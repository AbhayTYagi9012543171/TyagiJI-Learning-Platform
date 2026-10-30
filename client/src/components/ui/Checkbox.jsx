export default function Checkbox({ label, hint, checked, onChange, className = '', ...props }) {
  return (
    <label className={`tj-check-field ${className}`.trim()}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange?.(event.target.checked)} {...props} />
      <span><strong>{label}</strong>{hint && <small>{hint}</small>}</span>
    </label>
  );
}

