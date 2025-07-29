const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
  createNotification,
  sendBulkNotifications
} = require('../controllers/notifications');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.use(protect);

// User routes
router.get('/', getNotifications);
router.get('/stats', getNotificationStats);
router.put('/:id/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);
router.delete('/:id', deleteNotification);

// Admin routes
router.post('/', authorize('admin'), createNotification);
router.post('/bulk', authorize('admin'), sendBulkNotifications);

module.exports = router;
