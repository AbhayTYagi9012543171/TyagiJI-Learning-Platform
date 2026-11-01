import { useEffect, useId } from 'react';
import { X } from 'lucide-react';
export default function Drawer({ open, onClose, title, children, side = 'right', footer }) {
  const id = useId().replace(/:/g, '');
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') onClose?.(); };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="tj-drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }}>
      <aside className={`tj-drawer tj-drawer--${side}`} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`}>
        <header><h2 id={`${id}-title`}>{title}</h2><button type="button" className="tj-icon-button" onClick={onClose} aria-label="Close panel"><X size={18}/></button></header>
        <div className="tj-drawer__body">{children}</div>
        {footer && <footer>{footer}</footer>}
      </aside>
    </div>
  );
}

