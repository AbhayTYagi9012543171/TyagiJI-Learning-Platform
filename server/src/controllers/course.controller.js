const courseService = require('../services/course.service');

async function list(req, res) {
  const result = await courseService.listPublishedCourses(req.query);
  res.json(result);
}

async function getBySlug(req, res) {
  const result = await courseService.getPublishedCourse(req.params.slug);
  if (!result) return res.status(404).json({ message: 'Course not found.' });
  return res.json(result);
}

async function lessons(req, res) {
  const result = await courseService.listCourseLessons(req.params.slug);
  if (!result) return res.status(404).json({ message: 'Course not found.' });
  return res.json({ lessons: result });
}

module.exports = { list, getBySlug, lessons };
