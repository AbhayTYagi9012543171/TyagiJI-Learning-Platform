export default function IconButton({ icon: Icon, label, className = '', variant = 'ghost', ...props }) {
  if (!Icon) return null;
  return <button type="button" className={`tj-icon-button tj-icon-button--${variant} ${className}`.trim()} aria-label={label} title={label} {...props}><Icon size={18} aria-hidden="true"/></button>;
}
