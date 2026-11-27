import { useCallback, useEffect, useRef, useState } from 'react';

/** Tempo de exibição das notificações de sucesso. */
export const TOAST_DURATION_MS = 4_000;

export interface ToastState {
  /** Muda a cada exibição: reinicia o temporizador e o anúncio, mesmo com o mesmo texto. */
  id: number;
  message: string;
}

/**
 * Ciclo de vida de uma notificação temporária (toast):
 * - `show` substitui a notificação atual (nunca empilha) e reinicia o temporizador;
 * - a notificação some sozinha após `durationMs`;
 * - o temporizador é sempre limpo ao trocar de mensagem, ao dispensar e ao desmontar,
 *   evitando mensagens obsoletas e atualizações de estado após a desmontagem.
 */
export function useToast(durationMs = TOAST_DURATION_MS) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const sequence = useRef(0);

  const show = useCallback((message: string) => {
    sequence.current += 1;
    setToast({ id: sequence.current, message });
  }, []);

  const dismiss = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => {
      // Só remove a notificação que criou este temporizador.
      setToast((current) => (current?.id === toast.id ? null : current));
    }, durationMs);
    return () => window.clearTimeout(timer);
  }, [toast, durationMs]);

  return { toast, show, dismiss };
}
