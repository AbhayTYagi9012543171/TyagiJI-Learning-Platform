const express = require('express');
const {
  Achievement,
  UserAchievement,
  Enrollment,
  Progress,
  QuizAttempt,
  Submission,
} = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const CATEGORY_BY_RULE = {
  courses_completed: 'Learning',
  lessons_completed: 'Learning',
  quizzes_passed: 'Coding',
  projects_approved: 'Projects',
  streak_days: 'Consistency',
  manual: 'Special',
};

function requirementFor(rule, threshold) {
  const plural = threshold === 1 ? '' : 's';
  switch (rule) {
    case 'courses_completed':
      return `Complete ${threshold} course${plural}`;
    case 'lessons_completed':
      return `Complete ${threshold} lesson${plural}`;
    case 'quizzes_passed':
      return `Pass ${threshold} quiz${plural}`;
    case 'projects_approved':
      return `Get ${threshold} project${plural} approved`;
    case 'streak_days':
      return `Learn on ${threshold} consecutive days`;
    default:
      return 'Awarded by a platform administrator';
  }
}

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

async function getUserMetrics(userId) {
  const [coursesCompleted, progressRows, quizzesPassed, projectsApproved] = await Promise.all([
    Enrollment.countDocuments({ user: userId, status: 'completed' }),
    Progress.find({ user: userId }).select('completedLessons').lean(),
    QuizAttempt.countDocuments({ user: userId, passed: true }),
    Submission.countDocuments({ user: userId, status: 'approved' }),
  ]);

  const completedLessonIds = new Set();
  for (const row of progressRows) {
    for (const lessonId of row.completedLessons || []) {
      completedLessonIds.add(String(lessonId));
    }
  }

  return {
    courses_completed: coursesCompleted,
    lessons_completed: completedLessonIds.size,
    quizzes_passed: quizzesPassed,
    projects_approved: projectsApproved,
    // This project does not yet store daily activity events. Streak awards
    // remain manually grantable until a persisted activity/streak model exists.
    streak_days: 0,
    manual: 0,
  };
}

// GET /api/v1/achievements
// Returns the active achievement catalogue together with the signed-in
// learner's earned state and progress calculated from persisted learning data.
router.get('/', requireAuth, asyncRoute(async (req, res) => {
  const [catalogue, earnedRows, metrics] = await Promise.all([
    Achievement.find({ active: true }).sort({ points: 1, title: 1 }).lean(),
    UserAchievement.find({ user: req.user._id }).select('achievement earnedAt').lean(),
    getUserMetrics(req.user._id),
  ]);

  const earnedIds = new Set(earnedRows.map((row) => String(row.achievement)));
  const newlyEarned = catalogue.filter((item) => (
    item.rule !== 'manual'
    && item.rule !== 'streak_days'
    && (metrics[item.rule] || 0) >= Number(item.threshold || 1)
    && !earnedIds.has(String(item._id))
  ));

  // Persist automatically completed milestones exactly once. The unique
  // { user, achievement } index protects against duplicate awards.
  if (newlyEarned.length) {
    await Promise.all(newlyEarned.map((item) => UserAchievement.updateOne(
      { user: req.user._id, achievement: item._id },
      { $setOnInsert: { user: req.user._id, achievement: item._id, earnedAt: new Date() } },
      { upsert: true },
    )));
  }

  const finalEarnedRows = newlyEarned.length
    ? await UserAchievement.find({ user: req.user._id }).select('achievement earnedAt').lean()
    : earnedRows;
  const earnedById = new Map(finalEarnedRows.map((row) => [String(row.achievement), row]));

  const data = catalogue.map((item) => {
    const threshold = Math.max(1, Number(item.threshold || 1));
    const current = Math.max(0, Number(metrics[item.rule] || 0));
    const earnedRecord = earnedById.get(String(item._id));
    const earned = Boolean(earnedRecord);
    const progress = earned ? 100 : Math.min(99, Math.round((current / threshold) * 100));

    return {
      _id: String(item._id),
      key: item.key,
      title: item.title,
      description: item.description,
      icon: item.icon || 'award',
      points: Number(item.points || 0),
      rule: item.rule,
      threshold,
      category: CATEGORY_BY_RULE[item.rule] || 'Special',
      requirement: requirementFor(item.rule, threshold),
      current,
      progress,
      earned,
      earnedAt: earnedRecord?.earnedAt || null,
    };
  });

  return res.status(200).json({ success: true, data });
}));

module.exports = router;
