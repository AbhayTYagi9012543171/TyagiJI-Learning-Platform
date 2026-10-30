
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  CheckCircle2,
  Clock3,
  Code2,
  Compass,
  Copy,
  ExternalLink,
  FileText,
  GraduationCap,
  Layers3,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  X,
} from 'lucide-react';

import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import CourseGrid from '../components/courses/CourseGrid.jsx';
import {
  PageHeader as Intro,
  EmptyState as Empty,
  LoadingState as Loading,
  ErrorState as ErrorNotice,
  SuccessState as SuccessNotice,
  Container as PageContainer,
  SearchField as SearchInput,
  StatCard,
  ProgressBar,
} from '../components/ui/index.js';


/* =========================================================
   SHARED UTILITIES
========================================================= */

const EMPTY = Object.freeze({});

function getArray(value) {
  return Array.isArray(value) ? value : [];
}

function getText(value, fallback = '') {
  return typeof value === 'string' && value.trim()
    ? value.trim()
    : fallback;
}

function getError(error, fallback = 'Something went wrong. Please try again.') {
  return error?.message || fallback;
}

function makeSlug(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatDuration(minutes) {
  const value = Number(minutes);

  if (!Number.isFinite(value) || value <= 0) return null;

  if (value < 60) return `${value} min`;

  const hours = value / 60;

  return Number.isInteger(hours)
    ? `${hours} hr`
    : `${hours.toFixed(1)} hrs`;
}

function getId(value) {
  if (!value) return '';
  return String(value._id || value.id || value);
}

function getInitials(value) {
  return String(value || 'T')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

/* =========================================================
   DATA HOOK
========================================================= */

function useData(path, initialValue = EMPTY) {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    setVersion((current) => current + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const result = await api(path, { signal: controller.signal });

        if (active) {
          setData(result ?? initialValue);
        }
      } catch (err) {
        if (active && err.name !== 'AbortError') {
          setError(getError(err, 'Unable to load this content.'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [path, version]);

  return {
    data,
    loading,
    error,
    refresh,
  };
}

/* =========================================================
   SHARED UI COMPONENTS
   ========================================================= */

/* =========================================================
   HOME PAGE
========================================================= */

export function Home() {
  const { data, loading, error, refresh } = useData('/courses', {
    courses: [],
  });

  const courses = getArray(data.courses).slice(0, 6);

  return (
    <>
      <section className="hero shell hero-premium">
        <div className="hero-copy">
          <span className="hero-badge">
            <span className="badge-dot" />
            FULL-STACK & SOFTWARE DEVELOPMENT
          </span>

          <h1>
            Learn Today.
            <br />
            Build Tomorrow.
            <br />
            <em>Create Your Future.</em>
          </h1>

          <p className="lead">
            Learn programming through structured lessons, practical
            assignments, real projects, and beginner-friendly explanations.
            Build the skills to create things that matter.
          </p>

          <div className="hero-actions">
            <Link className="btn primary big" to="/courses">
              Explore Courses
              <ArrowRight size={18} />
            </Link>

            <Link className="btn outline big" to="/projects">
              <Play size={16} />
              Explore Projects
            </Link>
          </div>

          <div className="proof">
            <span>
              <CheckCircle2 size={16} />
              Beginner friendly
            </span>

            <span>
              <CheckCircle2 size={16} />
              Hands-on projects
            </span>

            <span>
              <CheckCircle2 size={16} />
              Learn by building
            </span>
          </div>
        </div>

        <div
          className="hero-art"
          aria-label="Illustration of a software development learning environment"
        >
          <div className="art-glow" />
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />

          <div className="learning-mode">
            <span className="play-tile">
              <Play fill="currentColor" size={18} />
            </span>

            <span>
              <small>Learning mode</small>
              <b>Build and practice</b>
            </span>
          </div>

          <div className="code-illustration">
            <div className="editor-top">
              <span className="traffic">
                <i />
                <i />
                <i />
              </span>

              <span>learning-project.jsx</span>
              <span className="editor-dots">•••</span>
            </div>

            <div className="editor-body">
              <aside>
                {Array.from({ length: 8 }, (_, index) => (
                  <b key={index}>{index + 1}</b>
                ))}
              </aside>

              <div className="code-lines">
                <span className="line long purple" />
                <span className="line medium blue" />
                <span className="line short orange" />
                <span className="line long green" />
                <span className="line medium purple" />
                <span className="line tiny blue" />
                <span className="line long orange" />
                <span className="line medium green" />
              </div>
            </div>
          </div>

          <div className="language-float html-float">
            <b>&lt;/&gt;</b>
            <span>HTML</span>
          </div>

          <div className="language-float python-float">
            <b>Py</b>
            <span>Python</span>
          </div>

          <div className="language-float c-float">
            <b>JS</b>
          </div>

          <div className="assignment-float">
            <b>
              <CheckCircle2 size={15} />
              Learning goals
            </b>
            <small>✓ Practice questions</small>
            <small>✓ Build projects</small>
          </div>
        </div>
      </section>

      <div className="strip">
        <div className="shell">
          <span>LEARN IN-DEMAND SKILLS</span>
          <b>HTML & CSS</b>
          <i />
          <b>JavaScript</b>
          <i />
          <b>MERN Stack</b>
          <i />
          <b>Full-stack projects</b>
        </div>
      </div>

      <section className="shell section">
        <div className="section-head">
          <div>
            <span className="eyebrow">A CLEAR PATH FORWARD</span>
            <h2>Start with the essentials.</h2>
            <p>
              Build a strong foundation, then turn what you learn into
              something real.
            </p>
          </div>

          <Link className="text-link" to="/courses">
            Explore all courses
            <ArrowRight size={16} />
          </Link>
        </div>

        <ErrorNotice error={error} onRetry={refresh} />

        {loading ? (
          <Loading text="Loading featured courses..." />
        ) : courses.length ? (
          <CourseGrid courses={courses} />
        ) : (
          <Empty
            title="Your learning journey starts here"
            text="Published courses will appear here when they are available in the course catalog."
            action={
              <Link className="btn outline" to="/courses">
                Browse course library
              </Link>
            }
          />
        )}
      </section>

      <section className="section shaded">
        <div className="shell">
          <span className="eyebrow">LEARNING THAT STICKS</span>
          <h2>Learn it. Practice it. Build it.</h2>

          <p>
            Move beyond watching tutorials with guided practice and
            real-world projects.
          </p>

          <div className="features">
            {[
              {
                icon: <Layers3 />,
                title: 'Guided learning paths',
                text: 'Follow structured lessons with clear next steps.',
              },
              {
                icon: <Code2 />,
                title: 'Practice as you learn',
                text: 'Experiment with code examples and exercises.',
              },
              {
                icon: <Trophy />,
                title: 'Build a portfolio',
                text: 'Turn concepts into practical projects.',
              },
              {
                icon: <CheckCircle2 />,
                title: 'Track your progress',
                text: 'Keep completed lessons and quiz attempts together.',
              },
            ].map((feature) => (
              <article className="feature-card" key={feature.title}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="shell cta">
        <div>
          <span className="eyebrow">YOUR FUTURE STARTS WITH ONE STEP</span>
          <h2>Ready to build something?</h2>
          <p>
            Choose a course, practice a little every day, and watch your
            skills grow.
          </p>
        </div>

        <Link className="btn primary big" to="/courses">
          Start learning
          <ArrowRight size={18} />
        </Link>
      </section>
    </>
  );
}

/* =========================================================
   COURSE CATALOG
========================================================= */

export function Courses() {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('All levels');
  const [technology, setTechnology] = useState('All topics');

  const { data, loading, error, refresh } = useData('/courses', {
    courses: [],
  });

  const allCourses = getArray(data.courses);

  const topics = useMemo(
    () => [
      'All topics',
      ...new Set(
        allCourses
          .map((course) => course.technology)
          .filter(Boolean)
      ),
    ],
    [allCourses]
  );

  const filteredCourses = useMemo(() => {
    const search = query.trim().toLowerCase();

    return allCourses.filter((course) => {
      const searchable = [
        course.title,
        course.description,
        course.technology,
        ...(getArray(course.objectives)),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = !search || searchable.includes(search);

      const matchesLevel =
        level === 'All levels' || course.difficulty === level;

      const matchesTechnology =
        technology === 'All topics' ||
        course.technology === technology;

      return matchesSearch && matchesLevel && matchesTechnology;
    });
  }, [allCourses, query, level, technology]);

  function clearFilters() {
    setQuery('');
    setLevel('All levels');
    setTechnology('All topics');
  }

  return (
    <PageContainer>
      <Intro
        tag="PREMIUM LEARNING LIBRARY"
        title="Choose a skill. Build something real."
        text="Structured learning paths with detailed lessons, worked examples, practice labs, knowledge checks, and portfolio projects."
      />

      <div className="catalog-controls">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search courses, skills, or technologies..."
        />

        <label className="filter-control">
          <span>Technology</span>

          <select
            value={technology}
            onChange={(event) => setTechnology(event.target.value)}
          >
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-control">
          <span>Level</span>

          <select
            value={level}
            onChange={(event) => setLevel(event.target.value)}
          >
            {[
              'All levels',
              'Beginner',
              'Intermediate',
              'Advanced',
            ].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        {(query || level !== 'All levels' || technology !== 'All topics') && (
          <button
            type="button"
            className="btn quiet"
            onClick={clearFilters}
          >
            <X size={15} />
            Clear
          </button>
        )}
      </div>

      <div className="catalog-summary">
        <strong>
          {filteredCourses.length} learning paths
        </strong>

        <span>
          Detailed curriculum · Hands-on practice · Capstone projects
        </span>
      </div>

      <ErrorNotice error={error} onRetry={refresh} />

      {loading ? (
        <Loading text="Finding your courses..." />
      ) : filteredCourses.length ? (
        <CourseGrid courses={filteredCourses} />
      ) : (
        <Empty
          title={
            allCourses.length
              ? 'No matching courses'
              : 'No published courses yet'
          }
          text={
            allCourses.length
              ? 'Try changing your search or filters.'
              : 'The course library will appear here after courses are added and published in the database.'
          }
          action={
            allCourses.length > 0 ? (
              <button className="btn outline" onClick={clearFilters}>
                Clear filters
              </button>
            ) : (
              <button className="btn outline" onClick={refresh}>
                Check again
              </button>
            )
          }
        />
      )}
    </PageContainer>
  );
}

/* =========================================================
   COURSE DETAILS
========================================================= */

export function Course() {
  const { slug } = useParams();

  const {
    data,
    loading,
    error,
    refresh,
  } = useData(`/courses/${encodeURIComponent(slug || '')}`, {});

  const course = data.course;
  const modules = getArray(data.modules);
  const lessons = getArray(data.lessons);

  const moduleIds = useMemo(
    () => new Set(modules.map((module) => getId(module._id))),
    [modules]
  );

  const unassignedLessons = lessons.filter(
    (lesson) =>
      !lesson.module || !moduleIds.has(getId(lesson.module))
  );

  const totalMinutes = lessons.reduce(
    (total, lesson) => total + (Number(lesson.durationMinutes) || 0),
    0
  );

  if (loading) {
    return (
      <PageContainer>
        <Loading text="Loading course curriculum..." />
      </PageContainer>
    );
  }

  if (error && !course) {
    return (
      <PageContainer>
        <ErrorNotice error={error} onRetry={refresh} />
        <Empty
          title="Unable to load this course"
          text="Check your connection and try again."
          action={
            <Link className="btn outline" to="/courses">
              Back to courses
            </Link>
          }
        />
      </PageContainer>
    );
  }

  if (!course) {
    return (
      <PageContainer>
        <Empty
          title="Course not found"
          text="This course may have been removed or is not published."
          action={
            <Link className="btn primary" to="/courses">
              Browse courses
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const assessmentSlug = [
    'html',
    'css',
    'javascript',
  ].includes(slug)
    ? `${slug}-foundations-quiz`
    : `${slug}-assessment`;

  return (
    <PageContainer>
      <Link className="back" to="/courses">
        ← All courses
      </Link>

      <section className="detail detail-premium">
        <span className="eyebrow">
          {course.technology} · {course.difficulty || 'Beginner'}
        </span>

        <h1>{course.title}</h1>

        <p>{course.description}</p>

        <div className="detail-tags">
          <span className="pill">
            <BookOpen size={14} />
            {lessons.length || course.lessonCount || 'Guided'} lessons
          </span>

          <span className="pill">
            <Layers3 size={14} />
            {modules.length || 'Structured'} modules
          </span>

          {course.estimatedHours > 0 && (
            <span className="pill">
              <Clock3 size={14} />
              {course.estimatedHours} hours
            </span>
          )}
        </div>

        <div className="course-meta-grid">
          <div>
            <strong>{course.difficulty || 'Beginner'}</strong>
            <small>Learning level</small>
          </div>

          <div>
            <strong>{modules.length || 'Structured'}</strong>
            <small>Curriculum modules</small>
          </div>

          <div>
            <strong>
              {totalMinutes
                ? formatDuration(totalMinutes)
                : course.estimatedHours
                  ? `${course.estimatedHours} hrs`
                  : 'Flexible'}
            </strong>
            <small>Learning duration</small>
          </div>
        </div>
      </section>

      {getArray(course.objectives).length > 0 && (
        <section className="panel outcomes">
          <h2>What you will learn</h2>

          <ul>
            {course.objectives.map((objective, index) => (
              <li key={`${objective}-${index}`}>
                <CheckCircle2 size={17} />
                {objective}
              </li>
            ))}
          </ul>

          {getArray(course.prerequisites).length > 0 && (
            <>
              <h3>Before you start</h3>

              <ul>
                {course.prerequisites.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      <div className="section-head">
        <div>
          <span className="eyebrow">YOUR LEARNING ROADMAP</span>
          <h2>Course curriculum</h2>
          <p>Work through the lessons at your own pace.</p>
        </div>
      </div>

      <div className="curriculum-list">
        {modules.length ? (
          modules.map((module, index) => {
            const moduleLessons = lessons.filter(
              (lesson) => getId(lesson.module) === getId(module._id)
            );

            return (
              <section
                className="curriculum-module"
                key={module._id || module.slug || index}
              >
                <div className="curriculum-module-head">
                  <span className="module-number">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <div>
                    <h3>{module.title}</h3>
                    <p>{module.description}</p>

                    {module.estimatedMinutes > 0 && (
                      <small>
                        <Clock3 size={13} />
                        {formatDuration(module.estimatedMinutes)}
                      </small>
                    )}
                  </div>
                </div>

                <div className="rows">
                  {moduleLessons.map((lesson) => (
                    <Link
                      className="row"
                      to={`/courses/${slug}/lessons/${lesson.slug}`}
                      key={lesson._id || lesson.slug}
                    >
                      <b>
                        <BookOpen size={16} />
                      </b>

                      <span>
                        {lesson.title}

                        <small>
                          {lesson.durationMinutes || 10} min ·{' '}
                          {lesson.difficulty || 'Beginner'}
                        </small>
                      </span>

                      <ArrowUpRight size={17} />
                    </Link>
                  ))}

                  {!moduleLessons.length && (
                    <p className="muted">
                      No published lessons in this module yet.
                    </p>
                  )}
                </div>
              </section>
            );
          })
        ) : (
          lessons.map((lesson, index) => (
            <Link
              className="row"
              to={`/courses/${slug}/lessons/${lesson.slug}`}
              key={lesson._id || lesson.slug}
            >
              <b>{String(index + 1).padStart(2, '0')}</b>

              <span>
                {lesson.title}
                <small>
                  {lesson.durationMinutes || 10} min ·{' '}
                  {lesson.difficulty || 'Beginner'}
                </small>
              </span>

              <ArrowUpRight size={17} />
            </Link>
          ))
        )}

        {unassignedLessons.length > 0 && modules.length > 0 && (
          <section className="curriculum-module">
            <div className="curriculum-module-head">
              <span className="module-number">+</span>

              <div>
                <h3>Additional lessons</h3>
                <p>Lessons not currently assigned to a module.</p>
              </div>
            </div>

            <div className="rows">
              {unassignedLessons.map((lesson) => (
                <Link
                  className="row"
                  to={`/courses/${slug}/lessons/${lesson.slug}`}
                  key={lesson._id || lesson.slug}
                >
                  <b>
                    <BookOpen size={16} />
                  </b>

                  <span>
                    {lesson.title}
                    <small>
                      {lesson.durationMinutes || 10} min
                    </small>
                  </span>

                  <ArrowUpRight size={17} />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {!lessons.length && (
        <Empty
          title="Lessons are being prepared"
          text="This course does not have published lessons yet."
        />
      )}

      <div className="course-assessment-cta">
        <div>
          <span className="eyebrow">TEST YOUR KNOWLEDGE</span>
          <h2>Ready for the assessment?</h2>
          <p>Check your understanding of the course topics.</p>
        </div>

        <Link className="btn primary" to={`/quiz/${assessmentSlug}`}>
          Take course assessment
          <ArrowRight size={17} />
        </Link>
      </div>
    </PageContainer>
  );
}

/* =========================================================
   LESSON PAGE
========================================================= */

export function Lesson() {
  const { lesson: lessonSlug } = useParams();

  const {
    data,
    loading,
    error,
    refresh,
  } = useData(
    `/lessons/${encodeURIComponent(lessonSlug || '')}`,
    {}
  );

  const { user } = useAuth();

  const lesson = data.lesson;

  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let active = true;

    if (!lesson?._id || !user) {
      setSaved(false);
      return undefined;
    }

    api('/users/me/bookmarks')
      .then((result) => {
        if (active) {
          setSaved(
            getArray(result.bookmarks).some(
              (bookmark) => bookmark.lessonSlug === lesson.slug
            )
          );
        }
      })
      .catch(() => {
        if (active) setSaved(false);
      });

    return () => {
      active = false;
    };
  }, [lesson?._id, lesson?.slug, user]);

  async function markComplete() {
    if (!lesson?._id || busy) return;

    setBusy(true);
    setActionError('');
    setActionMessage('');

    try {
      await api(`/lessons/${lesson._id}/complete`, {
        method: 'POST',
      });

      setActionMessage('Lesson completed. Your progress has been saved.');
    } catch (err) {
      setActionError(getError(err));
    } finally {
      setBusy(false);
    }
  }

  async function toggleBookmark() {
    if (!lesson?._id || busy) return;

    setBusy(true);
    setActionError('');
    setActionMessage('');

    try {
      await api(`/users/me/bookmarks/${lesson._id}`, {
        method: saved ? 'DELETE' : 'POST',
      });

      setSaved((current) => !current);

      setActionMessage(
        saved ? 'Bookmark removed.' : 'Lesson saved to your library.'
      );
    } catch (err) {
      setActionError(getError(err));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <PageContainer narrow>
        <Loading text="Loading lesson content..." />
      </PageContainer>
    );
  }

  if (!lesson) {
    return (
      <PageContainer narrow>
        <ErrorNotice error={error} onRetry={refresh} />

        <Empty
          title="Lesson unavailable"
          text="This lesson may have been removed or is not published."
          action={
            <Link className="btn outline" to="/courses">
              Browse courses
            </Link>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer narrow>
      <Link className="back" to="/courses">
        ← Back to courses
      </Link>

      <div className="lesson-heading">
        <span className="eyebrow">
          {lesson.difficulty || 'BEGINNER'} LESSON
        </span>

        <h1>{lesson.title}</h1>
        <p className="lead">{lesson.summary}</p>

        {lesson.durationMinutes > 0 && (
          <span className="pill">
            <Clock3 size={14} />
            {lesson.durationMinutes} minutes
          </span>
        )}
      </div>

      {getArray(lesson.objectives).length > 0 && (
        <section className="panel">
          <h2>Lesson objectives</h2>

          <ul>
            {lesson.objectives.map((objective, index) => (
              <li key={`${objective}-${index}`}>{objective}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="lesson-content">
        {getArray(lesson.contentBlocks).map((block, index) => (
          <section className="lesson-block" key={index}>
            {block.heading && <h2>{block.heading}</h2>}

            {block.text && <p>{block.text}</p>}

            {block.code && (
              <pre>
                <code>{block.code}</code>
              </pre>
            )}
          </section>
        ))}
      </div>

      {getArray(lesson.keyTakeaways).length > 0 && (
        <section className="panel outcomes">
          <h2>Key takeaways</h2>

          <ul>
            {lesson.keyTakeaways.map((item, index) => (
              <li key={`${item}-${index}`}>
                <CheckCircle2 size={17} />
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {getArray(lesson.resources).length > 0 && (
        <section className="panel">
          <h2>Additional resources</h2>

          {lesson.resources.map((resource, index) => (
            <a
              className="row"
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              key={resource.url || index}
            >
              <span>{resource.title || resource.label || 'Learning resource'}</span>
              <ExternalLink size={16} />
            </a>
          ))}
        </section>
      )}

      <ErrorNotice error={actionError} />
      <SuccessNotice>{actionMessage}</SuccessNotice>

      <div className="lesson-actions">
        <button
          className="btn primary"
          type="button"
          disabled={busy}
          onClick={markComplete}
        >
          <CheckCircle2 size={17} />
          {busy ? 'Saving...' : 'Mark complete'}
        </button>

        <button
          className="btn outline"
          type="button"
          disabled={busy || !user}
          onClick={toggleBookmark}
          title={!user ? 'Sign in to save lessons' : ''}
        >
          <Bookmark size={17} />
          {saved ? 'Remove bookmark' : 'Save lesson'}
        </button>
      </div>
    </PageContainer>
  );
}

/* =========================================================
   PROJECT CATALOG
========================================================= */

export function Projects() {
  const { data, loading, error, refresh } = useData('/projects', {
    projects: [],
  });

  const projects = getArray(data.projects);

  return (
    <PageContainer>
      <Intro
        tag="PROJECT LAB"
        title="Learn by making."
        text="Guided builds turn concepts into working things. Start simple and grow your confidence."
      />

      <ErrorNotice error={error} onRetry={refresh} />

      {loading ? (
        <Loading text="Loading project lab..." />
      ) : projects.length ? (
        <div className="project-grid">
          {projects.map((project) => (
            <article
              className="project-card project-card-premium"
              key={project._id || project.slug}
            >
              <span className="pill">
                {project.difficulty || 'Practice'}
              </span>

              <div className="feature-icon">
                <Code2 />
              </div>

              <h3>{project.title}</h3>
              <p>{project.description}</p>

              <small>
                {Array.isArray(project.technology)
                  ? project.technology.join(' · ')
                  : project.technology}
              </small>

              <Link
                className="text-link"
                to={`/projects/${project.slug}`}
              >
                View project brief
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title="No published projects yet"
          text="Projects will appear here when they are added and published."
        />
      )}
    </PageContainer>
  );
}

/* =========================================================
   PROJECT DETAILS
========================================================= */

export function Project() {
  const { slug } = useParams();

  const { data, loading, error, refresh } = useData(
    `/projects/${encodeURIComponent(slug || '')}`,
    {}
  );

  const project = data.project;

  const [completed, setCompleted] = useState([]);

  function toggleRequirement(index) {
    setCompleted((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    );
  }

  if (loading) {
    return (
      <PageContainer narrow>
        <Loading text="Loading project brief..." />
      </PageContainer>
    );
  }

  if (!project) {
    return (
      <PageContainer narrow>
        <ErrorNotice error={error} onRetry={refresh} />

        <Empty
          title="Project not found"
          text="Choose a project from the project library."
          action={
            <Link className="btn outline" to="/projects">
              Back to projects
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const requirements = getArray(project.requirements);
  const steps = getArray(project.steps);

  return (
    <PageContainer narrow>
      <Link className="back" to="/projects">
        ← Project lab
      </Link>

      <Intro
        tag={`${project.difficulty || 'PRACTICE'} PROJECT`}
        title={project.title}
        text={project.description}
      />

      <section className="panel project-detail-panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">PROJECT CHECKLIST</span>
            <h2>Requirements</h2>
          </div>

          <span className="pill">
            {completed.length}/{requirements.length} completed
          </span>
        </div>

        {requirements.length ? (
          requirements.map((requirement, index) => (
            <label className="check" key={index}>
              <input
                type="checkbox"
                checked={completed.includes(index)}
                onChange={() => toggleRequirement(index)}
              />

              {requirement}
            </label>
          ))
        ) : (
          <p className="muted">No requirements have been added.</p>
        )}

        <div className="project-progress">
          <div
            className="project-progress-fill"
            style={{
              width: requirements.length
                ? `${(completed.length / requirements.length) * 100}%`
                : '0%',
            }}
          />
        </div>

        <h2>Build steps</h2>

        {steps.length ? (
          <ol className="project-steps">
            {steps.map((step, index) => (
              <li key={index}>
                <b>{step.title || `Step ${index + 1}`}</b>

                {step.description && <p>{step.description}</p>}

                {typeof step === 'string' && <p>{step}</p>}
              </li>
            ))}
          </ol>
        ) : (
          <p className="muted">No project steps have been added yet.</p>
        )}

        {getArray(project.extensionTasks).length > 0 && (
          <>
            <h2>Challenge yourself</h2>

            <ul>
              {project.extensionTasks.map((task, index) => (
                <li key={index}>{task}</li>
              ))}
            </ul>
          </>
        )}
      </section>
    </PageContainer>
  );
}

/* =========================================================
   RESOURCE LIBRARY
========================================================= */

export function Resources() {
  const { data, loading, error, refresh } = useData('/resources', {
    resources: [],
  });

  const resources = getArray(data.resources);

  return (
    <PageContainer>
      <Intro
        tag="RESOURCE LIBRARY"
        title="Good references, in one place."
        text="A curated starting point for documentation, practice, and web standards."
      />

      <ErrorNotice error={error} onRetry={refresh} />

      {loading ? (
        <Loading text="Loading learning resources..." />
      ) : resources.length ? (
        <div className="resource-grid">
          {resources.map((resource, index) => (
            <a
              className="resource-card"
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              key={resource._id || resource.url || index}
            >
              <span className="pill">
                {resource.category || 'Reference'}
              </span>

              <h3>
                {resource.title}
                <ExternalLink size={16} />
              </h3>

              <p>{resource.description}</p>
            </a>
          ))}
        </div>
      ) : (
        <Empty
          title="No resources available"
          text="Learning resources will appear here after they are added to the library."
        />
      )}
    </PageContainer>
  );
}

/* =========================================================
   GLOSSARY
========================================================= */

const glossaryTerms = [
  ['Accessibility', 'Building digital experiences people with different abilities can use.'],
  ['API', 'An interface that lets software systems communicate.'],
  ['Attribute', 'Extra information added to an HTML element.'],
  ['DOM', 'The browser object representation of a document.'],
  ['Flexbox', 'A CSS layout model for arranging items along one axis.'],
  ['HTTP', 'A protocol for requesting and transferring web resources.'],
  ['Responsive design', 'Layouts that adapt to screen sizes and contexts.'],
  ['Semantic HTML', 'HTML elements chosen for the meaning of their content.'],
  ['Specificity', 'How CSS resolves competing selectors.'],
  ['Variable', 'A named reference to a value in a program.'],
];

export function Glossary() {
  const [query, setQuery] = useState('');

  const terms = glossaryTerms.filter((term) =>
    term.join(' ').toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <PageContainer>
      <Intro
        tag="DEVELOPER GLOSSARY"
        title="Decode the jargon."
        text="A quick reference for concepts you will meet while learning the web."
      />

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search developer terms..."
      />

      <div className="rows glossary-list">
        {terms.map(([term, description]) => (
          <article className="row glossary-item" key={term}>
            <span>
              <b>{term}</b>
              <small>{description}</small>
            </span>
          </article>
        ))}
      </div>

      {!terms.length && (
        <Empty
          title="No matching terms"
          text="Try another search phrase."
          action={
            <button className="btn outline" onClick={() => setQuery('')}>
              Clear search
            </button>
          }
        />
      )}
    </PageContainer>
  );
}

/* =========================================================
   CHEATSHEETS
========================================================= */

const cheatsheets = [
  {
    title: 'HTML starter',
    code: `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My Page</title>
</head>
<body>
  <main>
    <h1>Hello World</h1>
  </main>
</body>
</html>`,
  },
  {
    title: 'CSS grid',
    code: `.container {
  display: grid;
  gap: 1rem;
  grid-template-columns:
    repeat(auto-fit, minmax(16rem, 1fr));
}`,
  },
  {
    title: 'JavaScript',
    code: `const items = [1, 2, 3];

const doubled = items.map((number) => number * 2);

console.log(doubled);`,
  },
];

export function Cheatsheets() {
  const [copied, setCopied] = useState('');

  async function copyExample(title, code) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(title);

      window.setTimeout(() => {
        setCopied((current) => current === title ? '' : current);
      }, 1800);
    } catch {
      setCopied('');
    }
  }

  return (
    <PageContainer>
      <Intro
        tag="QUICK REFERENCE"
        title="The essentials, at a glance."
        text="Small examples to help you recall syntax while building."
      />

      <div className="cheats">
        {cheatsheets.map((item) => (
          <article className="panel cheatsheet-card" key={item.title}>
            <div className="section-head">
              <h3>{item.title}</h3>

              <button
                className="btn outline"
                type="button"
                onClick={() => copyExample(item.title, item.code)}
              >
                {copied === item.title ? (
                  <CheckCircle2 size={15} />
                ) : (
                  <Copy size={15} />
                )}

                {copied === item.title ? 'Copied' : 'Copy'}
              </button>
            </div>

            <pre>
              <code>{item.code}</code>
            </pre>
          </article>
        ))}
      </div>
    </PageContainer>
  );
}

/* =========================================================
   INTERACTIVE PLAYGROUND
========================================================= */

export function Playground() {
  const [html, setHtml] = useState(
    `<h1>Hello, builder!</h1>
<p>Edit the code, then press Run.</p>
<button id="go">Click me</button>`
  );

  const [css, setCss] = useState(
    `body {
  font: 16px system-ui;
  padding: 24px;
  color: #172033;
}

h1 {
  color: #4f46e5;
}`
  );

  const [js, setJs] = useState(
    `document.querySelector('#go').onclick = () => {
  alert('Nice work!');
};`
  );

  const [tab, setTab] = useState('html');
  const [runVersion, setRunVersion] = useState(0);

  const source = useMemo(() => {
    const safeCss = css.replace(/<\/style/gi, '<\\/style');
    const safeJs = js.replace(/<\/script/gi, '<\\/script');

    return `<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy"
content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data: https:;">
<style>${safeCss}</style>
</head>
<body>
${html}
<script>
try {
${safeJs}
} catch (error) {
  document.body.textContent = 'Error: ' + error.message;
}
<\/script>
</body>
</html>`;
  }, [html, css, js]);

  const currentValue =
    tab === 'html' ? html : tab === 'css' ? css : js;

  function updateValue(value) {
    if (tab === 'html') setHtml(value);
    else if (tab === 'css') setCss(value);
    else setJs(value);
  }

  return (
    <PageContainer>
      <Intro
        tag="INTERACTIVE PLAYGROUND"
        title="Try it. Break it. Learn."
        text="Edit HTML, CSS, and JavaScript in an isolated browser preview. Your code is not sent to the server."
      />

      <div className="playground playground-premium">
        <section className="playground-editor">
          <div className="tabs" role="tablist" aria-label="Code editor tabs">
            {['html', 'css', 'js'].map((item) => (
              <button
                type="button"
                role="tab"
                aria-selected={tab === item}
                className={tab === item ? 'active' : ''}
                onClick={() => setTab(item)}
                key={item}
              >
                {item.toUpperCase()}
              </button>
            ))}

            <button
              className="btn primary run"
              type="button"
              onClick={() => setRunVersion((version) => version + 1)}
            >
              <Play size={15} />
              Run
            </button>
          </div>

          <textarea
            aria-label={`${tab} editor`}
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            value={currentValue}
            onChange={(event) => updateValue(event.target.value)}
          />
        </section>

        <section className="preview-panel">
          <div className="preview-head">
            <span>Live preview</span>
            <span className="pill">Sandboxed</span>
          </div>

          <iframe
            key={runVersion}
            title="Sandboxed code preview"
            sandbox="allow-scripts"
            referrerPolicy="no-referrer"
            srcDoc={source}
          />
        </section>
      </div>

      <p className="safety">
        <ShieldCheck size={16} />
        Sandboxing reduces risk but is not a guarantee against every
        browser-based attack. Never paste secrets into the playground.
      </p>
    </PageContainer>
  );
}

/* =========================================================
   LOGIN / REGISTER
========================================================= */

export function Auth({ mode = 'login' }) {
  const { login, register, user } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const isRegister = mode === 'register';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submit(event) {
    event.preventDefault();

    setError('');

    if (isRegister && form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    setBusy(true);

    try {
      const signedIn = await (
        isRegister
          ? register({
              name: form.name.trim(),
              email: form.email.trim(),
              password: form.password,
            })
          : login({
              email: form.email.trim(),
              password: form.password,
            })
      );

      const destination = location.state?.from?.pathname;

      const safeDestination =
        destination &&
        destination.startsWith('/') &&
        !destination.startsWith('//')
          ? destination
          : signedIn?.role === 'admin'
            ? '/admin'
            : '/dashboard';

      navigate(safeDestination, { replace: true });
    } catch (err) {
      setError(getError(err, 'Unable to authenticate your account.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap auth-wrap-premium">
      <form className="auth-card auth-card-premium" onSubmit={submit}>
        <div className="auth-brand-mark">
          <GraduationCap size={28} />
        </div>

        <span className="eyebrow">
          {isRegister ? 'JOIN THE LEARNING COMMUNITY' : 'YOUR NEXT STEP'}
        </span>

        <h1>
          {isRegister ? 'Create your account' : 'Welcome back'}
        </h1>

        <p>
          {isRegister
            ? 'Start building your development skills with structured learning.'
            : 'Pick up where your learning journey left off.'}
        </p>

        {isRegister && (
          <label>
            Full name

            <input
              required
              minLength="2"
              maxLength="80"
              autoComplete="name"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
            />
          </label>
        )}

        <label>
          Email address

          <input
            required
            type="email"
            maxLength="254"
            autoComplete="email"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
          />
        </label>

        <label>
          Password

          <input
            required
            minLength="8"
            maxLength="128"
            type={showPassword ? 'text' : 'password'}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            value={form.password}
            onChange={(event) => update('password', event.target.value)}
          />
        </label>

        {isRegister && (
          <label>
            Confirm password

            <input
              required
              minLength="8"
              maxLength="128"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.confirm}
              onChange={(event) => update('confirm', event.target.value)}
            />
          </label>
        )}

        <label className="password-visibility">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(event) => setShowPassword(event.target.checked)}
          />
          Show password
        </label>

        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}

        <button className="btn primary full" disabled={busy}>
          {busy
            ? 'Please wait...'
            : isRegister
              ? 'Create account'
              : 'Log in'}

          <ArrowRight size={17} />
        </button>

        <p className="switch">
          {isRegister
            ? 'Already have an account?'
            : 'New to TyagiJI?'}

          {' '}

          <Link to={isRegister ? '/login' : '/register'}>
            {isRegister ? 'Log in' : 'Create an account'}
          </Link>
        </p>

        {!isRegister && (
          <Link to="/forgot-password">
            Forgot password?
          </Link>
        )}

        <div className="auth-security">
          <ShieldCheck size={15} />
          Secure account authentication
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   STUDENT DASHBOARD
========================================================= */

export function Dashboard() {
  const { user } = useAuth();

  const {
    data,
    loading,
    error,
    refresh,
  } = useData('/users/me/dashboard', {});

  const dashboard = data.dashboard || {};

  const stats = [
    {
      label: 'Lessons completed',
      value: dashboard.completedLessons || 0,
      icon: <BookOpen />,
    },
    {
      label: 'Courses in progress',
      value: dashboard.coursesInProgress || 0,
      icon: <Layers3 />,
    },
    {
      label: 'Quiz attempts',
      value: dashboard.quizAttempts || 0,
      icon: <CheckCircle2 />,
    },
    {
      label: 'Saved lessons',
      value: dashboard.bookmarks || 0,
      icon: <Bookmark />,
    },
  ];

  return (
    <PageContainer className="dashboard-page">
      <div className="dashboard-welcome">
        <div>
          <span className="eyebrow">YOUR LEARNING SPACE</span>

          <h1>
            Welcome back
            {user?.name ? `, ${user.name.split(' ')[0]}` : ''}.
          </h1>

          <p>
            Every small step adds up. Pick up where you left off.
          </p>
        </div>

        <div className="dashboard-avatar">
          {getInitials(user?.name)}
        </div>
      </div>

      <ErrorNotice error={error} onRetry={refresh} />

      {loading ? (
        <Loading text="Loading your learning dashboard..." />
      ) : (
        <>
          <div className="stats stats-premium">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
              />
            ))}
          </div>

          <section className="panel dashboard-learning">
            <div className="section-head">
              <div>
                <span className="eyebrow">CONTINUE LEARNING</span>
                <h2>Your learning paths</h2>
              </div>

              <Link className="text-link" to="/courses">
                Browse courses
                <ArrowRight size={16} />
              </Link>
            </div>

            {getArray(dashboard.courses).length ? (
              <div className="dashboard-course-list">
                {dashboard.courses.map((course) => (
                  <article
                    className="dashboard-course"
                    key={course.slug || course._id}
                  >
                    <div>
                      <h3>{course.title}</h3>
                      <span>
                        {Number(course.percentage) || 0}% complete
                      </span>
                    </div>

                    <ProgressBar value={Number(course.percentage) || 0} size="sm" />

                    <Link
                      to={`/courses/${course.slug}`}
                      aria-label={`Continue ${course.title}`}
                    >
                      <ArrowUpRight size={18} />
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <Empty
                title="Your learning journey starts here"
                text="Choose a course and start building your skills."
                action={
                  <Link className="btn primary" to="/courses">
                    Explore courses
                  </Link>
                }
              />
            )}
          </section>

          <section className="panel">
            <span className="eyebrow">QUICK ACCESS</span>
            <h2>Your learning tools</h2>

            <div className="quick-links">
              <Link to="/bookmarks">
                <Bookmark />
                Saved lessons
              </Link>

              <Link to="/progress">
                <Trophy />
                Progress report
              </Link>

              <Link to="/playground">
                <Code2 />
                Code playground
              </Link>

              <Link to="/settings">
                <ShieldCheck />
                Settings
              </Link>
            </div>
          </section>
        </>
      )}
    </PageContainer>
  );
}

/* =========================================================
   BOOKMARKS
========================================================= */

export function Bookmarks() {
  const { data, loading, error, refresh } = useData(
    '/users/me/bookmarks',
    { bookmarks: [] }
  );

  const bookmarks = getArray(data.bookmarks);

  return (
    <PageContainer>
      <Intro
        tag="YOUR LIBRARY"
        title="Saved for later."
        text="Your bookmarked lessons, ready whenever you are."
      />

      <ErrorNotice error={error} onRetry={refresh} />

      {loading ? (
        <Loading text="Loading your bookmarks..." />
      ) : bookmarks.length ? (
        <div className="rows">
          {bookmarks.map((bookmark) => (
            <Link
              className="row"
              key={bookmark._id || bookmark.lessonSlug}
              to={`/courses/${bookmark.courseSlug}/lessons/${bookmark.lessonSlug}`}
            >
              <b>
                <Bookmark size={17} />
              </b>

              <span>
                {bookmark.title}
                <small>{bookmark.courseTitle}</small>
              </span>

              <ArrowUpRight size={17} />
            </Link>
          ))}
        </div>
      ) : (
        <Empty
          title="Nothing saved yet"
          text="Bookmark lessons to build your personal learning library."
          action={
            <Link className="btn outline" to="/courses">
              Explore courses
            </Link>
          }
        />
      )}
    </PageContainer>
  );
}

/* =========================================================
   PROGRESS
========================================================= */

export function Progress() {
  const { data, loading, error, refresh } = useData(
    '/users/me/progress',
    {}
  );

  const stats = [
    ['Completed lessons', data.completedLessons || 0],
    ['Courses started', data.coursesStarted || 0],
    ['Quiz attempts', data.quizAttempts || 0],
  ];

  return (
    <PageContainer>
      <Intro
        tag="PROGRESS REPORT"
        title="Notice how far you have come."
        text="Your learning progress is based on saved lesson completions and quiz attempts."
      />

      <ErrorNotice error={error} onRetry={refresh} />

      {loading ? (
        <Loading text="Calculating your learning progress..." />
      ) : (
        <div className="stats stats-premium">
          {stats.map(([label, value]) => (
            <StatCard key={label} label={label} value={value} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

export function Settings() {
  const { user, refresh } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [theme, setTheme] = useState(
    user?.preferences?.theme || 'dark'
  );

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setName(user?.name || '');
    setTheme(user?.preferences?.theme || 'dark');
  }, [user]);

  async function save(event) {
    event.preventDefault();

    setBusy(true);
    setError('');
    setMessage('');

    try {
      await api('/users/me/preferences', {
        method: 'PATCH',
        body: JSON.stringify({
          name: name.trim(),
          theme,
        }),
      });

      document.documentElement.dataset.theme = theme;

      await refresh();

      setMessage('Your preferences have been saved.');
    } catch (err) {
      setError(getError(err, 'Unable to save your preferences.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageContainer narrow>
      <Intro
        tag="PREFERENCES"
        title="Make it yours."
        text="Manage your profile and learning experience."
      />

      <form className="panel form-stack settings-form" onSubmit={save}>
        <label>
          Display name

          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            minLength="2"
            maxLength="80"
          />
        </label>

        <label>
          Theme

          <select
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>

        <ErrorNotice error={error} />
        <SuccessNotice>{message}</SuccessNotice>

        <button className="btn primary" disabled={busy}>
          {busy ? 'Saving preferences...' : 'Save preferences'}
          <ArrowRight size={16} />
        </button>
      </form>
    </PageContainer>
  );
}

/* =========================================================
   PROFILE
========================================================= */

export function Profile() {
  const { user } = useAuth();

  return (
    <PageContainer>
      <Intro
        tag="YOUR PROFILE"
        title={user?.name || 'Student profile'}
        text={user?.email || 'Account information'}
      />

      <section className="panel profile-card">
        <div className="profile-avatar">
          {getInitials(user?.name)}
        </div>

        <div>
          <h2>{user?.name || 'Learner'}</h2>
          <p>{user?.email}</p>
          <span className="pill">
            {user?.role || 'student'}
          </span>
        </div>
      </section>

      <Link className="btn outline" to="/settings">
        Edit preferences
        <ArrowRight size={16} />
      </Link>
    </PageContainer>
  );
}

/* =========================================================
   QUIZ
========================================================= */

export function Quiz() {
  const { id } = useParams();

  const {
    data,
    loading,
    error,
    refresh,
  } = useData(`/quizzes/${encodeURIComponent(id || '')}`, {});

  const quiz = data.quiz;

  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const questions = getArray(quiz?.questions);

  function chooseAnswer(questionId, optionIndex) {
    setAnswers((current) => ({
      ...current,
      [questionId]: optionIndex,
    }));
  }

  async function submit() {
    if (!quiz || busy) return;

    if (Object.keys(answers).length !== questions.length) {
      setActionError('Please answer every question before submitting.');
      return;
    }

    setBusy(true);
    setActionError('');

    try {
      const response = await api(`/quizzes/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          answers: Object.entries(answers).map(
            ([questionId, optionIndex]) => ({
              questionId,
              optionIndex,
            })
          ),
        }),
      });

      setResult(response.result);
    } catch (err) {
      setActionError(getError(err, 'Unable to submit this quiz.'));
    } finally {
      setBusy(false);
    }
  }

  function retry() {
    setAnswers({});
    setResult(null);
    setActionError('');
  }

  return (
    <PageContainer narrow>
      <Intro
        tag="KNOWLEDGE CHECK"
        title={quiz?.title || 'Course quiz'}
        text={
          quiz?.description ||
          'Test your understanding of the course topics.'
        }
      />

      <ErrorNotice error={error} onRetry={refresh} />
      <ErrorNotice error={actionError} />

      {loading ? (
        <Loading text="Preparing your assessment..." />
      ) : quiz ? (
        <>
          <div className="quiz-progress">
            <span>
              {Object.keys(answers).length} of {questions.length} answered
            </span>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: questions.length
                    ? `${(Object.keys(answers).length / questions.length) * 100}%`
                    : '0%',
                }}
              />
            </div>
          </div>

          {questions.map((question, index) => (
            <fieldset
              className="panel question question-premium"
              key={question._id || index}
              disabled={!!result}
            >
              <legend>
                <span className="question-number">
                  {String(index + 1).padStart(2, '0')}
                </span>

                {question.prompt}
              </legend>

              {getArray(question.options).map((option, optionIndex) => (
                <label
                  className={`quiz-option ${
                    answers[question._id] === optionIndex
                      ? 'selected'
                      : ''
                  }`}
                  key={optionIndex}
                >
                  <input
                    type="radio"
                    name={question._id}
                    checked={answers[question._id] === optionIndex}
                    onChange={() =>
                      chooseAnswer(question._id, optionIndex)
                    }
                  />

                  <span>{option}</span>
                </label>
              ))}

              {result && result.details?.[index]?.explanation && (
                <p className="quiz-explanation">
                  {result.details[index].explanation}
                </p>
              )}
            </fieldset>
          ))}

          {result ? (
            <section className="panel quiz-result">
              <div className="feature-icon">
                <Trophy />
              </div>

              <h2>Your score: {result.percentage}%</h2>

              <p>
                {result.passed
                  ? 'Congratulations! You passed this assessment.'
                  : 'Keep practicing. Review the explanations and try again.'}
              </p>

              <button className="btn primary" onClick={retry}>
                Try again
                <RefreshCw size={16} />
              </button>
            </section>
          ) : (
            <button
              className="btn primary full"
              type="button"
              disabled={busy || !questions.length}
              onClick={submit}
            >
              {busy ? 'Submitting...' : 'Submit assessment'}
              <ArrowRight size={16} />
            </button>
          )}
        </>
      ) : (
        <Empty
          title="Assessment unavailable"
          text="This quiz may not be published yet."
          action={
            <Link className="btn outline" to="/courses">
              Browse courses
            </Link>
          }
        />
      )}
    </PageContainer>
  );
}

/* =========================================================
   ADMIN DASHBOARD / CRUD
========================================================= */

const ADMIN_SECTIONS = [
  'courses',
  'modules',
  'lessons',
  'quizzes',
  'projects',
  'resources',
  'users',
];

const ADVANCED_FIELDS = {
  courses: ['objectives', 'prerequisites', 'learningOutcomes', 'skills'],
  modules: ['objectives'],
  lessons: [
    'summary',
    'module',
    'contentBlocks',
    'objectives',
    'prerequisites',
    'keyTakeaways',
    'resources',
    'durationMinutes',
  ],
  quizzes: ['questions', 'passingScore', 'randomize'],
  projects: [
    'technology',
    'requirements',
    'steps',
    'starterFiles',
    'extensionTasks',
  ],
  resources: ['technology', 'verified'],
};

const DEFAULT_ADMIN_FORM = {
  title: '',
  slug: '',
  description: '',
  course: '',
  technology: 'HTML',
  difficulty: 'Beginner',
  url: '',
  published: false,
  order: 0,
  advanced: '{}',
  email: '',
  password: '',
  status: 'active',
};

export function Admin() {
  const [section, setSection] = useState('courses');
  const [items, setItems] = useState([]);
  const [courses, setCourses] = useState([]);

  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [form, setForm] = useState(DEFAULT_ADMIN_FORM);
  const [editing, setEditing] = useState(null);

  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const needsCourse = [
    'modules',
    'lessons',
    'quizzes',
  ].includes(section);

  const load = useCallback(
    async (nextPage = page, nextQuery = query) => {
      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams({
          page: String(nextPage),
          limit: '25',
        });

        if (nextQuery.trim()) {
          params.set('q', nextQuery.trim());
        }

        const response = await api(
          `/admin/${section}?${params.toString()}`
        );

        setItems(getArray(response[section]));
        setPages(Math.max(1, response.pagination?.pages || 1));
        setTotal(response.pagination?.total || 0);
      } catch (err) {
        setItems([]);
        setError(getError(err, 'Unable to load admin records.'));
      } finally {
        setLoading(false);
      }
    },
    [section, page, query]
  );

  useEffect(() => {
    setPage(1);
    setEditing(null);
    setForm(DEFAULT_ADMIN_FORM);
    setMessage('');
    setError('');

    load(1, '');
  }, [section]);

  useEffect(() => {
    let active = true;

    api('/admin/courses?limit=100')
      .then((response) => {
        if (active) setCourses(getArray(response.courses));
      })
      .catch(() => {
        if (active) setCourses([]);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      load(1, query);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query, section]);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === 'title' &&
      !editing &&
      !current.slug
        ? { slug: makeSlug(value) }
        : {}),
    }));
  }

  function resetForm() {
    setEditing(null);

    setForm({
      ...DEFAULT_ADMIN_FORM,
      course: courses[0]?._id || '',
    });
  }

  function changeSection(value) {
    setSection(value);
    setQuery('');
    setPage(1);
    setEditing(null);
    setForm(DEFAULT_ADMIN_FORM);
    setMessage('');
    setError('');
  }

  function beginEdit(item) {
    const advanced = {};

    for (const key of ADVANCED_FIELDS[section] || []) {
      if (item[key] !== undefined) {
        advanced[key] = item[key];
      }
    }

    setEditing(item._id);
    setMessage('');
    setError('');

    setForm({
      ...DEFAULT_ADMIN_FORM,
      title: item.title || item.name || '',
      slug: item.slug || '',
      description: item.description || item.summary || '',
      course: getId(item.course) || courses[0]?._id || '',
      technology: item.technology || item.category || 'HTML',
      difficulty: item.difficulty || 'Beginner',
      url: item.url || '',
      published: Boolean(item.published),
      order: item.order ?? item.displayOrder ?? 0,
      advanced: JSON.stringify(advanced, null, 2),
      email: item.email || '',
      status: item.status || 'active',
    });
  }

  async function save(event) {
    event.preventDefault();

    if (busy) return;

    setBusy(true);
    setError('');
    setMessage('');

    try {
      let advanced;

      try {
        advanced = JSON.parse(form.advanced || '{}');

        if (
          !advanced ||
          Array.isArray(advanced) ||
          typeof advanced !== 'object'
        ) {
          throw new Error();
        }
      } catch {
        throw new Error('Advanced fields must be a valid JSON object.');
      }

      const slug = makeSlug(form.slug || form.title);

      let payload = { ...advanced };

      if (section === 'users') {
        payload = editing
          ? {
              name: form.title.trim(),
              status: form.status,
            }
          : {
              name: form.title.trim(),
              email: form.email.trim(),
              password: form.password,
            };
      } else {
        Object.assign(payload, {
          title: form.title.trim(),
          slug,
          description: form.description.trim(),
        });
      }

      if (section === 'courses') {
        Object.assign(payload, {
          technology: form.technology,
          difficulty: form.difficulty,
          published: form.published,
          displayOrder: Number(form.order) || 0,
        });
      }

      if (needsCourse) {
        if (!form.course) {
          throw new Error('Please select a parent course.');
        }

        payload.course = form.course;
      }

      if (section === 'modules') {
        payload.order = Number(payload.order ?? form.order) || 0;
      }

      if (section === 'lessons') {
        Object.assign(payload, {
          summary: payload.summary ?? form.description,
          durationMinutes: Number(payload.durationMinutes) || 10,
          published: form.published,
          difficulty: form.difficulty,
          order: Number(payload.order ?? form.order) || 0,
          contentBlocks: getArray(payload.contentBlocks),
        });
      }

      if (section === 'quizzes') {
        Object.assign(payload, {
          questions: getArray(payload.questions),
          passingScore: Number(payload.passingScore ?? 70),
          published: form.published,
        });
      }

      if (section === 'projects') {
        Object.assign(payload, {
          difficulty: form.difficulty,
          technology: Array.isArray(payload.technology)
            ? payload.technology
            : [form.technology],
          requirements: getArray(payload.requirements),
          steps: getArray(payload.steps),
          published: form.published,
        });
      }

      if (section === 'resources') {
        Object.assign(payload, {
          url: form.url.trim(),
          category: form.technology,
          technology: Array.isArray(payload.technology)
            ? payload.technology
            : [form.technology],
        });
      }

      const method = editing ? 'PATCH' : 'POST';

      const path = editing
        ? `/admin/${section}/${editing}`
        : `/admin/${section}`;

      await api(path, {
        method,
        body: JSON.stringify(payload),
      });

      setMessage(
        `${editing ? 'Changes saved' : 'Record created'} successfully.`
      );

      resetForm();

      await load(page, query);
    } catch (err) {
      setError(getError(err, 'Unable to save this record.'));
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished(item) {
    try {
      await api(`/admin/${section}/${item._id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          published: !item.published,
        }),
      });

      setMessage(
        `${item.title || 'Item'} ${
          item.published ? 'unpublished' : 'published'
        }.`
      );

      await load(page, query);
    } catch (err) {
      setError(getError(err, 'Unable to update publishing status.'));
    }
  }

  async function toggleUser(item) {
    try {
      await api(`/admin/users/${item._id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: item.status === 'active' ? 'disabled' : 'active',
        }),
      });

      setMessage(
        `Account ${
          item.status === 'active' ? 'disabled' : 'enabled'
        }.`
      );

      await load(page, query);
    } catch (err) {
      setError(getError(err, 'Unable to update this account.'));
    }
  }

  async function remove(item) {
    const label = item.title || item.name || item.email || 'this record';

    if (
      !window.confirm(
        `Delete "${label}"? This action may affect related learning records.`
      )
    ) {
      return;
    }

    setError('');
    setMessage('');

    try {
      await api(`/admin/${section}/${item._id}`, {
        method: 'DELETE',
      });

      setMessage('Record deleted successfully.');

      if (editing === item._id) {
        resetForm();
      }

      const nextPage =
        items.length === 1 && page > 1 ? page - 1 : page;

      setPage(nextPage);

      await load(nextPage, query);
    } catch (err) {
      setError(getError(err, 'Unable to delete this record.'));
    }
  }

  function goToPage(nextPage) {
    const safePage = Math.min(pages, Math.max(1, nextPage));

    setPage(safePage);
    load(safePage, query);
  }

  const titleForSection = section.endsWith('s')
    ? section.slice(0, -1)
    : section;

  return (
    <PageContainer className="admin-page">
      <div className="admin-heading">
        <div>
          <span className="eyebrow">CONTROL CENTER</span>
          <h1>Manage the academy.</h1>

          <p>
            Operate your learning catalog with database-backed
            changes and controlled administrative actions.
          </p>
        </div>

        <div className="admin-heading-mark">
          <ShieldCheck size={28} />
          <span>Admin workspace</span>
          <small>Secure content operations</small>
        </div>
      </div>

      <div className="admin-metrics">
        <article className="stat">
          <small>Current section</small>
          <strong>{section}</strong>
        </article>

        <article className="stat">
          <small>Matching records</small>
          <strong>{total}</strong>
        </article>

        <article className="stat">
          <small>Current page</small>
          <strong>{page} / {pages}</strong>
        </article>

        <article className="stat">
          <small>Access level</small>
          <strong>Admin</strong>
        </article>
      </div>

      <div className="admin-tabs" role="tablist" aria-label="Admin sections">
        {ADMIN_SECTIONS.map((item) => (
          <button
            type="button"
            role="tab"
            aria-selected={section === item}
            className={section === item ? 'active' : ''}
            onClick={() => changeSection(item)}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>

      <ErrorNotice error={error} />
      <SuccessNotice>{message}</SuccessNotice>

      <div className="admin-layout">
        <section className="panel admin-editor">
          <div className="panel-title">
            <div>
              <span className="eyebrow">
                {editing ? 'UPDATE RECORD' : 'NEW RECORD'}
              </span>

              <h2>
                {editing ? 'Edit' : 'Create'} {titleForSection}
              </h2>
            </div>

            {editing && (
              <button
                className="btn quiet"
                type="button"
                onClick={resetForm}
              >
                Cancel edit
              </button>
            )}
          </div>

          {section === 'users' ? (
            <>
              <div className="admin-hint">
                <ShieldCheck size={22} />

                <div>
                  <b>Student account management</b>
                  <p>
                    Create student accounts, update names, and
                    enable or disable accounts. Administrator promotion
                    should remain a protected server-side operation.
                  </p>
                </div>
              </div>

              <form
                className="form-stack admin-user-form"
                onSubmit={save}
              >
                <label>
                  Full name

                  <input
                    required
                    minLength="2"
                    maxLength="80"
                    value={form.title}
                    onChange={(event) =>
                      update('title', event.target.value)
                    }
                  />
                </label>

                {!editing && (
                  <>
                    <label>
                      Email address

                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={form.email}
                        onChange={(event) =>
                          update('email', event.target.value)
                        }
                      />
                    </label>

                    <label>
                      Temporary password

                      <input
                        type="password"
                        required
                        minLength="12"
                        autoComplete="new-password"
                        value={form.password}
                        onChange={(event) =>
                          update('password', event.target.value)
                        }
                      />

                      <small>
                        Share credentials securely with the learner.
                      </small>
                    </label>
                  </>
                )}

                {editing && (
                  <label>
                    Account status

                    <select
                      value={form.status}
                      onChange={(event) =>
                        update('status', event.target.value)
                      }
                    >
                      <option value="active">Active</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </label>
                )}

                <button className="btn primary full" disabled={busy}>
                  {busy
                    ? 'Saving...'
                    : editing
                      ? 'Save account'
                      : 'Create student account'}
                </button>
              </form>
            </>
          ) : (
            <form className="form-stack" onSubmit={save}>
              <label>
                Title

                <input
                  required
                  minLength="2"
                  maxLength="160"
                  value={form.title}
                  onChange={(event) =>
                    update('title', event.target.value)
                  }
                  placeholder="Give this record a clear title"
                  autoComplete="off"
                />
              </label>

              <label>
                Slug

                <input
                  required
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  value={form.slug}
                  onChange={(event) =>
                    update('slug', event.target.value)
                  }
                  placeholder="url-friendly-slug"
                  autoComplete="off"
                />

                <small>
                  Lowercase letters, numbers, and hyphens.
                </small>
              </label>

              <label>
                Description

                <textarea
                  rows="4"
                  value={form.description}
                  onChange={(event) =>
                    update('description', event.target.value)
                  }
                  placeholder="Describe what learners will get from this content."
                />
              </label>

              {needsCourse && (
                <label>
                  Parent course

                  <select
                    required
                    value={form.course}
                    onChange={(event) =>
                      update('course', event.target.value)
                    }
                  >
                    <option value="">Select a course</option>

                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {[
                'courses',
                'projects',
                'resources',
              ].includes(section) && (
                <label>
                  Technology / category

                  <select
                    value={form.technology}
                    onChange={(event) =>
                      update('technology', event.target.value)
                    }
                  >
                    {[
                      'HTML',
                      'CSS',
                      'JavaScript',
                      'React',
                      'Node.js',
                      'MongoDB',
                      'Python',
                      'TypeScript',
                      'SQL',
                      'Git',
                      'Data Structures & Algorithms',
                      'MERN Stack',
                    ].map((technology) => (
                      <option key={technology} value={technology}>
                        {technology}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {[
                'courses',
                'lessons',
                'projects',
              ].includes(section) && (
                <label>
                  Difficulty

                  <select
                    value={form.difficulty}
                    onChange={(event) =>
                      update('difficulty', event.target.value)
                    }
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </label>
              )}

              {section === 'resources' && (
                <label>
                  Resource URL

                  <input
                    type="url"
                    required
                    value={form.url}
                    onChange={(event) =>
                      update('url', event.target.value)
                    }
                    placeholder="https://developer.mozilla.org/"
                  />
                </label>
              )}

              {[
                'courses',
                'modules',
                'lessons',
              ].includes(section) && (
                <label>
                  Display order

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.order}
                    onChange={(event) =>
                      update('order', event.target.value)
                    }
                  />
                </label>
              )}

              {[
                'courses',
                'lessons',
                'quizzes',
                'projects',
              ].includes(section) && (
                <label className="publish-toggle">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(event) =>
                      update('published', event.target.checked)
                    }
                  />

                  <span>
                    <b>Published</b>
                    <small>
                      Published records can appear on learner-facing pages.
                    </small>
                  </span>
                </label>
              )}

              <details className="advanced-fields">
                <summary>Advanced fields (JSON)</summary>

                <p>
                  Add optional model fields such as objectives,
                  lesson content blocks, quiz questions, and
                  project requirements. Use valid JSON.
                </p>

                <textarea
                  rows="12"
                  spellCheck="false"
                  value={form.advanced}
                  onChange={(event) =>
                    update('advanced', event.target.value)
                  }
                  aria-label="Advanced model fields JSON"
                />
              </details>

              <button
                className="btn primary full"
                disabled={busy}
                type="submit"
              >
                {busy
                  ? 'Saving changes...'
                  : editing
                    ? 'Save changes'
                    : 'Create record'}

                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </section>

        <section className="panel admin-records">
          <div className="panel-title">
            <div>
              <span className="eyebrow">DATABASE RECORDS</span>

              <h2>
                {section}
                <span className="pill">{total} total</span>
              </h2>
            </div>

            <button
              className="btn outline"
              type="button"
              onClick={() => load(page, query)}
              disabled={loading}
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={`Search ${section}...`}
          />

          {loading ? (
            <Loading text={`Loading ${section}...`} />
          ) : !items.length ? (
            <Empty
              title="No records found"
              text={
                query
                  ? 'Try another search phrase.'
                  : 'Create your first record in this section.'
              }
            />
          ) : (
            <div className="admin-record-list">
              {items.map((item) => (
                <article className="admin-record" key={item._id}>
                  <div className="record-main">
                    <span className="record-avatar">
                      {getInitials(
                        item.title || item.name || item.email
                      )}
                    </span>

                    <div className="record-copy">
                      <b>
                        {item.title || item.name || item.email}
                      </b>

                      <small>
                        {item.slug ||
                          item.email ||
                          item.url ||
                          item.technology ||
                          ''}
                      </small>

                      <div className="record-badges">
                        {item.role && (
                          <span className="pill">{item.role}</span>
                        )}

                        {item.status && (
                          <span
                            className={`pill ${
                              item.status === 'active'
                                ? 'status-active'
                                : 'status-disabled'
                            }`}
                          >
                            {item.status}
                          </span>
                        )}

                        {typeof item.published === 'boolean' && (
                          <span
                            className={`pill ${
                              item.published
                                ? 'status-active'
                                : 'status-draft'
                            }`}
                          >
                            {item.published ? 'Published' : 'Draft'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="record-actions">
                    <button
                      className="btn outline"
                      type="button"
                      onClick={() => beginEdit(item)}
                    >
                      Edit
                    </button>

                    {section === 'users' ? (
                      <button
                        className="btn outline"
                        type="button"
                        onClick={() => toggleUser(item)}
                      >
                        {item.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                    ) : (
                      typeof item.published === 'boolean' && (
                        <button
                          className="btn outline"
                          type="button"
                          onClick={() => togglePublished(item)}
                        >
                          {item.published ? 'Unpublish' : 'Publish'}
                        </button>
                      )
                    )}

                    <button
                      className="btn danger"
                      type="button"
                      onClick={() => remove(item)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="pagination">
            <button
              className="btn outline"
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => goToPage(page - 1)}
            >
              ← Previous
            </button>

            <span>
              Page {page} of {pages}
            </span>

            <button
              className="btn outline"
              type="button"
              disabled={page >= pages || loading}
              onClick={() => goToPage(page + 1)}
            >
              Next →
            </button>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}

/* =========================================================
   FORGOT PASSWORD
========================================================= */

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();

    setBusy(true);
    setError('');
    setMessage('');

    try {
      const response = await api('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });

      setMessage(
        response.message ||
          'If an account matches that address, recovery instructions will be sent.'
      );
    } catch (err) {
      setError(getError(err, 'Unable to request password recovery.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap auth-wrap-premium">
      <form className="auth-card auth-card-premium" onSubmit={submit}>
        <div className="auth-brand-mark">
          <LockKeyhole size={26} />
        </div>

        <span className="eyebrow">ACCOUNT RECOVERY</span>

        <h1>Reset your password</h1>

        <p>
          Enter the email address associated with your account.
          If it exists, the platform will provide recovery instructions.
        </p>

        <label>
          Email address

          <input
            type="email"
            autoComplete="email"
            required
            maxLength="254"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <ErrorNotice error={error} />
        <SuccessNotice>{message}</SuccessNotice>

        <button className="btn primary full" disabled={busy}>
          {busy ? 'Sending request...' : 'Send recovery request'}
          <ArrowRight size={16} />
        </button>

        <p className="switch">
          <Link to="/login">Return to login</Link>
        </p>
      </form>
    </div>
  );
}

/* =========================================================
   RESET PASSWORD
========================================================= */

export function ResetPassword() {
  const [params] = useSearchParams();

  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();

    setError('');
    setMessage('');

    if (!token) {
      setError('No reset token was found in this link.');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Use at least 8 characters for your password.');
      return;
    }

    setBusy(true);

    try {
      const response = await api('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token,
          password,
        }),
      });

      setMessage(
        response.message ||
          'Password updated. You can now sign in.'
      );

      setPassword('');
      setConfirm('');
    } catch (err) {
      setError(getError(err, 'This reset link is invalid or expired.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap auth-wrap-premium">
      <form className="auth-card auth-card-premium" onSubmit={submit}>
        <div className="auth-brand-mark">
          <ShieldCheck size={26} />
        </div>

        <span className="eyebrow">ACCOUNT SECURITY</span>

        <h1>Choose a new password</h1>

        <p>
          Reset links are single-use and expire. Request a new link
          if this one is no longer valid.
        </p>

        {!token && (
          <p className="form-error" role="alert">
            No reset token was found. Request another password reset.
          </p>
        )}

        <label>
          New password

          <input
            type="password"
            autoComplete="new-password"
            minLength="8"
            maxLength="128"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <label>
          Confirm new password

          <input
            type="password"
            autoComplete="new-password"
            minLength="8"
            maxLength="128"
            required
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
        </label>

        <ErrorNotice error={error} />
        <SuccessNotice>{message}</SuccessNotice>

        <button
          className="btn primary full"
          disabled={busy || !token}
        >
          {busy ? 'Updating password...' : 'Update password'}
          <ArrowRight size={16} />
        </button>

        <p className="switch">
          <Link to="/forgot-password">
            Request another reset link
          </Link>
        </p>

        {message && (
          <Link to="/login">Continue to login</Link>
        )}
      </form>
    </div>
  );
}

/* =========================================================
   INFORMATION / 404
========================================================= */

export function Info({ title, text }) {
  return (
    <PageContainer narrow>
      <Intro
        tag="TYAGIJI LEARNING PLATFORM"
        title={title}
        text={text}
      />

      <Link className="btn primary" to="/">
        Back home
        <ArrowRight size={16} />
      </Link>
    </PageContainer>
  );
}

export function NotFound() {
  return (
    <PageContainer>
      <div className="not-found-content">
        <span className="not-found-code">404</span>

        <Intro
          tag="PAGE NOT FOUND"
          title="This page wandered off."
          text="The page you are looking for may have moved or no longer exists. Let's get you back to learning."
        />

        <Link className="btn primary" to="/">
          Back home
          <ArrowRight size={16} />
        </Link>
      </div>
    </PageContainer>
  );
}
