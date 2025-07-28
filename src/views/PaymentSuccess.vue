<template>
  <div class="payment-success">
    <div class="success-container">
      <div class="success-animation">
        <div class="checkmark-circle">
          <div class="checkmark">✓</div>
        </div>
      </div>
      
      <div class="success-content">
        <h1>Payment Successful!</h1>
        <p class="success-message">
          Thank you for choosing our barber shop! Your appointment has been confirmed.
        </p>
        
        <div v-if="bookingDetails" class="booking-confirmation">
          <h2>Booking Confirmation</h2>
          <div class="confirmation-details">
            <div class="detail-row">
              <span class="label">Booking ID:</span>
              <span class="value">#{{ bookingDetails.bookingId }}</span>
            </div>
            <div v-if="bookingDetails.serviceName" class="detail-row">
              <span class="label">Service:</span>
              <span class="value">{{ bookingDetails.serviceName }}</span>
            </div>
            <div v-if="bookingDetails.date" class="detail-row">
              <span class="label">Date:</span>
              <span class="value">{{ formatDate(bookingDetails.date) }}</span>
            </div>
            <div v-if="bookingDetails.time" class="detail-row">
              <span class="label">Time:</span>
              <span class="value">{{ bookingDetails.time }}</span>
            </div>
            <div v-if="bookingDetails.stylist" class="detail-row">
              <span class="label">Stylist:</span>
              <span class="value">{{ bookingDetails.stylist }}</span>
            </div>
            <div class="detail-row total">
              <span class="label">Total Paid:</span>
              <span class="value">${{ bookingDetails.amount }}</span>
            </div>
          </div>
        </div>
        
        <div class="next-steps">
          <h3>What's Next?</h3>
          <div class="steps-grid">
            <div class="step">
              <div class="step-icon">📧</div>
              <h4>Confirmation Email</h4>
              <p>You'll receive a confirmation email with all the details shortly.</p>
            </div>
            <div class="step">
              <div class="step-icon">📱</div>
              <h4>SMS Reminder</h4>
              <p>We'll send you a reminder 24 hours before your appointment.</p>
            </div>
            <div class="step">
              <div class="step-icon">🏪</div>
              <h4>Visit Our Shop</h4>
              <p>Please arrive 10 minutes early for your appointment.</p>
            </div>
          </div>
        </div>
        
        <div class="contact-info">
          <h3>Need to Make Changes?</h3>
          <p>Contact us at least 24 hours in advance:</p>
          <div class="contact-details">
            <div class="contact-item">
              <span class="contact-icon">📞</span>
              <span>(555) 123-4567</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">📧</span>
              <span>info@barbershop.com</span>
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <button @click="goHome" class="btn-primary">
            Back to Home
          </button>
          <button @click="bookAnother" class="btn-secondary">
            Book Another Service
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const bookingDetails = ref(null)

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const goHome = () => {
  router.push('/')
}

const bookAnother = () => {
  router.push('/services')
}

onMounted(() => {
  // Get booking details from query parameters or localStorage
  if (route.query.bookingId) {
    bookingDetails.value = {
      bookingId: route.query.bookingId,
      amount: route.query.amount,
      serviceName: route.query.serviceName,
      date: route.query.date,
      time: route.query.time,
      stylist: route.query.stylist
    }
  }
  
  // Also check localStorage for stored booking data
  const stored = localStorage.getItem('lastBooking')
  if (stored) {
    const storedData = JSON.parse(stored)
    bookingDetails.value = { ...bookingDetails.value, ...storedData }
  }
  
  // Clear the stored booking data after displaying
  setTimeout(() => {
    localStorage.removeItem('lastBooking')
  }, 1000)
})
</script>

<style scoped>
.payment-success {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.success-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
  overflow: hidden;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-animation {
  text-align: center;
  padding: 3rem 2rem 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.checkmark-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
  }
  70% {
    box-shadow: 0 0 0 20px rgba(40, 167, 69, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
  }
}

.checkmark {
  color: white;
  font-size: 3rem;
  font-weight: bold;
  animation: checkmarkAppear 0.5s ease-in-out 0.3s both;
}

@keyframes checkmarkAppear {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.success-content {
  padding: 2rem;
}

.success-content h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 1rem;
  font-weight: 700;
}

.success-message {
  text-align: center;
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.booking-confirmation {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.booking-confirmation h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.confirmation-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #dee2e6;
}

.detail-row.total {
  border-bottom: none;
  border-top: 2px solid #667eea;
  padding-top: 1rem;
  margin-top: 1rem;
  font-weight: bold;
  font-size: 1.1rem;
}

.label {
  color: #666;
  font-weight: 500;
}

.value {
  color: #2c3e50;
  font-weight: 600;
}

.next-steps h3,
.contact-info h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.step {
  text-align: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.step:hover {
  transform: translateY(-5px);
}

.step-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.step h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.step p {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
}

.contact-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.contact-details {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.contact-icon {
  font-size: 1.2rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  min-width: 180px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .payment-success {
    padding: 1rem;
  }
  
  .success-content h1 {
    font-size: 2rem;
  }
  
  .steps-grid {
    grid-template-columns: 1fr;
  }
  
  .contact-details {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
