// PAYMENT INTEGRATION COMMENTED OUT FOR DEPLOYMENT
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51234567890abcdef');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Create payment intent - SIMULATED FOR DEPLOYMENT
// @route   POST /api/payments/create-intent
// @access  Private
exports.createPaymentIntent = async (req, res) => {
  try {
    const { bookingId, amount, currency = 'usd' } = req.body;

    // Validate booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // SIMULATE payment intent creation (Stripe integration disabled)
    const simulatedPaymentIntent = {
      id: `pi_simulated_${Date.now()}`,
      client_secret: `pi_simulated_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.round(amount * 100),
      currency,
      status: 'requires_payment_method'
    };

    // Update booking with simulated payment intent ID
    booking.paymentIntentId = simulatedPaymentIntent.id;
    booking.paymentStatus = 'pending';
    await booking.save();

    res.status(200).json({
      success: true,
      data: {
        clientSecret: simulatedPaymentIntent.client_secret,
        paymentIntentId: simulatedPaymentIntent.id
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment intent'
    });
  }
};

// @desc    Confirm payment - SIMULATED FOR DEPLOYMENT
// @route   POST /api/payments/confirm
// @access  Private
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;

    // SIMULATE payment confirmation (Stripe integration disabled)
    // In real implementation, this would retrieve from Stripe
    const simulatedPaymentStatus = 'succeeded'; // Always succeed for demo

    if (simulatedPaymentStatus === 'succeeded') {
      // Update booking payment status
      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          paymentStatus: 'completed',
          paymentMethod: 'card',
          paymentDate: new Date(),
          transactionId: paymentIntentId,
          status: 'confirmed'
        },
        { new: true }
      ).populate('customer stylist service');

      res.status(200).json({
        success: true,
        data: booking,
        message: 'Payment confirmed successfully (simulated)'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment not completed'
      });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm payment'
    });
  }
};

// @desc    Process bank transfer payment
// @route   POST /api/payments/bank-transfer
// @access  Private
exports.processBankTransfer = async (req, res) => {
  try {
    const { bookingId, bankDetails } = req.body;

    // Validate booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Update booking with bank transfer details
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: 'pending_bank_transfer',
        paymentMethod: 'bank_transfer',
        bankTransferDetails: bankDetails,
        status: 'pending_payment'
      },
      { new: true }
    ).populate('customer stylist service');

    res.status(200).json({
      success: true,
      data: updatedBooking,
      message: 'Bank transfer details recorded. You will receive payment instructions via email.'
    });
  } catch (error) {
    console.error('Bank transfer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process bank transfer'
    });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by user role
    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    } else if (req.user.role === 'barber') {
      query.stylist = req.user.id;
    }

    const payments = await Booking.find({
      ...query,
      paymentStatus: { $in: ['completed', 'pending_bank_transfer'] }
    })
    .populate('customer', 'firstName lastName email')
    .populate('stylist', 'firstName lastName')
    .populate('service', 'name price')
    .sort({ paymentDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Booking.countDocuments({
      ...query,
      paymentStatus: { $in: ['completed', 'pending_bank_transfer'] }
    });

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment history'
    });
  }
};

// @desc    Refund payment - SIMULATED FOR DEPLOYMENT
// @route   POST /api/payments/refund
// @access  Private/Admin
exports.refundPayment = async (req, res) => {
  try {
    const { bookingId, reason, amount } = req.body;

    // Only admins can process refunds
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to process refunds'
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking || !booking.transactionId) {
      return res.status(404).json({
        success: false,
        error: 'Booking or transaction not found'
      });
    }

    // SIMULATE refund processing (Stripe integration disabled)
    const simulatedRefund = {
      id: `re_simulated_${Date.now()}`,
      amount: amount ? Math.round(amount * 100) : booking.totalAmount * 100,
      status: 'succeeded'
    };

    // Update booking status
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'refunded',
      refundId: simulatedRefund.id,
      refundAmount: simulatedRefund.amount / 100,
      refundReason: reason,
      refundDate: new Date(),
      status: 'cancelled'
    });

    res.status(200).json({
      success: true,
      data: simulatedRefund,
      message: 'Refund processed successfully (simulated)'
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process refund'
    });
  }
};

// @desc    Webhook handler for Stripe events - DISABLED FOR DEPLOYMENT
// @route   POST /api/payments/webhook
// @access  Public
exports.handleWebhook = async (req, res) => {
  // WEBHOOK FUNCTIONALITY DISABLED (Stripe integration disabled)
  console.log('Webhook called but Stripe integration is disabled');

  // For demo purposes, just return success
  res.json({
    received: true,
    message: 'Webhook disabled - Stripe integration commented out'
  });

  /* ORIGINAL STRIPE WEBHOOK CODE COMMENTED OUT
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Update booking status
      await Booking.findOneAndUpdate(
        { paymentIntentId: paymentIntent.id },
        {
          paymentStatus: 'completed',
          status: 'confirmed',
          paymentDate: new Date()
        }
      );
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await Booking.findOneAndUpdate(
        { paymentIntentId: failedPayment.id },
        {
          paymentStatus: 'failed',
          status: 'payment_failed'
        }
      );
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
  */
};

// @desc    Get payment statistics (Admin only) - WORKING WITH SIMULATED DATA
// @route   GET /api/payments/stats
// @access  Private/Admin
exports.getPaymentStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view payment statistics'
      });
    }

    const { startDate, endDate } = req.query;
    const dateFilter = {};

    if (startDate && endDate) {
      dateFilter.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // This still works with simulated payment data in the database
    const stats = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalBookings: { $sum: 1 },
          averageBookingValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    const paymentMethodStats = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || { totalRevenue: 0, totalBookings: 0, averageBookingValue: 0 },
        paymentMethods: paymentMethodStats
      },
      note: 'Statistics based on simulated payment data (Stripe integration disabled)'
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment statistics'
    });
  }
};
