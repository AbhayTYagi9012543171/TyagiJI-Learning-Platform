export default function ProgressBar({ value = 0, max = 100, label, showValue = false, size = 'md', className = '' }) {
  const numericMax = Number(max) > 0 ? Number(max) : 100;
  const numericValue = Number(value);
  const percent = Number.isFinite(numericValue) ? Math.min(100, Math.max(0, (numericValue / numericMax) * 100)) : 0;
  return (
    <div className={`tj-progress tj-progress--${size} ${className}`.trim()}>
      {(label || showValue) && (
        <div className="tj-progress__meta">
          {label && <span>{label}</span>}
          {showValue && <strong>{Math.round(percent)}%</strong>}
        </div>
      )}
      <div className="tj-progress__track" role="progressbar" aria-label={label || 'Progress'} aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(percent)}>
        <span className="tj-progress__fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
