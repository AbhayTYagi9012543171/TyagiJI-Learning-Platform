const router = require('express').Router();
const controller = require('../controllers/course.controller');
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

router.get('/', asyncRoute(controller.list));
router.get('/:slug/lessons', asyncRoute(controller.lessons));
router.get('/:slug', asyncRoute(controller.getBySlug));

module.exports = router;
