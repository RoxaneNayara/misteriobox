import { useEffect, useState, type RefObject } from 'react';

interface ScrollEdges {
  /** Há opções escondidas à esquerda. */
  canScrollStart: boolean;
  /** Há opções escondidas à direita. */
  canScrollEnd: boolean;
}

const EDGE_TOLERANCE_PX = 2;
/**
 * Folga mínima entre a opção revelada e a borda da faixa. É maior que o esmaecimento das
 * bordas (2rem no CSS), para que a opção fique inteira e legível, não apenas dentro da caixa.
 */
export const NAV_REVEAL_PADDING_PX = 40;

/** Rola somente a faixa do menu (nunca a página) até `item` ficar inteiro à vista. */
function revealInList(list: HTMLElement, item: HTMLElement, behavior: ScrollBehavior): void {
  const listBox = list.getBoundingClientRect();
  const itemBox = item.getBoundingClientRect();
  let delta = 0;
  if (itemBox.left < listBox.left + NAV_REVEAL_PADDING_PX) {
    delta = itemBox.left - listBox.left - NAV_REVEAL_PADDING_PX;
  } else if (itemBox.right > listBox.right - NAV_REVEAL_PADDING_PX) {
    delta = itemBox.right - listBox.right + NAV_REVEAL_PADDING_PX;
  }
  if (delta !== 0) list.scrollBy({ left: delta, behavior });
}

function preferredBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
}

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
    if (active) revealInList(list, active, preferredBehavior());
  }, [listRef, activeSelector, activeKey, enabled]);

  // Teclado: a opção que recebe o foco fica inteira à vista (WCAG 2.4.11, foco não encoberto).
  // Imediato, para que o foco nunca fique parcialmente escondido durante uma animação.
  useEffect(() => {
    const list = listRef.current;
    if (!enabled || !list) return;
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      const item = target?.closest<HTMLElement>('a, button');
      if (item && list.contains(item)) revealInList(list, item, 'instant');
    };
    list.addEventListener('focusin', onFocusIn);
    return () => list.removeEventListener('focusin', onFocusIn);
  }, [listRef, enabled]);

  return edges;
}
