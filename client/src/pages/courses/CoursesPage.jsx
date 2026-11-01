import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  Clock3,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';

import { api } from '../../services/api.js';
import '../../styles/course-premium.css';

const LEVELS = [
  'All levels',
  'Beginner',
  'Intermediate',
  'Advanced',
];

function text(value, fallback = '') {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
}

function duration(hours) {
  const value = Number(hours);

  if (!Number.isFinite(value) || value <= 0) {
    return 'Self-paced';
  }

  return `${value} ${value === 1 ? 'hour' : 'hours'}`;
}

function isAbortError(error) {
  return (
    error?.name === 'AbortError' ||
    error?.code === 'ABORT_ERR' ||
    error?.cause?.name === 'AbortError'
  );
}

function getCoursesFromResponse(result) {
  if (Array.isArray(result)) {
    return result;
  }

  const candidates = [
    result?.courses,
    result?.data?.courses,
    result?.data?.data?.courses,
    result?.data,
    result?.data?.data,
  ];

  return candidates.find(Array.isArray) || [];
}

function getTechnology(course) {
  return text(course?.technology || course?.category);
}

function getLevel(course) {
  const value = text(
    course?.difficulty || course?.level,
    'Beginner'
  );

  const normalized = value.toLowerCase();

  if (normalized === 'beginner') return 'Beginner';
  if (normalized === 'intermediate') return 'Intermediate';
  if (normalized === 'advanced') return 'Advanced';

  return value;
}

function getSkills(course) {
  if (!Array.isArray(course?.skills)) {
    return [];
  }

  return course.skills
    .map((skill) =>
      typeof skill === 'string'
        ? skill.trim()
        : text(skill?.name || skill?.title)
    )
    .filter(Boolean);
}

function getCourseIdentifier(course) {
  return text(course?.slug || course?._id || course?.id);
}

function getCourseDate(course) {
  const value = course?.publishedAt || course?.createdAt;

  if (!value) return 0;

  const timestamp = new Date(value).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
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
        const response = await api.get('/courses?limit=100', {
          signal: controller.signal,
        });

        if (!active) return;

        setCourses(getCoursesFromResponse(response));
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
      courses.map(getTechnology).filter(Boolean)
    );

    return [
      'All topics',
      ...Array.from(uniqueTopics).sort((a, b) =>
        a.localeCompare(b)
      ),
    ];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const result = courses.filter((course) => {
      const objectives = Array.isArray(course?.objectives)
        ? course.objectives.map((item) =>
            typeof item === 'string'
              ? item
              : text(item?.title || item?.description)
          )
        : [];

      const searchableText = [
        course?.title,
        course?.description,
        course?.tagline,
        getTechnology(course),
        getLevel(course),
        ...getSkills(course),
        ...objectives,
      ]
        .map((value) => String(value ?? ''))
        .join(' ')
        .toLowerCase();

      const matchesQuery =
        !needle || searchableText.includes(needle);

      const matchesLevel =
        level === 'All levels' || getLevel(course) === level;

      const matchesTechnology =
        technology === 'All topics' ||
        getTechnology(course) === technology;

      return (
        matchesQuery &&
        matchesLevel &&
        matchesTechnology
      );
    });

    result.sort((a, b) => {
      if (sort === 'title') {
        return text(a?.title).localeCompare(text(b?.title));
      }

      if (sort === 'duration') {
        return (
          (Number(a?.estimatedHours) || 0) -
          (Number(b?.estimatedHours) || 0)
        );
      }

      if (sort === 'newest') {
        return getCourseDate(b) - getCourseDate(a);
      }

      return (
        (Number(a?.displayOrder) || 0) -
        (Number(b?.displayOrder) || 0)
      );
    });

    return result;
  }, [courses, query, level, technology, sort]);

  const resetFilters = useCallback(() => {
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
            <Sparkles size={14} aria-hidden="true" />
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
              <BookOpen size={16} aria-hidden="true" />
              {courses.length}{' '}
              {courses.length === 1
                ? 'learning path'
                : 'learning paths'}
            </span>

            <span>
              <Clock3 size={16} aria-hidden="true" />
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

      <section
        className="cp-catalog-section"
        aria-labelledby="course-library-heading"
      >
        <div className="cp-section-heading">
          <div>
            <span className="cp-eyebrow">
              THE COURSE LIBRARY
            </span>

            <h2 id="course-library-heading">
              Find your next skill
            </h2>

            <p>
              Choose a path that matches your goals and
              current experience.
            </p>
          </div>

          <span
            className="cp-result-count"
            aria-live="polite"
          >
            {loading
              ? 'Loading courses…'
              : `${filteredCourses.length} ${
                  filteredCourses.length === 1
                    ? 'course'
                    : 'courses'
                }`}
          </span>
        </div>

        <div className="cp-filter-panel">
          <label className="cp-search">
            <Search size={18} aria-hidden="true" />

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
              onChange={(event) =>
                setTechnology(event.target.value)
              }
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
            onClick={resetFilters}
          >
            <SlidersHorizontal size={15} aria-hidden="true" />
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
          <div className="cp-state cp-error" role="alert">
            <AlertCircle size={24} aria-hidden="true" />

            <h3>We couldn't load your courses</h3>

            <p>{error}</p>

            <button
              className="cp-primary-button"
              type="button"
              onClick={retryLoading}
            >
              <RefreshCw size={16} aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="cp-course-grid">
            {filteredCourses.map((course, index) => {
              const skills = getSkills(course).slice(0, 3);
              const title = text(
                course?.title,
                'Untitled course'
              );
              const identifier = getCourseIdentifier(course);
              const thumbnail = text(
                course?.thumbnailUrl || course?.thumbnail
              );

              return (
                <article
                  className="cp-course-card"
                  key={
                    course?._id ||
                    course?.id ||
                    identifier ||
                    `${title}-${index}`
                  }
                >
                  <div
                    className="cp-course-cover"
                    data-tech={getTechnology(course) || 'Learning'}
                  >
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={`${title} course cover`}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="cp-cover-placeholder">
                        <span>
                          {text(
                            getTechnology(course),
                            'TJ'
                          )
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>

                        <small>TYAGIJI ACADEMY</small>
                      </div>
                    )}

                    <span className="cp-course-level">
                      {getLevel(course)}
                    </span>

                    {course?.isPremium && (
                      <span className="cp-premium-label">
                        <Sparkles
                          size={12}
                          aria-hidden="true"
                        />
                        Premium
                      </span>
                    )}
                  </div>

                  <div className="cp-course-body">
                    <div className="cp-course-category">
                      {getTechnology(course) ||
                        'Professional learning'}
                    </div>

                    <h3>{title}</h3>

                    <p>
                      {text(
                        course?.tagline || course?.description,
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
                        <BookOpen
                          size={15}
                          aria-hidden="true"
                        />
                        {Number(course?.lessonCount) || 0}{' '}
                        lessons
                      </span>

                      <span>
                        <Clock3
                          size={15}
                          aria-hidden="true"
                        />
                        {duration(course?.estimatedHours)}
                      </span>
                    </div>

                    {identifier ? (
                      <Link
                        className="cp-course-link"
                        to={`/courses/${encodeURIComponent(
                          identifier
                        )}`}
                        aria-label={`Explore ${title}`}
                      >
                        Explore course
                        <ArrowUpRight
                          size={18}
                          aria-hidden="true"
                        />
                      </Link>
                    ) : (
                      <span
                        className="cp-course-link"
                        aria-disabled="true"
                      >
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
            <Search size={28} aria-hidden="true" />

            <h3>No courses match your filters</h3>

            <p>
              Try a different keyword or clear your filters.
            </p>

            <button
              className="cp-primary-button"
              type="button"
              onClick={resetFilters}
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
