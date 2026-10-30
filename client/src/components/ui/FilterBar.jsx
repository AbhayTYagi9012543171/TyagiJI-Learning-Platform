export default function FilterBar({ children, onReset, resetLabel = 'Clear filters', className = '' }) {
  return (
    <div className={`tj-filter-bar ${className}`.trim()}>
      <div className="tj-filter-bar__controls">{children}</div>
      {onReset && <button type="button" className="tj-filter-bar__reset" onClick={onReset}>{resetLabel}</button>}
    </div>
  );
}

