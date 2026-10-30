import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
export default function Dropdown({ label, children, className = '' }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  useEffect(() => {
    function closeOutside(event) { if (root.current && !root.current.contains(event.target)) setOpen(false); }
    function closeEscape(event) { if (event.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', closeOutside);
    document.addEventListener('keydown', closeEscape);
    return () => { document.removeEventListener('mousedown', closeOutside); document.removeEventListener('keydown', closeEscape); };
  }, []);
  return (
    <div className={`tj-dropdown ${open ? 'is-open' : ''} ${className}`.trim()} ref={root}>
      <button type="button" className="tj-dropdown__trigger" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((value) => !value)}>{label}<ChevronDown size={15}/></button>
      {open && <div className="tj-dropdown__menu" role="menu" onClick={(event) => { if (event.target.closest('[role="menuitem"]')) setOpen(false); }}>{children}</div>}
    </div>
  );
}

