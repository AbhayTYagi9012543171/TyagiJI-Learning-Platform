import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bookmark, CheckCircle2, Clock3, ExternalLink, PlayCircle } from 'lucide-react';
import { api } from '../../services/api.js';
import '../../styles/course-premium.css';

const arr = (value) => Array.isArray(value) ? value : [];

export default function LessonPage() {
  const { lesson: slug, course: courseSlug } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError('');
    api.get(`/lessons/${encodeURIComponent(slug || '')}`, { signal: controller.signal })
      .then((result) => setLesson(result.lesson || null))
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message || 'Unable to load lesson.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [slug]);

  useEffect(() => {
    if (!lesson?._id) return;
    let active = true;
    Promise.all([api.get('/users/me/progress'), api.get('/users/me/bookmarks')]).then(([progress, bookmarks]) => {
      if (!active) return;
      const entry = arr(progress.progress).find((item) => item.course?._id === lesson.course?._id || item.course === lesson.course?._id);
      setCompleted(arr(entry?.completedLessons).some((item) => String(item?._id || item) === String(lesson._id)));
      setSaved(arr(bookmarks.bookmarks).some((item) => item.lessonSlug === lesson.slug));
    }).catch(() => {});
    return () => { active = false; };
  }, [lesson]);

  async function completeLesson() {
    if (busy || completed || !lesson?._id) return;
    setBusy(true); setMessage(''); setError('');
    try { await api.post(`/lessons/${lesson._id}/complete`, {}); setCompleted(true); setMessage('Lesson completed. Your progress has been saved.'); }
    catch (err) { setError(err.message || 'Unable to save lesson progress.'); }
    finally { setBusy(false); }
  }

  async function toggleBookmark() {
    if (busy || !lesson?._id) return;
    setBusy(true); setError(''); setMessage('');
    try { await api(saved ? `/users/me/bookmarks/${lesson._id}` : `/users/me/bookmarks/${lesson._id}`, { method: saved ? 'DELETE' : 'POST' }); setSaved(!saved); setMessage(saved ? 'Bookmark removed.' : 'Lesson saved to bookmarks.'); }
    catch (err) { setError(err.message || 'Unable to update bookmark.'); }
    finally { setBusy(false); }
  }

  if (loading) return <main className="cp-page"><div className="cp-state">Loading lesson...</div></main>;
  if (!lesson) return <main className="cp-page"><div className="cp-state cp-error"><h2>Lesson unavailable</h2><p>{error || 'This lesson may have been unpublished.'}</p><Link to="/courses" className="cp-primary-button">Browse courses</Link></div></main>;

  return <main className="cp-page cp-lesson-page">
    <Link className="cp-back-link" to={`/courses/${courseSlug}`}><ArrowLeft size={16}/> Back to course</Link>
    <header className="cp-lesson-hero"><span className="cp-eyebrow">{lesson.course?.title || 'LEARNING PATH'} · {lesson.difficulty || 'Beginner'}</span><h1>{lesson.title}</h1><p>{lesson.summary}</p><div className="cp-detail-meta"><span><Clock3 size={16}/>{lesson.durationMinutes || 10} min</span><span><PlayCircle size={16}/> Guided lesson</span>{completed && <span className="cp-completed-label"><CheckCircle2 size={16}/> Completed</span>}</div></header>
    <div className="cp-lesson-layout"><article className="cp-lesson-content">
      {arr(lesson.objectives).length > 0 && <section className="cp-lesson-objectives"><h2>What you will learn</h2><ul>{arr(lesson.objectives).map((item, index) => <li key={index}><CheckCircle2 size={17}/>{item}</li>)}</ul></section>}
      {arr(lesson.contentBlocks).map((block, index) => <section className={`cp-lesson-block cp-block-${block.type || 'text'}`} key={block._id || index}>{block.heading && <h2>{block.heading}</h2>}{block.text && <p>{block.text}</p>}{block.type === 'callout' && block.text && <div className="cp-callout">{block.text}</div>}{block.code && <pre className="cp-code-block"><code>{block.code}</code></pre>}{block.expectedOutput && <div className="cp-output"><strong>Expected output</strong><pre>{block.expectedOutput}</pre></div>}{block.caption && <small>{block.caption}</small>}</section>)}
      {arr(lesson.keyTakeaways).length > 0 && <section className="cp-lesson-objectives"><h2>Key takeaways</h2><ul>{arr(lesson.keyTakeaways).map((item, index) => <li key={index}><CheckCircle2 size={17}/>{item}</li>)}</ul></section>}
      {arr(lesson.resources).length > 0 && <section className="cp-lesson-objectives"><h2>Further learning</h2>{arr(lesson.resources).map((resource, index) => <a className="cp-resource-link" key={resource.url || index} href={resource.url} target="_blank" rel="noreferrer">{resource.title || 'Learning resource'} <ExternalLink size={15}/></a>)}</section>}
      {message && <p className="cp-notice" role="status">{message}</p>}{error && <p className="cp-inline-error" role="alert">{error}</p>}
      <div className="cp-lesson-actions"><button className="cp-primary-button" onClick={completeLesson} disabled={busy || completed}>{completed ? <><CheckCircle2 size={17}/> Completed</> : <><CheckCircle2 size={17}/>{busy ? 'Saving...' : 'Mark as complete'}</>}</button><button className="cp-secondary-button" onClick={toggleBookmark} disabled={busy}><Bookmark size={17} fill={saved ? 'currentColor' : 'none'}/>{saved ? 'Saved' : 'Bookmark lesson'}</button></div>
    </article><aside className="cp-lesson-aside"><div className="cp-aside-card"><span className="cp-eyebrow">YOUR PROGRESS</span><h3>{completed ? 'Nice work!' : 'One lesson at a time'}</h3><p>{completed ? 'This lesson is marked complete in your learning history.' : 'Finish this lesson and mark it complete to keep your learning progress up to date.'}</p><div className="cp-progress-track"><span style={{ width: completed ? '100%' : '0%' }}/></div><small>{completed ? 'Lesson complete' : 'Not completed yet'}</small><Link className="cp-text-link" to={`/courses/${courseSlug}`}>View full curriculum <ArrowRight size={15}/></Link></div></aside></div>
  </main>;
}
