const express = require('express');
const {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleLike,
  addComment,
  getAnnouncementStats
} = require('../controllers/announcementController');

const { auth, adminOnly, optionalAuth } = require('../middleware/auth');
const fileUploadService = require('../utils/fileUploadService');

const router = express.Router();

// Public routes (with optional auth for personalized content)
router.get('/', optionalAuth, getAnnouncements);
router.get('/:id', getAnnouncement);

// Protected routes
router.post('/', auth, adminOnly, fileUploadService.getAnnouncementUpload().array('images', 3), createAnnouncement);
router.put('/:id', auth, adminOnly, updateAnnouncement);
router.delete('/:id', auth, adminOnly, deleteAnnouncement);

// Engagement routes
router.put('/:id/like', auth, toggleLike);
router.post('/:id/comments', auth, addComment);

// Admin routes
router.get('/admin/stats', auth, adminOnly, getAnnouncementStats);

module.exports = router;
