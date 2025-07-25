const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['event', 'exam', 'holiday', 'academic', 'hostel', 'sports', 'cultural', 'general', 'urgent'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetAudience: {
    departments: [{
      type: String,
      trim: true
    }],
    years: [{
      type: Number,
      min: 1,
      max: 4
    }],
    hostelBlocks: [{
      type: String,
      trim: true
    }],
    isGlobal: {
      type: Boolean,
      default: false
    }
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  eventDetails: {
    startDate: Date,
    endDate: Date,
    location: String,
    registrationRequired: {
      type: Boolean,
      default: false
    },
    registrationDeadline: Date,
    maxParticipants: Number,
    contactPerson: String,
    contactEmail: String,
    contactPhone: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  publishAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null
  },
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isEdited: {
      type: Boolean,
      default: false
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  pinnedUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for view count
announcementSchema.virtual('viewCount').get(function() {
  return this.views.length;
});

// Virtual for like count
announcementSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
announcementSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual to check if announcement is expired
announcementSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Virtual to check if announcement should be published
announcementSchema.virtual('shouldBePublished').get(function() {
  return this.publishAt <= new Date();
});

// Indexes for better performance
announcementSchema.index({ category: 1, createdAt: -1 });
announcementSchema.index({ author: 1, createdAt: -1 });
announcementSchema.index({ publishAt: 1, isActive: 1 });
announcementSchema.index({ expiresAt: 1 });
announcementSchema.index({ isPinned: -1, createdAt: -1 });
announcementSchema.index({ tags: 1 });
announcementSchema.index({ 'targetAudience.departments': 1 });
announcementSchema.index({ 'targetAudience.years': 1 });

// Method to check if user can view this announcement
announcementSchema.methods.canUserView = function(user) {
  if (!this.isActive || this.isExpired || !this.shouldBePublished) {
    return false;
  }
  
  if (this.targetAudience.isGlobal) {
    return true;
  }
  
  const { departments, years, hostelBlocks } = this.targetAudience;
  
  if (departments.length > 0 && !departments.includes(user.department)) {
    return false;
  }
  
  if (years.length > 0 && !years.includes(user.year)) {
    return false;
  }
  
  if (hostelBlocks.length > 0 && !hostelBlocks.includes(user.hostelBlock)) {
    return false;
  }
  
  return true;
};

// Method to add view
announcementSchema.methods.addView = function(userId) {
  const existingView = this.views.find(view => view.user.toString() === userId.toString());
  if (!existingView) {
    this.views.push({ user: userId });
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to toggle like
announcementSchema.methods.toggleLike = function(userId) {
  const existingLike = this.likes.find(like => like.user.toString() === userId.toString());
  
  if (existingLike) {
    this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
  } else {
    this.likes.push({ user: userId });
  }
  
  return this.save();
};

// Method to add comment
announcementSchema.methods.addComment = function(userId, content) {
  this.comments.push({ user: userId, content });
  return this.save();
};

// Pre-save middleware to handle pinned announcements
announcementSchema.pre('save', function(next) {
  if (this.isPinned && !this.pinnedUntil) {
    // Set default pin duration to 7 days
    this.pinnedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  
  if (this.pinnedUntil && this.pinnedUntil <= new Date()) {
    this.isPinned = false;
    this.pinnedUntil = null;
  }
  
  next();
});

module.exports = mongoose.model('Announcement', announcementSchema);
