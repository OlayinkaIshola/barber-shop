const express = require('express');
const {
  createPaymentIntent,
  confirmPayment,
  processBankTransfer,
  getPaymentHistory,
  refundPayment,
  handleWebhook,
  getPaymentStats
} = require('../controllers/payments');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.use(protect);

router.post('/create-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);
router.post('/bank-transfer', processBankTransfer);
router.get('/history', getPaymentHistory);

// Admin only routes
router.post('/refund', authorize('admin'), refundPayment);
router.get('/stats', authorize('admin'), getPaymentStats);

module.exports = router;
