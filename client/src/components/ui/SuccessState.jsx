import { CheckCircle2 } from 'lucide-react';
export default function SuccessState({ children, className = '' }) {
  if (!children) return null;
  return (
    <p className={`notice success-notice tj-alert tj-alert--success ${className}`.trim()} role="status">
      <CheckCircle2 size={16} aria-hidden="true" /> {children}
    </p>
  );
}
