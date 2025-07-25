const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: ['water', 'electricity', 'cleaning', 'maintenance', 'wifi', 'security', 'food', 'noise', 'heating-cooling', 'plumbing', 'furniture', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'in-progress', 'resolved', 'closed', 'rejected'],
    default: 'pending'
  },
  location: {
    hostelBlock: {
      type: String,
      required: true,
      trim: true
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true
    },
    floor: {
      type: String,
      trim: true
    },
    commonArea: {
      type: String,
      trim: true
    },
    specificLocation: {
      type: String,
      trim: true,
      maxlength: 200
    }
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  contactInfo: {
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
    },
    alternatePhone: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
    },
    preferredContactTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'anytime'],
      default: 'anytime'
    }
  },
  images: [{
    url: String,
    filename: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'acknowledged', 'in-progress', 'resolved', 'closed', 'rejected']
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 300
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 500
    }
  }],
  resolution: {
    description: {
      type: String,
      trim: true,
      maxlength: 500
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    resolutionTime: Number, // in hours
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: 300
    }
  },
  expectedResolutionDate: Date,
  actualResolutionDate: Date,
  isUrgent: {
    type: Boolean,
    default: false
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  relatedComplaints: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint'
  }],
  notifications: {
    emailSent: {
      type: Boolean,
      default: false
    },
    smsSent: {
      type: Boolean,
      default: false
    },
    lastNotificationSent: Date
  },
  metadata: {
    deviceInfo: String,
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
complaintSchema.index({ status: 1, priority: 1 });
complaintSchema.index({ category: 1, 'location.hostelBlock': 1 });
complaintSchema.index({ reportedBy: 1, createdAt: -1 });
complaintSchema.index({ assignedTo: 1, status: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for days since reported
complaintSchema.virtual('daysSinceReported').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for formatted location
complaintSchema.virtual('formattedLocation').get(function() {
  let location = `${this.location.hostelBlock}, Room ${this.location.roomNumber}`;
  if (this.location.floor) {
    location += `, Floor ${this.location.floor}`;
  }
  if (this.location.commonArea) {
    location += `, ${this.location.commonArea}`;
  }
  return location;
});

// Virtual for current status info
complaintSchema.virtual('currentStatusInfo').get(function() {
  const latestStatus = this.statusHistory[this.statusHistory.length - 1];
  return latestStatus || {
    status: this.status,
    updatedAt: this.createdAt,
    comment: 'Initial complaint submission'
  };
});

// Virtual for resolution time in hours
complaintSchema.virtual('resolutionTimeHours').get(function() {
  if (this.resolution.resolvedAt && this.createdAt) {
    return Math.round((this.resolution.resolvedAt - this.createdAt) / (1000 * 60 * 60));
  }
  return null;
});

// Method to update status with history tracking
complaintSchema.methods.updateStatus = function(newStatus, updatedBy, comment = '', adminNotes = '') {
  // Add to status history
  this.statusHistory.push({
    status: newStatus,
    updatedBy: updatedBy,
    updatedAt: new Date(),
    comment: comment,
    adminNotes: adminNotes
  });
  
  // Update current status
  this.status = newStatus;
  
  // Set resolution date if resolved
  if (newStatus === 'resolved' && !this.resolution.resolvedAt) {
    this.resolution.resolvedAt = new Date();
    this.resolution.resolvedBy = updatedBy;
    this.resolution.resolutionTime = this.resolutionTimeHours;
    this.actualResolutionDate = new Date();
  }
  
  return this.save();
};

// Method to add resolution details
complaintSchema.methods.addResolution = function(description, resolvedBy, satisfactionRating = null, feedback = '') {
  this.resolution.description = description;
  this.resolution.resolvedBy = resolvedBy;
  this.resolution.resolvedAt = new Date();
  this.resolution.resolutionTime = this.resolutionTimeHours;
  this.resolution.satisfactionRating = satisfactionRating;
  this.resolution.feedback = feedback;
  this.actualResolutionDate = new Date();
  
  return this.updateStatus('resolved', resolvedBy, 'Complaint resolved with details');
};

// Method to calculate SLA compliance
complaintSchema.methods.isSLACompliant = function() {
  const slaHours = {
    'urgent': 4,
    'high': 24,
    'medium': 72,
    'low': 168
  };
  
  const maxHours = slaHours[this.priority] || 72;
  const hoursSinceReported = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  
  if (this.status === 'resolved' || this.status === 'closed') {
    return this.resolution.resolutionTime <= maxHours;
  }
  
  return hoursSinceReported <= maxHours;
};

// Method to check if complaint needs escalation
complaintSchema.methods.needsEscalation = function() {
  const escalationHours = {
    'urgent': 2,
    'high': 12,
    'medium': 48,
    'low': 120
  };
  
  const maxHours = escalationHours[this.priority] || 48;
  const hoursSinceReported = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  
  return hoursSinceReported > maxHours && !['resolved', 'closed'].includes(this.status);
};

// Static method to get complaints summary for dashboard
complaintSchema.statics.getComplaintsSummary = function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
        averageResolutionTime: { $avg: '$resolution.resolutionTime' }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

// Static method to get complaints by category
complaintSchema.statics.getCategoryStats = function(timeframe = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframe);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        avgResolutionTime: { $avg: '$resolution.resolutionTime' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Pre-save middleware to set expected resolution date
complaintSchema.pre('save', function(next) {
  if (this.isNew && !this.expectedResolutionDate) {
    const slaHours = {
      'urgent': 4,
      'high': 24,
      'medium': 72,
      'low': 168
    };
    
    const hours = slaHours[this.priority] || 72;
    this.expectedResolutionDate = new Date(Date.now() + hours * 60 * 60 * 1000);
  }
  next();
});

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
