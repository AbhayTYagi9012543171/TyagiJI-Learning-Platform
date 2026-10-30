import { Clock3 } from 'lucide-react';
import EmptyState from '../ui/EmptyState.jsx';
export default function ActivityTimeline({ items = [], className = '' }) {
  if (!items.length) return <EmptyState title="No recent activity" text="Your learning activity will appear here as you use the platform." icon={Clock3}/>;
  return (
    <ol className={`tj-activity-timeline ${className}`.trim()}>
      {items.map((item, index) => <li key={item._id || item.id || `${item.title}-${index}`}><span className="tj-activity-timeline__dot"/><div><strong>{item.title || item.description || 'Learning activity'}</strong><p>{item.description || item.type || 'Progress updated'}</p>{item.createdAt && <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time>}</div></li>)}
    </ol>
  );
}

