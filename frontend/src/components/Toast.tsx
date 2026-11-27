import type { ToastState } from '../hooks/useToast';
import { CheckIcon, CrossIcon } from './Icons';

interface ToastProps {
  toast: ToastState | null;
  onDismiss: () => void;
  testId?: string;
}

/**
 * Notificação temporária de sucesso. A região viva fica sempre no documento
 * (leitores de tela a registram desde o início) e anuncia cada nova mensagem sem
 * mover o foco. Fica fixa acima do botão "Voltar ao topo", fora do fluxo do conteúdo.
 */
export function Toast({ toast, onDismiss, testId = 'toast' }: ToastProps) {
  return (
    <div
      className="toast-region"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-testid={testId}
    >
      {toast && (
        <div className="toast" key={toast.id} data-testid={`${testId}-message`}>
          <CheckIcon className="toast__icon" />
          <p className="toast__text">{toast.message}</p>
          <button
            type="button"
            className="toast__close"
            onClick={onDismiss}
            aria-label="Fechar notificação"
            data-testid={`${testId}-close`}
          >
            <CrossIcon />
          </button>
        </div>
      )}
    </div>
  );
}
