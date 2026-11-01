import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Clock3, Code2, GraduationCap, Layers3, LockKeyhole, PlayCircle, Sparkles } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../styles/course-premium.css';

const arr = (value) => Array.isArray(value) ? value : [];
const id = (value) => String(value?._id || value || '');
const duration = (value) => { const n = Number(value); if (!n) return 'Self-paced'; return n >= 60 ? `${Math.floor(n / 60)}h ${n % 60 ? `${n % 60}m` : ''}`.trim() : `${n} min`; };

export default function CourseDetailsPage() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState({});
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [openModules, setOpenModules] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    api.get(`/courses/${encodeURIComponent(slug || '')}`, { signal: controller.signal })
      .then(setData)
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message || 'Unable to load this course.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [slug]);

  useEffect(() => {
    if (!isAuthenticated) { setEnrolled(false); return; }
    let active = true;
    api.get('/enrollments/me').then((result) => {
      if (active) setEnrolled(arr(result.enrollments).some((item) => id(item.course) === id(data.course?._id) || item.course?.slug === slug));
    }).catch(() => { if (active) setEnrolled(false); });
    return () => { active = false; };
  }, [isAuthenticated, data.course?._id, slug]);

  const course = data.course;
  const modules = arr(data.modules);
  const lessons = arr(data.lessons);
  const moduleLessons = useMemo(() => {
    const map = new Map();
    modules.forEach((module) => map.set(id(module), lessons.filter((lesson) => id(lesson.module) === id(module))));
    return map;
  }, [modules, lessons]);
  const totalMinutes = lessons.reduce((sum, lesson) => sum + (Number(lesson.durationMinutes) || 0), 0);
  const objectives = arr(course?.objectives).length ? arr(course.objectives) : arr(course?.learningOutcomes);

  async function enroll() {
    if (!isAuthenticated) { window.location.assign('/login'); return; }
    if (!course?._id || busy) return;
    setBusy(true); setNotice(''); setError('');
    try { await api.post(`/courses/${course._id}/enroll`, {}); setEnrolled(true); setNotice('You are enrolled. Your learning path is ready.'); }
    catch (err) { setError(err.message || 'Unable to enroll in this course.'); }
    finally { setBusy(false); }
  }

  if (loading) return <main className="cp-page"><div className="cp-state"><span className="cp-spinner"/>Preparing course details...</div></main>;
  if (error && !course) return <main className="cp-page"><div className="cp-state cp-error"><h2>Course could not be loaded</h2><p>{error}</p><Link to="/courses" className="cp-primary-button">Back to courses</Link></div></main>;
  if (!course) return <main className="cp-page"><div className="cp-state"><h2>Course not found</h2><Link to="/courses" className="cp-primary-button">Browse courses</Link></div></main>;

  return <main className="cp-page cp-course-detail">
    <Link to="/courses" className="cp-back-link"><ArrowLeft size={16}/> All courses</Link>
    <section className="cp-detail-hero">
      <div className="cp-detail-copy">
        <div className="cp-eyebrow"><Sparkles size={14}/> {course.technology || 'PROFESSIONAL LEARNING'} <span>·</span> {course.difficulty || 'Beginner'}</div>
        <h1>{course.title}</h1>
        <p className="cp-detail-tagline">{course.tagline || course.description}</p>
        <div className="cp-detail-meta"><span><Layers3 size={16}/> {modules.length} modules</span><span><BookOpen size={16}/> {lessons.length} lessons</span><span><Clock3 size={16}/> {course.estimatedHours ? `${course.estimatedHours} hours` : duration(totalMinutes)}</span></div>
        <div className="cp-detail-actions">{enrolled ? <Link to={lessons[0] ? `/courses/${course.slug}/lessons/${lessons[0].slug}` : '/dashboard'} className="cp-primary-button"><PlayCircle size={18}/> Continue learning</Link> : <button className="cp-primary-button" onClick={enroll} disabled={busy}><GraduationCap size={18}/> {busy ? 'Enrolling...' : isAuthenticated ? 'Enroll in this course' : 'Sign in to enroll'}</button>}<span className="cp-access-note"><LockKeyhole size={13}/> {course.isPremium ? 'Premium course access' : 'Open learning path'}</span></div>
        {notice && <p className="cp-notice" role="status">{notice}</p>}{error && <p className="cp-inline-error" role="alert">{error}</p>}
      </div>
      <div className="cp-detail-art">{course.thumbnailUrl ? <img src={course.thumbnailUrl} alt=""/> : <div className="cp-detail-monogram"><Code2 size={54}/><span>{(course.technology || 'TJ').slice(0, 3).toUpperCase()}</span></div>}<div className="cp-art-caption">LEARN · PRACTICE · CREATE</div></div>
    </section>

    <div className="cp-detail-layout">
      <div className="cp-detail-main">
        <section className="cp-content-section"><span className="cp-eyebrow">YOUR LEARNING OUTCOMES</span><h2>What you will be able to do</h2>{objectives.length ? <ul className="cp-check-list">{objectives.map((item, index) => <li key={`${item}-${index}`}><CheckCircle2 size={18}/>{item}</li>)}</ul> : <p>{course.description}</p>}</section>
        {arr(course.skills).length > 0 && <section className="cp-content-section"><span className="cp-eyebrow">SKILLS YOU WILL DEVELOP</span><h2>Practical skills</h2><div className="cp-skill-cloud">{arr(course.skills).map((skill) => <span key={skill}>{skill}</span>)}</div></section>}
        <section className="cp-content-section"><div className="cp-section-heading"><div><span className="cp-eyebrow">THE LEARNING JOURNEY</span><h2>Course curriculum</h2><p>{modules.length} modules · {lessons.length} lessons · {duration(totalMinutes)} of guided content</p></div></div>
          {modules.length ? <div className="cp-module-list">{modules.map((module, index) => { const items = moduleLessons.get(id(module)) || []; const expanded = openModules[id(module)] ?? index === 0; return <section className="cp-module" key={id(module) || module.slug}><button className="cp-module-toggle" onClick={() => setOpenModules((old) => ({ ...old, [id(module)]: !expanded }))} aria-expanded={expanded}><span className="cp-module-number">{String(index + 1).padStart(2, '0')}</span><span className="cp-module-title"><strong>{module.title}</strong><small>{items.length} lessons · {duration(module.estimatedMinutes)}</small></span><span className={`cp-chevron ${expanded ? 'is-open' : ''}`}>⌄</span></button>{expanded && <div className="cp-module-content">{module.description && <p>{module.description}</p>}{arr(module.objectives).length > 0 && <ul>{arr(module.objectives).map((item, i) => <li key={i}>{item}</li>)}</ul>}{items.map((lesson) => <Link className="cp-lesson-row" to={`/courses/${course.slug}/lessons/${lesson.slug}`} key={id(lesson) || lesson.slug}><span className="cp-lesson-icon"><PlayCircle size={17}/></span><span><strong>{lesson.title}</strong><small>{lesson.summary || 'Open lesson and explore the topic.'}</small></span><em>{duration(lesson.durationMinutes)}</em><ArrowRight size={16}/></Link>)}</div>}</section>; })}</div> : <div className="cp-state">Curriculum is being prepared for this course.</div>}
          {lessons.some((lesson) => !modules.some((module) => id(module) === id(lesson.module))) && <div className="cp-unassigned-lessons">{lessons.filter((lesson) => !modules.some((module) => id(module) === id(lesson.module))).map((lesson) => <Link className="cp-lesson-row" to={`/courses/${course.slug}/lessons/${lesson.slug}`} key={id(lesson)}><BookOpen size={17}/><strong>{lesson.title}</strong><ArrowRight size={16}/></Link>)}</div>}
        </section>
      </div>
      <aside className="cp-detail-aside"><div className="cp-aside-card"><span className="cp-eyebrow">COURSE AT A GLANCE</span><h3>Designed for real progress</h3><div className="cp-aside-stat"><BookOpen/><span><strong>{lessons.length}</strong><small>Published lessons</small></span></div><div className="cp-aside-stat"><Layers3/><span><strong>{modules.length}</strong><small>Structured modules</small></span></div><div className="cp-aside-stat"><Clock3/><span><strong>{course.estimatedHours || Math.ceil(totalMinutes / 60) || 'Flexible'}</strong><small>Estimated hours</small></span></div><div className="cp-aside-stat"><GraduationCap/><span><strong>{course.difficulty || 'Beginner'}</strong><small>Difficulty level</small></span></div><button className="cp-primary-button cp-full-button" onClick={enroll} disabled={busy || enrolled}>{enrolled ? 'You are enrolled' : busy ? 'Please wait...' : 'Start this course'}</button></div>{arr(course.prerequisites).length > 0 && <div className="cp-aside-card"><h3>Before you begin</h3><ul className="cp-prereq-list">{arr(course.prerequisites).map((item, index) => <li key={index}>{item}</li>)}</ul></div>}</aside>
    </div>
  </main>;
}
