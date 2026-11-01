
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Code2,
  GraduationCap,
  Layers3,
  LockKeyhole,
  PlayCircle,
  Sparkles,
} from 'lucide-react';

import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../styles/course-premium.css';

const toArray = (value) => (Array.isArray(value) ? value : []);

const getId = (value) => {
  if (value && typeof value === 'object') {
    return String(value._id || value.id || '');
  }

  return String(value || '');
};

const formatDuration = (value) => {
  const minutes = Number(value);

  if (!Number.isFinite(minutes) || minutes <= 0) {
    return 'Self-paced';
  }

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return remainingMinutes
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }

  return `${minutes} min`;
};

function isAbortError(error) {
  return (
    error?.name === 'AbortError' ||
    error?.code === 'ABORT_ERR' ||
    error?.cause?.name === 'AbortError'
  );
}

export default function CourseDetailsPage() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();

  const [data, setData] = useState({});
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [openModules, setOpenModules] = useState({});

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError('');
    setData({});
    setNotice('');

    api
      .get(`/courses/${encodeURIComponent(slug || '')}`, {
        signal: controller.signal,
      })
      .then((result) => {
        if (!controller.signal.aborted) {
          setData(result || {});
        }
      })
      .catch((requestError) => {
        if (
          !controller.signal.aborted &&
          !isAbortError(requestError)
        ) {
          setError(
            requestError.message || 'Unable to load this course.'
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [slug]);

  const course = data.course || null;
  const modules = toArray(data.modules);
  const lessons = toArray(data.lessons);

  useEffect(() => {
    if (!isAuthenticated) {
      setEnrolled(false);
      return undefined;
    }

    if (!course?._id && !slug) {
      return undefined;
    }

    let active = true;

    api
      .get('/enrollments/me')
      .then((result) => {
        if (!active) return;

        const enrollments = toArray(result?.enrollments);

        setEnrolled(
          enrollments.some((item) => {
            const enrolledCourse = item?.course;

            return (
              (course?._id &&
                getId(enrolledCourse) === getId(course._id)) ||
              (slug &&
                enrolledCourse?.slug === slug)
            );
          })
        );
      })
      .catch(() => {
        if (active) {
          setEnrolled(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, course?._id, slug]);

  const moduleLessons = useMemo(() => {
    const result = new Map();

    modules.forEach((module) => {
      result.set(
        getId(module),
        lessons.filter(
          (lesson) => getId(lesson.module) === getId(module)
        )
      );
    });

    return result;
  }, [modules, lessons]);

  const totalMinutes = lessons.reduce(
    (total, lesson) =>
      total + (Number(lesson.durationMinutes) || 0),
    0
  );

  const objectives = toArray(course?.objectives).length
    ? toArray(course.objectives)
    : toArray(course?.learningOutcomes);

  const unassignedLessons = lessons.filter(
    (lesson) =>
      !modules.some(
        (module) => getId(module) === getId(lesson.module)
      )
  );

  async function handleEnroll() {
    if (!isAuthenticated) {
      window.location.assign('/login');
      return;
    }

    if (!course?._id || busy || enrolled) {
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');

    try {
      await api.post(`/courses/${course._id}/enroll`, {});

      setEnrolled(true);
      setNotice(
        'You are enrolled. Your learning path is ready.'
      );
    } catch (requestError) {
      setError(
        requestError.message || 'Unable to enroll in this course.'
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="cp-page">
        <div className="cp-state" role="status">
          <span className="cp-spinner" />
          Preparing course details...
        </div>
      </main>
    );
  }

  if (error && !course) {
    return (
      <main className="cp-page">
        <div className="cp-state cp-error" role="alert">
          <h2>Course could not be loaded</h2>
          <p>{error}</p>
          <Link to="/courses" className="cp-primary-button">
            Back to courses
          </Link>
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="cp-page">
        <div className="cp-state">
          <h2>Course not found</h2>
          <Link to="/courses" className="cp-primary-button">
            Browse courses
          </Link>
        </div>
      </main>
    );
  }

  const courseSlug = course.slug || slug;

  return (
    <main className="cp-page cp-course-detail">
      <Link to="/courses" className="cp-back-link">
        <ArrowLeft size={16} />
        All courses
      </Link>

      <section className="cp-detail-hero">
        <div className="cp-detail-copy">
          <div className="cp-eyebrow">
            <Sparkles size={14} />
            {course.technology || 'PROFESSIONAL LEARNING'}
            <span>·</span>
            {course.difficulty || 'Beginner'}
          </div>

          <h1>{course.title}</h1>

          <p className="cp-detail-tagline">
            {course.tagline || course.description}
          </p>

          <div className="cp-detail-meta">
            <span>
              <Layers3 size={16} />
              {modules.length} modules
            </span>
            <span>
              <BookOpen size={16} />
              {lessons.length} lessons
            </span>
            <span>
              <Clock3 size={16} />
              {course.estimatedHours
                ? `${course.estimatedHours} hours`
                : formatDuration(totalMinutes)}
            </span>
          </div>

          <div className="cp-detail-actions">
            {enrolled ? (
              <Link
                to={
                  lessons[0]
                    ? `/courses/${courseSlug}/lessons/${lessons[0].slug}`
                    : '/dashboard'
                }
                className="cp-primary-button"
              >
                <PlayCircle size={18} />
                Continue learning
              </Link>
            ) : (
              <button
                type="button"
                className="cp-primary-button"
                onClick={handleEnroll}
                disabled={busy}
              >
                <GraduationCap size={18} />
                {busy
                  ? 'Enrolling...'
                  : isAuthenticated
                    ? 'Enroll in this course'
                    : 'Sign in to enroll'}
              </button>
            )}

            <span className="cp-access-note">
              <LockKeyhole size={13} />
              {course.isPremium
                ? 'Premium course access'
                : 'Open learning path'}
            </span>
          </div>

          {notice && (
            <p className="cp-notice" role="status">
              {notice}
            </p>
          )}

          {error && (
            <p className="cp-inline-error" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="cp-detail-art">
          {course.thumbnailUrl ? (
            <img src={course.thumbnailUrl} alt="" />
          ) : (
            <div className="cp-detail-monogram">
              <Code2 size={54} />
              <span>
                {(course.technology || 'TJ')
                  .slice(0, 3)
                  .toUpperCase()}
              </span>
            </div>
          )}

          <div className="cp-art-caption">
            LEARN · PRACTICE · CREATE
          </div>
        </div>
      </section>

      <div className="cp-detail-layout">
        <div className="cp-detail-main">
          <section className="cp-content-section">
            <span className="cp-eyebrow">
              YOUR LEARNING OUTCOMES
            </span>

            <h2>What you will be able to do</h2>

            {objectives.length > 0 ? (
              <ul className="cp-check-list">
                {objectives.map((item, index) => (
                  <li key={`${item}-${index}`}>
                    <CheckCircle2 size={18} />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                {course.description ||
                  'Learning outcomes will be available soon.'}
              </p>
            )}
          </section>

          {toArray(course.skills).length > 0 && (
            <section className="cp-content-section">
              <span className="cp-eyebrow">
                SKILLS YOU WILL DEVELOP
              </span>

              <h2>Practical skills</h2>

              <div className="cp-skill-cloud">
                {toArray(course.skills).map((skill, index) => (
                  <span key={`${skill}-${index}`}>{skill}</span>
                ))}
              </div>
            </section>
          )}

          <section className="cp-content-section">
            <div className="cp-section-heading">
              <div>
                <span className="cp-eyebrow">
                  THE LEARNING JOURNEY
                </span>
                <h2>Course curriculum</h2>
                <p>
                  {modules.length} modules · {lessons.length} lessons ·{' '}
                  {formatDuration(totalMinutes)} of guided content
                </p>
              </div>
            </div>

            {modules.length > 0 ? (
              <div className="cp-module-list">
                {modules.map((module, index) => {
                  const moduleId = getId(module);
                  const items = moduleLessons.get(moduleId) || [];
                  const expanded =
                    openModules[moduleId] ?? index === 0;

                  return (
                    <section
                      className="cp-module"
                      key={moduleId || module.slug || index}
                    >
                      <button
                        type="button"
                        className="cp-module-toggle"
                        onClick={() =>
                          setOpenModules((previous) => ({
                            ...previous,
                            [moduleId]: !expanded,
                          }))
                        }
                        aria-expanded={expanded}
                      >
                        <span className="cp-module-number">
                          {String(index + 1).padStart(2, '0')}
                        </span>

                        <span className="cp-module-title">
                          <strong>{module.title}</strong>
                          <small>
                            {items.length} lessons ·{' '}
                            {formatDuration(module.estimatedMinutes)}
                          </small>
                        </span>

                        <span
                          className={`cp-chevron ${
                            expanded ? 'is-open' : ''
                          }`}
                        >
                          ⌄
                        </span>
                      </button>

                      {expanded && (
                        <div className="cp-module-content">
                          {module.description && (
                            <p>{module.description}</p>
                          )}

                          {toArray(module.objectives).length > 0 && (
                            <ul>
                              {toArray(module.objectives).map(
                                (item, objectiveIndex) => (
                                  <li key={objectiveIndex}>{item}</li>
                                )
                              )}
                            </ul>
                          )}

                          {items.map((lesson, lessonIndex) => (
                            <Link
                              className="cp-lesson-row"
                              to={`/courses/${courseSlug}/lessons/${lesson.slug}`}
                              key={getId(lesson) || lesson.slug || lessonIndex}
                            >
                              <span className="cp-lesson-icon">
                                <PlayCircle size={17} />
                              </span>

                              <span>
                                <strong>{lesson.title}</strong>
                                <small>
                                  {lesson.summary ||
                                    'Open lesson and explore the topic.'}
                                </small>
                              </span>

                              <em>
                                {formatDuration(lesson.durationMinutes)}
                              </em>

                              <ArrowRight size={16} />
                            </Link>
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            ) : (
              <div className="cp-state">
                Curriculum is being prepared for this course.
              </div>
            )}

            {unassignedLessons.length > 0 && (
              <div className="cp-unassigned-lessons">
                {unassignedLessons.map((lesson, index) => (
                  <Link
                    className="cp-lesson-row"
                    to={`/courses/${courseSlug}/lessons/${lesson.slug}`}
                    key={getId(lesson) || lesson.slug || index}
                  >
                    <BookOpen size={17} />
                    <strong>{lesson.title}</strong>
                    <ArrowRight size={16} />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="cp-detail-aside">
          <div className="cp-aside-card">
            <span className="cp-eyebrow">COURSE AT A GLANCE</span>
            <h3>Designed for real progress</h3>

            <div className="cp-aside-stat">
              <BookOpen />
              <span>
                <strong>{lessons.length}</strong>
                <small>Published lessons</small>
              </span>
            </div>

            <div className="cp-aside-stat">
              <Layers3 />
              <span>
                <strong>{modules.length}</strong>
                <small>Structured modules</small>
              </span>
            </div>

            <div className="cp-aside-stat">
              <Clock3 />
              <span>
                <strong>
                  {course.estimatedHours ||
                    Math.ceil(totalMinutes / 60) ||
                    'Flexible'}
                </strong>
                <small>Estimated hours</small>
              </span>
            </div>

            <div className="cp-aside-stat">
              <GraduationCap />
              <span>
                <strong>{course.difficulty || 'Beginner'}</strong>
                <small>Difficulty level</small>
              </span>
            </div>

            <button
              type="button"
              className="cp-primary-button cp-full-button"
              onClick={handleEnroll}
              disabled={busy || enrolled}
            >
              {enrolled
                ? 'You are enrolled'
                : busy
                  ? 'Please wait...'
                  : 'Start this course'}
            </button>
          </div>

          {toArray(course.prerequisites).length > 0 && (
            <div className="cp-aside-card">
              <h3>Before you begin</h3>

              <ul className="cp-prereq-list">
                {toArray(course.prerequisites).map(
                  (item, index) => (
                    <li key={index}>{item}</li>
                  )
                )}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
