<template>
  <div class="payment">
    <PageNavigation />
    <div class="payment-container">
      <div class="payment-header">
        <h1>Secure Payment</h1>
        <p>Complete your booking with our secure payment system</p>
      </div>

      <div v-if="bookingData" class="booking-summary">
        <h2>Booking Summary</h2>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="item-label">Booking ID</div>
            <div class="item-value">#{{ bookingData.bookingId }}</div>
          </div>
          <div v-if="selectedService" class="summary-item">
            <div class="item-label">Service</div>
            <div class="item-value">{{ selectedService.name }}</div>
          </div>
          <div v-if="selectedStylist" class="summary-item">
            <div class="item-label">Stylist</div>
            <div class="item-value">{{ selectedStylist.name }}</div>
          </div>
          <div v-if="bookingData.date && bookingData.time" class="summary-item">
            <div class="item-label">Date & Time</div>
            <div class="item-value">{{ bookingData.date }} at {{ bookingData.time }}</div>
          </div>
        </div>
        <div class="summary-total">
          <div class="total-label">Total Amount</div>
          <div class="total-value">${{ amount }}</div>
        </div>
      </div>

      <form @submit.prevent="processPayment" class="payment-form">
        <div class="form-header">
          <h3>Payment Information</h3>
          <div class="security-badge">
            <span class="security-icon">🔒</span>
            <span>Secure & Encrypted</span>
          </div>
        </div>

        <!-- Payment Method Selection -->
        <div class="payment-method-selector">
          <h4>Choose Payment Method</h4>
          <div class="method-buttons">
            <button
              type="button"
              @click="paymentMethod = 'card'"
              :class="['method-btn', { active: paymentMethod === 'card' }]"
            >
              <span class="method-icon">💳</span>
              <span>Credit/Debit Card</span>
            </button>
            <button
              type="button"
              @click="paymentMethod = 'bank'"
              :class="['method-btn', { active: paymentMethod === 'bank' }]"
            >
              <span class="method-icon">🏦</span>
              <span>Bank Transfer</span>
            </button>
          </div>
        </div>

        <!-- Card Payment Form -->
        <div v-if="paymentMethod === 'card'" class="payment-fields">
          <div class="form-group">
            <label>Card Number</label>
            <div class="input-with-icon">
              <i class="fas fa-credit-card input-icon"></i>
              <input type="text" v-model="payment.cardNumber" placeholder="1234 5678 9012 3456" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Expiry Date</label>
              <div class="input-with-icon">
                <i class="fas fa-calendar-alt input-icon"></i>
                <input type="text" v-model="payment.expiry" placeholder="MM/YY" required>
              </div>
            </div>
            <div class="form-group">
              <label>CVV</label>
              <div class="input-with-icon">
                <i class="fas fa-lock input-icon"></i>
                <input type="text" v-model="payment.cvv" placeholder="123" required>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Cardholder Name</label>
            <div class="input-with-icon">
              <i class="fas fa-user input-icon"></i>
              <input type="text" v-model="payment.cardholderName" placeholder="Full name as on card" required>
            </div>
          </div>
        </div>

        <!-- Bank Transfer Form -->
        <div v-if="paymentMethod === 'bank'" class="payment-fields">
          <div class="form-group">
            <label>Account Holder Name</label>
            <div class="input-with-icon">
              <i class="fas fa-user input-icon"></i>
              <input type="text" v-model="bankTransfer.accountHolder" placeholder="Full name on account" required>
            </div>
          </div>

          <div class="form-group">
            <label>Bank Name</label>
            <div class="input-with-icon">
              <i class="fas fa-university input-icon"></i>
              <input type="text" v-model="bankTransfer.bankName" placeholder="Your bank name" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Account Number</label>
              <div class="input-with-icon">
                <i class="fas fa-hashtag input-icon"></i>
                <input type="text" v-model="bankTransfer.accountNumber" placeholder="Account number" required>
              </div>
            </div>
            <div class="form-group">
              <label>Routing Number</label>
              <div class="input-with-icon">
                <i class="fas fa-route input-icon"></i>
                <input type="text" v-model="bankTransfer.routingNumber" placeholder="Routing number" required>
              </div>
            </div>
          </div>

          <div class="bank-transfer-info">
            <div class="info-box">
              <h5>🏦 Bank Transfer Instructions</h5>
              <p>Your payment will be processed within 1-2 business days. You will receive a confirmation email with transfer details.</p>
            </div>
          </div>
        </div>

        <button type="submit" class="pay-btn" :disabled="processing">
          <span v-if="processing" class="btn-icon">⏳</span>
          <span v-else class="btn-icon">{{ paymentMethod === 'card' ? '💳' : '🏦' }}</span>
          <span>
            {{ processing ? 'Processing...' :
               (paymentMethod === 'card' ? 'Pay' : 'Transfer') + ' $' + amount }}
          </span>
          <div class="btn-shine"></div>
        </button>
      </form>

      <div v-if="paymentSuccess" class="success-message">
        <h2>✅ Payment Successful!</h2>
        <p>Your appointment has been confirmed. We'll see you soon!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// STRIPE INTEGRATION COMMENTED OUT FOR DEPLOYMENT
// import { loadStripe } from '@stripe/stripe-js'
import PageNavigation from '@/components/PageNavigation.vue'
import { paymentAPI, serviceAPI, stylistAPI } from '../services/api.js'

const route = useRoute()
const router = useRouter()

// STRIPE INITIALIZATION COMMENTED OUT FOR DEPLOYMENT
// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890abcdef')

const bookingData = ref(null)
const paymentSuccess = ref(false)
const amount = ref(0)
const paymentMethod = ref('card')

const payment = ref({
  cardNumber: '',
  expiry: '',
  cvv: '',
  cardholderName: ''
})

const bankTransfer = ref({
  accountHolder: '',
  bankName: '',
  accountNumber: '',
  routingNumber: ''
})

const services = ref([
  { id: 1, name: 'Classic Haircut', price: 25 },
  { id: 2, name: 'Beard Trim', price: 15 },
  { id: 3, name: 'Hair Wash & Style', price: 35 },
  { id: 4, name: 'Buzz Cut', price: 20 },
  { id: 5, name: 'Premium Package', price: 50 }
])

const stylists = ref([
  { id: 1, name: 'Mike Johnson' },
  { id: 2, name: 'Sarah Williams' },
  { id: 3, name: 'David Brown' },
  { id: 4, name: 'Lisa Davis' }
])

const selectedService = computed(() =>
  services.value.find(s => s.id == bookingData.value?.serviceId)
)

const selectedStylist = computed(() =>
  stylists.value.find(s => s.name == bookingData.value?.stylist)
)

const processing = ref(false)

const processPayment = async () => {
  if (processing.value) return
  processing.value = true

  try {
    if (paymentMethod.value === 'card') {
      await processCardPayment()
    } else if (paymentMethod.value === 'bank') {
      await processBankTransferPayment()
    }
  } catch (error) {
    console.error('Payment processing error:', error)
    alert('Payment failed. Please try again.')
  } finally {
    processing.value = false
  }
}

const processCardPayment = async () => {
  try {
    // SIMULATE CARD PAYMENT PROCESSING (Stripe integration disabled)
    console.log('Simulating card payment processing...')

    // Validate card details (basic validation for demo)
    if (!payment.value.cardNumber || !payment.value.expiry || !payment.value.cvv || !payment.value.cardholderName) {
      throw new Error('Please fill in all card details')
    }

    // Create simulated payment intent
    const intentResponse = await paymentAPI.createIntent({
      bookingId: bookingData.value.bookingId,
      amount: amount.value
    })

    // SIMULATE successful payment processing
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate processing time

    const simulatedPaymentIntent = {
      id: intentResponse.data.paymentIntentId,
      status: 'succeeded'
    }

    // Confirm payment on backend with simulated data
    await paymentAPI.confirmPayment({
      paymentIntentId: simulatedPaymentIntent.id,
      bookingId: bookingData.value.bookingId
    })

    // Navigate to success page
    navigateToSuccess()

    /* ORIGINAL STRIPE CODE COMMENTED OUT
    const stripe = await stripePromise
    const { clientSecret } = intentResponse.data

    // Confirm payment with Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: {
          number: payment.value.cardNumber.replace(/\s/g, ''),
          exp_month: parseInt(payment.value.expiry.split('/')[0]),
          exp_year: parseInt('20' + payment.value.expiry.split('/')[1]),
          cvc: payment.value.cvv
        },
        billing_details: {
          name: payment.value.cardholderName
        }
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    if (paymentIntent.status === 'succeeded') {
      // Confirm payment on backend
      await paymentAPI.confirmPayment({
        paymentIntentId: paymentIntent.id,
        bookingId: bookingData.value.bookingId
      })

      // Navigate to success page
      navigateToSuccess()
    }
    */
  } catch (error) {
    throw error
  }
}

const processBankTransferPayment = async () => {
  try {
    const response = await paymentAPI.processBankTransfer({
      bookingId: bookingData.value.bookingId,
      bankDetails: bankTransfer.value
    })

    alert(response.message)
    navigateToSuccess()
  } catch (error) {
    throw error
  }
}

const navigateToSuccess = () => {
  const successData = {
    bookingId: bookingData.value.bookingId,
    amount: amount.value,
    serviceName: bookingData.value.serviceName,
    date: bookingData.value.date,
    time: bookingData.value.time,
    stylist: bookingData.value.stylistName
  }

  localStorage.setItem('lastBooking', JSON.stringify(successData))

  router.push({
    path: '/payment-success',
    query: successData
  })
}

onMounted(() => {
  // Get payment information from query parameters
  if (route.query.bookingId && route.query.amount) {
    amount.value = route.query.amount
    bookingData.value = {
      bookingId: route.query.bookingId,
      amount: route.query.amount
    }
  }

  // Also check localStorage for any stored booking data
  const stored = localStorage.getItem('bookingData')
  if (stored) {
    const storedData = JSON.parse(stored)
    bookingData.value = { ...bookingData.value, ...storedData }
  }
})
</script>

<style scoped>
.payment {
  min-height: 100vh;
  background: linear-gradient(135deg, #f4e4bc 0%, #f0d49c 100%);
  padding: 2rem;
}

.payment-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(44, 44, 44, 0.15);
  overflow: hidden;
  border: 3px solid rgba(212, 175, 55, 0.2);
  position: relative;
}

.payment-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #d4af37, #f4e4bc, #d4af37);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.payment-header {
  background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%);
  color: #f4e4bc;
  padding: 3rem 2rem 2rem;
  text-align: center;
}

.payment-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #d4af37;
}

.payment-header p {
  opacity: 0.9;
  font-size: 1.1rem;
}

.booking-summary {
  background: rgba(212, 175, 55, 0.1);
  padding: 2rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

.booking-summary h2 {
  color: #2c2c2c;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  text-align: center;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-item {
  background: white;
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(44, 44, 44, 0.1);
}

.item-label {
  color: #5a5a5a;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
}

.item-value {
  color: #2c2c2c;
  font-weight: 600;
  font-size: 1.1rem;
}

.summary-total {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  padding: 1.5rem;
  border-radius: 15px;
  text-align: center;
  color: #2c2c2c;
}

.total-label {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
}

.total-value {
  font-size: 2rem;
  font-weight: bold;
}

.payment-form {
  padding: 3rem;
  background: linear-gradient(135deg, rgba(244, 228, 188, 0.05) 0%, rgba(212, 175, 55, 0.05) 100%);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(212, 175, 55, 0.2);
}

.form-header h3 {
  color: #2c2c2c;
  font-size: 1.5rem;
  margin: 0;
}

.security-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(212, 175, 55, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #2c2c2c;
}

.security-icon {
  font-size: 1.2rem;
}

.form-group {
  margin-bottom: 2rem;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c2c2c;
  font-weight: 600;
  font-size: 1rem;
}

.form-group input {
  width: 100%;
  padding: 15px 20px;
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: 12px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
}

.form-group input:focus {
  outline: none;
  border-color: #d4af37;
  box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.15);
  background: white;
  transform: translateY(-2px);
}

.card-icons {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

/* Input with Icon Styles */
.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 15px;
  color: #d4af37;
  font-size: 1rem;
  z-index: 2;
  pointer-events: none;
}

.input-with-icon input,
.input-with-icon select,
.input-with-icon textarea {
  padding-left: 45px !important;
}

/* Payment Method Selector */
.payment-method-selector {
  margin-bottom: 2rem;
  padding: 2rem;
  background: rgba(244, 228, 188, 0.1);
  border-radius: 15px;
  border: 2px solid rgba(212, 175, 55, 0.2);
}

.payment-method-selector h4 {
  color: #2c2c2c;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  text-align: center;
}

.method-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.method-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  background: white;
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  color: #2c2c2c;
}

.method-btn:hover {
  border-color: #d4af37;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.2);
}

.method-btn.active {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  border-color: #d4af37;
  color: #2c2c2c;
  font-weight: bold;
}

.method-icon {
  font-size: 2rem;
}

.payment-fields {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bank-transfer-info {
  margin-top: 1.5rem;
}

.info-box {
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 10px;
  padding: 1.5rem;
}

.info-box h5 {
  color: #d4af37;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.info-box p {
  color: #5a5a5a;
  margin: 0;
  line-height: 1.5;
}

.pay-btn {
  position: relative;
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  color: #2c2c2c;
  border: none;
  padding: 18px 40px;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  overflow: hidden;
  margin-top: 1rem;
}

.pay-btn:hover {
  background: linear-gradient(135deg, #f4e4bc 0%, #d4af37 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.4);
}

.btn-icon {
  font-size: 1.3rem;
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.pay-btn:hover .btn-shine {
  left: 100%;
}

@media (max-width: 768px) {
  .payment {
    padding: 1rem;
  }

  .payment-header {
    padding: 2rem 1rem 1.5rem;
  }

  .payment-header h1 {
    font-size: 2rem;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>