export default function SectionHeader({ eyebrow, title, description, action, className = '' }) {
  return (
    <div className={`section-head tj-section-header ${className}`.trim()}>
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        {title && <h2>{title}</h2>}
        {description && <p>{description}</p>}
      </div>
      {action && <div className="tj-section-header__action">{action}</div>}
    </div>
  );
}
