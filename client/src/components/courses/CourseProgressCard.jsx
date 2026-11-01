import { Link } from 'react-router-dom';
import ProgressBar from '../ui/ProgressBar.jsx';
import Badge from '../ui/Badge.jsx';
export default function CourseProgressCard({ course }) {
  const percent = Math.max(0, Math.min(100, Number(course?.percentage) || 0));
  return (
    <article className="tj-course-progress-card">
      <div className="tj-course-progress-card__top">
        <div><Badge tone={percent >= 100 ? 'success' : 'primary'}>{percent >= 100 ? 'Completed' : 'In progress'}</Badge><h3>{course?.title || 'Untitled course'}</h3></div>
        <strong>{percent}%</strong>
      </div>
      <ProgressBar value={percent} size="sm"/>
      {course?.slug && <Link to={`/courses/${course.slug}`}>Continue learning</Link>}
    </article>
  );
}

