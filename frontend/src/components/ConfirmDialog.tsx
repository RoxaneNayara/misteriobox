import { useEffect, useRef, type ReactNode } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  busy?: boolean;
  testId: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Diálogo modal nativo: prende o foco e fecha com Esc (tratado como cancelamento). */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = 'Cancelar',
  tone = 'default',
  busy = false,
  testId,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = `${testId}-title`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby={titleId}
      data-testid={testId}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
    >
      <h2 id={titleId} className="dialog__title">
        {title}
      </h2>
      <div className="dialog__body">{children}</div>
      <div className="dialog__actions">
        <button
          type="button"
          className="button button--ghost"
          onClick={onCancel}
          disabled={busy}
          data-testid={`${testId}-cancel`}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className={`button ${tone === 'danger' ? 'button--danger' : 'button--primary'}`}
          onClick={onConfirm}
          disabled={busy}
          data-testid={`${testId}-confirm`}
        >
          {busy ? 'Aguarde...' : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
