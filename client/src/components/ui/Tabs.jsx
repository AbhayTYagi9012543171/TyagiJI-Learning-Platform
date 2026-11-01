import { useState } from 'react';
const safeId = (value) => String(value).replace(/[^a-zA-Z0-9_-]/g, '-');

export default function Tabs({ items = [], value, defaultValue, onChange, className = '', label = 'Sections' }) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.value);
  const active = value ?? internal;
  const select = (next) => { if (value === undefined) setInternal(next); onChange?.(next); };
  return (
    <div className={`tj-tabs ${className}`.trim()}>
      <div className="tj-tabs__list" role="tablist" aria-label={label}>
        {items.map((item) => <button key={item.value} type="button" role="tab" id={`tab-${safeId(item.value)}`} aria-selected={active === item.value} aria-controls={`panel-${safeId(item.value)}`} className={active === item.value ? 'is-active' : ''} onClick={() => select(item.value)}>{item.label}</button>)}
      </div>
      {items.map((item) => active === item.value ? <div key={item.value} id={`panel-${safeId(item.value)}`} role="tabpanel" aria-labelledby={`tab-${safeId(item.value)}`} className="tj-tabs__panel">{item.content}</div> : null)}
    </div>
  );
}
