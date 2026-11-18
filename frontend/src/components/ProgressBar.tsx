interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  testId?: string;
}

export function ProgressBar({ value, max, label, testId }: ProgressBarProps) {
  const percentage = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="progress" data-testid={testId}>
      <div className="progress__label">
        <span>{label}</span>
        <span>
          {value} de {max} ({percentage}%)
        </span>
      </div>
      <div
        className="progress__track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      >
        <div className="progress__fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
