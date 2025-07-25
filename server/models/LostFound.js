const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema({
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
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: ['electronics', 'books', 'id-card', 'keys', 'clothing', 'accessories', 'documents', 'bags', 'sports-equipment', 'other'],
    default: 'other'
  },
  type: {
    type: String,
    required: true,
    enum: ['lost', 'found'],
  },
  location: {
    lastSeen: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    building: String,
    floor: String,
    room: String
  },
  contactInfo: {
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    preferredContact: {
      type: String,
      enum: ['phone', 'email', 'both'],
      default: 'email'
    }
  },
  images: [{
    url: String,
    filename: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'matched', 'resolved', 'expired'],
    default: 'active'
  },
  dateReported: {
    type: Date,
    default: Date.now
  },
  dateLostFound: {
    type: Date,
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: 300
  },
  qrCode: {
    code: String,
    generatedAt: Date,
    isUsed: {
      type: Boolean,
      default: false
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isUrgent: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
lostFoundSchema.index({ type: 1, status: 1 });
lostFoundSchema.index({ category: 1 });
lostFoundSchema.index({ dateLostFound: -1 });
lostFoundSchema.index({ 'location.lastSeen': 'text', title: 'text', description: 'text', tags: 'text' });
lostFoundSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for days since reported
lostFoundSchema.virtual('daysSinceReported').get(function() {
  return Math.floor((Date.now() - this.dateReported) / (1000 * 60 * 60 * 24));
});

// Virtual for formatted location
lostFoundSchema.virtual('formattedLocation').get(function() {
  let location = this.location.lastSeen;
  if (this.location.building) {
    location += `, ${this.location.building}`;
  }
  if (this.location.floor) {
    location += `, Floor ${this.location.floor}`;
  }
  if (this.location.room) {
    location += `, Room ${this.location.room}`;
  }
  return location;
});

// Method to check if item is expired
lostFoundSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

// Method to generate QR code for pickup confirmation
lostFoundSchema.methods.generateQRCode = function() {
  const qrData = {
    itemId: this._id,
    type: this.type,
    generatedAt: new Date(),
    hash: require('crypto').createHash('md5').update(`${this._id}${Date.now()}`).digest('hex')
  };
  
  this.qrCode = {
    code: JSON.stringify(qrData),
    generatedAt: new Date(),
    isUsed: false
  };
  
  return this.qrCode.code;
};

// Static method to find matching items
lostFoundSchema.statics.findMatches = function(item) {
  const oppositeType = item.type === 'lost' ? 'found' : 'lost';
  
  return this.find({
    type: oppositeType,
    category: item.category,
    status: 'active',
    $text: { $search: item.title + ' ' + item.description }
  }).sort({ score: { $meta: 'textScore' } });
};

// Pre-save middleware to auto-expire old items
lostFoundSchema.pre('save', function(next) {
  if (this.isExpired() && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

// Pre-find middleware to exclude expired items by default
lostFoundSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeExpired) {
    this.find({ status: { $ne: 'expired' } });
  }
  next();
});

const LostFound = mongoose.model('LostFound', lostFoundSchema);

module.exports = LostFound;
