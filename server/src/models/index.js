const mongoose=require('mongoose'),{Schema}=mongoose;const userSchema=new Schema({name:{type:String,required:true,trim:true,minlength:2,maxlength:80},email:{type:String,required:true,unique:true,lowercase:true,trim:true},passwordHash:{type:String,required:true,select:false},role:{type:String,enum:['student','admin'],default:'student'},status:{type:String,enum:['active','disabled'],default:'active'},preferences:{theme:{type:String,enum:['dark','light'],default:'dark'}},resetTokenHash:{type:String,select:false},resetTokenExpires:Date,authVersion:{type:Number,default:0,select:false}},{timestamps:true});const courseSchema=new Schema({title:{type:String,required:true},slug:{type:String,required:true,unique:true},description:String,tagline:{type:String,maxlength:180},thumbnailUrl:String,estimatedHours:{type:Number,min:0,default:0},price:{type:Number,min:0,default:0},isPremium:{type:Boolean,default:false},skills:[String],technology:{type:String,enum:['HTML','CSS','JavaScript','React','Node.js','MongoDB','Python','TypeScript','SQL','Git','Data Structures & Algorithms','MERN Stack'],required:true},difficulty:{type:String,enum:['Beginner','Intermediate','Advanced'],default:'Beginner'},objectives:[String],prerequisites:[String],learningOutcomes:[String],targetAudience:[String],publishedAt:Date,published:{type:Boolean,default:false},displayOrder:{type:Number,default:0},createdBy:{type:Schema.Types.ObjectId,ref:'User'}},{timestamps:true});const moduleSchema=new Schema({course:{type:Schema.Types.ObjectId,ref:'Course',required:true},title:{type:String,required:true},slug:{type:String,required:true},description:String,objectives:[String],estimatedMinutes:{type:Number,min:0,default:0},order:{type:Number,default:0}},{timestamps:true});moduleSchema.index({course:1,slug:1},{unique:true});const lessonSchema=new Schema({course:{type:Schema.Types.ObjectId,ref:'Course',required:true},module:{type:Schema.Types.ObjectId,ref:'Module'},title:{type:String,required:true},slug:{type:String,required:true},summary:String,contentBlocks:[{type:{type:String,enum:['text','code','callout','example','exercise','output','image'],default:'text'},heading:String,text:String,code:String,language:String,expectedOutput:String,caption:String}],objectives:[String],prerequisites:[String],keyTakeaways:[String],resources:[{title:String,url:String}],durationMinutes:{type:Number,default:10},difficulty:{type:String,default:'Beginner'},order:{type:Number,default:0},published:{type:Boolean,default:false}},{timestamps:true});lessonSchema.index({course:1,slug:1},{unique:true});const quizSchema=new Schema({title:{type:String,required:true},slug:{type:String,required:true,unique:true},course:{type:Schema.Types.ObjectId,ref:'Course',required:true},description:String,questions:[{prompt:{type:String,required:true},options:[String],correctIndex:{type:Number,required:true,select:false},explanation:String,difficulty:String,hint:String}],passingScore:{type:Number,default:70},published:{type:Boolean,default:false},randomize:{type:Boolean,default:false}},{timestamps:true});const attemptSchema=new Schema({user:{type:Schema.Types.ObjectId,ref:'User',required:true},quiz:{type:Schema.Types.ObjectId,ref:'Quiz',required:true},answers:[{questionId:Schema.Types.ObjectId,optionIndex:Number}],score:Number,total:Number,percentage:Number,passed:Boolean,details:[{questionId:Schema.Types.ObjectId,correct:Boolean,explanation:String,selectedIndex:Number,correctIndex:Number}],submittedAt:Date},{timestamps:true});const projectSchema=new Schema({title:{type:String,required:true},slug:{type:String,required:true,unique:true},description:String,difficulty:String,technology:[String],requirements:[String],learningObjectives:[String],acceptanceCriteria:[String],estimatedHours:{type:Number,min:0,default:2},steps:[Schema.Types.Mixed],starterFiles:[{name:String,content:String}],extensionTasks:[String],published:{type:Boolean,default:false}},{timestamps:true});const enrollmentSchema=new Schema({user:{type:Schema.Types.ObjectId,ref:'User',required:true},course:{type:Schema.Types.ObjectId,ref:'Course',required:true},status:{type:String,enum:['active','completed','cancelled'],default:'active'},enrolledAt:{type:Date,default:Date.now},completedAt:Date},{timestamps:true});enrollmentSchema.index({user:1,course:1},{unique:true});const progressSchema=new Schema({user:{type:Schema.Types.ObjectId,ref:'User',required:true},course:{type:Schema.Types.ObjectId,ref:'Course',required:true},completedLessons:[{type:Schema.Types.ObjectId,ref:'Lesson'}],lastLesson:{type:Schema.Types.ObjectId,ref:'Lesson'},completionPercentage:{type:Number,default:0},lastActivity:Date},{timestamps:true});progressSchema.index({user:1,course:1},{unique:true});const bookmarkSchema=new Schema({user:{type:Schema.Types.ObjectId,ref:'User',required:true},lesson:{type:Schema.Types.ObjectId,ref:'Lesson',required:true}},{timestamps:true});bookmarkSchema.index({user:1,lesson:1},{unique:true});const resourceSchema=new Schema({title:{type:String,required:true},description:String,url:{type:String,required:true},category:String,technology:[String],difficulty:String,verified:Boolean,displayOrder:Number},{timestamps:true});const noteSchema=new Schema({user:{type:Schema.Types.ObjectId,ref:'User',required:true},lesson:{type:Schema.Types.ObjectId,ref:'Lesson',required:true},content:{type:String,required:true,maxlength:10000}},{timestamps:true});noteSchema.index({user:1,lesson:1},{unique:true});
// V11 additions: persistent career outcomes and operational records.
const submissionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 140 },
  description: { type: String, trim: true, maxlength: 5000, default: '' },
  repositoryUrl: { type: String, trim: true, maxlength: 500 },
  demoUrl: { type: String, trim: true, maxlength: 500 },
  status: { type: String, enum: ['draft', 'submitted', 'in_review', 'changes_requested', 'approved', 'rejected'], default: 'draft', index: true },
  feedback: { type: String, maxlength: 5000, default: '' },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  submittedAt: Date,
}, { timestamps: true });
submissionSchema.index({ user: 1, project: 1, createdAt: -1 });

const achievementSchema = new Schema({
  key: { type: String, required: true, unique: true, trim: true, lowercase: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 500 },
  icon: { type: String, default: 'award' },
  points: { type: Number, min: 0, default: 0 },
  rule: { type: String, enum: ['courses_completed', 'lessons_completed', 'quizzes_passed', 'projects_approved', 'streak_days', 'manual'], required: true },
  threshold: { type: Number, min: 1, default: 1 },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true });

const userAchievementSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  achievement: { type: Schema.Types.ObjectId, ref: 'Achievement', required: true },
  earnedAt: { type: Date, default: Date.now },
  metadata: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });
userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

const certificateSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  certificateNumber: { type: String, required: true, unique: true, index: true },
  issuedAt: { type: Date, default: Date.now },
  revokedAt: Date,
}, { timestamps: true });
certificateSchema.index({ user: 1, course: 1 }, { unique: true });

const auditLogSchema = new Schema({
  actor: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  action: { type: String, required: true, maxlength: 120 },
  resourceType: { type: String, required: true, maxlength: 80 },
  resourceId: { type: String, maxlength: 100 },
  metadata: { type: Schema.Types.Mixed, default: {} },
  ip: { type: String, maxlength: 80 },
}, { timestamps: true });
auditLogSchema.index({ createdAt: -1 });

const notificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, maxlength: 140 },
  message: { type: String, required: true, maxlength: 1000 },
  type: { type: String, enum: ['system', 'learning', 'achievement', 'review'], default: 'system' },
  href: { type: String, maxlength: 500 },
  readAt: Date,
}, { timestamps: true });
notificationSchema.index({ user: 1, readAt: 1, createdAt: -1 });

const discussionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', index: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  body: { type: String, required: true, trim: true, maxlength: 10000 },
  status: { type: String, enum: ['published', 'hidden'], default: 'published', index: true },
}, { timestamps: true });

const reviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, maxlength: 2000, default: '' },
  published: { type: Boolean, default: true },
}, { timestamps: true });
reviewSchema.index({ user: 1, course: 1 }, { unique: true });



module.exports = {
  Enrollment: mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema),
  Note: mongoose.models.Note || mongoose.model('Note', noteSchema),
  User: mongoose.models.User || mongoose.model('User', userSchema),
  Course: mongoose.models.Course || mongoose.model('Course', courseSchema),
  Module: mongoose.models.Module || mongoose.model('Module', moduleSchema),
  Lesson: mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema),
  Quiz: mongoose.models.Quiz || mongoose.model('Quiz', quizSchema),
  QuizAttempt: mongoose.models.QuizAttempt || mongoose.model('QuizAttempt', attemptSchema),
  Project: mongoose.models.Project || mongoose.model('Project', projectSchema),
  Progress: mongoose.models.Progress || mongoose.model('Progress', progressSchema),
  Bookmark: mongoose.models.Bookmark || mongoose.model('Bookmark', bookmarkSchema),
  Resource: mongoose.models.Resource || mongoose.model('Resource', resourceSchema),
  Submission: mongoose.models.Submission || mongoose.model('Submission', submissionSchema),
  Achievement: mongoose.models.Achievement || mongoose.model('Achievement', achievementSchema),
  UserAchievement: mongoose.models.UserAchievement || mongoose.model('UserAchievement', userAchievementSchema),
  Certificate: mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema),
  AuditLog: mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema),
  Notification: mongoose.models.Notification || mongoose.model('Notification', notificationSchema),
  Discussion: mongoose.models.Discussion || mongoose.model('Discussion', discussionSchema),
  Review: mongoose.models.Review || mongoose.model('Review', reviewSchema),
};
