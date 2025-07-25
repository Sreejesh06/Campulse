const Announcement = require('../models/Announcement');
const User = require('../models/User');
const emailService = require('../utils/emailService');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Public (with optional auth for personalized content)
const getAnnouncements = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Build query filters
  let queryFilters = { isActive: true };

  // Category filter
  if (req.query.category && req.query.category !== 'all') {
    queryFilters.category = req.query.category;
  }

  // Priority filter
  if (req.query.priority) {
    queryFilters.priority = req.query.priority;
  }

  // Date range filter
  if (req.query.startDate || req.query.endDate) {
    queryFilters.createdAt = {};
    if (req.query.startDate) {
      queryFilters.createdAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      queryFilters.createdAt.$lte = new Date(req.query.endDate);
    }
  }

  // Search filter
  if (req.query.search) {
    queryFilters.$text = { $search: req.query.search };
  }

  // User-specific filtering if authenticated
  if (req.user) {
    const userDept = req.user.department;
    const userYear = req.user.year;
    const userHostel = req.user.hostelInfo?.block;

    queryFilters.$or = [
      { 'targetAudience.isGlobal': true },
      { 'targetAudience.departments': { $in: [userDept] } },
      { 'targetAudience.years': { $in: [userYear] } },
      { 'targetAudience.hostelBlocks': { $in: [userHostel] } }
    ];
  }

  // Sort options
  const sortOptions = {};
  switch (req.query.sort) {
    case 'priority':
      sortOptions.priority = -1;
      sortOptions.createdAt = -1;
      break;
    case 'category':
      sortOptions.category = 1;
      sortOptions.createdAt = -1;
      break;
    case 'oldest':
      sortOptions.createdAt = 1;
      break;
    default:
      sortOptions.createdAt = -1;
  }

  try {
    const announcements = await Announcement.find(queryFilters)
      .populate('author', 'firstName lastName role')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Announcement.countDocuments(queryFilters);

    res.status(200).json({
      success: true,
      count: announcements.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: announcements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching announcements',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Public
const getAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id)
    .populate('author', 'firstName lastName role')
    .populate('engagement.likes', 'firstName lastName')
    .populate('engagement.comments.author', 'firstName lastName');

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }

  // Increment view count
  announcement.engagement.views += 1;
  await announcement.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: announcement
  });
});

// @desc    Create new announcement
// @route   POST /api/announcements
// @access  Private (Admin only)
const createAnnouncement = asyncHandler(async (req, res, next) => {
  // Add author to request body
  req.body.author = req.user.id;

  const announcement = await Announcement.create(req.body);

  await announcement.populate('author', 'firstName lastName role');

  // Send notifications if enabled
  if (req.body.sendNotifications && process.env.NODE_ENV !== 'development') {
    try {
      // Get target audience
      const recipients = await getTargetAudience(announcement.targetAudience);
      
      if (recipients.length > 0) {
        await emailService.sendAnnouncementNotification(announcement, recipients);
      }
    } catch (error) {
      console.error('Failed to send announcement notifications:', error);
      // Don't fail the announcement creation if notification fails
    }
  }

  res.status(201).json({
    success: true,
    data: announcement
  });
});

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin only)
const updateAnnouncement = asyncHandler(async (req, res, next) => {
  let announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }

  // Make sure user is announcement author or admin
  if (announcement.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to update this announcement'
    });
  }

  announcement = await Announcement.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('author', 'firstName lastName role');

  res.status(200).json({
    success: true,
    data: announcement
  });
});

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin only)
const deleteAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }

  // Make sure user is announcement author or admin
  if (announcement.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to delete this announcement'
    });
  }

  await announcement.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Announcement deleted successfully'
  });
});

// @desc    Like/Unlike announcement
// @route   PUT /api/announcements/:id/like
// @access  Private
const toggleLike = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }

  const userId = req.user.id;
  const likeIndex = announcement.engagement.likes.indexOf(userId);

  if (likeIndex > -1) {
    // Unlike
    announcement.engagement.likes.splice(likeIndex, 1);
  } else {
    // Like
    announcement.engagement.likes.push(userId);
  }

  await announcement.save();

  res.status(200).json({
    success: true,
    data: {
      likes: announcement.engagement.likes.length,
      isLiked: likeIndex === -1
    }
  });
});

// @desc    Add comment to announcement
// @route   POST /api/announcements/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }

  const comment = {
    author: req.user.id,
    content: req.body.content,
    createdAt: new Date()
  };

  announcement.engagement.comments.push(comment);
  await announcement.save();

  // Populate the new comment
  await announcement.populate('engagement.comments.author', 'firstName lastName');

  const newComment = announcement.engagement.comments[announcement.engagement.comments.length - 1];

  res.status(201).json({
    success: true,
    data: newComment
  });
});

// @desc    Get announcement statistics
// @route   GET /api/announcements/stats
// @access  Private (Admin only)
const getAnnouncementStats = asyncHandler(async (req, res, next) => {
  const stats = await Announcement.getAnnouncementStats();

  res.status(200).json({
    success: true,
    data: stats
  });
});

// Helper function to get target audience
const getTargetAudience = async (targetAudience) => {
  let query = { isActive: true };

  if (targetAudience.isGlobal) {
    // Send to all active users
    return await User.find(query).select('email firstName lastName');
  }

  // Build specific audience query
  const conditions = [];

  if (targetAudience.departments && targetAudience.departments.length > 0) {
    conditions.push({ department: { $in: targetAudience.departments } });
  }

  if (targetAudience.years && targetAudience.years.length > 0) {
    conditions.push({ year: { $in: targetAudience.years } });
  }

  if (targetAudience.hostelBlocks && targetAudience.hostelBlocks.length > 0) {
    conditions.push({ 'hostelInfo.block': { $in: targetAudience.hostelBlocks } });
  }

  if (conditions.length > 0) {
    query.$or = conditions;
  }

  return await User.find(query).select('email firstName lastName');
};

module.exports = {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleLike,
  addComment,
  getAnnouncementStats
};
