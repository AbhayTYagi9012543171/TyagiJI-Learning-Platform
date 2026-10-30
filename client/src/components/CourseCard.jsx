
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Code2,
  Layers3,
  Sparkles,
} from 'lucide-react';

const getText = (value, fallback = '') => {
  if (typeof value !== 'string') return fallback;
  return value.trim() || fallback;
};

const getObjectives = (objectives) => {
  if (!Array.isArray(objectives)) return [];

  return objectives
    .filter((item) => typeof item === 'string' && item.trim())
    .slice(0, 3);
};

const formatDuration = (minutes) => {
  const value = Number(minutes);

  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  if (value < 60) {
    return `${value} min`;
  }

  const hours = value / 60;

  return Number.isInteger(hours)
    ? `${hours} hr`
    : `${hours.toFixed(1)} hrs`;
};

export default function CourseCard({ course }) {
  if (!course || typeof course !== 'object') {
    return null;
  }

  const title = getText(course.title, 'Untitled course');
  const description = getText(
    course.description,
    'Explore the course curriculum and start building your skills.'
  );

  const technology = getText(course.technology, 'Technology');
  const difficulty = getText(course.difficulty, 'Beginner');
  const slug = getText(course.slug);

  const objectives = getObjectives(course.objectives);

  const lessonCount = Number(course.lessonCount);
  const estimatedMinutes = Number(course.estimatedMinutes);
  const estimatedHours = Number(course.estimatedHours);

  const duration = formatDuration(
    estimatedMinutes > 0
      ? estimatedMinutes
      : estimatedHours > 0
        ? estimatedHours * 60
        : null
  );

  const validLessonCount =
    Number.isFinite(lessonCount) && lessonCount > 0;

  const thumbnail = getText(course.thumbnailUrl);

  const difficultyClass = difficulty.toLowerCase().replace(
    /[^a-z0-9]+/g,
    '-'
  );

  return (
    <article className="course-card course-card--premium">
      {/* Course thumbnail */}
      <div className="course-card-visual">
        {thumbnail ? (
          <img
            className="course-card-thumbnail"
            src={thumbnail}
            alt={`${title} course thumbnail`}
            loading="lazy"
          />
        ) : (
          <div className="course-icon course-card-icon">
            <Code2 size={30} strokeWidth={1.7} />
          </div>
        )}

        <span className="course-card-category">
          <Layers3 size={13} />
          {technology}
        </span>

        {course.isPremium && (
          <span className="course-premium-badge">
            <Sparkles size={12} />
            Premium
          </span>
        )}
      </div>

      {/* Course information */}
      <div className="course-card-content">
        <div className="course-card-meta">
          <span
            className={`pill course-difficulty course-difficulty--${difficultyClass}`}
          >
            {difficulty}
          </span>

          {course.published && (
            <span className="course-published">
              <CheckCircle2 size={13} />
              Published
            </span>
          )}
        </div>

        <h3 className="course-card-title">{title}</h3>

        <p className="course-card-description">
          {description}
        </p>

        {/* Learning objectives */}
        {objectives.length > 0 && (
          <div className="course-card-skills">
            {objectives.map((objective, index) => (
              <span key={`${objective}-${index}`}>
                {objective}
              </span>
            ))}
          </div>
        )}

        {/* Course statistics */}
        <div className="course-card-stats">
          <div className="course-stat">
            <BookOpen size={15} />

            <span>
              {validLessonCount
                ? `${lessonCount} lessons`
                : 'Guided learning'}
            </span>
          </div>

          {duration && (
            <div className="course-stat">
              <Clock3 size={15} />
              <span>{duration}</span>
            </div>
          )}
        </div>

        {/* Course action */}
        <div className="card-bottom course-card-footer">
          <div className="course-card-footer-label">
            <span>Explore curriculum</span>
            <small>Learn at your own pace</small>
          </div>

          {slug ? (
            <Link
              to={`/courses/${encodeURIComponent(slug)}`}
              className="course-card-action"
              aria-label={`Explore ${title}`}
            >
              <ArrowUpRight size={20} />
            </Link>
          ) : (
            <span
              className="course-card-action course-card-action--disabled"
              aria-label="Course details unavailable"
              aria-disabled="true"
            >
              <ArrowUpRight size={20} />
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
