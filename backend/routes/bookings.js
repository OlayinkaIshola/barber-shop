const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  deleteBooking,
  getMyBookings,
  getStylistBookings,
  checkAvailability,
  confirmBooking,
  cancelBooking,
  completeBooking,
  addReview
} = require('../controllers/bookings');
const { protect, authorize, approvedBarber, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const createBookingValidation = [
  body('customerInfo.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),
  body('customerInfo.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('customerInfo.phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('customerInfo.location')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Location must be between 5 and 200 characters'),
  body('customerInfo.gender')
    .isIn(['male', 'female', 'non-binary', 'prefer-not-to-say'])
    .withMessage('Please select a valid gender'),
  body('customerInfo.age')
    .isInt({ min: 1, max: 120 })
    .withMessage('Age must be between 1 and 120'),
  body('service')
    .isMongoId()
    .withMessage('Please provide a valid service ID'),
  body('stylist')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Please provide a valid stylist ID'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date')
    .custom((value) => {
      const bookingDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (bookingDate <= today) {
        throw new Error('Booking date must be in the future');
      }
      return true;
    }),
  body('time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time in HH:MM format'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const updateBookingValidation = [
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'])
    .withMessage('Please provide a valid status'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time in HH:MM format'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Review comment cannot exceed 500 characters')
];

const availabilityValidation = [
  query('stylistId')
    .isMongoId()
    .withMessage('Please provide a valid stylist ID'),
  query('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  query('time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time in HH:MM format'),
  query('duration')
    .isInt({ min: 5, max: 300 })
    .withMessage('Duration must be between 5 and 300 minutes')
];

// Public routes
router.post('/', createBookingValidation, validate, createBooking);
router.get('/availability', availabilityValidation, validate, checkAvailability);

// Protected routes
router.use(protect);

// Customer routes
router.get('/my-bookings', getMyBookings);
router.get('/:id', getBooking);
router.put('/:id/review', reviewValidation, validate, addReview);

// Barber routes
router.get('/stylist/my-bookings', approvedBarber, getStylistBookings);
router.put('/:id/confirm', approvedBarber, confirmBooking);
router.put('/:id/complete', approvedBarber, completeBooking);

// Admin routes
router.get('/', authorize('admin'), getBookings);
router.put('/:id', authorize('admin', 'barber'), updateBookingValidation, validate, updateBooking);
router.delete('/:id', authorize('admin'), deleteBooking);

// Shared routes (customer, barber, admin)
router.put('/:id/cancel', cancelBooking);

module.exports = router;
