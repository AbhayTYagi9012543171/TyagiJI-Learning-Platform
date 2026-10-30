const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'];
export default function Badge({ children, tone = 'neutral', dot = false, className = '' }) {
  const safeTone = tones.includes(tone) ? tone : 'neutral';
  return (
    <span className={`tj-badge tj-badge--${safeTone} ${className}`.trim()}>
      {dot && <span className="tj-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
