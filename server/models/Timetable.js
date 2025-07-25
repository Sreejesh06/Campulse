const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
  },
  endTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
  },
  subject: {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 10
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    credits: {
      type: Number,
      min: 1,
      max: 6,
      default: 3
    }
  },
  instructor: {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    }
  },
  location: {
    building: {
      type: String,
      required: true,
      trim: true
    },
    room: {
      type: String,
      required: true,
      trim: true
    },
    floor: String,
    block: String
  },
  type: {
    type: String,
    enum: ['lecture', 'lab', 'tutorial', 'seminar', 'practical'],
    default: 'lecture'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  meetingLink: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 200
  }
});

const timetableSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  semester: {
    type: String,
    required: true,
    trim: true
  },
  academicYear: {
    type: String,
    required: true,
    match: [/^\d{4}-\d{4}$/, 'Please enter academic year in YYYY-YYYY format']
  },
  schedule: {
    monday: [timeSlotSchema],
    tuesday: [timeSlotSchema],
    wednesday: [timeSlotSchema],
    thursday: [timeSlotSchema],
    friday: [timeSlotSchema],
    saturday: [timeSlotSchema],
    sunday: [timeSlotSchema]
  },
  totalCredits: {
    type: Number,
    default: 0
  },
  preferences: {
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '12h'
    },
    showWeekends: {
      type: Boolean,
      default: false
    },
    colorScheme: {
      type: String,
      enum: ['default', 'colorful', 'minimal', 'dark'],
      default: 'default'
    },
    notifications: {
      enabled: {
        type: Boolean,
        default: true
      },
      minutesBefore: {
        type: Number,
        default: 15,
        min: 5,
        max: 60
      }
    }
  },
  analytics: {
    totalClasses: {
      type: Number,
      default: 0
    },
    attendedClasses: {
      type: Number,
      default: 0
    },
    missedClasses: {
      type: Number,
      default: 0
    },
    attendancePercentage: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
timetableSchema.index({ student: 1, academicYear: 1, semester: 1 }, { unique: true });
timetableSchema.index({ student: 1, isActive: 1 });

// Virtual for getting current day's schedule
timetableSchema.virtual('todaySchedule').get(function() {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];
  return this.schedule[today] || [];
});

// Virtual for getting next class
timetableSchema.virtual('nextClass').get(function() {
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[now.getDay()];
  
  const todayClasses = this.schedule[today] || [];
  const upcomingClass = todayClasses.find(cls => cls.startTime > currentTime);
  
  if (upcomingClass) {
    return upcomingClass;
  }
  
  // Look for next day's first class
  for (let i = 1; i < 7; i++) {
    const nextDayIndex = (now.getDay() + i) % 7;
    const nextDay = days[nextDayIndex];
    const nextDayClasses = this.schedule[nextDay] || [];
    if (nextDayClasses.length > 0) {
      return nextDayClasses[0];
    }
  }
  
  return null;
});

// Method to calculate total credits
timetableSchema.methods.calculateTotalCredits = function() {
  let total = 0;
  const subjects = new Set();
  
  Object.values(this.schedule).forEach(daySchedule => {
    daySchedule.forEach(timeSlot => {
      const subjectKey = timeSlot.subject.code;
      if (!subjects.has(subjectKey)) {
        subjects.add(subjectKey);
        total += timeSlot.subject.credits;
      }
    });
  });
  
  this.totalCredits = total;
  return total;
};

// Method to get weekly schedule summary
timetableSchema.methods.getWeeklySummary = function() {
  const summary = {
    totalClasses: 0,
    totalHours: 0,
    subjectCount: new Set(),
    dailyBreakdown: {}
  };
  
  Object.entries(this.schedule).forEach(([day, classes]) => {
    summary.dailyBreakdown[day] = {
      classCount: classes.length,
      duration: 0
    };
    
    classes.forEach(cls => {
      summary.totalClasses++;
      summary.subjectCount.add(cls.subject.code);
      
      // Calculate duration
      const start = cls.startTime.split(':').map(Number);
      const end = cls.endTime.split(':').map(Number);
      const duration = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
      summary.totalHours += duration / 60;
      summary.dailyBreakdown[day].duration += duration / 60;
    });
  });
  
  summary.subjectCount = summary.subjectCount.size;
  return summary;
};

// Method to check for time conflicts
timetableSchema.methods.hasTimeConflict = function(day, newTimeSlot) {
  const daySchedule = this.schedule[day] || [];
  
  return daySchedule.some(existingSlot => {
    const newStart = newTimeSlot.startTime;
    const newEnd = newTimeSlot.endTime;
    const existingStart = existingSlot.startTime;
    const existingEnd = existingSlot.endTime;
    
    return (newStart < existingEnd && newEnd > existingStart);
  });
};

// Method to add attendance record
timetableSchema.methods.markAttendance = function(subjectCode, date, attended = true) {
  if (attended) {
    this.analytics.attendedClasses++;
  } else {
    this.analytics.missedClasses++;
  }
  
  this.analytics.totalClasses = this.analytics.attendedClasses + this.analytics.missedClasses;
  this.analytics.attendancePercentage = this.analytics.totalClasses > 0 
    ? Math.round((this.analytics.attendedClasses / this.analytics.totalClasses) * 100) 
    : 100;
    
  return this.save();
};

// Pre-save middleware to calculate total credits
timetableSchema.pre('save', function(next) {
  this.calculateTotalCredits();
  next();
});

// Static method to get active timetable for student
timetableSchema.statics.getActiveTimetable = function(studentId) {
  return this.findOne({ student: studentId, isActive: true })
    .populate('student', 'firstName lastName studentId department');
};

const Timetable = mongoose.model('Timetable', timetableSchema);

module.exports = Timetable;
