export default function Card({ children, className = '', as: Element = 'section', interactive = false, padding = 'md', ...props }) {
  return (
    <Element
      className={`tj-card tj-card--${padding} ${interactive ? 'tj-card--interactive' : ''} ${className}`.trim()}
      {...props}
    >
      {children}
    </Element>
  );
}
