<template>
  <div class="payment">
    <h1>Payment</h1>
    
    <div v-if="bookingData" class="booking-summary">
      <h2>Booking Summary</h2>
      <div class="summary-item">
        <span>Service:</span>
        <span>{{ selectedService?.name }}</span>
      </div>
      <div class="summary-item">
        <span>Stylist:</span>
        <span>{{ selectedStylist?.name }}</span>
      </div>
      <div class="summary-item">
        <span>Date & Time:</span>
        <span>{{ bookingData.date }} at {{ bookingData.time }}</span>
      </div>
      <div class="summary-item total">
        <span>Total:</span>
        <span>${{ selectedService?.price }}</span>
      </div>
    </div>

    <form @submit.prevent="processPayment" class="payment-form">
      <h3>Payment Information</h3>
      
      <div class="form-group">
        <label>Card Number:</label>
        <input type="text" v-model="payment.cardNumber" placeholder="1234 5678 9012 3456" required>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Expiry Date:</label>
          <input type="text" v-model="payment.expiry" placeholder="MM/YY" required>
        </div>
        <div class="form-group">
          <label>CVV:</label>
          <input type="text" v-model="payment.cvv" placeholder="123" required>
        </div>
      </div>

      <div class="form-group">
        <label>Cardholder Name:</label>
        <input type="text" v-model="payment.cardholderName" required>
      </div>

      <button type="submit" class="pay-btn">
        Pay ${{ selectedService?.price }}
      </button>
    </form>

    <div v-if="paymentSuccess" class="success-message">
      <h2>✅ Payment Successful!</h2>
      <p>Your appointment has been confirmed. We'll see you soon!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const bookingData = ref(null)
const paymentSuccess = ref(false)

const payment = ref({
  cardNumber: '',
  expiry: '',
  cvv: '',
  cardholderName: ''
})

const services = ref([
  { id: 1, name: 'Classic Haircut', price: 25 },
  { id: 2, name: 'Beard Trim', price: 15 },
  { id: 3, name: 'Hair Wash & Style', price: 35 },
  { id: 4, name: 'Premium Package', price: 50 }
])

const stylists = ref([
  { id: 1, name: 'Mike Johnson' },
  { id: 2, name: 'Sarah Davis' },
  { id: 3, name: 'Tony Rodriguez' },
  { id: 4, name: 'Alex Chen' }
])

const selectedService = computed(() => 
  services.value.find(s => s.id == bookingData.value?.serviceId)
)

const selectedStylist = computed(() => 
  stylists.value.find(s => s.id == bookingData.value?.stylistId)
)

const processPayment = () => {
  // Simulate payment processing
  setTimeout(() => {
    paymentSuccess.value = true
    localStorage.removeItem('bookingData')
  }, 1000)
}

onMounted(() => {
  const stored = localStorage.getItem('bookingData')
  if (stored) {
    bookingData.value = JSON.parse(stored)
  }
})
</script>

<style scoped>
.payment {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
}

.booking-summary {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.summary-item.total {
  font-weight: bold;
  font-size: 1.2rem;
  border-top: 1px solid #ddd;
  padding-top: 0.5rem;
  margin-top: 1rem;
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.pay-btn {
  padding: 1rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  cursor: pointer;
}

.success-message {
  text-align: center;
  padding: 2rem;
  background: #d4edda;
  border-radius: 8px;
  color: #155724;
  margin-top: 2rem;
}
</style>