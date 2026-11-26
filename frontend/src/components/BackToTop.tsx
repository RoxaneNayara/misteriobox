import { useEffect, useState } from 'react';
import { ArrowUpIcon } from './Icons';

/** Distância mínima de rolagem para exibir o botão (ou 60% da altura da tela, o que for maior). */
const MIN_SCROLL_PX = 400;

function shouldShow(): boolean {
  return window.scrollY > Math.max(MIN_SCROLL_PX, window.innerHeight * 0.6);
}

/**
 * Botão "Voltar ao topo": aparece depois que o jogador rola a página, rola de volta
 * suavemente (ou de imediato, com movimento reduzido) e devolve o foco ao conteúdo
 * principal, para que a navegação por teclado recomece do início da página.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setVisible(shouldShow());
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  if (!visible) return null;

  const scrollToTop = () => {
    // O foco vem antes da rolagem: no Chromium, focar durante uma rolagem suave a interrompe.
    document.getElementById('conteudo')?.focus({ preventScroll: true });
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'instant' : 'smooth' });
  };

  return (
    <button
      type="button"
      className="back-to-top"
      onClick={scrollToTop}
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
      data-testid="back-to-top"
    >
      <ArrowUpIcon />
    </button>
  );
}
