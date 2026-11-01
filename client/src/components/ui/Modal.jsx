import { useEffect, useId } from 'react';
import { X } from 'lucide-react';
export default function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  const modalId = useId().replace(/:/g, '');
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose?.(); };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', onKeyDown); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="tj-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }}>
      <section className={`tj-modal tj-modal--${size}`} role="dialog" aria-modal="true" aria-labelledby={`${modalId}-title`} aria-describedby={description ? `${modalId}-description` : undefined}>
        <header className="tj-modal__header">
          <div><h2 id={`${modalId}-title`}>{title}</h2>{description && <p id={`${modalId}-description`}>{description}</p>}</div>
          <button type="button" className="tj-icon-button" onClick={onClose} aria-label="Close dialog"><X size={18}/></button>
        </header>
        <div className="tj-modal__body">{children}</div>
        {footer && <footer className="tj-modal__footer">{footer}</footer>}
      </section>
    </div>
  );
}
