export default function SortControl({ value, onChange, options = [], label = 'Sort by', className = '' }) {
  return (
    <label className={`tj-sort-control ${className}`.trim()}>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange?.(event.target.value)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

