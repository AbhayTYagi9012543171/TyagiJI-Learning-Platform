
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { z } = require('zod');
const { rateLimit } = require('express-rate-limit');

const {
  User,
  Course,
  Module,
  Lesson,
  Quiz,
  QuizAttempt,
  Project,
  Progress,
  Bookmark,
  Resource,
  Enrollment,
  Note,
} = require('../models');

const {
  optionalAuth,
  requireAuth,
  requireAdmin,
} = require('../middleware/auth');

const CareerProfile = require('../models/CareerProfile');
const CareerRoadmap = require('../models/CareerRoadmap');

const router = express.Router();

/* -------------------------------------------------------
   SHARED HELPERS
------------------------------------------------------- */

const asyncRoute = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
});

const emailSchema = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((value) => value.toLowerCase());

const passwordSchema = z.string().min(8).max(128);

const safeUser = (user) => {
  if (!user) return null;

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    preferences: user.preferences || {},
  };
};

const isValidId = (id) => mongoose.isValidObjectId(id);

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(180)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const getIdentifier = (value) => {
  return isValidId(value)
    ? { _id: value }
    : { slug: value };
};

function sessionCookieOptions() {
  const secure = process.env.COOKIE_SECURE === 'true';
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

function createSession(user, res) {
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET is not configured.');
  }

  const token = jwt.sign(
    {
      sub: String(user._id),
      jti: crypto.randomUUID(),
    },
    process.env.SESSION_SECRET,
    {
      expiresIn: '7d',
    }
  );

  res.cookie('cp_session', token, sessionCookieOptions());
}

function clearSession(res) {
  const { maxAge, ...cookieOptions } = sessionCookieOptions();
  res.clearCookie('cp_session', cookieOptions);
}

function sendValidationError(res, error, message = 'Invalid request data.') {
  return res.status(400).json({
    success: false,
    message,
    errors: error.issues?.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    })) || [],
  });
}

function escapeRegex(value) {
  return String(value || '')
    .slice(0, 80)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function pagination(query) {
  const page = Math.max(
    1,
    Number.parseInt(query.page, 10) || 1
  );

  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(query.limit, 10) || 25)
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

/* -------------------------------------------------------
   HEALTH
------------------------------------------------------- */

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'tyagiji-learning-api',
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1
        ? 'connected'
        : 'disconnected',
  });
});

/* -------------------------------------------------------
   AUTHENTICATION
------------------------------------------------------- */

// REGISTER
router.post(
  '/auth/register',
  authLimit,
  asyncRoute(async (req, res) => {
    const schema = z.object({
      name: z.string().trim().min(2).max(80),
      email: emailSchema,
      password: passwordSchema,
    }).strict();

    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return sendValidationError(
        res,
        parsed.error,
        'Please check your registration details.'
      );
    }

    const { name, email, password } = parsed.data;

    const existingUser = await User.exists({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: 'student',
      status: 'active',
    });

    createSession(user, res);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: safeUser(user),
    });
  })
);

// LOGIN
router.post(
  '/auth/login',
  authLimit,
  asyncRoute(async (req, res) => {
    const schema = z.object({
      email: emailSchema,
      password: z.string().min(1).max(128),
    }).strict();

    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return sendValidationError(
        res,
        parsed.error,
        'Enter a valid email and password.'
      );
    }

    const user = await User.findOne({
      email: parsed.data.email,
    }).select('+passwordHash');

    if (
      !user ||
      user.status !== 'active' ||
      !user.passwordHash ||
      !(await bcrypt.compare(
        parsed.data.password,
        user.passwordHash
      ))
    ) {
      return res.status(401).json({
        success: false,
        message: 'Email or password is incorrect.',
      });
    }

    createSession(user, res);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: safeUser(user),
    });
  })
);

// LOGOUT
router.post('/auth/logout', (req, res) => {
  clearSession(res);

  return res.status(200).json({
    success: true,
    message: 'Signed out successfully.',
  });
});

// CURRENT USER
// IMPORTANT: This route is public.
// A visitor without a session receives 200, not 401.
router.get(
  '/auth/me',
  optionalAuth,
  (req, res) => {
    return res.status(200).json({
      success: true,
      authenticated: Boolean(req.user),
      user: safeUser(req.user),
    });
  }
);

// FORGOT PASSWORD
router.post(
  '/auth/forgot-password',
  authLimit,
  asyncRoute(async (req, res) => {
    const parsed = emailSchema.safeParse(req.body?.email);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid email address.',
      });
    }

    const user = await User.findOne({
      email: parsed.data,
    });

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');

      user.resetTokenHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      user.resetTokenExpires = new Date(
        Date.now() + 15 * 60 * 1000
      );

      await user.save();

      // Development-only helper.
      // Production password recovery needs a configured email provider.
      if (
        process.env.NODE_ENV !== 'production' &&
        process.env.ENABLE_DEV_RESET === 'true'
      ) {
        console.info(
          `Development reset token: ${token}`
        );
      }
    }

    return res.status(200).json({
      success: true,
      message:
        'If an account matches that address, recovery instructions will be sent.',
    });
  })
);

// RESET PASSWORD
router.post(
  '/auth/reset-password',
  authLimit,
  asyncRoute(async (req, res) => {
    const schema = z.object({
      token: z.string().min(32).max(256),
      password: passwordSchema,
    }).strict();

    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return sendValidationError(
        res,
        parsed.error,
        'A valid reset token and password are required.'
      );
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(parsed.data.token)
      .digest('hex');

    const user = await User.findOne({
      resetTokenHash: tokenHash,
      resetTokenExpires: {
        $gt: new Date(),
      },
    }).select('+resetTokenHash');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Reset link is invalid or expired.',
      });
    }

    user.passwordHash = await bcrypt.hash(
      parsed.data.password,
      12
    );

    user.resetTokenHash = undefined;
    user.resetTokenExpires = undefined;

    await user.save();

    clearSession(res);

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully. Please sign in again.',
    });
  })
);

/* -------------------------------------------------------
   PUBLIC COURSES AND LESSONS
------------------------------------------------------- */

router.use('/courses', require('./course.routes'));

router.get(
  '/lessons/:slug',
  asyncRoute(async (req, res) => {
    const lesson = await Lesson.findOne({
      slug: req.params.slug,
      published: true,
    }).populate('course', 'title slug');

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found.',
      });
    }

    return res.json({
      success: true,
      lesson,
    });
  })
);

// COMPLETE LESSON
router.post(
  '/lessons/:id/complete',
  requireAuth,
  asyncRoute(async (req, res) => {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lesson identifier.',
      });
    }

    const lesson = await Lesson.findOne({
      _id: req.params.id,
      published: true,
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Published lesson not found.',
      });
    }

    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: lesson.course,
      status: 'active',
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Enroll in this course before completing lessons.',
      });
    }

    const totalLessons = await Lesson.countDocuments({
      course: lesson.course,
      published: true,
    });

    const progress = await Progress.findOneAndUpdate(
      {
        user: req.user._id,
        course: lesson.course,
      },
      {
        $addToSet: {
          completedLessons: lesson._id,
        },
        $set: {
          lastLesson: lesson._id,
          lastActivity: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    progress.completionPercentage = totalLessons
      ? Math.round(
          (progress.completedLessons.length / totalLessons) * 100
        )
      : 0;

    await progress.save();

    return res.json({
      success: true,
      progress,
    });
  })
);

/* -------------------------------------------------------
   PROJECTS
------------------------------------------------------- */

router.get(
  '/projects',
  asyncRoute(async (req, res) => {
    const projects = await Project.find({
      published: true,
    })
      .select('-starterFiles')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({
      success: true,
      projects,
    });
  })
);

router.get(
  '/projects/:slug',
  asyncRoute(async (req, res) => {
    const project = await Project.findOne({
      slug: req.params.slug,
      published: true,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    return res.json({
      success: true,
      project,
    });
  })
);

/* -------------------------------------------------------
   RESOURCES
------------------------------------------------------- */

router.get(
  '/resources',
  asyncRoute(async (req, res) => {
    const resources = await Resource.find({
      $or: [
        { published: true },
        { published: { $exists: false } },
      ],
    })
      .sort({ displayOrder: 1, title: 1 })
      .limit(100)
      .lean();

    return res.json({
      success: true,
      resources,
    });
  })
);

/* -------------------------------------------------------
   GLOSSARY
------------------------------------------------------- */

router.get('/glossary', (req, res) => {
  const entries = [
    {
      term: 'Accessibility',
      definition: 'Designing and building digital experiences that people with different abilities can use.',
    },
    {
      term: 'API',
      definition: 'A defined interface that lets software systems communicate.',
    },
    {
      term: 'Attribute',
      definition: 'Extra information that configures or describes an HTML element.',
    },
    {
      term: 'DOM',
      definition: 'The browser object model representing a document and its nodes.',
    },
    {
      term: 'Flexbox',
      definition: 'A CSS layout system for arranging items along one axis.',
    },
    {
      term: 'HTTP',
      definition: 'A protocol used to request and transfer web resources.',
    },
    {
      term: 'Responsive design',
      definition: 'Layouts that adapt to viewport size and content constraints.',
    },
    {
      term: 'Semantic HTML',
      definition: 'HTML elements that communicate the meaning and role of content.',
    },
    {
      term: 'Specificity',
      definition: 'The selector-priority component used by the CSS cascade.',
    },
    {
      term: 'Promise',
      definition: 'An object representing the eventual result or failure of an asynchronous operation.',
    },
  ];

  return res.json({
    success: true,
    entries,
  });
});

/* -------------------------------------------------------
   CHEATSHEETS
------------------------------------------------------- */

router.get('/cheatsheets', (req, res) => {
  const cheatsheets = [
    {
      title: 'HTML essentials',
      category: 'HTML',
      items: [
        'Use semantic landmarks such as main, nav, header, and footer.',
        'Give informative images meaningful alt text.',
        'Associate labels with form controls.',
        'Use headings in a logical hierarchy.',
      ],
    },
    {
      title: 'CSS layout',
      category: 'CSS',
      items: [
        'Use Flexbox for one-dimensional layouts.',
        'Use Grid for two-dimensional layouts.',
        'Prefer rem and flexible units for adaptable layouts.',
        'Use :focus-visible to make keyboard focus obvious.',
      ],
    },
    {
      title: 'JavaScript essentials',
      category: 'JavaScript',
      items: [
        'Prefer const unless reassignment is required.',
        'Use === for strict equality.',
        'Handle rejected promises and failed HTTP responses.',
        'Use addEventListener for DOM events.',
      ],
    },
    {
      title: 'Git workflow',
      category: 'Tools',
      items: [
        'Check git status before committing.',
        'Make small, descriptive commits.',
        'Never commit secrets or .env files.',
        'Review changes before pushing.',
      ],
    },
  ];

  return res.json({
    success: true,
    cheatsheets,
  });
});

/* -------------------------------------------------------
   QUIZZES
------------------------------------------------------- */

// PUBLIC QUIZ LIST
router.get(
  '/quizzes',
  asyncRoute(async (req, res) => {
    const quizzes = await Quiz.find({
      published: true,
    })
      .select('-questions')
      .populate('course', 'title slug')
      .limit(100)
      .lean();

    return res.json({
      success: true,
      quizzes,
    });
  })
);

// PUBLIC QUIZ DETAILS
// Never return correctIndex to the browser before submission.
router.get(
  '/quizzes/:id',
  asyncRoute(async (req, res) => {
    const quiz = await Quiz.findOne({
      ...getIdentifier(req.params.id),
      published: true,
    }).select('-questions.correctIndex');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.',
      });
    }

    return res.json({
      success: true,
      quiz,
    });
  })
);

// SUBMIT QUIZ
router.post(
  '/quizzes/:id/submit',
  requireAuth,
  asyncRoute(async (req, res) => {
    const quiz = await Quiz.findOne({
      ...getIdentifier(req.params.id),
      published: true,
    }).select('+questions.correctIndex');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.',
      });
    }

    const schema = z.object({
      answers: z.array(
        z.object({
          questionId: z.string(),
          optionIndex: z.number().int().min(0).max(100),
        }).strict()
      ).max(200),
    }).strict();

    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return sendValidationError(
        res,
        parsed.error,
        'Invalid quiz answers.'
      );
    }

    const validIds = new Set(
      quiz.questions.map((question) => String(question._id))
    );

    const submittedIds = parsed.data.answers.map(
      (answer) => answer.questionId
    );

    if (
      submittedIds.some(
        (id) => !isValidId(id) || !validIds.has(id)
      ) ||
      new Set(submittedIds).size !== submittedIds.length
    ) {
      return res.status(400).json({
        success: false,
        message: 'Answers contain duplicate or unknown questions.',
      });
    }

    const answerMap = new Map(
      parsed.data.answers.map((answer) => [
        answer.questionId,
        answer.optionIndex,
      ])
    );

    let score = 0;

    const details = quiz.questions.map((question) => {
      const selectedIndex = answerMap.get(
        String(question._id)
      );

      const correct =
        selectedIndex === question.correctIndex;

      if (correct) score += 1;

      return {
        questionId: question._id,
        selectedIndex: selectedIndex ?? null,
        correct,
        explanation: question.explanation,
        correctIndex: question.correctIndex,
      };
    });

    const total = quiz.questions.length;

    const percentage = total
      ? Math.round((score / total) * 100)
      : 0;

    const passingScore = quiz.passingScore ?? 60;

    const attempt = await QuizAttempt.create({
      user: req.user._id,
      quiz: quiz._id,
      answers: parsed.data.answers,
      score,
      total,
      percentage,
      passed: percentage >= passingScore,
      details,
      submittedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      result: {
        attemptId: attempt._id,
        score,
        total,
        percentage,
        passed: attempt.passed,
        details,
      },
    });
  })
);

// STUDENT QUIZ HISTORY
router.get(
  '/quizzes/:id/attempts',
  requireAuth,
  asyncRoute(async (req, res) => {
    const quiz = await Quiz.findOne(
      getIdentifier(req.params.id)
    ).select('_id');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.',
      });
    }

    const attempts = await QuizAttempt.find({
      user: req.user._id,
      quiz: quiz._id,
    })
      .sort({ submittedAt: -1 })
      .limit(50)
      .populate('quiz', 'title')
      .lean();

    return res.json({
      success: true,
      attempts: attempts.map((attempt) => ({
        ...attempt,
        quizTitle: attempt.quiz?.title,
      })),
    });
  })
);

/* -------------------------------------------------------
   STUDENT PROGRESS
------------------------------------------------------- */

router.get(
  '/users/me/progress',
  requireAuth,
  asyncRoute(async (req, res) => {
    const [progress, quizAttempts] = await Promise.all([
      Progress.find({
        user: req.user._id,
      })
        .populate('course', 'title slug')
        .lean(),

      QuizAttempt.countDocuments({
        user: req.user._id,
      }),
    ]);

    return res.json({
      success: true,
      completedLessons: progress.reduce(
        (total, item) => total + item.completedLessons.length,
        0
      ),
      coursesStarted: progress.length,
      quizAttempts,
      progress,
      activity: progress.map((item) => ({
        title: `Learning in ${item.course?.title || 'a course'}`,
        date: item.lastActivity,
      })),
    });
  })
);

/* -------------------------------------------------------
   STUDENT BOOKMARKS
------------------------------------------------------- */

router.get(
  '/users/me/bookmarks',
  requireAuth,
  asyncRoute(async (req, res) => {
    const bookmarks = await Bookmark.find({
      user: req.user._id,
    })
      .populate({
        path: 'lesson',
        populate: {
          path: 'course',
          select: 'title slug',
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      bookmarks: bookmarks
        .filter((item) => item.lesson)
        .map((item) => ({
          _id: item._id,
          title: item.lesson.title,
          lessonSlug: item.lesson.slug,
          courseTitle: item.lesson.course?.title,
          courseSlug: item.lesson.course?.slug,
          createdAt: item.createdAt,
        })),
    });
  })
);

router.post(
  '/users/me/bookmarks/:lessonId',
  requireAuth,
  asyncRoute(async (req, res) => {
    if (!isValidId(req.params.lessonId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lesson identifier.',
      });
    }

    const lesson = await Lesson.findOne({
      _id: req.params.lessonId,
      published: true,
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found.',
      });
    }

    const bookmark = await Bookmark.findOneAndUpdate(
      {
        user: req.user._id,
        lesson: lesson._id,
      },
      {
        $setOnInsert: {
          user: req.user._id,
          lesson: lesson._id,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(201).json({
      success: true,
      bookmark,
    });
  })
);

router.delete(
  '/users/me/bookmarks/:lessonId',
  requireAuth,
  asyncRoute(async (req, res) => {
    if (!isValidId(req.params.lessonId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lesson identifier.',
      });
    }

    await Bookmark.deleteOne({
      user: req.user._id,
      lesson: req.params.lessonId,
    });

    return res.json({
      success: true,
      message: 'Bookmark removed.',
    });
  })
);

/* -------------------------------------------------------
   STUDENT DASHBOARD
------------------------------------------------------- */

router.get(
  '/users/me/dashboard',
  requireAuth,
  asyncRoute(async (req, res) => {
    const [
      progress,
      bookmarks,
      quizAttempts,
      lessonCounts,
    ] = await Promise.all([
      Progress.find({
        user: req.user._id,
      })
        .populate('course', 'title slug')
        .lean(),

      Bookmark.countDocuments({
        user: req.user._id,
      }),

      QuizAttempt.countDocuments({
        user: req.user._id,
      }),

      Lesson.aggregate([
        {
          $match: {
            published: true,
          },
        },
        {
          $group: {
            _id: '$course',
            total: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totals = new Map(
      lessonCounts.map((item) => [
        String(item._id),
        item.total,
      ])
    );

    const courses = progress
      .filter((item) => item.course)
      .map((item) => ({
        title: item.course.title,
        slug: item.course.slug,
        completed: item.completedLessons.length,
        total: totals.get(String(item.course._id)) || 0,
        percentage: item.completionPercentage || 0,
      }));

    return res.json({
      success: true,
      dashboard: {
        completedLessons: progress.reduce(
          (total, item) =>
            total + item.completedLessons.length,
          0
        ),
        coursesInProgress: courses.filter(
          (course) => course.percentage < 100
        ).length,
        quizAttempts,
        bookmarks,
        courses,
      },
    });
  })
);

/* -------------------------------------------------------
   STUDENT PREFERENCES
------------------------------------------------------- */

router.patch(
  '/users/me/preferences',
  requireAuth,
  asyncRoute(async (req, res) => {
    const schema = z.object({
      name: z.string().trim().min(2).max(80).optional(),
      theme: z.enum(['dark', 'light']).optional(),
    }).strict();

    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return sendValidationError(
        res,
        parsed.error,
        'Invalid preference settings.'
      );
    }

    if (!Object.keys(parsed.data).length) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one preference to update.',
      });
    }

    if (parsed.data.name) {
      req.user.name = parsed.data.name;
    }

    if (parsed.data.theme) {
      req.user.preferences = req.user.preferences || {};
      req.user.preferences.theme = parsed.data.theme;
    }

    await req.user.save();

    return res.json({
      success: true,
      user: safeUser(req.user),
    });
  })
);

/* -------------------------------------------------------
   STUDENT ENROLLMENTS
------------------------------------------------------- */

router.get(
  '/enrollments/me',
  requireAuth,
  asyncRoute(async (req, res) => {
    const enrollments = await Enrollment.find({
      user: req.user._id,
      status: { $ne: 'cancelled' },
    })
      .populate(
        'course',
        'title slug description technology difficulty thumbnailUrl isPremium estimatedHours published'
      )
      .sort({ enrolledAt: -1 })
      .lean();

    return res.json({
      success: true,
      enrollments: enrollments.filter(
        (item) => item.course?.published
      ),
    });
  })
);

// ENROLL IN COURSE
router.post(
  '/courses/:courseId/enroll',
  requireAuth,
  asyncRoute(async (req, res) => {
    if (!isValidId(req.params.courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course identifier.',
      });
    }

    const course = await Course.findOne({
      _id: req.params.courseId,
      published: true,
    }).select('_id isPremium');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Published course not found.',
      });
    }

    if (
      course.isPremium &&
      process.env.PREMIUM_ENROLLMENT_OPEN !== 'true'
    ) {
      return res.status(402).json({
        success: false,
        message: 'This premium course requires an active entitlement.',
      });
    }

    const enrollment = await Enrollment.findOneAndUpdate(
      {
        user: req.user._id,
        course: course._id,
      },
      {
        $set: {
          status: 'active',
        },
        $setOnInsert: {
          user: req.user._id,
          course: course._id,
          enrolledAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(201).json({
      success: true,
      enrollment,
    });
  })
);

// CANCEL ENROLLMENT
router.delete(
  '/enrollments/:id',
  requireAuth,
  asyncRoute(async (req, res) => {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid enrollment identifier.',
      });
    }

    const enrollment = await Enrollment.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
        status: 'active',
      },
      {
        $set: {
          status: 'cancelled',
        },
      },
      {
        new: true,
      }
    );

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Active enrollment not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Enrollment cancelled.',
      enrollment,
    });
  })
);

/* -------------------------------------------------------
   STUDENT NOTES
------------------------------------------------------- */

router.get(
  '/users/me/notes',
  requireAuth,
  asyncRoute(async (req, res) => {
    const notes = await Note.find({
      user: req.user._id,
    })
      .populate('lesson', 'title slug course')
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();

    return res.json({
      success: true,
      notes: notes.filter((note) => note.lesson),
    });
  })
);

// CREATE OR UPDATE NOTE
router.put(
  '/users/me/notes/:lessonId',
  requireAuth,
  asyncRoute(async (req, res) => {
    if (!isValidId(req.params.lessonId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lesson identifier.',
      });
    }

    const schema = z.object({
      content: z.string().trim().min(1).max(10000),
    }).strict();

    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return sendValidationError(
        res,
        parsed.error,
        'Note content must be between 1 and 10000 characters.'
      );
    }

    const lesson = await Lesson.findOne({
      _id: req.params.lessonId,
      published: true,
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Published lesson not found.',
      });
    }

    const note = await Note.findOneAndUpdate(
      {
        user: req.user._id,
        lesson: lesson._id,
      },
      {
        $set: {
          content: parsed.data.content,
        },
        $setOnInsert: {
          user: req.user._id,
          lesson: lesson._id,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.json({
      success: true,
      note,
    });
  })
);

// DELETE NOTE
router.delete(
  '/users/me/notes/:lessonId',
  requireAuth,
  asyncRoute(async (req, res) => {
    if (!isValidId(req.params.lessonId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lesson identifier.',
      });
    }

    await Note.deleteOne({
      user: req.user._id,
      lesson: req.params.lessonId,
    });

    return res.json({
      success: true,
      message: 'Note deleted.',
    });
  })
);

/* -------------------------------------------------------
   ADMIN MODEL CONFIGURATION
------------------------------------------------------- */

const adminModels = {
  courses: Course,
  modules: Module,
  lessons: Lesson,
  quizzes: Quiz,
  projects: Project,
  resources: Resource,
  users: User,
};

const technologySchema = z.enum([
  'HTML',
  'CSS',
  'JavaScript',
  'React',
  'Node.js',
  'MongoDB',
  'Python',
  'TypeScript',
  'SQL',
  'Git',
  'Data Structures & Algorithms',
  'MERN Stack',
]);

const difficultySchema = z.enum([
  'Beginner',
  'Intermediate',
  'Advanced',
]);

const courseSchema = z.object({
  title: z.string().trim().min(2).max(120),
  slug: slugSchema,
  description: z.string().max(3000).optional(),
  tagline: z.string().max(180).optional(),
  thumbnailUrl: z.string().url().max(2048).optional().or(z.literal('')),
  estimatedHours: z.number().min(0).max(10000).optional(),
  price: z.number().min(0).max(1000000).optional(),
  isPremium: z.boolean().optional(),
  skills: z.array(z.string().max(80)).max(30).optional(),
  learningOutcomes: z.array(z.string().max(300)).max(40).optional(),
  targetAudience: z.array(z.string().max(200)).max(30).optional(),
  technology: technologySchema,
  difficulty: difficultySchema.optional(),
  objectives: z.array(z.string().max(240)).max(40).optional(),
  prerequisites: z.array(z.string().max(240)).max(40).optional(),
  published: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
}).strict();

const moduleSchema = z.object({
  title: z.string().trim().min(2).max(120),
  slug: slugSchema,
  course: z.string().refine(isValidId, 'Invalid course identifier.'),
  description: z.string().max(3000).optional(),
  objectives: z.array(z.string().max(240)).max(30).optional(),
  estimatedMinutes: z.number().int().min(0).max(10000).optional(),
  order: z.number().int().min(0).optional(),
}).strict();

const contentBlockSchema = z.object({
  type: z.enum([
    'text',
    'code',
    'callout',
    'example',
    'exercise',
    'output',
    'image',
  ]).optional(),
  heading: z.string().max(200).optional(),
  text: z.string().max(12000).optional(),
  code: z.string().max(20000).optional(),
  language: z.string().max(40).optional(),
  expectedOutput: z.string().max(12000).optional(),
  caption: z.string().max(500).optional(),
}).strict();

const lessonSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: slugSchema,
  course: z.string().refine(isValidId, 'Invalid course identifier.'),
  module: z.string().refine(isValidId, 'Invalid module identifier.').optional().or(z.literal('')),
  summary: z.string().max(3000).optional(),
  contentBlocks: z.array(contentBlockSchema).max(100).optional(),
  keyTakeaways: z.array(z.string().max(500)).max(40).optional(),
  resources: z.array(
    z.object({
      title: z.string().max(160),
      url: z.string().url().max(2048),
    }).strict()
  ).max(30).optional(),
  objectives: z.array(z.string().max(240)).max(30).optional(),
  prerequisites: z.array(z.string().max(240)).max(30).optional(),
  difficulty: difficultySchema.optional(),
  published: z.boolean().optional(),
  durationMinutes: z.number().int().min(1).max(600).optional(),
  order: z.number().int().min(0).optional(),
}).strict();

const questionSchema = z.object({
  prompt: z.string().min(3).max(2000),
  options: z.array(z.string().min(1).max(500)).min(2).max(8),
  correctIndex: z.number().int().min(0).max(7),
  explanation: z.string().max(2000).optional(),
  difficulty: z.string().max(40).optional(),
  hint: z.string().max(500).optional(),
}).strict().refine(
  (question) => question.correctIndex < question.options.length,
  {
    message: 'correctIndex must point to an existing option.',
    path: ['correctIndex'],
  }
);

const quizSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: slugSchema,
  course: z.string().refine(isValidId, 'Invalid course identifier.'),
  description: z.string().max(3000).optional(),
  questions: z.array(questionSchema).max(200).optional(),
  passingScore: z.number().int().min(0).max(100).optional(),
  randomize: z.boolean().optional(),
  published: z.boolean().optional(),
}).strict();

const projectSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: slugSchema,
  description: z.string().max(5000).optional(),
  difficulty: difficultySchema.optional(),
  technology: z.array(z.string().max(40)).max(12).optional(),
  requirements: z.array(z.string().max(500)).max(50).optional(),
  learningObjectives: z.array(z.string().max(300)).max(40).optional(),
  acceptanceCriteria: z.array(z.string().max(500)).max(50).optional(),
  estimatedHours: z.number().min(0).max(10000).optional(),
  steps: z.array(z.any()).max(100).optional(),
  starterFiles: z.array(
    z.object({
      name: z.string().max(200),
      content: z.string().max(50000),
    }).strict()
  ).max(50).optional(),
  extensionTasks: z.array(z.string().max(500)).max(50).optional(),
  published: z.boolean().optional(),
}).strict();

const resourceSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().max(3000).optional(),
  url: z.string().url().max(2048),
  category: z.string().max(100).optional(),
  technology: z.array(z.string().max(40)).max(12).optional(),
  difficulty: difficultySchema.optional(),
  verified: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
}).strict();

const userSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  status: z.enum(['active', 'disabled']).optional(),
}).strict();

const adminSchemas = {
  courses: courseSchema,
  modules: moduleSchema,
  lessons: lessonSchema,
  quizzes: quizSchema,
  projects: projectSchema,
  resources: resourceSchema,
  users: userSchema,
};

/* -------------------------------------------------------
   ADMIN ROUTES
------------------------------------------------------- */

// All /admin endpoints require admin role.
router.use('/admin', requireAuth, requireAdmin);

// ADMIN ANALYTICS
router.get(
  '/admin/analytics',
  asyncRoute(async (req, res) => {
    const [
      users,
      activeUsers,
      courses,
      publishedCourses,
      lessons,
      publishedLessons,
      quizzes,
      projects,
      enrollments,
      quizAttempts,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      Course.countDocuments(),
      Course.countDocuments({ published: true }),
      Lesson.countDocuments(),
      Lesson.countDocuments({ published: true }),
      Quiz.countDocuments(),
      Project.countDocuments(),
      Enrollment.countDocuments({ status: 'active' }),
      QuizAttempt.countDocuments(),
    ]);

    const recentCourses = await Course.find()
      .select('title slug published technology createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return res.json({
      success: true,
      analytics: {
        users,
        activeUsers,
        courses,
        publishedCourses,
        lessons,
        publishedLessons,
        quizzes,
        projects,
        enrollments,
        quizAttempts,
        recentCourses,
      },
    });
  })
);

/* -------------------------------------------------------
   ADMIN CRUD
------------------------------------------------------- */

for (const [resource, Model] of Object.entries(adminModels)) {
  const schema = adminSchemas[resource];

  // LIST
  router.get(
    `/admin/${resource}`,
    asyncRoute(async (req, res) => {
      const { page, limit, skip } = pagination(req.query);
      const filter = {};

      if (req.query.q) {
        const term = escapeRegex(req.query.q);

        filter.$or = [
          { title: { $regex: term, $options: 'i' } },
          { name: { $regex: term, $options: 'i' } },
          { email: { $regex: term, $options: 'i' } },
          { slug: { $regex: term, $options: 'i' } },
        ];
      }

      if (
        resource === 'users' &&
        ['active', 'disabled'].includes(req.query.status)
      ) {
        filter.status = req.query.status;
      }

      const select =
        resource === 'users'
          ? '-passwordHash -resetTokenHash -resetTokenExpires'
          : '';

      const [items, total] = await Promise.all([
        Model.find(filter)
          .select(select)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        Model.countDocuments(filter),
      ]);

      return res.json({
        success: true,
        [resource]: items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    })
  );

  // CREATE
  router.post(
    `/admin/${resource}`,
    asyncRoute(async (req, res) => {
      if (resource === 'users') {
        const createUserSchema = z.object({
          name: z.string().trim().min(2).max(80),
          email: emailSchema,
          password: z.string().min(12).max(128),
          status: z.enum(['active', 'disabled']).optional(),
        }).strict();

        const parsed = createUserSchema.safeParse(req.body);

        if (!parsed.success) {
          return sendValidationError(
            res,
            parsed.error,
            'Enter a name, valid email and password of at least 12 characters.'
          );
        }

        const existing = await User.exists({
          email: parsed.data.email,
        });

        if (existing) {
          return res.status(409).json({
            success: false,
            message: 'An account with this email already exists.',
          });
        }

        const user = await User.create({
          name: parsed.data.name,
          email: parsed.data.email,
          passwordHash: await bcrypt.hash(
            parsed.data.password,
            12
          ),
          role: 'student',
          status: parsed.data.status || 'active',
        });

        return res.status(201).json({
          success: true,
          item: safeUser(user),
        });
      }

      const parsed = schema.safeParse(req.body);

      if (!parsed.success) {
        return sendValidationError(
          res,
          parsed.error,
          'Invalid content data.'
        );
      }

      if (
        ['modules', 'lessons', 'quizzes'].includes(resource)
      ) {
        const courseExists = await Course.exists({
          _id: parsed.data.course,
        });

        if (!courseExists) {
          return res.status(400).json({
            success: false,
            message: 'Choose an existing course.',
          });
        }
      }

      if (resource === 'lessons' && parsed.data.module) {
        const moduleExists = await Module.exists({
          _id: parsed.data.module,
          course: parsed.data.course,
        });

        if (!moduleExists) {
          return res.status(400).json({
            success: false,
            message: 'Choose a module belonging to the selected course.',
          });
        }
      }

      const item = await Model.create({
        ...parsed.data,
        createdBy: req.user._id,
      });

      return res.status(201).json({
        success: true,
        item:
          resource === 'users'
            ? safeUser(item)
            : item,
      });
    })
  );

  // UPDATE
  router.patch(
    `/admin/${resource}/:id`,
    asyncRoute(async (req, res) => {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid resource identifier.',
        });
      }

      if (
        resource === 'users' &&
        String(req.params.id) === String(req.user._id) &&
        req.body.status === 'disabled'
      ) {
        return res.status(400).json({
          success: false,
          message: 'You cannot disable your own admin account.',
        });
      }

      if (
        resource === 'users' &&
        req.body.status === 'disabled'
      ) {
        const activeAdmins = await User.countDocuments({
          role: 'admin',
          status: 'active',
        });

        const target = await User.findById(req.params.id);

        if (
          target?.role === 'admin' &&
          target.status === 'active' &&
          activeAdmins <= 1
        ) {
          return res.status(400).json({
            success: false,
            message: 'Cannot disable the last active administrator.',
          });
        }
      }

      const parsed = schema.partial().safeParse(req.body);

      if (!parsed.success) {
        return sendValidationError(
          res,
          parsed.error,
          'Invalid update data.'
        );
      }

      if (!Object.keys(parsed.data).length) {
        return res.status(400).json({
          success: false,
          message: 'Provide at least one valid field to update.',
        });
      }

      if (
        ['modules', 'lessons', 'quizzes'].includes(resource) &&
        parsed.data.course
      ) {
        const courseExists = await Course.exists({
          _id: parsed.data.course,
        });

        if (!courseExists) {
          return res.status(400).json({
            success: false,
            message: 'Choose an existing course.',
          });
        }
      }

      if (
        resource === 'lessons' &&
        parsed.data.module &&
        parsed.data.course
      ) {
        const moduleExists = await Module.exists({
          _id: parsed.data.module,
          course: parsed.data.course,
        });

        if (!moduleExists) {
          return res.status(400).json({
            success: false,
            message: 'Choose a module belonging to the selected course.',
          });
        }
      }

      const update = {
        ...parsed.data,
      };

      if (
        resource === 'courses' &&
        update.published === true
      ) {
        update.publishedAt = new Date();
      }

      const item = await Model.findByIdAndUpdate(
        req.params.id,
        {
          $set: update,
        },
        {
          new: true,
          runValidators: true,
        }
      ).select(
        resource === 'users'
          ? '-passwordHash -resetTokenHash -resetTokenExpires'
          : ''
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found.',
        });
      }

      return res.json({
        success: true,
        item:
          resource === 'users'
            ? safeUser(item)
            : item,
      });
    })
  );

  // DELETE
  router.delete(
    `/admin/${resource}/:id`,
    asyncRoute(async (req, res) => {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid resource identifier.',
        });
      }

      if (
        resource === 'users' &&
        String(req.params.id) === String(req.user._id)
      ) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own account.',
        });
      }

      if (resource === 'users') {
        const target = await User.findById(req.params.id);

        if (!target) {
          return res.status(404).json({
            success: false,
            message: 'User not found.',
          });
        }

        if (
          target.role === 'admin' &&
          target.status === 'active'
        ) {
          const activeAdmins = await User.countDocuments({
            role: 'admin',
            status: 'active',
          });

          if (activeAdmins <= 1) {
            return res.status(400).json({
              success: false,
              message: 'Cannot delete the last active administrator.',
            });
          }
        }
      }

      const item = await Model.findByIdAndDelete(
        req.params.id
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found.',
        });
      }

      // COURSE CASCADE CLEANUP
      if (resource === 'courses') {
        const [lessonIds, quizIds] = await Promise.all([
          Lesson.find({
            course: item._id,
          }).distinct('_id'),

          Quiz.find({
            course: item._id,
          }).distinct('_id'),
        ]);

        await Promise.all([
          Module.deleteMany({ course: item._id }),
          Lesson.deleteMany({ course: item._id }),
          Quiz.deleteMany({ course: item._id }),
          Progress.deleteMany({ course: item._id }),
          Enrollment.deleteMany({ course: item._id }),
          Note.deleteMany({ lesson: { $in: lessonIds } }),
          Bookmark.deleteMany({ lesson: { $in: lessonIds } }),
          QuizAttempt.deleteMany({ quiz: { $in: quizIds } }),
        ]);
      }

      // MODULE CLEANUP
      if (resource === 'modules') {
        await Lesson.updateMany(
          { module: item._id },
          { $unset: { module: 1 } }
        );
      }

      // LESSON CLEANUP
      if (resource === 'lessons') {
        await Promise.all([
          Bookmark.deleteMany({
            lesson: item._id,
          }),

          Note.deleteMany({
            lesson: item._id,
          }),

          Progress.updateMany(
            { completedLessons: item._id },
            {
              $pull: {
                completedLessons: item._id,
              },
            }
          ),

          Progress.updateMany(
            { lastLesson: item._id },
            {
              $unset: {
                lastLesson: 1,
              },
            }
          ),
        ]);

        const total = await Lesson.countDocuments({
          course: item.course,
          published: true,
        });

        const progressRows = await Progress.find({
          course: item.course,
        });

        await Promise.all(
          progressRows.map((progress) => {
            progress.completionPercentage = total
              ? Math.round(
                  (progress.completedLessons.length / total) * 100
                )
              : 0;

            return progress.save();
          })
        );
      }

      // QUIZ CLEANUP
      if (resource === 'quizzes') {
        await QuizAttempt.deleteMany({
          quiz: item._id,
        });
      }

      // USER CLEANUP
      if (resource === 'users') {
        await Promise.all([
          Progress.deleteMany({ user: item._id }),
          Enrollment.deleteMany({ user: item._id }),
          Note.deleteMany({ user: item._id }),
          Bookmark.deleteMany({ user: item._id }),
          QuizAttempt.deleteMany({ user: item._id }),
        ]);
      }

      return res.json({
        success: true,
        message: 'Item deleted successfully.',
      });
    })
  );
}

/* -------------------------------------------------------
   CAREER PROFILE AND ROADMAPS
------------------------------------------------------- */

const careerProfileSchema = z.object({
  targetRole: z.string().trim().max(120).optional().default(''),
  experienceLevel: z.enum(['exploring', 'beginner', 'intermediate', 'advanced']).optional().default('exploring'),
  skills: z.array(z.string().trim().min(1).max(80)).max(40).optional().default([]),
  interests: z.array(z.string().trim().min(1).max(80)).max(40).optional().default([]),
  weeklyHours: z.number().min(0).max(80).optional().default(5),
}).strict();

const roadmapCreateSchema = z.object({
  title: z.string().trim().min(2).max(140),
  targetRole: z.string().trim().max(120).optional().default(''),
  milestones: z.array(z.object({
    title: z.string().trim().min(1).max(180),
    order: z.number().int().min(0).optional(),
    completed: z.boolean().optional().default(false),
  }).strict()).max(50).optional().default([]),
}).strict();

const roadmapUpdateSchema = z.object({
  milestones: z.array(z.object({
    _id: z.string().optional(),
    title: z.string().trim().min(1).max(180),
    order: z.number().int().min(0).optional(),
    completed: z.boolean(),
  }).strict()).max(50),
}).strict();

router.get('/career/profile', requireAuth, asyncRoute(async (req, res) => {
  const profile = await CareerProfile.findOne({ user: req.user._id }).lean();
  return res.json({
    success: true,
    profile: profile || {
      targetRole: '', experienceLevel: 'exploring', skills: [], interests: [], weeklyHours: 5,
    },
  });
}));

router.put('/career/profile', requireAuth, asyncRoute(async (req, res) => {
  const parsed = careerProfileSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error, 'Please check your career profile.');

  const profile = await CareerProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: parsed.data, $setOnInsert: { user: req.user._id } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();

  return res.json({ success: true, profile });
}));

router.get('/career/roadmaps', requireAuth, asyncRoute(async (req, res) => {
  const roadmaps = await CareerRoadmap.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  return res.json({ success: true, roadmaps });
}));

router.post('/career/roadmaps', requireAuth, asyncRoute(async (req, res) => {
  const parsed = roadmapCreateSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error, 'Please check the roadmap details.');

  const roadmap = await CareerRoadmap.create({
    user: req.user._id,
    title: parsed.data.title,
    targetRole: parsed.data.targetRole,
    milestones: parsed.data.milestones.map((milestone, index) => ({
      title: milestone.title,
      order: milestone.order ?? index,
      completed: milestone.completed,
    })),
  });

  return res.status(201).json({ success: true, roadmap });
}));

router.patch('/career/roadmaps/:id', requireAuth, asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid roadmap identifier.' });
  }

  const parsed = roadmapUpdateSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error, 'Please check the roadmap milestones.');

  const roadmap = await CareerRoadmap.findOne({ _id: req.params.id, user: req.user._id });
  if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found.' });

  roadmap.milestones = parsed.data.milestones.map((milestone, index) => ({
    ...(milestone._id && mongoose.isValidObjectId(milestone._id) ? { _id: milestone._id } : {}),
    title: milestone.title,
    order: milestone.order ?? index,
    completed: milestone.completed,
  }));
  await roadmap.save();

  return res.json({ success: true, roadmap });
}));

router.delete('/career/roadmaps/:id', requireAuth, asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid roadmap identifier.' });
  }

  const deleted = await CareerRoadmap.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!deleted) return res.status(404).json({ success: false, message: 'Roadmap not found.' });
  return res.json({ success: true, message: 'Roadmap deleted successfully.' });
}));

/* -------------------------------------------------------
   NOT FOUND
------------------------------------------------------- */

// This router-level fallback catches unknown API routes
// only if the parent app mounts this router directly.
router.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: 'API route not found.',
    path: req.originalUrl,
  });
});

module.exports = router;
