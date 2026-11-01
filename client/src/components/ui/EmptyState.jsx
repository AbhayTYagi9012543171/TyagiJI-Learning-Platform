import { Compass } from 'lucide-react';
export default function EmptyState({ title = 'Nothing here yet', text = 'When there is something to show, it will appear here.', action, icon: Icon = Compass, className = '' }) {
  return (
    <div className={`empty empty-premium tj-empty ${className}`.trim()} role="status">
      <div className="empty-icon"><Icon size={26} aria-hidden="true" /></div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action && <div className="tj-empty__action">{action}</div>}
    </div>
  );
}
