export default function Container({ children, narrow = false, className = '', as: Element = 'main', ...props }) {
  return (
    <Element className={`shell page page-enter ${narrow ? 'narrow' : ''} ${className}`.trim()} {...props}>
      {children}
    </Element>
  );
}
