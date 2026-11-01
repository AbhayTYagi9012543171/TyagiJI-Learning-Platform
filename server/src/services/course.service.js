const { Course, Module, Lesson } = require('../models');

const TECHNOLOGY_ALIASES = Object.freeze({
  html: 'HTML',
  css: 'CSS',
  javascript: 'JavaScript',
  js: 'JavaScript',
  react: 'React',
  node: 'Node.js',
  nodejs: 'Node.js',
  mongodb: 'MongoDB',
});

function escapeRegex(value) {
  return String(value || '')
    .trim()
    .slice(0, 80)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function safeInteger(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function buildCourseFilter({ query = '', technology = '', level = '', difficulty = '' } = {}) {
  const filter = { published: true };
  const selectedTechnology = String(technology || '').trim();
  const selectedLevel = String(level || difficulty || '').trim();

  if (selectedTechnology && selectedTechnology !== 'All topics') {
    const normalized = TECHNOLOGY_ALIASES[selectedTechnology.toLowerCase()] || selectedTechnology;
    filter.technology = normalized;
  }

  if (selectedLevel && selectedLevel !== 'All levels') {
    if (['Beginner', 'Intermediate', 'Advanced'].includes(selectedLevel)) {
      filter.difficulty = selectedLevel;
    }
  }

  const search = escapeRegex(query);
  if (search) {
    const expression = new RegExp(search, 'i');
    filter.$or = [
      { title: expression },
      { description: expression },
      { tagline: expression },
      { technology: expression },
      { skills: expression },
      { objectives: expression },
      { learningOutcomes: expression },
    ];
  }

  return filter;
}

async function listPublishedCourses(options = {}) {
  const filter = buildCourseFilter(options);
  const page = safeInteger(options.page, 1, 1, 100000);
  const limit = safeInteger(options.limit, 24, 1, 100);
  const sortOption = String(options.sort || 'featured');
  const sort = {
    featured: { displayOrder: 1, publishedAt: -1, title: 1 },
    newest: { publishedAt: -1, createdAt: -1 },
    title: { title: 1 },
    duration: { estimatedHours: 1, title: 1 },
  }[sortOption] || { displayOrder: 1, publishedAt: -1, title: 1 };

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .select('title slug description tagline thumbnailUrl estimatedHours price isPremium skills technology difficulty objectives prerequisites learningOutcomes targetAudience publishedAt displayOrder createdAt')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Course.countDocuments(filter),
  ]);

  const courseIds = courses.map((course) => course._id);
  const [lessonCounts, moduleCounts] = await Promise.all([
    Lesson.aggregate([
      { $match: { course: { $in: courseIds }, published: true } },
      { $group: { _id: '$course', count: { $sum: 1 } } },
    ]),
    Module.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $group: { _id: '$course', count: { $sum: 1 } } },
    ]),
  ]);

  const lessonsByCourse = new Map(lessonCounts.map((item) => [String(item._id), item.count]));
  const modulesByCourse = new Map(moduleCounts.map((item) => [String(item._id), item.count]));

  return {
    success: true,
    courses: courses.map((course) => ({
      ...course,
      lessonCount: lessonsByCourse.get(String(course._id)) || 0,
      moduleCount: modulesByCourse.get(String(course._id)) || 0,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
}

async function getPublishedCourse(slug) {
  const requested = String(slug || '').trim().toLowerCase();
  if (!requested || requested.length > 180) return null;

  const course = await Course.findOne({ slug: requested, published: true }).lean();
  if (!course) return null;

  const [modules, lessons] = await Promise.all([
    Module.find({ course: course._id }).sort({ order: 1, createdAt: 1 }).lean(),
    Lesson.find({ course: course._id, published: true })
      .select('-__v')
      .sort({ order: 1, createdAt: 1 })
      .lean(),
  ]);

  return {
    success: true,
    course: {
      ...course,
      lessonCount: lessons.length,
      moduleCount: modules.length,
    },
    modules,
    lessons,
  };
}

async function listCourseLessons(slug) {
  const requested = String(slug || '').trim().toLowerCase();
  if (!requested || requested.length > 180) return null;

  const course = await Course.findOne({ slug: requested, published: true }).select('_id').lean();
  if (!course) return null;

  return Lesson.find({ course: course._id, published: true })
    .select('_id course module title slug summary objectives durationMinutes difficulty order')
    .sort({ order: 1, createdAt: 1 })
    .lean();
}

module.exports = {
  buildCourseFilter,
  listPublishedCourses,
  getPublishedCourse,
  listCourseLessons,
};
