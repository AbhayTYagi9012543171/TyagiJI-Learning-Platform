export default function RadioGroup({ label, name, options = [], value, onChange, direction = 'column', className = '' }) {
  return (
    <fieldset className={`tj-radio-group tj-radio-group--${direction} ${className}`.trim()}>
      {label && <legend>{label}</legend>}
      {options.map((option) => (
        <label key={option.value} className="tj-radio-option">
          <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange?.(option.value)} disabled={option.disabled} />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

