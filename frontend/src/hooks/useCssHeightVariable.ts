import { useEffect, type RefObject } from 'react';

/**
 * Publica a altura atual de um elemento como variável CSS no `:root`
 * (ex.: `--app-header-height`). Usado para posicionar elementos fixos (sticky)
 * com a altura real, que muda com a largura da tela e o tamanho do nome (B05).
 */
export function useCssHeightVariable(
  ref: RefObject<HTMLElement | null>,
  variableName: `--${string}`,
  enabled = true,
): void {
  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;
    const root = document.documentElement;
    const publish = () => {
      root.style.setProperty(
        variableName,
        `${Math.ceil(element.getBoundingClientRect().height)}px`,
      );
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(element);
    return () => {
      observer.disconnect();
      root.style.removeProperty(variableName);
    };
  }, [ref, variableName, enabled]);
}
