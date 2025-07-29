<template>
  <div class="booking">
    <PageNavigation />
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
          <div class="input-with-icon">
            <i class="fas fa-user input-icon"></i>
            <input
              type="text"
              id="name"
              v-model="bookingForm.name"
              required
              placeholder="Enter your full name"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email *</label>
          <div class="input-with-icon">
            <i class="fas fa-envelope input-icon"></i>
            <input
              type="email"
              id="email"
              v-model="bookingForm.email"
              required
              placeholder="Enter your email address"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="phone">Phone Number *</label>
          <div class="input-with-icon">
            <i class="fas fa-phone input-icon"></i>
            <input
              type="tel"
              id="phone"
              v-model="bookingForm.phone"
              required
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="location">Your Location *</label>
          <div class="location-input-group">
            <div class="input-with-icon">
              <i class="fas fa-map-marker-alt input-icon"></i>
              <input
                id="location"
                v-model="bookingForm.location"
                type="text"
                placeholder="Enter your address or use current location"
                required
              />
            </div>
            <button
              type="button"
              @click="getCurrentLocation"
              class="location-btn"
              :disabled="locationLoading"
            >
              <span v-if="locationLoading">📍</span>
              <span v-else>🎯</span>
            </button>
          </div>
          <div v-if="locationError" class="location-error">
            {{ locationError }}
          </div>
          <div v-if="locationSuccess" class="location-success">
            ✅ Location detected successfully!
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="gender">Gender *</label>
            <div class="input-with-icon">
              <i class="fas fa-venus-mars input-icon"></i>
              <select id="gender" v-model="bookingForm.gender" required>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="age">Age *</label>
            <div class="input-with-icon">
              <i class="fas fa-birthday-cake input-icon"></i>
              <input
                type="number"
                id="age"
                v-model="bookingForm.age"
                required
                min="1"
                max="120"
                placeholder="Enter your age"
              />
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="date">Preferred Date *</label>
            <div class="input-with-icon">
              <i class="fas fa-calendar-alt input-icon"></i>
              <input
                type="date"
                id="date"
                v-model="bookingForm.date"
                required
                :min="minDate"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="time">Preferred Time *</label>
            <div class="input-with-icon">
              <i class="fas fa-clock input-icon"></i>
              <select id="time" v-model="bookingForm.time" required>
                <option value="">Select time</option>
                <option v-for="time in availableTimes" :key="time" :value="time">
                  {{ time }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="notes">Additional Notes</label>
          <div class="input-with-icon">
            <i class="fas fa-sticky-note input-icon"></i>
            <textarea
              id="notes"
              v-model="bookingForm.notes"
              rows="4"
              placeholder="Any special requests or notes..."
            ></textarea>
          </div>
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
import PageNavigation from '@/components/PageNavigation.vue'

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
  gender: '',
  age: '',
  date: '',
  time: '',
  stylist: '',
  notes: ''
})

// Location tracking
const locationLoading = ref(false)
const locationError = ref('')
const locationSuccess = ref(false)

// Available times
const availableTimes = ref([
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
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
         bookingForm.value.gender &&
         bookingForm.value.age &&
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

const getCurrentLocation = () => {
  locationLoading.value = true
  locationError.value = ''
  locationSuccess.value = false

  if (!navigator.geolocation) {
    locationError.value = 'Geolocation is not supported by this browser.'
    locationLoading.value = false
    return
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords

        // Use reverse geocoding to get address (using a free service)
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        )

        if (response.ok) {
          const data = await response.json()
          const address = `${data.locality}, ${data.principalSubdivision}, ${data.countryName}`
          bookingForm.value.location = address
          locationSuccess.value = true

          // Clear success message after 3 seconds
          setTimeout(() => {
            locationSuccess.value = false
          }, 3000)
        } else {
          // Fallback to coordinates if reverse geocoding fails
          bookingForm.value.location = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
          locationSuccess.value = true
        }
      } catch (error) {
        locationError.value = 'Failed to get address. Please enter manually.'
        console.error('Geocoding error:', error)
      } finally {
        locationLoading.value = false
      }
    },
    (error) => {
      let errorMessage = 'Unable to retrieve your location. '

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += 'Location access denied by user.'
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage += 'Location information is unavailable.'
          break
        case error.TIMEOUT:
          errorMessage += 'Location request timed out.'
          break
        default:
          errorMessage += 'An unknown error occurred.'
          break
      }

      locationError.value = errorMessage
      locationLoading.value = false
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    }
  )
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

/* Location Input Styles */
.location-input-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.location-input-group input {
  flex: 1;
}

.location-btn {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  border: none;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2rem;
  min-width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.location-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.location-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.location-error {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 4px;
  border-left: 3px solid #e74c3c;
}

.location-success {
  color: #27ae60;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(39, 174, 96, 0.1);
  border-radius: 4px;
  border-left: 3px solid #27ae60;
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
