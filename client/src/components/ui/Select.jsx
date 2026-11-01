export default function Select({ label, hint, error, id, options = [], className = '', ...props }) {
  const inputId = id || props.name;
  return (
    <label className={`tj-field ${className}`.trim()} htmlFor={inputId}>
      {label && <span className="tj-field__label">{label}</span>}
      <select id={inputId} className={`tj-input ${error ? 'is-invalid' : ''}`} aria-invalid={Boolean(error)} aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined} {...props}>
        {options.map((option) => typeof option === 'string'
          ? <option key={option} value={option}>{option}</option>
          : <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
      </select>
      {error && <span className="tj-field__error">{error}</span>}
      {!error && hint && <span className="tj-field__hint">{hint}</span>}
    </label>
  );
}
