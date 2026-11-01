
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Clock3,
  ExternalLink,
  PlayCircle,
} from 'lucide-react';
import { api } from '../../services/api.js';
import '../../styles/course-premium.css';

const arr = (value) => (Array.isArray(value) ? value : []);

const getPayload = (response) => response?.data ?? response ?? {};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const getId = (value) => {
  if (value && typeof value === 'object') {
    return value._id ?? value.id ?? '';
  }

  return value ?? '';
};

const isCanceled = (error) =>
  error?.name === 'AbortError' ||
  error?.name === 'CanceledError' ||
  error?.code === 'ERR_CANCELED';

export default function LessonPage() {
  const { lesson: slug, course: courseSlug } = useParams();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');

  // Load the requested lesson.
  useEffect(() => {
    const controller = new AbortController();

    async function loadLesson() {
      setLoading(true);
      setError('');
      setLesson(null);
      setMessage('');

      try {
        const response = await api.get(
          `/lessons/${encodeURIComponent(slug || '')}`,
          { signal: controller.signal },
        );

        if (controller.signal.aborted) return;

        const payload = getPayload(response);

        const lessonData =
          payload.lesson ??
          payload.data?.lesson ??
          payload.data ??
          null;

        if (!lessonData || typeof lessonData !== 'object') {
          setLesson(null);
          setError('The requested lesson could not be found.');
          return;
        }

        setLesson(lessonData);
      } catch (err) {
        if (!controller.signal.aborted && !isCanceled(err)) {
          setError(
            getErrorMessage(err, 'Unable to load lesson. Please try again.'),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadLesson();

    return () => controller.abort();
  }, [slug]);

  // Load the user's completion state and bookmarks.
  useEffect(() => {
    if (!lesson?._id) {
      setCompleted(false);
      setSaved(false);
      return undefined;
    }

    let active = true;

    async function loadUserState() {
      try {
        const [progressResponse, bookmarksResponse] = await Promise.all([
          api.get('/users/me/progress'),
          api.get('/users/me/bookmarks'),
        ]);

        if (!active) return;

        const progressPayload = getPayload(progressResponse);
        const bookmarksPayload = getPayload(bookmarksResponse);

        const progress =
          progressPayload.progress ??
          progressPayload.data?.progress ??
          [];

        const bookmarks =
          bookmarksPayload.bookmarks ??
          bookmarksPayload.data?.bookmarks ??
          [];

        const lessonCourseId = getId(lesson.course);

        const courseProgress = arr(progress).find(
          (item) =>
            String(getId(item?.course)) === String(lessonCourseId),
        );

        const completedIds = arr(courseProgress?.completedLessons).map(
          (item) => String(getId(item)),
        );

        setCompleted(completedIds.includes(String(lesson._id)));

        setSaved(
          arr(bookmarks).some((item) => {
            const bookmarkedLesson = item?.lesson ?? item;
            const bookmarkId = getId(bookmarkedLesson);

            return (
              String(bookmarkId) === String(lesson._id) ||
              (item?.lessonSlug &&
                item.lessonSlug === lesson.slug) ||
              (bookmarkedLesson?.slug &&
                bookmarkedLesson.slug === lesson.slug)
            );
          }),
        );
      } catch {
        // The lesson remains accessible if progress cannot be loaded.
      }
    }

    loadUserState();

    return () => {
      active = false;
    };
  }, [lesson]);

  async function completeLesson() {
    if (busy || completed || !lesson?._id) return;

    setBusy(true);
    setError('');
    setMessage('');

    try {
      await api.post(
        `/lessons/${encodeURIComponent(lesson._id)}/complete`,
        {},
      );

      setCompleted(true);
      setMessage('Lesson completed. Your progress has been saved.');
    } catch (err) {
      setError(
        getErrorMessage(err, 'Unable to save lesson progress.'),
      );
    } finally {
      setBusy(false);
    }
  }

  async function toggleBookmark() {
    if (busy || !lesson?._id) return;

    setBusy(true);
    setError('');
    setMessage('');

    try {
      const lessonId = encodeURIComponent(lesson._id);

      if (saved) {
        await api.delete(`/users/me/bookmarks/${lessonId}`);
        setSaved(false);
        setMessage('Bookmark removed.');
      } else {
        await api.post(`/users/me/bookmarks/${lessonId}`, {});
        setSaved(true);
        setMessage('Lesson saved to bookmarks.');
      }
    } catch (err) {
      setError(
        getErrorMessage(err, 'Unable to update bookmark.'),
      );
    } finally {
      setBusy(false);
    }
  }

  const coursePathId =
    courseSlug || getId(lesson?.course);

  const coursePath = `/courses/${encodeURIComponent(
    coursePathId || '',
  )}`;

  if (loading) {
    return (
      <main className="cp-page cp-lesson-page">
        <div
          className="cp-state"
          role="status"
          aria-live="polite"
        >
          Loading lesson...
        </div>
      </main>
    );
  }

  if (!lesson) {
    return (
      <main className="cp-page cp-lesson-page">
        <div className="cp-state cp-error">
          <h2>Lesson unavailable</h2>
          <p>
            {error ||
              'This lesson may have been unpublished or removed.'}
          </p>
          <Link to="/courses" className="cp-primary-button">
            Browse courses
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cp-page cp-lesson-page">
      <Link className="cp-back-link" to={coursePath}>
        <ArrowLeft size={16} aria-hidden="true" />
        Back to course
      </Link>

      <header className="cp-lesson-hero">
        <span className="cp-eyebrow">
          {lesson.course?.title || 'LEARNING PATH'}
          {' · '}
          {lesson.difficulty || 'Beginner'}
        </span>

        <h1>{lesson.title || 'Untitled lesson'}</h1>

        {lesson.summary && <p>{lesson.summary}</p>}

        <div className="cp-detail-meta">
          <span>
            <Clock3 size={16} aria-hidden="true" />
            {lesson.durationMinutes || 10} min
          </span>

          <span>
            <PlayCircle size={16} aria-hidden="true" />
            Guided lesson
          </span>

          {completed && (
            <span className="cp-completed-label">
              <CheckCircle2 size={16} aria-hidden="true" />
              Completed
            </span>
          )}
        </div>
      </header>

      <div className="cp-lesson-layout">
        <article className="cp-lesson-content">
          {arr(lesson.objectives).length > 0 && (
            <section className="cp-lesson-objectives">
              <h2>What you will learn</h2>

              <ul>
                {arr(lesson.objectives).map((item, index) => (
                  <li key={index}>
                    <CheckCircle2
                      size={17}
                      aria-hidden="true"
                    />
                    {typeof item === 'string'
                      ? item
                      : item?.text || item?.title || ''}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {arr(lesson.contentBlocks).map((block, index) => (
            <section
              className={`cp-lesson-block cp-block-${
                block?.type || 'text'
              }`}
              key={block?._id || index}
            >
              {block?.heading && <h2>{block.heading}</h2>}

              {block?.text && <p>{block.text}</p>}

              {block?.type === 'callout' && block?.text && (
                <div className="cp-callout">
                  {block.text}
                </div>
              )}

              {block?.code && (
                <pre className="cp-code-block">
                  <code>{block.code}</code>
                </pre>
              )}

              {block?.expectedOutput && (
                <div className="cp-output">
                  <strong>Expected output</strong>
                  <pre>{block.expectedOutput}</pre>
                </div>
              )}

              {block?.caption && (
                <small>{block.caption}</small>
              )}
            </section>
          ))}

          {arr(lesson.keyTakeaways).length > 0 && (
            <section className="cp-lesson-objectives">
              <h2>Key takeaways</h2>

              <ul>
                {arr(lesson.keyTakeaways).map((item, index) => (
                  <li key={index}>
                    <CheckCircle2
                      size={17}
                      aria-hidden="true"
                    />
                    {typeof item === 'string'
                      ? item
                      : item?.text || item?.title || ''}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {arr(lesson.resources).length > 0 && (
            <section className="cp-lesson-objectives">
              <h2>Further learning</h2>

              {arr(lesson.resources).map((resource, index) => (
                <a
                  className="cp-resource-link"
                  key={resource?.url || index}
                  href={resource?.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => {
                    if (!resource?.url) {
                      event.preventDefault();
                    }
                  }}
                >
                  {resource?.title || 'Learning resource'}
                  <ExternalLink
                    size={15}
                    aria-hidden="true"
                  />
                </a>
              ))}
            </section>
          )}

          {message && (
            <p
              className="cp-notice"
              role="status"
              aria-live="polite"
            >
              {message}
            </p>
          )}

          {error && (
            <p className="cp-inline-error" role="alert">
              {error}
            </p>
          )}

          <div className="cp-lesson-actions">
            <button
              type="button"
              className="cp-primary-button"
              onClick={completeLesson}
              disabled={busy || completed}
            >
              {completed ? (
                <>
                  <CheckCircle2
                    size={17}
                    aria-hidden="true"
                  />
                  Completed
                </>
              ) : (
                <>
                  <CheckCircle2
                    size={17}
                    aria-hidden="true"
                  />
                  {busy ? 'Saving...' : 'Mark as complete'}
                </>
              )}
            </button>

            <button
              type="button"
              className="cp-secondary-button"
              onClick={toggleBookmark}
              disabled={busy}
            >
              <Bookmark
                size={17}
                fill={saved ? 'currentColor' : 'none'}
                aria-hidden="true"
              />
              {busy
                ? 'Please wait...'
                : saved
                  ? 'Saved'
                  : 'Bookmark lesson'}
            </button>
          </div>
        </article>

        <aside className="cp-lesson-aside">
          <div className="cp-aside-card">
            <span className="cp-eyebrow">
              YOUR PROGRESS
            </span>

            <h3>
              {completed
                ? 'Nice work!'
                : 'One lesson at a time'}
            </h3>

            <p>
              {completed
                ? 'This lesson is marked complete in your learning history.'
                : 'Finish this lesson and mark it complete to keep your learning progress up to date.'}
            </p>

            <div
              className="cp-progress-track"
              role="progressbar"
              aria-label="Lesson completion"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={completed ? 100 : 0}
            >
              <span
                style={{
                  width: completed ? '100%' : '0%',
                }}
              />
            </div>

            <small>
              {completed
                ? 'Lesson complete'
                : 'Not completed yet'}
            </small>

            <Link
              className="cp-text-link"
              to={coursePath}
            >
              View full curriculum
              <ArrowRight
                size={15}
                aria-hidden="true"
              />
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
