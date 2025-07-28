<template>
  <div class="booking">
    <div class="booking-container">
      <h1>Book an Appointment</h1>

      <!-- Selected Service and Stylist Display -->
      <div v-if="selectedService" class="booking-summary">
        <h2>Booking Summary</h2>
        <div class="summary-grid">
          <div class="service-info">
            <h3>Selected Service</h3>
            <h4>{{ selectedService.name }}</h4>
            <p class="service-price">${{ selectedService.price }}</p>
            <p class="service-duration">{{ selectedService.duration }} minutes</p>
          </div>
          <div v-if="selectedStylist" class="stylist-info">
            <h3>Selected Stylist</h3>
            <h4>{{ selectedStylist }}</h4>
            <p class="stylist-note">Your preferred stylist</p>
          </div>
        </div>
      </div>

      <!-- Booking Form -->
      <form @submit.prevent="submitBooking" class="booking-form">
        <div class="form-group">
          <label for="name">Full Name *</label>
          <input
            type="text"
            id="name"
            v-model="bookingForm.name"
            required
            placeholder="Enter your full name"
          />
        </div>

        <div class="form-group">
          <label for="email">Email *</label>
          <input
            type="email"
            id="email"
            v-model="bookingForm.email"
            required
            placeholder="Enter your email address"
          />
        </div>

        <div class="form-group">
          <label for="phone">Phone Number *</label>
          <input
            type="tel"
            id="phone"
            v-model="bookingForm.phone"
            required
            placeholder="Enter your phone number"
          />
        </div>

        <div class="form-group">
          <label for="location">Preferred Location *</label>
          <select id="location" v-model="bookingForm.location" required>
            <option value="">Select location</option>
            <option value="downtown">Downtown Branch - 123 Main St</option>
            <option value="uptown">Uptown Branch - 456 Oak Ave</option>
            <option value="westside">Westside Branch - 789 Pine Rd</option>
            <option value="eastside">Eastside Branch - 321 Elm St</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="date">Preferred Date *</label>
            <input
              type="date"
              id="date"
              v-model="bookingForm.date"
              required
              :min="minDate"
            />
          </div>

          <div class="form-group">
            <label for="time">Preferred Time *</label>
            <select id="time" v-model="bookingForm.time" required>
              <option value="">Select time</option>
              <option v-for="time in availableTimes" :key="time" :value="time">
                {{ time }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="stylist">Preferred Stylist</label>
          <select id="stylist" v-model="bookingForm.stylist">
            <option value="">No preference</option>
            <option v-for="stylist in stylists" :key="stylist.id" :value="stylist.name">
              {{ stylist.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="notes">Additional Notes</label>
          <textarea
            id="notes"
            v-model="bookingForm.notes"
            rows="4"
            placeholder="Any special requests or notes..."
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" @click="goBack" class="btn-secondary">
            Back to Services
          </button>
          <button type="submit" class="btn-primary" :disabled="!isFormValid">
            Confirm Booking
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Selected service and stylist from query parameters
const selectedService = ref(null)
const selectedStylist = ref(null)

// Booking form data
const bookingForm = ref({
  name: '',
  email: '',
  phone: '',
  location: '',
  date: '',
  time: '',
  stylist: '',
  notes: ''
})

// Available times
const availableTimes = ref([
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
])

// Available stylists
const stylists = ref([
  { id: 1, name: 'Mike Johnson' },
  { id: 2, name: 'Sarah Williams' },
  { id: 3, name: 'David Brown' },
  { id: 4, name: 'Lisa Davis' }
])

// Computed properties
const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const isFormValid = computed(() => {
  return bookingForm.value.name &&
         bookingForm.value.email &&
         bookingForm.value.phone &&
         bookingForm.value.location &&
         bookingForm.value.date &&
         bookingForm.value.time
})

// Methods
const submitBooking = () => {
  if (!isFormValid.value) {
    alert('Please fill in all required fields.')
    return
  }

  // Here you would typically send the booking data to your backend
  const bookingData = {
    ...bookingForm.value,
    service: selectedService.value,
    bookingId: Date.now(), // Simple ID generation
    status: 'confirmed'
  }

  console.log('Booking submitted:', bookingData)

  // Show success message
  alert(`Booking confirmed!
Service: ${selectedService.value?.name}
Date: ${bookingForm.value.date}
Time: ${bookingForm.value.time}
Total: $${selectedService.value?.price}

We'll send you a confirmation email shortly.`)

  // Store booking data for payment and success pages
  const paymentData = {
    bookingId: bookingData.bookingId,
    amount: selectedService.value?.price,
    serviceName: selectedService.value?.name,
    date: bookingForm.value.date,
    time: bookingForm.value.time,
    stylist: bookingForm.value.stylist || 'No preference'
  }

  localStorage.setItem('bookingData', JSON.stringify(paymentData))

  // Navigate to payment page
  router.push({
    path: '/payment',
    query: paymentData
  })
}

const goBack = () => {
  router.push('/services')
}

// Initialize component
onMounted(() => {
  // Get service information from query parameters
  if (route.query.serviceId) {
    selectedService.value = {
      id: route.query.serviceId,
      name: route.query.serviceName,
      price: route.query.price,
      duration: route.query.duration
    }
  }

  // Pre-select stylist if coming from stylists page
  if (route.query.preferredStylist) {
    selectedStylist.value = route.query.preferredStylist
    bookingForm.value.stylist = route.query.preferredStylist
  }

  // Clear the selected service from localStorage after using it
  localStorage.removeItem('selectedService')
})
</script>

<style scoped>
.booking {
  padding: 2rem;
  background: linear-gradient(135deg, #f4e4bc 0%, #f0d49c 100%);
  min-height: 100vh;
}

.booking-container {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(44, 44, 44, 0.15);
  overflow: hidden;
  border: 3px solid rgba(212, 175, 55, 0.2);
  position: relative;
}

.booking-container::before {
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

.booking h1 {
  text-align: center;
  color: #f4e4bc;
  margin: 0;
  padding: 2rem;
  background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%);
  font-size: 2.5rem;
}

.booking-summary {
  padding: 2rem;
  background: rgba(212, 175, 55, 0.1);
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
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.service-info,
.stylist-info {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(44, 44, 44, 0.1);
}

.service-info {
  border-left: 4px solid #d4af37;
}

.stylist-info {
  border-left: 4px solid #8B4513;
}

.service-info h3,
.stylist-info h3 {
  color: #5a5a5a;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.service-info h4,
.stylist-info h4 {
  color: #2c2c2c;
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
  font-weight: 700;
}

.service-price {
  color: #d4af37;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.service-duration {
  color: #5a5a5a;
  margin: 0;
  font-style: italic;
}

.stylist-note {
  color: #8B4513;
  margin: 0;
  font-weight: 500;
  font-size: 0.9rem;
}

.booking-form {
  padding: 3rem;
  background: linear-gradient(135deg, rgba(244, 228, 188, 0.05) 0%, rgba(212, 175, 55, 0.05) 100%);
}

.form-group {
  margin-bottom: 2rem;
  position: relative;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c2c2c;
  font-weight: 600;
}

.form-group input,
.form-group select,
.form-group textarea {
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

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #d4af37;
  box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.15);
  background: white;
  transform: translateY(-2px);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #dee2e6;
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
  min-width: 150px;
}

.btn-primary {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  color: #2c2c2c;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #f4e4bc 0%, #d4af37 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(212, 175, 55, 0.3);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #8B4513;
  color: #f4e4bc;
}

.btn-secondary:hover {
  background: #A0522D;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(139, 69, 19, 0.3);
}

@media (max-width: 768px) {
  .booking {
    padding: 1rem;
  }

  .booking h1 {
    font-size: 2rem;
    padding: 1.5rem;
  }

  .summary-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
