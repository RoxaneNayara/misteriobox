import { useEffect, useState, type RefObject } from 'react';

interface ScrollEdges {
  /** Há opções escondidas à esquerda. */
  canScrollStart: boolean;
  /** Há opções escondidas à direita. */
  canScrollEnd: boolean;
}

const EDGE_TOLERANCE_PX = 2;

function readEdges(list: HTMLElement): ScrollEdges {
  const maxScroll = list.scrollWidth - list.clientWidth;
  return {
    canScrollStart: list.scrollLeft > EDGE_TOLERANCE_PX,
    canScrollEnd: list.scrollLeft < maxScroll - EDGE_TOLERANCE_PX,
  };
}

/**
 * Menu horizontal com rolagem própria (telas estreitas):
 * - informa se há opções escondidas em cada borda, para exibir o indicador de continuação;
 * - mantém a opção ativa visível dentro da faixa rolável, sem mover a página.
 */
export function useScrollableNav(
  listRef: RefObject<HTMLElement | null>,
  activeSelector: string,
  activeKey: string | null,
  enabled = true,
): ScrollEdges {
  const [edges, setEdges] = useState<ScrollEdges>({ canScrollStart: false, canScrollEnd: false });

  useEffect(() => {
    const list = listRef.current;
    if (!enabled || !list) return;
    const update = () =>
      setEdges((previous) => {
        const next = readEdges(list);
        return previous.canScrollStart === next.canScrollStart &&
          previous.canScrollEnd === next.canScrollEnd
          ? previous
          : next;
      });
    update();
    list.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(list);
    return () => {
      list.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [listRef, enabled]);

  useEffect(() => {
    const list = listRef.current;
    if (!enabled || !list || !activeKey) return;
    const active = list.querySelector<HTMLElement>(activeSelector);
    if (!active) return;
    // Rola somente a faixa do menu (nunca a página) até a opção ativa ficar inteira à vista.
    const listBox = list.getBoundingClientRect();
    const itemBox = active.getBoundingClientRect();
    const padding = 24;
    let delta = 0;
    if (itemBox.left < listBox.left + padding) delta = itemBox.left - listBox.left - padding;
    else if (itemBox.right > listBox.right - padding)
      delta = itemBox.right - listBox.right + padding;
    if (delta !== 0) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      list.scrollBy({ left: delta, behavior: reduceMotion ? 'instant' : 'smooth' });
    }
  }, [listRef, activeSelector, activeKey, enabled]);

  return edges;
}
