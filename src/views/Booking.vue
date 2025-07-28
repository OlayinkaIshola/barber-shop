<template>
  <div class="booking">
    <div class="booking-container">
      <h1>Book an Appointment</h1>

      <!-- Selected Service Display -->
      <div v-if="selectedService" class="selected-service">
        <h2>Selected Service</h2>
        <div class="service-info">
          <h3>{{ selectedService.name }}</h3>
          <p class="service-price">${{ selectedService.price }}</p>
          <p class="service-duration">Duration: {{ selectedService.duration }} minutes</p>
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

// Selected service from query parameters
const selectedService = ref(null)

// Booking form data
const bookingForm = ref({
  name: '',
  email: '',
  phone: '',
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

  // Navigate to payment or confirmation page
  router.push({
    path: '/payment',
    query: {
      bookingId: bookingData.bookingId,
      amount: selectedService.value?.price
    }
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
})
</script>

<style scoped>
.booking {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.booking-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.booking h1 {
  text-align: center;
  color: #2c3e50;
  margin: 0;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 2.5rem;
}

.selected-service {
  padding: 2rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.selected-service h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.service-info {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.service-info h3 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
}

.service-price {
  color: #e74c3c;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.service-duration {
  color: #666;
  margin: 0;
  font-style: italic;
}

.booking-form {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 600;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
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
  .booking {
    padding: 1rem;
  }

  .booking h1 {
    font-size: 2rem;
    padding: 1.5rem;
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
