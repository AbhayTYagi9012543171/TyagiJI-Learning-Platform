import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
const icons = { success: CheckCircle2, error: AlertCircle, info: Info };
export default function Toast({ message, tone = 'info', onClose, className = '' }) {
  if (!message) return null;
  const Icon = icons[tone] || Info;
  return (
    <div className={`tj-toast tj-toast--${tone} ${className}`.trim()} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon size={18} aria-hidden="true"/><span>{message}</span>
      {onClose && <button type="button" onClick={onClose} aria-label="Dismiss notification"><X size={16}/></button>}
    </div>
  );
}

