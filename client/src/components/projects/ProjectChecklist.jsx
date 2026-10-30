export default function ProjectChecklist({ items = [], completed = [], onToggle, className = '' }) {
  return (
    <div className={`tj-project-checklist ${className}`.trim()}>
      {items.map((item, index) => {
        const checked = completed.includes(index);
        return <label key={`${item}-${index}`} className={checked ? 'is-complete' : ''}><input type="checkbox" checked={checked} onChange={() => onToggle?.(index)}/><span>{item}</span></label>;
      })}
    </div>
  );
}

