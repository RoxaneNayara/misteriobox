import { useState, type FormEvent } from 'react';
import type { Evidence, InvestigationProgress, Suspect } from '../../types/api';

export interface AccusationDraft {
  suspect: Suspect;
  evidence: Evidence;
}

interface AccusationFormProps {
  investigation: InvestigationProgress;
  disabled: boolean;
  onSubmit: (draft: AccusationDraft) => void;
}

export function AccusationForm({ investigation, disabled, onSubmit }: AccusationFormProps) {
  const [suspectId, setSuspectId] = useState('');
  const [evidenceId, setEvidenceId] = useState('');
  const [errors, setErrors] = useState<{ suspect?: string; evidence?: string }>({});

  const { analyzedEvidences, minimumForAccusation, canAccuse } = investigation.progress;
  const analyzedEvidenceOptions = investigation.evidences.filter(
    (evidence) => evidence.state === 'ANALISADA',
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const suspect = investigation.suspects.find((item) => item.id === suspectId);
    const evidence = analyzedEvidenceOptions.find((item) => item.id === evidenceId);
    const nextErrors = {
      suspect: suspect ? undefined : 'Selecione o suspeito que você vai acusar.',
      evidence: evidence ? undefined : 'Selecione a evidência que sustenta a acusação.',
    };
    setErrors(nextErrors);
    if (suspect && evidence) onSubmit({ suspect, evidence });
  };

  if (!canAccuse) {
    return (
      <p className="alert alert--info" data-testid="accusation-locked">
        Analise pelo menos {minimumForAccusation} evidências para liberar a acusação (
        {analyzedEvidences}/{minimumForAccusation}).
      </p>
    );
  }

  return (
    <form
      className="form accusation-form"
      onSubmit={handleSubmit}
      noValidate
      data-testid="accusation-form"
    >
      <fieldset
        className="accusation-form__suspects"
        aria-describedby={errors.suspect ? 'accusation-suspect-error' : undefined}
      >
        <legend>Quem é o responsável?</legend>
        {investigation.suspects.map((suspect) => (
          <label key={suspect.id} className="radio-option">
            <input
              type="radio"
              name="accused-suspect"
              value={suspect.id}
              checked={suspectId === suspect.id}
              onChange={() => setSuspectId(suspect.id)}
              data-testid={`accusation-suspect-${suspect.id}`}
            />
            <span>
              {suspect.name} <small>— {suspect.role}</small>
            </span>
          </label>
        ))}
        {errors.suspect && (
          <p
            id="accusation-suspect-error"
            className="form-field__error"
            data-testid="accusation-suspect-error"
          >
            {errors.suspect}
          </p>
        )}
      </fieldset>

      <div className="form-field">
        <label htmlFor="accusation-evidence" className="form-field__label">
          Evidência que sustenta a acusação
        </label>
        <select
          id="accusation-evidence"
          className={`form-field__input ${errors.evidence ? 'form-field__input--invalid' : ''}`}
          value={evidenceId}
          onChange={(event) => setEvidenceId(event.target.value)}
          aria-invalid={errors.evidence ? true : undefined}
          aria-describedby={
            errors.evidence ? 'accusation-evidence-error' : 'accusation-evidence-hint'
          }
          data-testid="accusation-evidence"
        >
          <option value="">Selecione uma evidência analisada</option>
          {analyzedEvidenceOptions.map((evidence) => (
            <option key={evidence.id} value={evidence.id}>
              {evidence.title}
            </option>
          ))}
        </select>
        <p id="accusation-evidence-hint" className="form-field__hint">
          Somente evidências já analisadas podem ser usadas.
        </p>
        {errors.evidence && (
          <p
            id="accusation-evidence-error"
            className="form-field__error"
            data-testid="accusation-evidence-error"
          >
            {errors.evidence}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="button button--danger"
        disabled={disabled}
        data-testid="accusation-submit"
      >
        Fazer acusação definitiva
      </button>
    </form>
  );
}
