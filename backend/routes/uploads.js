const express = require('express');
const {
  uploadProfileImage,
  uploadPortfolioImages,
  deletePortfolioImage,
  updatePortfolioImage,
  getPortfolio,
  getStylistPortfolio,
  handleMulterError
} = require('../controllers/uploads');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/portfolio/:stylistId', getStylistPortfolio);

// Protected routes
router.use(protect);

// Profile image upload
router.post('/profile', uploadProfileImage);

// Portfolio management
router.get('/portfolio', getPortfolio);
router.post('/portfolio', authorize('barber'), uploadPortfolioImages);
router.put('/portfolio/:imageId', authorize('barber'), updatePortfolioImage);
router.delete('/portfolio/:imageId', authorize('barber'), deletePortfolioImage);

// Error handling middleware
router.use(handleMulterError);

module.exports = router;
