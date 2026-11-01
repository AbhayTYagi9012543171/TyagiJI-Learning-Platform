
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BookOpen,
  Clock3,
  Search,
  SlidersHorizontal,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

import { api } from '../../services/api.js';
import '../../styles/course-premium.css';

const LEVELS = ['All levels', 'Beginner', 'Intermediate', 'Advanced'];

const text = (value, fallback = '') =>
  typeof value === 'string' && value.trim()
    ? value.trim()
    : fallback;

const duration = (hours) => {
  const value = Number(hours);

  if (!Number.isFinite(value) || value <= 0) {
    return 'Self-paced';
  }

  return `${value} ${value === 1 ? 'hour' : 'hours'}`;
};

const isAbortError = (error) =>
  error?.name === 'AbortError' ||
  error?.code === 'ABORT_ERR' ||
  error?.cause?.name === 'AbortError';

function getCoursesFromResponse(result) {
  if (Array.isArray(result?.courses)) {
    return result.courses;
  }

  if (Array.isArray(result?.data?.courses)) {
    return result.data.courses;
  }

  if (Array.isArray(result?.data)) {
    return result.data;
  }

  return [];
}

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('All levels');
  const [technology, setTechnology] = useState('All topics');
  const [sort, setSort] = useState('featured');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const retryLoading = useCallback(() => {
    setError('');
    setLoading(true);
    setRetryCount((count) => count + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadCourses() {
      setLoading(true);
      setError('');

      try {
        const result = await api.get('/courses?limit=100', {
          signal: controller.signal,
        });

        if (!active) return;

        setCourses(getCoursesFromResponse(result));
      } catch (err) {
        if (!active || isAbortError(err)) return;

        setError(
          err?.message ||
            'Unable to load courses. Please try again.'
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCourses();

    return () => {
      active = false;
      controller.abort();
    };
  }, [retryCount]);

  const topics = useMemo(() => {
    const uniqueTopics = new Set(
      courses
        .map((course) => text(course.technology))
        .filter(Boolean)
    );

    return ['All topics', ...Array.from(uniqueTopics).sort()];
  }, [courses]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const result = courses.filter((course) => {
      const skills = Array.isArray(course.skills)
        ? course.skills
        : [];

      const objectives = Array.isArray(course.objectives)
        ? course.objectives
        : [];

      const haystack = [
        course.title,
        course.description,
        course.tagline,
        course.technology,
        ...skills,
        ...objectives,
      ]
        .map((value) => String(value ?? ''))
        .join(' ')
        .toLowerCase();

      const matchesQuery =
        !needle || haystack.includes(needle);

      const matchesLevel =
        level === 'All levels' ||
        course.difficulty === level;

      const matchesTechnology =
        technology === 'All topics' ||
        course.technology === technology;

      return (
        matchesQuery &&
        matchesLevel &&
        matchesTechnology
      );
    });

    result.sort((a, b) => {
      if (sort === 'title') {
        return text(a.title).localeCompare(text(b.title));
      }

      if (sort === 'duration') {
        return (
          (Number(a.estimatedHours) || 0) -
          (Number(b.estimatedHours) || 0)
        );
      }

      if (sort === 'newest') {
        const dateA = new Date(
          a.publishedAt || a.createdAt || 0
        ).getTime();

        const dateB = new Date(
          b.publishedAt || b.createdAt || 0
        ).getTime();

        return (
          (Number.isFinite(dateB) ? dateB : 0) -
          (Number.isFinite(dateA) ? dateA : 0)
        );
      }

      return (
        (Number(a.displayOrder) || 0) -
        (Number(b.displayOrder) || 0)
      );
    });

    return result;
  }, [courses, query, level, technology, sort]);

  const reset = useCallback(() => {
    setQuery('');
    setLevel('All levels');
    setTechnology('All topics');
    setSort('featured');
  }, []);

  return (
    <main className="cp-page cp-catalog">
      <section className="cp-catalog-hero">
        <div className="cp-hero-copy">
          <span className="cp-eyebrow">
            <Sparkles size={14} />
            TYAGIJI LEARNING EXPERIENCE
          </span>

          <h1>
            Learn with purpose.
            <br />
            <span>Build with confidence.</span>
          </h1>

          <p>
            Explore structured learning paths with practical
            lessons, guided projects, and clear outcomes
            designed to turn knowledge into real skills.
          </p>

          <div className="cp-hero-stats">
            <span>
              <BookOpen size={16} />
              {courses.length} learning paths
            </span>

            <span>
              <Clock3 size={16} />
              Learn at your pace
            </span>
          </div>
        </div>

        <div className="cp-hero-art" aria-hidden="true">
          <div className="cp-orbit cp-orbit-one" />
          <div className="cp-orbit cp-orbit-two" />

          <div className="cp-hero-symbol">
            T<span>J</span>
          </div>

          <div className="cp-float-card cp-float-top">
            01 <small>Learn</small>
          </div>

          <div className="cp-float-card cp-float-bottom">
            02 <small>Build</small>
          </div>
        </div>
      </section>

      <section className="cp-catalog-section">
        <div className="cp-section-heading">
          <div>
            <span className="cp-eyebrow">
              THE COURSE LIBRARY
            </span>

            <h2>Find your next skill</h2>

            <p>
              Choose a path that matches your goals and
              current experience.
            </p>
          </div>

          <span className="cp-result-count">
            {loading ? 'Loading courses…' : `${filtered.length} courses`}
          </span>
        </div>

        <div className="cp-filter-panel">
          <label className="cp-search">
            <Search size={18} />

            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search courses, skills, technologies..."
              aria-label="Search courses"
            />
          </label>

          <label className="cp-select">
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

          <label className="cp-select">
            <span>Level</span>

            <select
              value={level}
              onChange={(event) => setLevel(event.target.value)}
            >
              {LEVELS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="cp-select">
            <span>Sort by</span>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="newest">Recently added</option>
              <option value="title">Course name</option>
              <option value="duration">Shortest duration</option>
            </select>
          </label>

          <button
            className="cp-reset"
            type="button"
            onClick={reset}
          >
            <SlidersHorizontal size={15} />
            Reset
          </button>
        </div>

        {loading ? (
          <div
            className="cp-state"
            role="status"
            aria-live="polite"
          >
            <span className="cp-spinner" />
            Loading your learning library...
          </div>
        ) : error ? (
          <div
            className="cp-state cp-error"
            role="alert"
          >
            <AlertCircle size={24} />

            <h3>We couldn't load your courses</h3>

            <p>{error}</p>

            <button
              className="cp-primary-button"
              type="button"
              onClick={retryLoading}
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        ) : filtered.length > 0 ? (
          <div className="cp-course-grid">
            {filtered.map((course, index) => {
              const skills = Array.isArray(course.skills)
                ? course.skills.slice(0, 3)
                : [];

              const title = text(course.title, 'Untitled course');
              const slug = text(course.slug);

              return (
                <article
                  className="cp-course-card"
                  key={course._id || slug || `${title}-${index}`}
                >
                  <div
                    className="cp-course-cover"
                    data-tech={text(course.technology, 'Learning')}
                  >
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={`${title} course cover`}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="cp-cover-placeholder">
                        <span>
                          {text(course.technology, 'TJ')
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>

                        <small>TYAGIJI ACADEMY</small>
                      </div>
                    )}

                    <span className="cp-course-level">
                      {text(course.difficulty, 'Beginner')}
                    </span>

                    {course.isPremium && (
                      <span className="cp-premium-label">
                        <Sparkles size={12} />
                        Premium
                      </span>
                    )}
                  </div>

                  <div className="cp-course-body">
                    <div className="cp-course-category">
                      {text(
                        course.technology,
                        'Professional learning'
                      )}
                    </div>

                    <h3>{title}</h3>

                    <p>
                      {text(
                        course.tagline || course.description,
                        'Explore the curriculum and develop practical skills through guided learning.'
                      )}
                    </p>

                    <div className="cp-skill-list">
                      {skills.map((skill, skillIndex) => (
                        <span key={`${skill}-${skillIndex}`}>
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="cp-course-meta">
                      <span>
                        <BookOpen size={15} />
                        {Number(course.lessonCount) || 0} lessons
                      </span>

                      <span>
                        <Clock3 size={15} />
                        {duration(course.estimatedHours)}
                      </span>
                    </div>

                    {slug ? (
                      <Link
                        className="cp-course-link"
                        to={`/courses/${encodeURIComponent(slug)}`}
                      >
                        Explore course
                        <ArrowUpRight size={18} />
                      </Link>
                    ) : (
                      <span className="cp-course-link" aria-disabled="true">
                        Course details unavailable
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="cp-state">
            <Search size={28} />

            <h3>No courses match your filters</h3>

            <p>
              Try a different keyword or clear your filters.
            </p>

            <button
              className="cp-primary-button"
              type="button"
              onClick={reset}
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
