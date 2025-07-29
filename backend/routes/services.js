const express = require('express');
const { body } = require('express-validator');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getServicesByCategory,
  getPopularServices,
  searchServices
} = require('../controllers/services');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const serviceValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Service name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Service description must be between 10 and 500 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('duration')
    .isInt({ min: 5, max: 300 })
    .withMessage('Duration must be between 5 and 300 minutes'),
  body('category')
    .isIn(['Haircuts', 'Beard Services', 'Hair Treatments', 'Styling', 'Packages', 'Specialty Services'])
    .withMessage('Please select a valid category')
];

// Public routes
router.get('/', getServices);
router.get('/search', searchServices);
router.get('/popular', getPopularServices);
router.get('/category/:category', getServicesByCategory);
router.get('/:id', getService);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize('admin'));

router.post('/', serviceValidation, validate, createService);
router.put('/:id', serviceValidation, validate, updateService);
router.delete('/:id', deleteService);

module.exports = router;
