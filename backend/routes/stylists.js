const express = require('express');
const {
  getStylists,
  getStylist,
  getStylistAvailability,
  updateStylistAvailability,
  getStylistStats,
  approveStylist,
  rejectStylist
} = require('../controllers/stylists');
const { protect, authorize, approvedBarber } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getStylists);
router.get('/:id', getStylist);
router.get('/:id/availability', getStylistAvailability);

// Protected routes
router.use(protect);

// Barber routes
router.put('/availability', approvedBarber, updateStylistAvailability);
router.get('/stats/my-stats', approvedBarber, getStylistStats);

// Admin routes
router.put('/:id/approve', authorize('admin'), approveStylist);
router.put('/:id/reject', authorize('admin'), rejectStylist);

module.exports = router;
