import { Link } from 'react-router-dom';
export default function QuickActionCard({ to, icon: Icon, title, description, className = '' }) {
  return (
    <Link to={to} className={`tj-quick-action ${className}`.trim()}>
      {Icon && <span className="tj-quick-action__icon"><Icon size={19}/></span>}
      <span><strong>{title}</strong>{description && <small>{description}</small>}</span>
    </Link>
  );
}

