const DEFAULT_ACHIEVEMENTS = [
  {
    key: 'first-course',
    title: 'First Steps',
    description: 'Complete your first course and celebrate the start of your learning journey.',
    icon: 'book',
    points: 100,
    rule: 'courses_completed',
    threshold: 1,
  },
  {
    key: 'course-collector',
    title: 'Course Collector',
    description: 'Complete three courses and broaden your developer skill set.',
    icon: 'award',
    points: 250,
    rule: 'courses_completed',
    threshold: 3,
  },
  {
    key: 'lesson-learner',
    title: 'Lesson Learner',
    description: 'Complete ten lessons through consistent study and practice.',
    icon: 'book',
    points: 150,
    rule: 'lessons_completed',
    threshold: 10,
  },
  {
    key: 'lesson-master',
    title: 'Lesson Master',
    description: 'Complete fifty lessons and build a strong learning foundation.',
    icon: 'medal',
    points: 400,
    rule: 'lessons_completed',
    threshold: 50,
  },
  {
    key: 'quiz-ready',
    title: 'Quiz Ready',
    description: 'Pass your first quiz and validate what you have learned.',
    icon: 'zap',
    points: 100,
    rule: 'quizzes_passed',
    threshold: 1,
  },
  {
    key: 'quiz-pro',
    title: 'Quiz Pro',
    description: 'Pass five quizzes and demonstrate consistent understanding.',
    icon: 'trophy',
    points: 300,
    rule: 'quizzes_passed',
    threshold: 5,
  },
  {
    key: 'project-builder',
    title: 'Project Builder',
    description: 'Get your first practical project approved.',
    icon: 'target',
    points: 250,
    rule: 'projects_approved',
    threshold: 1,
  },
  {
    key: 'master-builder',
    title: 'Master Builder',
    description: 'Get five practical projects approved.',
    icon: 'crown',
    points: 600,
    rule: 'projects_approved',
    threshold: 5,
  },
  {
    key: 'consistency-champion',
    title: 'Consistency Champion',
    description: 'Maintain a seven-day learning streak.',
    icon: 'flame',
    points: 300,
    rule: 'streak_days',
    threshold: 7,
  },
  {
    key: 'community-champion',
    title: 'Community Champion',
    description: 'A special recognition awarded by the TyagiJI platform team.',
    icon: 'star',
    points: 500,
    rule: 'manual',
    threshold: 1,
  },
];

async function seedAchievements(Achievement) {
  for (const item of DEFAULT_ACHIEVEMENTS) {
    await Achievement.updateOne(
      { key: item.key },
      { $set: { ...item, active: true } },
      { upsert: true },
    );
  }
  console.info(`Seeded ${DEFAULT_ACHIEVEMENTS.length} achievement definitions.`);
}

module.exports = { DEFAULT_ACHIEVEMENTS, seedAchievements };
