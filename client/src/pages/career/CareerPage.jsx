import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Target, Plus, Trash2, CheckCircle2, BriefcaseBusiness, Save, LoaderCircle } from 'lucide-react';

const blankProfile = { targetRole: '', experienceLevel: 'exploring', skills: [], interests: [], weeklyHours: 5 };

export default function CareerPage() {
  const [profile, setProfile] = useState(blankProfile);
  const [roadmaps, setRoadmaps] = useState([]);
  const [skillText, setSkillText] = useState('');
  const [interestText, setInterestText] = useState('');
  const [roadmapTitle, setRoadmapTitle] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [milestoneText, setMilestoneText] = useState('');
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const [p, r] = await Promise.all([api('/career/profile'), api('/career/roadmaps')]);
      setProfile({ ...blankProfile, ...(p.profile || {}) });
      setRoadmaps(r.roadmaps || []);
    } catch (e) { setError(e.message || 'Unable to load career data.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const addTag = (field, value, setter) => {
    const tag = value.trim();
    if (tag && !profile[field].some((item) => item.toLowerCase() === tag.toLowerCase())) {
      setProfile((p) => ({ ...p, [field]: [...p[field], tag] }));
    }
    setter('');
  };
  async function saveProfile(e) {
    e.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      const result = await api('/career/profile', { method: 'PUT', body: JSON.stringify(profile) });
      setProfile({ ...blankProfile, ...result.profile }); setNotice('Career profile saved.');
    } catch (e) { setError(e.message || 'Could not save profile.'); }
    finally { setSaving(false); }
  }
  async function createRoadmap(e) {
    e.preventDefault(); if (!roadmapTitle.trim()) return;
    setSaving(true); setError(''); setNotice('');
    try {
      const result = await api('/career/roadmaps', { method: 'POST', body: JSON.stringify({
        title: roadmapTitle, targetRole, milestones: milestones.map((title, order) => ({ title, order, completed: false }))
      }) });
      setRoadmaps((items) => [result.roadmap, ...items]);
      setRoadmapTitle(''); setTargetRole(''); setMilestones([]); setNotice('Roadmap created.');
    } catch (e) { setError(e.message || 'Could not create roadmap.'); }
    finally { setSaving(false); }
  }
  async function toggleMilestone(roadmap, index) {
    const updated = roadmap.milestones.map((m, i) => i === index ? { ...m, completed: !m.completed } : m);
    try {
      const result = await api(`/career/roadmaps/${roadmap._id}`, { method: 'PATCH', body: JSON.stringify({ milestones: updated }) });
      setRoadmaps((items) => items.map((item) => item._id === roadmap._id ? result.roadmap : item));
    } catch (e) { setError(e.message || 'Could not update milestone.'); }
  }
  async function removeRoadmap(id) {
    try { await api(`/career/roadmaps/${id}`, { method: 'DELETE' }); setRoadmaps((items) => items.filter((r) => r._id !== id)); }
    catch (e) { setError(e.message || 'Could not delete roadmap.'); }
  }

  if (loading) return <main className="shell page"><div className="loading-state"><LoaderCircle className="loading-spinner"/> Loading career workspace…</div></main>;
  return <main className="shell page page-enter">
    <header className="intro"><span className="eyebrow">CAREER INTELLIGENCE</span><h1>Build your next chapter.</h1><p>Define your direction, track the skills you are developing, and turn your career goals into milestones.</p></header>
    {error && <div className="notice error-notice" role="alert">{error}</div>}
    {notice && <div className="notice success-notice" role="status">{notice}</div>}
    <div className="career-grid">
      <section className="panel career-panel">
        <div className="section-head"><div><span className="eyebrow">YOUR PROFILE</span><h2>Career direction</h2></div><Target size={24}/></div>
        <form onSubmit={saveProfile} className="career-form">
          <label>Target role<input value={profile.targetRole} onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })} placeholder="e.g. Full-stack developer"/></label>
          <label>Current experience<select value={profile.experienceLevel} onChange={(e) => setProfile({ ...profile, experienceLevel: e.target.value })}><option value="exploring">Exploring</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
          <label>Weekly learning hours<input type="number" min="0" max="80" value={profile.weeklyHours} onChange={(e) => setProfile({ ...profile, weeklyHours: Number(e.target.value) })}/></label>
          <label>Skills<input value={skillText} onChange={(e) => setSkillText(e.target.value)} placeholder="Add a skill and press Enter" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag('skills', skillText, setSkillText); } }}/></label>
          <div className="career-tags">{profile.skills.map((tag) => <button type="button" key={tag} onClick={() => setProfile((p) => ({ ...p, skills: p.skills.filter((x) => x !== tag) }))}>{tag} ×</button>)}</div>
          <label>Areas of interest<input value={interestText} onChange={(e) => setInterestText(e.target.value)} placeholder="Add an interest and press Enter" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag('interests', interestText, setInterestText); } }}/></label>
          <div className="career-tags">{profile.interests.map((tag) => <button type="button" key={tag} onClick={() => setProfile((p) => ({ ...p, interests: p.interests.filter((x) => x !== tag) }))}>{tag} ×</button>)}</div>
          <button className="btn primary" disabled={saving}><Save size={16}/>{saving ? 'Saving…' : 'Save career profile'}</button>
        </form>
      </section>
      <section className="panel career-panel">
        <div className="section-head"><div><span className="eyebrow">ACTION PLAN</span><h2>Create a roadmap</h2></div><BriefcaseBusiness size={24}/></div>
        <form className="career-form" onSubmit={createRoadmap}>
          <label>Roadmap name<input required minLength="2" maxLength="140" value={roadmapTitle} onChange={(e) => setRoadmapTitle(e.target.value)} placeholder="e.g. Become a React developer"/></label>
          <label>Target role<input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Optional"/></label>
          <label>Add milestone<input value={milestoneText} onChange={(e) => setMilestoneText(e.target.value)} placeholder="e.g. Build a portfolio project" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (milestoneText.trim()) { setMilestones((m) => [...m, milestoneText.trim()]); setMilestoneText(''); } } }}/></label>
          <div className="career-tags">{milestones.map((m, i) => <button type="button" key={`${m}-${i}`} onClick={() => setMilestones((items) => items.filter((_, n) => n !== i))}>{m} ×</button>)}</div>
          <button className="btn primary" disabled={saving || !roadmapTitle.trim()}><Plus size={16}/>Create roadmap</button>
        </form>
      </section>
    </div>
    <section className="section career-roadmaps"><div className="section-head"><div><span className="eyebrow">YOUR PLAN</span><h2>Career roadmaps</h2></div><span>{roadmaps.length} saved</span></div>
      {!roadmaps.length ? <div className="empty empty-premium"><Target size={28}/><h3>Your roadmap starts here</h3><p>Create a roadmap above to turn a career goal into trackable steps.</p><Link className="btn outline" to="/courses">Explore learning courses</Link></div> :
      <div className="career-roadmap-list">{roadmaps.map((roadmap) => {
        const done = roadmap.milestones.filter((m) => m.completed).length;
        const percent = roadmap.milestones.length ? Math.round(done / roadmap.milestones.length * 100) : 0;
        return <article className="panel career-roadmap" key={roadmap._id}><div className="section-head"><div><h3>{roadmap.title}</h3><p>{roadmap.targetRole || 'Career roadmap'} · {percent}% complete</p></div><button className="btn quiet" type="button" aria-label="Delete roadmap" onClick={() => removeRoadmap(roadmap._id)}><Trash2 size={16}/></button></div><div className="career-progress"><span style={{ width: `${percent}%` }}/></div>{roadmap.milestones.length ? roadmap.milestones.map((m, i) => <label className="career-milestone" key={`${m.title}-${i}`}><input type="checkbox" checked={m.completed} onChange={() => toggleMilestone(roadmap, i)}/><span>{m.title}</span>{m.completed && <CheckCircle2 size={16}/>}</label>) : <p className="muted">No milestones yet. Edit this roadmap by creating a new one with milestones.</p>}</article>;
      })}</div>}
    </section>
  </main>;
}
