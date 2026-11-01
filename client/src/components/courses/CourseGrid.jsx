import CourseCard from '../CourseCard.jsx';
import EmptyState from '../ui/EmptyState.jsx';
export default function CourseGrid({ courses = [], emptyTitle = 'No courses found', emptyText = 'Courses will appear here when they are available.', className = '' }) {
  if (!courses.length) return <EmptyState title={emptyTitle} text={emptyText}/>;
  return <div className={`course-grid ${className}`.trim()}>{courses.map((course) => <CourseCard key={course._id || course.slug} course={course}/>)}</div>;
}

