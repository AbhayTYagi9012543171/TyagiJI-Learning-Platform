const mongoose = require('mongoose');

const careerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    targetRole: { type: String, trim: true, maxlength: 120, default: '' },
    experienceLevel: {
      type: String,
      enum: ['exploring', 'beginner', 'intermediate', 'advanced'],
      default: 'exploring',
    },
    skills: { type: [{ type: String, trim: true, maxlength: 80 }], default: [] },
    interests: { type: [{ type: String, trim: true, maxlength: 80 }], default: [] },
    weeklyHours: { type: Number, min: 0, max: 80, default: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.CareerProfile || mongoose.model('CareerProfile', careerProfileSchema);
