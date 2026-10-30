import { ChevronLeft, ChevronRight } from 'lucide-react';
export default function Pagination({ page = 1, totalPages = 1, onChange, className = '' }) {
  const total = Math.max(1, Number(totalPages) || 1);
  const current = Math.min(total, Math.max(1, Number(page) || 1));
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, index) => index + 1);
  return (
    <nav className={`tj-pagination ${className}`.trim()} aria-label="Pagination">
      <button type="button" onClick={() => onChange?.(current - 1)} disabled={current === 1} aria-label="Previous page"><ChevronLeft size={16}/></button>
      {pages.map((number) => <button type="button" key={number} className={number === current ? 'is-active' : ''} aria-current={number === current ? 'page' : undefined} onClick={() => onChange?.(number)}>{number}</button>)}
      <button type="button" onClick={() => onChange?.(current + 1)} disabled={current === total} aria-label="Next page"><ChevronRight size={16}/></button>
    </nav>
  );
}

