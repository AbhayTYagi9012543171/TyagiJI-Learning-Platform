import React, { useMemo, useState } from 'react';
import { Play, RotateCcw, Terminal, Code2, Copy, Check, Info, Trash2 } from 'lucide-react';
import './resources-premium.css';

const STARTER=`// Try the mini JavaScript console
console.log("Welcome to the CodePath playground!");
console.log("JavaScript practice starts here.");
console.log(2026);
console.log(true);`;
function formatValue(value){if(typeof value==='string')return value;if(value===undefined)return 'undefined';try{return JSON.stringify(value,null,2)??String(value)}catch{return String(value)}}
// Deliberately supports only console.log with literal arguments and simple expressions.
// Arbitrary JavaScript is never evaluated in the application context.
function runSafeSnippet(source){
 const output=[];
 for(const rawLine of source.split('\n')){
  const line=rawLine.trim();
  if(!line || line.startsWith('//') || !line.startsWith('console.log(') || !line.endsWith(');')) continue;
  const raw=line.slice('console.log('.length,-2).trim();
  const parts=raw.match(/"[^"]*"|'[^']*'|`[^`]*`|[^,]+/g)||[];
  const values=parts.map(part=>{
   const p=part.trim();
   if((p.startsWith('"')&&p.endsWith('"'))||(p.startsWith("'")&&p.endsWith("'"))||(p.startsWith('`')&&p.endsWith('`'))) return p.slice(1,-1);
   if(!Number.isNaN(Number(p))&&p!=='') return Number(p);
   if(p==='true'||p==='false') return p==='true';
   if(p==='null') return null;
   return p;
  });
  if(values.length) output.push(values.map(formatValue).join(' '));
 }
 return output.length?output.join('\n'):'No supported console.log statements found. This learning console currently accepts console.log with literal strings, numbers and booleans.';
}
export default function PlaygroundPage(){
 const [code,setCode]=useState(STARTER);const [output,setOutput]=useState('Your output will appear here.');const [ran,setRan]=useState(false);const [copied,setCopied]=useState(false);
 const lineCount=useMemo(()=>Math.max(1,code.split('\n').length),[code]);
 const run=()=>{setOutput(runSafeSnippet(code));setRan(true);};
 const reset=()=>{setCode(STARTER);setOutput('Your output will appear here.');setRan(false);};
 const copy=async()=>{try{await navigator.clipboard.writeText(code);setCopied(true);window.setTimeout(()=>setCopied(false),1500)}catch{}};
 return <main className="rp-page"><div className="rp-shell rp-playground-shell">
  <section className="rp-subhero rp-play-hero"><span className="rp-eyebrow"><Code2 size={15}/> DEVELOPER LAB</span><h1>Think in code.<br/><span>Learn by doing.</span></h1><p>A focused space to experiment with JavaScript output and build confidence one small step at a time.</p><div className="rp-hero-meta"><span><Terminal size={15}/>JavaScript practice</span><span><Info size={15}/>Guided mini console</span></div></section>
  <div className="rp-lab-heading"><div><span className="rp-section-kicker">YOUR WORKSPACE</span><h2>JavaScript playground</h2></div><div className="rp-lab-actions"><button className="rp-button" onClick={reset}><RotateCcw size={15}/> Reset</button><button className="rp-button" onClick={copy}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy code'}</button><button className="rp-button rp-primary" onClick={run}><Play size={15} fill="currentColor"/> Run snippet</button></div></div>
  <section className="rp-lab-grid"><div className="rp-editor-panel"><div className="rp-panel-bar"><span><i className="rp-live-dot"/> editor.js</span><span>JavaScript · {lineCount} lines</span></div><div className="rp-editor-body"><pre aria-hidden="true">{Array.from({length:lineCount},(_,i)=>i+1).join('\n')}</pre><textarea spellCheck="false" value={code} onChange={e=>setCode(e.target.value)} aria-label="JavaScript code editor" /></div><div className="rp-editor-foot"><span>Editable practice snippet</span><span>Indentation: 2 spaces</span></div></div>
   <div className="rp-output-panel"><div className="rp-panel-bar"><span><Terminal size={15}/> console</span><button onClick={()=>{setOutput('Console cleared.');setRan(false)}} aria-label="Clear console"><Trash2 size={15}/> Clear</button></div><div className="rp-output-body">{ran&&<span className="rp-output-status"><i/> Execution preview</span>}<pre>{output}</pre></div><div className="rp-output-foot"><span>{ran?'Preview complete':'Waiting for a run'}</span><span className="rp-output-indicator"><i/>{ran?'Ready':'Idle'}</span></div></div></section>
  <aside className="rp-safety-note"><Info size={17}/><p><b>Learning console:</b> This intentionally limited preview recognizes basic <code>console.log()</code> statements with literal values. It does not execute arbitrary JavaScript or access your browser, files or network. Use a dedicated sandbox for full language execution.</p></aside>
 </div></main>;
}
