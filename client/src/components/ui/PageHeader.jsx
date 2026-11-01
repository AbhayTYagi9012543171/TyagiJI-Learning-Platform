export default function PageHeader({ tag, title, text, children, className = '', actions }) {
  return (
    <header className={`intro page-enter tj-page-header ${className}`.trim()}>
      {tag && <span className="eyebrow">{tag}</span>}
      <div className="tj-page-header__row">
        <div className="tj-page-header__copy">
          <h1>{title}</h1>
          {text && <p>{text}</p>}
        </div>
        {actions && <div className="tj-page-header__actions">{actions}</div>}
      </div>
      {children}
    </header>
  );
}
