const express = require('express');
const { body } = require('express-validator');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadProfileImage,
  getPendingBarbers,
  getUserStats
} = require('../controllers/users');
const { protect, authorize, ownerOrAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const createUserValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('role')
    .isIn(['customer', 'barber', 'admin'])
    .withMessage('Please provide a valid role')
];

const updateUserValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number')
];

// Protected routes
router.use(protect);

// User routes
router.get('/stats', getUserStats);
router.post('/upload-profile-image', uploadProfileImage);

// Admin routes
router.get('/', authorize('admin'), getUsers);
router.get('/pending-barbers', authorize('admin'), getPendingBarbers);
router.post('/', authorize('admin'), createUserValidation, validate, createUser);

// User-specific routes (owner or admin)
router.get('/:id', ownerOrAdmin, getUser);
router.put('/:id', ownerOrAdmin, updateUserValidation, validate, updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
