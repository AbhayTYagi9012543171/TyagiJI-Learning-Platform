const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 180 },
    order: { type: Number, min: 0, default: 0 },
    completed: { type: Boolean, default: false },
  },
  { _id: true }
);

const careerRoadmapSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 140 },
    targetRole: { type: String, trim: true, maxlength: 120, default: '' },
    milestones: { type: [milestoneSchema], default: [] },
  },
  { timestamps: true }
);

careerRoadmapSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.models.CareerRoadmap || mongoose.model('CareerRoadmap', careerRoadmapSchema);
