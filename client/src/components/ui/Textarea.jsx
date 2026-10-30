export default function Textarea({ label, hint, error, id, className = '', ...props }) {
  const inputId = id || props.name;
  return (
    <label className={`tj-field ${className}`.trim()} htmlFor={inputId}>
      {label && <span className="tj-field__label">{label}</span>}
      <textarea id={inputId} className={`tj-input tj-textarea ${error ? 'is-invalid' : ''}`} aria-invalid={Boolean(error)} aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined} {...props} />
      {error && <span className="tj-field__error">{error}</span>}
      {!error && hint && <span className="tj-field__hint">{hint}</span>}
    </label>
  );
}
