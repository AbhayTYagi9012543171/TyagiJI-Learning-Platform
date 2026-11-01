export default function Tooltip({ content, children, className = '' }) {
  return <span className={`tj-tooltip ${className}`.trim()} tabIndex={0} aria-label={content} data-tooltip={content}>{children}</span>;
}

