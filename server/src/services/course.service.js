const { Course, Module, Lesson } = require('../models');

function escapeRegex(value) {
  return String(value || '').slice(0, 80).replace(/[.*+?^${}()|{}[\]\\]/g, '\\$&');
}

async function listPublishedCourses({ query = '', technology = '', page = 1, limit = 20 } = {}) {
  const filter = { published: true };
  if (technology) {
    const key = String(technology).toLowerCase();
    filter.technology = ({ html: 'HTML', css: 'CSS', javascript: 'JavaScript', js: 'JavaScript' })[key] || technology;
  }
  if (query) filter.title = { $regex: escapeRegex(query), $options: 'i' };
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 20));
  const [courses, total] = await Promise.all([
    Course.find(filter).sort({ displayOrder: 1, title: 1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
    Course.countDocuments(filter),
  ]);
  const counts = await Lesson.aggregate([
    { $match: { course: { $in: courses.map((course) => course._id) }, published: true } },
    { $group: { _id: '$course', count: { $sum: 1 } } },
  ]);
  const countByCourse = new Map(counts.map((item) => [String(item._id), item.count]));
  return {
    courses: courses.map((course) => ({ ...course, lessonCount: countByCourse.get(String(course._id)) || 0 })),
    pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) },
  };
}

async function getPublishedCourse(slug) {
  const requested = String(slug || '').trim().toLowerCase();
  const aliases = { html: 'HTML', css: 'CSS', javascript: 'JavaScript', js: 'JavaScript' };
  const escaped = escapeRegex(requested);
  const course = await Course.findOne({
    published: true,
    $or: [{ slug: requested }, { slug: new RegExp(`^${escaped}$`, 'i') }, ...(aliases[requested] ? [{ technology: aliases[requested] }] : [])],
  }).lean();
  if (!course) return null;
  const [modules, lessons] = await Promise.all([
    Module.find({ course: course._id }).sort({ order: 1 }).lean(),
    Lesson.find({ course: course._id, published: true }).select('-contentBlocks').sort({ order: 1 }).lean(),
  ]);
  return { course, modules, lessons };
}

async function listCourseLessons(slug) {
  const course = await Course.findOne({ slug: String(slug || '').toLowerCase(), published: true });
  if (!course) return null;
  return Lesson.find({ course: course._id, published: true }).select('-contentBlocks').sort({ order: 1 }).lean();
}

module.exports = { listPublishedCourses, getPublishedCourse, listCourseLessons };
