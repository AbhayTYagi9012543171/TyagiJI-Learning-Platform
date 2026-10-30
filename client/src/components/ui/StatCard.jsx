export default function StatCard({ label, value, icon, helper, tone = 'primary', className = '' }) {
  return (
    <article className={`stat tj-stat tj-stat--${tone} ${className}`.trim()}>
      {icon && <div className="stat-icon tj-stat__icon">{icon}</div>}
      <small>{label}</small>
      <strong>{value ?? '—'}</strong>
      {helper && <span className="tj-stat__helper">{helper}</span>}
    </article>
  );
}
