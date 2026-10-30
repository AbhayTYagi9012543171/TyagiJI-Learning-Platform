import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
const iconByTone = { info: Info, success: CheckCircle2, warning: AlertTriangle, danger: AlertCircle };
export default function Alert({ tone = 'info', title, children, className = '' }) {
  const Icon = iconByTone[tone] || Info;
  return (
    <div className={`tj-alert tj-alert--${tone} ${className}`.trim()} role={tone === 'danger' ? 'alert' : 'status'}>
      <Icon size={18} aria-hidden="true" />
      <div>{title && <strong>{title}</strong>}{children && <div>{children}</div>}</div>
    </div>
  );
}
