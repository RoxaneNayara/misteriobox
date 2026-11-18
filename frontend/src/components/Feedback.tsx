import { MagnifierIcon } from './Icons';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Carregando...' }: LoadingStateProps) {
  return (
    <div className="loading" role="status" aria-live="polite" data-testid="loading-state">
      <span className="loading__lens" aria-hidden="true">
        <MagnifierIcon />
      </span>
      <span className="loading__text">{message}</span>
    </div>
  );
}

interface ErrorAlertProps {
  message: string;
  testId?: string;
  onRetry?: () => void;
}

export function ErrorAlert({ message, testId = 'error-alert', onRetry }: ErrorAlertProps) {
  return (
    <div className="alert alert--error" role="alert" data-testid={testId}>
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="button button--ghost button--small" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}

interface StatusMessageProps {
  message: string | null;
  testId?: string;
}

/** Mensagem de sucesso anunciada a leitores de tela. */
export function StatusMessage({ message, testId = 'status-message' }: StatusMessageProps) {
  return (
    <div className="status-region" role="status" aria-live="polite" data-testid={testId}>
      {message && (
        <p className="alert alert--success" key={message}>
          {message}
        </p>
      )}
    </div>
  );
}
