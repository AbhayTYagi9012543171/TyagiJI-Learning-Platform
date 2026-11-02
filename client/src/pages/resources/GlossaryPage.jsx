import React, { useMemo, useState } from 'react';
import { BookMarked, Search, ChevronDown, Hash, BookOpen, X } from 'lucide-react';
import './resources-premium.css';

const TERMS=[
 ['API','Backend','An Application Programming Interface is a defined contract that lets software systems communicate.','A REST API exposes endpoints such as GET /api/courses.'],
 ['Authentication','Security','The process of verifying the identity of a user, service or application.','Checking a signed session or token before granting access.'],
 ['Authorization','Security','The process of deciding what an authenticated identity is allowed to do.','Only users with the admin role can manage courses.'],
 ['Caching','Backend','Storing reusable data temporarily so future requests can be served faster.','Cache a frequently requested public configuration response.'],
 ['CI/CD','Developer Tools','Continuous Integration and Continuous Delivery/Deployment automate validation and release workflows.','Run tests and lint checks for every pull request.'],
 ['CORS','Networking','A browser security mechanism that controls cross-origin requests using HTTP headers.','Allow the deployed frontend origin in the API CORS policy.'],
 ['CRUD','Backend','Create, Read, Update and Delete: the four basic data-management operations.','An admin can create, inspect, edit and archive a resource.'],
 ['DOM','Frontend','The Document Object Model represents a web page as a tree of objects.','JavaScript updates a button label through the DOM.'],
 ['JWT','Security','JSON Web Token is a compact token format often used to carry signed claims.','A server verifies a token signature and expiry before accepting it.'],
 ['Middleware','Backend','A function that runs during a request-response lifecycle and can inspect or change the request.','Authentication middleware checks the current user before a protected route.'],
 ['NoSQL','Database','A broad family of database systems that do not rely exclusively on relational tables.','MongoDB stores records as BSON documents in collections.'],
 ['ORM / ODM','Database','A mapping layer that connects application objects with relational records or document models.','Mongoose is an ODM commonly used with MongoDB.'],
 ['REST','Backend','An architectural style for networked systems built around resources and standard HTTP semantics.','GET /api/courses retrieves a collection of courses.'],
 ['Responsive Design','Design & UI','An approach that adapts layout and interaction to different screen sizes and input methods.','A three-column card grid becomes one column on narrow screens.'],
 ['Semantic HTML','Frontend','HTML elements chosen for the meaning and role of their content, not only their appearance.','Use <nav> for primary navigation and <main> for page content.'],
 ['State','Frontend','Data that determines what a component or application currently renders.','A search input stores its current query in component state.'],
 ['WebSocket','Networking','A persistent, bidirectional communication channel between a client and server.','A collaboration app broadcasts document updates in real time.']
].map(([term,category,definition,example],i)=>({id:i+1,term,category,definition,example}));
const LETTERS=['All',...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
export default function GlossaryPage(){
 const [query,setQuery]=useState('');const [letter,setLetter]=useState('All');const [expanded,setExpanded]=useState(null);
 const filtered=useMemo(()=>TERMS.filter(t=>(letter==='All'||t.term[0].toUpperCase()===letter)&&(`${t.term} ${t.category} ${t.definition} ${t.example}`.toLowerCase().includes(query.toLowerCase()))),[query,letter]);
 const counts=TERMS.reduce((a,t)=>{const l=t.term[0].toUpperCase();a[l]=(a[l]||0)+1;return a;},{});
 return <main className="rp-page"><div className="rp-shell">
  <section className="rp-subhero rp-glossary-hero"><span className="rp-eyebrow"><BookMarked size={15}/> DEVELOPER KNOWLEDGE BASE</span><h1>Understand the words.<br/><span>Master the craft.</span></h1><p>A clear, searchable glossary of concepts you'll encounter while designing, building and shipping software.</p><div className="rp-hero-meta"><span><Hash size={15}/>{TERMS.length} essential terms</span><span><BookOpen size={15}/>Practical examples included</span></div></section>
  <section className="rp-toolbar"><label className="rp-search"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search a term or concept..." aria-label="Search glossary"/>{query&&<button onClick={()=>setQuery('')} aria-label="Clear search"><X size={16}/></button>}</label><span className="rp-count">{filtered.length} terms</span></section>
  <nav className="rp-alphabet" aria-label="Filter glossary by first letter">{LETTERS.map(l=><button key={l} disabled={l!=='All'&&!counts[l]} className={letter===l?'is-active':''} onClick={()=>setLetter(l)}>{l==='All'?'All':l}</button>)}</nav>
  <section className="rp-glossary-list">{filtered.map((item,i)=><article className={`rp-term ${expanded===item.id?'is-expanded':''}`} key={item.id} style={{'--rp-index':i}}><button className="rp-term-trigger" onClick={()=>setExpanded(expanded===item.id?null:item.id)} aria-expanded={expanded===item.id}><span className="rp-term-letter">{item.term[0]}</span><span className="rp-term-main"><b>{item.term}</b><small>{item.category}</small></span><span className="rp-term-preview">{item.definition}</span><ChevronDown size={18} className="rp-term-chevron"/></button>{expanded===item.id&&<div className="rp-term-detail"><p>{item.definition}</p><div><b>IN PRACTICE</b><code>{item.example}</code></div></div>}</article>)}</section>
  {!filtered.length&&<div className="rp-empty"><Search size={24}/><h3>No terms found</h3><p>Try another keyword or choose a different letter.</p><button className="rp-button rp-primary" onClick={()=>{setQuery('');setLetter('All')}}>Show all terms</button></div>}
 </div></main>;
}
