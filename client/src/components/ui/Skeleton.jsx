export default function Skeleton({ width = '100%', height = 16, radius = '10px', className = '' }) {
  return <span className={`tj-skeleton ${className}`.trim()} style={{ width, height, borderRadius: radius }} aria-hidden="true" />;
}
