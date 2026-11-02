import React, { useMemo, useState } from 'react';
import { BookOpen, Search, Bookmark, ExternalLink, Filter, Sparkles, ArrowUpRight, SlidersHorizontal, X, Layers3 } from 'lucide-react';
import './resources-premium.css';

const RESOURCE_ITEMS = [
  { id:'react', title:'React Documentation', description:'Official reference for components, hooks, server components and modern React patterns.', category:'Frontend', type:'Documentation', level:'All levels', tags:['React','Hooks','Components'], url:'https://react.dev', featured:true },
  { id:'mdn', title:'MDN Web Docs', description:'A dependable reference for HTML, CSS, JavaScript and browser APIs.', category:'Frontend', type:'Reference', level:'All levels', tags:['HTML','CSS','JavaScript'], url:'https://developer.mozilla.org' },
  { id:'typescript', title:'TypeScript Handbook', description:'Learn type modelling, generics, narrowing and safer application architecture.', category:'Frontend', type:'Guide', level:'Intermediate', tags:['TypeScript','Types','JavaScript'], url:'https://www.typescriptlang.org/docs/' },
  { id:'node', title:'Node.js Documentation', description:'Core APIs, asynchronous patterns, streams and production runtime guidance.', category:'Backend', type:'Documentation', level:'Intermediate', tags:['Node.js','Runtime','Backend'], url:'https://nodejs.org/docs/latest/api/' },
  { id:'express', title:'Express.js Guide', description:'Routing, middleware, error handling and practical server application patterns.', category:'Backend', type:'Guide', level:'Intermediate', tags:['Express','API','Node.js'], url:'https://expressjs.com/en/guide/routing.html' },
  { id:'owasp', title:'OWASP Cheat Sheet Series', description:'Practical application security guidance for authentication, sessions and APIs.', category:'Security', type:'Security', level:'Advanced', tags:['OWASP','Security','Auth'], url:'https://cheatsheetseries.owasp.org/' },
  { id:'mongo', title:'MongoDB Manual', description:'Data modelling, aggregation, indexing and database operations explained.', category:'Database', type:'Documentation', level:'Intermediate', tags:['MongoDB','NoSQL','Database'], url:'https://www.mongodb.com/docs/' },
  { id:'postgres', title:'PostgreSQL Documentation', description:'SQL language, relational design, query planning and database administration.', category:'Database', type:'Reference', level:'Advanced', tags:['SQL','PostgreSQL','Database'], url:'https://www.postgresql.org/docs/' },
  { id:'git', title:'Pro Git Book', description:'Understand commits, branches, remotes, collaboration and Git internals.', category:'Developer Tools', type:'Book', level:'All levels', tags:['Git','GitHub','Workflow'], url:'https://git-scm.com/book/en/v2' },
  { id:'vite', title:'Vite Documentation', description:'Fast frontend tooling, configuration, plugins and optimized production builds.', category:'Developer Tools', type:'Documentation', level:'Intermediate', tags:['Vite','Build','Frontend'], url:'https://vite.dev/guide/' },
  { id:'a11y', title:'Web Accessibility Initiative', description:'Standards and techniques for building inclusive, accessible experiences.', category:'Design & UI', type:'Standard', level:'All levels', tags:['Accessibility','WCAG','UX'], url:'https://www.w3.org/WAI/' },
  { id:'tailwind', title:'Tailwind CSS Documentation', description:'Utility-first styling, responsive variants, design tokens and customization.', category:'Design & UI', type:'Documentation', level:'Beginner', tags:['CSS','Tailwind','Design'], url:'https://tailwindcss.com/docs' },
];
const CATEGORIES = ['All','Frontend','Backend','Database','Design & UI','Security','Developer Tools'];
const readBookmarks = () => { try { return JSON.parse(localStorage.getItem('codepath-resource-bookmarks') || '[]'); } catch { return []; } };

export default function ResourcesPage() {
  const [query,setQuery] = useState('');
  const [category,setCategory] = useState('All');
  const [bookmarks,setBookmarks] = useState(readBookmarks);
  const [savedOnly,setSavedOnly] = useState(false);
  const [sort,setSort] = useState('featured');
  const [level,setLevel] = useState('All');
  const [filtersOpen,setFiltersOpen] = useState(false);
  const visible = useMemo(() => RESOURCE_ITEMS.filter(item => {
    const q=query.trim().toLowerCase();
    return (!q || [item.title,item.description,item.category,...item.tags].join(' ').toLowerCase().includes(q))
      && (category==='All' || item.category===category)
      && (!savedOnly || bookmarks.includes(item.id))
      && (level==='All' || item.level===level);
  }).sort((a,b) => sort==='az' ? a.title.localeCompare(b.title) : sort==='category' ? a.category.localeCompare(b.category) : Number(Boolean(b.featured))-Number(Boolean(a.featured))),[query,category,bookmarks,savedOnly,level,sort]);
  const toggleBookmark = id => setBookmarks(prev => { const next=prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]; try {localStorage.setItem('codepath-resource-bookmarks',JSON.stringify(next));} catch {} return next; });
  const clear = () => {setQuery('');setCategory('All');setSavedOnly(false);setLevel('All');setSort('featured');};
  return <main className="rp-page">
    <div className="rp-shell">
      <section className="rp-hero">
        <div className="rp-hero-copy">
          <span className="rp-eyebrow"><Sparkles size={15}/> THE DEVELOPER TOOLKIT</span>
          <h1>Resources that move<br/><span>your skills forward.</span></h1>
          <p>A carefully organized library of trusted documentation, practical guides and tools for building better software.</p>
          <div className="rp-hero-meta"><span><BookOpen size={15}/>{RESOURCE_ITEMS.length} curated resources</span><span><Bookmark size={15}/>{bookmarks.length} saved by you</span></div>
        </div>
        <div className="rp-hero-art" aria-hidden="true"><div className="rp-orbit rp-orbit-one"/><div className="rp-orbit rp-orbit-two"/><div className="rp-art-card"><Layers3 size={30}/><b>Learn. Build. Ship.</b><small>Your developer library</small><div className="rp-art-bars"><i/><i/><i/></div></div><span className="rp-art-dot"/></div>
      </section>
      <section className="rp-toolbar" aria-label="Resource filters">
        <label className="rp-search"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search docs, tools, topics or tags..." aria-label="Search resources"/>{query && <button onClick={()=>setQuery('')} aria-label="Clear search"><X size={16}/></button>}</label>
        <div className="rp-toolbar-actions">
          <select className="rp-select" value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort resources"><option value="featured">Featured first</option><option value="az">Name: A to Z</option><option value="category">Category</option></select>
          <button className={`rp-button rp-save-filter ${savedOnly?'is-active':''}`} onClick={()=>setSavedOnly(v=>!v)}><Bookmark size={16}/><span>Saved</span><b>{bookmarks.length}</b></button>
          <button className="rp-button rp-filter-toggle" onClick={()=>setFiltersOpen(v=>!v)}><SlidersHorizontal size={16}/> Filters</button>
        </div>
      </section>
      <section className={`rp-filter-panel ${filtersOpen?'is-open':''}`}>
        <div><span className="rp-filter-label"><Filter size={14}/> CATEGORY</span><div className="rp-chips">{CATEGORIES.map(c=><button key={c} className={`rp-chip ${category===c?'is-active':''}`} onClick={()=>setCategory(c)}>{c}</button>)}</div></div>
        <label className="rp-level-label">Experience level<select className="rp-select" value={level} onChange={e=>setLevel(e.target.value)}><option>All</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>All levels</option></select></label>
      </section>
      <div className="rp-results-head"><div><span className="rp-section-kicker">EXPLORE THE LIBRARY</span><h2>Developer resources <span>{visible.length}</span></h2></div><p>Open trusted references in a new tab.</p></div>
      {visible.length ? <section className="rp-grid">{visible.map((item,index)=><article className={`rp-card ${item.featured?'is-featured':''}`} key={item.id} style={{'--rp-index':index}}>
        <div className="rp-card-top"><span className="rp-category">{item.category}</span><button className={`rp-bookmark ${bookmarks.includes(item.id)?'is-saved':''}`} onClick={()=>toggleBookmark(item.id)} aria-label={bookmarks.includes(item.id)?`Remove ${item.title} from saved`:`Save ${item.title}`}><Bookmark size={18} fill={bookmarks.includes(item.id)?'currentColor':'none'}/></button></div>
        <div className="rp-card-icon"><BookOpen size={21}/></div><h3>{item.title}</h3><p>{item.description}</p>
        <div className="rp-tags">{item.tags.map(tag=><span key={tag}>#{tag}</span>)}</div>
        <div className="rp-card-footer"><span>{item.type} <i/> {item.level}</span><a href={item.url} target="_blank" rel="noopener noreferrer">Explore <ArrowUpRight size={16}/></a></div>
      </article>)}</section> : <div className="rp-empty"><div><Search size={24}/></div><h3>No matching resources</h3><p>Try another keyword or reset the filters to explore the full library.</p><button className="rp-button rp-primary" onClick={clear}>Clear all filters</button></div>}
      <footer className="rp-note"><Sparkles size={16}/><p>Quality over quantity. Resources link to their official publishers and documentation wherever possible.</p></footer>
    </div>
  </main>;
}
