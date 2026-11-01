const express = require('express');
const mongoose = require('mongoose');
const { z } = require('zod');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
  Project, Submission, Achievement, UserAchievement,
  Certificate, AuditLog, Notification,
} = require('../models');

const router = express.Router();
const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const objectId = (value) => mongoose.isValidObjectId(value);
const pageQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
const submissionInput = z.object({
  project: z.string().refine(objectId, 'Invalid project identifier.'),
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().max(5000).optional().default(''),
  repositoryUrl: z.string().url().max(500).optional().or(z.literal('')),
  demoUrl: z.string().url().max(500).optional().or(z.literal('')),
});
const reviewInput = z.object({
  status: z.enum(['in_review', 'changes_requested', 'approved', 'rejected']),
  feedback: z.string().trim().max(5000).optional().default(''),
});

// Student submissions are private to their owner; administrators can review all.
router.get('/submissions', requireAuth, asyncRoute(async (req, res) => {
  const { page, limit } = pageQuery.parse(req.query);
  const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
  const [items, total] = await Promise.all([
    Submission.find(filter).populate('project', 'title slug').populate('user', 'name email')
      .sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Submission.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}));

router.post('/submissions', requireAuth, asyncRoute(async (req, res) => {
  const input = submissionInput.parse(req.body);
  const project = await Project.findOne({ _id: input.project, published: true }).select('_id');
  if (!project) return res.status(404).json({ success: false, message: 'Published project not found.' });
  const item = await Submission.create({ ...input, user: req.user._id, status: 'submitted', submittedAt: new Date() });
  res.status(201).json({ success: true, message: 'Project submitted for review.', data: item });
}));

router.patch('/submissions/:id', requireAuth, asyncRoute(async (req, res) => {
  if (!objectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid submission identifier.' });
  const input = submissionInput.omit({ project: true }).partial().strict().parse(req.body);
  const item = await Submission.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) return res.status(404).json({ success: false, message: 'Submission not found.' });
  if (!['draft', 'changes_requested'].includes(item.status)) return res.status(409).json({ success: false, message: 'Only draft or returned submissions can be edited.' });
  Object.assign(item, input, { status: 'submitted', submittedAt: new Date() });
  await item.save();
  res.json({ success: true, message: 'Submission updated and sent for review.', data: item });
}));

router.patch('/submissions/:id/review', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  if (!objectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid submission identifier.' });
  const input = reviewInput.parse(req.body);
  const item = await Submission.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Submission not found.' });
  item.status = input.status;
  item.feedback = input.feedback;
  item.reviewedBy = req.user._id;
  item.reviewedAt = new Date();
  await item.save();
  await AuditLog.create({ actor: req.user._id, action: `submission.${input.status}`, resourceType: 'Submission', resourceId: String(item._id), ip: req.ip });
  await Notification.create({ user: item.user, title: 'Project submission reviewed', message: input.feedback || `Your submission status is now ${input.status.replace('_', ' ')}.`, type: 'review', href: '/my-learning' });
  res.json({ success: true, message: 'Review saved.', data: item });
}));

router.get('/achievements', requireAuth, asyncRoute(async (_req, res) => {
  const items = await Achievement.find({ active: true }).sort({ points: 1, title: 1 }).lean();
  res.json({ success: true, data: items });
}));

router.get('/my-achievements', requireAuth, asyncRoute(async (req, res) => {
  const items = await UserAchievement.find({ user: req.user._id }).populate('achievement').sort({ earnedAt: -1 }).lean();
  res.json({ success: true, data: items });
}));

router.get('/notifications', requireAuth, asyncRoute(async (req, res) => {
  const { page, limit } = pageQuery.parse(req.query);
  const [items, unread] = await Promise.all([
    Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Notification.countDocuments({ user: req.user._id, readAt: null }),
  ]);
  res.json({ success: true, data: items, unread });
}));

router.patch('/notifications/:id/read', requireAuth, asyncRoute(async (req, res) => {
  if (!objectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid notification identifier.' });
  const item = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { $set: { readAt: new Date() } }, { new: true });
  if (!item) return res.status(404).json({ success: false, message: 'Notification not found.' });
  res.json({ success: true, data: item });
}));

router.get('/certificates/verify/:certificateNumber', asyncRoute(async (req, res) => {
  const item = await Certificate.findOne({ certificateNumber: req.params.certificateNumber, revokedAt: null })
    .populate('user', 'name').populate('course', 'title').lean();
  if (!item) return res.status(404).json({ success: false, valid: false, message: 'Certificate not found or revoked.' });
  res.json({ success: true, valid: true, data: { certificateNumber: item.certificateNumber, learner: item.user?.name, course: item.course?.title, issuedAt: item.issuedAt } });
}));

module.exports = router;
