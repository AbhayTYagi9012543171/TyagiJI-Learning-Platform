export default function Avatar({ name = 'Learner', src, size = 'md', className = '' }) {
  const initials = String(name).trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'L';
  return (
    <span className={`tj-avatar tj-avatar--${size} ${className}`.trim()} aria-label={name} role="img">
      {src ? <img src={src} alt="" loading="lazy" /> : initials}
    </span>
  );
}
