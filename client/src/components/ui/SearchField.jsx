import { Search, X } from 'lucide-react';
export default function SearchField({ value, onChange, placeholder = 'Search...', label = 'Search', className = '', ...props }) {
  return (
    <label className={`search search-premium tj-search ${className}`.trim()}>
      <span className="tj-sr-only">{label}</span>
      <Search size={18} aria-hidden="true" />
      <input type="search" value={value} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} autoComplete="off" {...props} />
      {value && (
        <button type="button" className="search-clear" onClick={() => onChange?.('')} aria-label="Clear search">
          <X size={15} aria-hidden="true" />
        </button>
      )}
    </label>
  );
}
