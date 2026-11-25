import { useCallback, useEffect, useRef, useState } from 'react';

const ACTIVATION_RATIO = 0.4;
const USER_SCROLL_EVENTS = ['wheel', 'touchstart', 'keydown'] as const;

/**
 * Identifica a seção em exibição para destacar a opção correspondente do menu
 * da investigação (B05). Considera ativa a última seção cujo topo já entrou nos
 * 40% superiores da área visível abaixo dos elementos fixos; no fim da página,
 * a última seção (que pode ser curta demais para chegar ao topo).
 *
 * `select(id)` fixa o destaque na opção escolhida no menu até o jogador rolar a
 * página por conta própria — perto do fim da página várias seções cabem na tela
 * e a escolha explícita deve prevalecer.
 */
export function useActiveSection(
  sectionIds: readonly string[],
  enabled: boolean,
): { activeId: string; select: (id: string) => void } {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? '');
  const selectedByUser = useRef<string | null>(null);

  const select = useCallback((id: string) => {
    selectedByUser.current = id;
    setActiveId(id);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      if (selectedByUser.current) return;
      const stickyOffset =
        parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const activationLine = stickyOffset + (window.innerHeight - stickyOffset) * ACTIVATION_RATIO;
      const reachedBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let current = sectionIds[0] ?? '';
      for (const id of sectionIds) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= activationLine) current = id;
      }
      if (reachedBottom) current = sectionIds[sectionIds.length - 1] ?? current;
      setActiveId(current);
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const releaseSelection = () => {
      if (!selectedByUser.current) return;
      selectedByUser.current = null;
      schedule();
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    for (const eventName of USER_SCROLL_EVENTS) {
      window.addEventListener(eventName, releaseSelection, { passive: true });
    }
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      for (const eventName of USER_SCROLL_EVENTS) {
        window.removeEventListener(eventName, releaseSelection);
      }
    };
  }, [sectionIds, enabled]);

  return { activeId, select };
}
