<template>
  <div class="booking-history">
    <PageNavigation />
    
    <div class="container">
      <div class="page-header">
        <h1>Booking History</h1>
        <div class="filters">
          <select v-model="statusFilter" @change="filterBookings">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input 
            type="date" 
            v-model="dateFilter" 
            @change="filterBookings"
            class="date-filter"
          >
        </div>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading your bookings...</p>
      </div>

      <div v-else-if="filteredBookings.length === 0" class="empty-state">
        <div class="empty-icon">📅</div>
        <h2>No bookings found</h2>
        <p v-if="statusFilter || dateFilter">Try adjusting your filters</p>
        <p v-else>You haven't made any bookings yet</p>
        <button @click="$router.push('/services')" class="cta-btn">Book Your First Appointment</button>
      </div>

      <div v-else class="bookings-container">
        <div class="bookings-stats">
          <div class="stat">
            <span class="stat-number">{{ bookings.length }}</span>
            <span class="stat-label">Total Bookings</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ completedBookings }}</span>
            <span class="stat-label">Completed</span>
          </div>
          <div class="stat">
            <span class="stat-number">${{ totalSpent }}</span>
            <span class="stat-label">Total Spent</span>
          </div>
        </div>

        <div class="bookings-list">
          <div v-for="booking in paginatedBookings" :key="booking._id" class="booking-card">
            <div class="booking-header">
              <div class="service-info">
                <h3>{{ booking.serviceSnapshot?.name || 'Service' }}</h3>
                <p class="service-description">{{ booking.serviceSnapshot?.description }}</p>
              </div>
              <div class="booking-status">
                <span :class="['status-badge', booking.status]">{{ booking.status }}</span>
                <span class="booking-id">#{{ booking._id.slice(-6) }}</span>
              </div>
            </div>

            <div class="booking-details">
              <div class="detail-row">
                <div class="detail-item">
                  <i class="fas fa-user"></i>
                  <span>{{ booking.stylistSnapshot?.name || 'Stylist' }}</span>
                </div>
                <div class="detail-item">
                  <i class="fas fa-calendar"></i>
                  <span>{{ formatDate(booking.date) }}</span>
                </div>
                <div class="detail-item">
                  <i class="fas fa-clock"></i>
                  <span>{{ booking.time }}</span>
                </div>
                <div class="detail-item">
                  <i class="fas fa-dollar-sign"></i>
                  <span>${{ booking.totalAmount }}</span>
                </div>
              </div>

              <div v-if="booking.notes" class="booking-notes">
                <i class="fas fa-sticky-note"></i>
                <span>{{ booking.notes }}</span>
              </div>

              <div v-if="booking.paymentMethod" class="payment-info">
                <i class="fas fa-credit-card"></i>
                <span>{{ formatPaymentMethod(booking.paymentMethod) }}</span>
                <span :class="['payment-status', booking.paymentStatus]">
                  {{ formatPaymentStatus(booking.paymentStatus) }}
                </span>
              </div>
            </div>

            <div class="booking-actions">
              <button v-if="booking.status === 'completed' && !booking.review" 
                      @click="openReviewModal(booking)" 
                      class="action-btn review">
                <i class="fas fa-star"></i>
                Leave Review
              </button>
              
              <button v-if="canReschedule(booking)" 
                      @click="rescheduleBooking(booking)" 
                      class="action-btn reschedule">
                <i class="fas fa-calendar-alt"></i>
                Reschedule
              </button>
              
              <button v-if="canCancel(booking)" 
                      @click="cancelBooking(booking)" 
                      class="action-btn cancel">
                <i class="fas fa-times"></i>
                Cancel
              </button>
              
              <button @click="viewBookingDetails(booking)" 
                      class="action-btn details">
                <i class="fas fa-eye"></i>
                View Details
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button @click="currentPage--" :disabled="currentPage === 1" class="page-btn">
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <span class="page-info">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          
          <button @click="currentPage++" :disabled="currentPage === totalPages" class="page-btn">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Review Modal -->
    <div v-if="showReviewModal" class="modal-overlay" @click="closeReviewModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Rate Your Experience</h3>
          <button @click="closeReviewModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-content">
          <div class="booking-summary">
            <p><strong>Service:</strong> {{ selectedBooking?.serviceSnapshot?.name }}</p>
            <p><strong>Stylist:</strong> {{ selectedBooking?.stylistSnapshot?.name }}</p>
            <p><strong>Date:</strong> {{ formatDate(selectedBooking?.date) }}</p>
          </div>
          <div class="rating-input">
            <label>Rating:</label>
            <div class="stars-input">
              <span v-for="star in 5" :key="star" 
                    @click="reviewForm.rating = star"
                    :class="['star', { active: star <= reviewForm.rating }]">
                ⭐
              </span>
            </div>
          </div>
          <div class="comment-input">
            <label>Comment (optional):</label>
            <textarea v-model="reviewForm.comment" 
                      placeholder="Share your experience..."
                      rows="4"></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeReviewModal" class="btn secondary">Cancel</button>
          <button @click="submitReview" class="btn primary" :disabled="!reviewForm.rating">
            Submit Review
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageNavigation from '@/components/PageNavigation.vue'
import { bookingAPI } from '../services/api.js'

const router = useRouter()

// Reactive data
const bookings = ref([])
const loading = ref(true)
const statusFilter = ref('')
const dateFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

// Review modal
const showReviewModal = ref(false)
const selectedBooking = ref(null)
const reviewForm = ref({
  rating: 0,
  comment: ''
})

// Computed properties
const filteredBookings = computed(() => {
  let filtered = bookings.value

  if (statusFilter.value) {
    filtered = filtered.filter(booking => booking.status === statusFilter.value)
  }

  if (dateFilter.value) {
    const filterDate = new Date(dateFilter.value)
    filtered = filtered.filter(booking => {
      const bookingDate = new Date(booking.date)
      return bookingDate.toDateString() === filterDate.toDateString()
    })
  }

  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
})

const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredBookings.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredBookings.value.length / itemsPerPage)
})

const completedBookings = computed(() => {
  return bookings.value.filter(b => b.status === 'completed').length
})

const totalSpent = computed(() => {
  return bookings.value
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0)
})

// Methods
const loadBookings = async () => {
  try {
    loading.value = true
    const response = await bookingAPI.getMyBookings()
    bookings.value = response.data
  } catch (error) {
    console.error('Error loading bookings:', error)
    alert('Failed to load booking history')
  } finally {
    loading.value = false
  }
}

const filterBookings = () => {
  currentPage.value = 1
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatPaymentMethod = (method) => {
  const methods = {
    'card': 'Credit Card',
    'bank_transfer': 'Bank Transfer',
    'cash': 'Cash',
    'pending': 'Pending'
  }
  return methods[method] || method
}

const formatPaymentStatus = (status) => {
  const statuses = {
    'pending': 'Pending',
    'completed': 'Paid',
    'failed': 'Failed',
    'refunded': 'Refunded',
    'pending_bank_transfer': 'Awaiting Transfer'
  }
  return statuses[status] || status
}

const canReschedule = (booking) => {
  const bookingDate = new Date(booking.date)
  const now = new Date()
  const hoursDiff = (bookingDate - now) / (1000 * 60 * 60)
  
  return ['pending', 'confirmed'].includes(booking.status) && hoursDiff > 24
}

const canCancel = (booking) => {
  const bookingDate = new Date(booking.date)
  const now = new Date()
  const hoursDiff = (bookingDate - now) / (1000 * 60 * 60)
  
  return ['pending', 'confirmed'].includes(booking.status) && hoursDiff > 24
}

const rescheduleBooking = (booking) => {
  router.push({
    path: '/booking',
    query: {
      reschedule: booking._id,
      service: booking.service,
      stylist: booking.stylist
    }
  })
}

const cancelBooking = async (booking) => {
  if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
    return
  }

  try {
    await bookingAPI.cancel(booking._id, 'Cancelled by customer')
    await loadBookings()
    alert('Booking cancelled successfully')
  } catch (error) {
    console.error('Error cancelling booking:', error)
    alert('Failed to cancel booking')
  }
}

const viewBookingDetails = (booking) => {
  router.push(`/booking-details/${booking._id}`)
}

const openReviewModal = (booking) => {
  selectedBooking.value = booking
  reviewForm.value = { rating: 0, comment: '' }
  showReviewModal.value = true
}

const closeReviewModal = () => {
  showReviewModal.value = false
  selectedBooking.value = null
}

const submitReview = async () => {
  try {
    await bookingAPI.addReview(selectedBooking.value._id, reviewForm.value)
    closeReviewModal()
    await loadBookings()
    alert('Review submitted successfully!')
  } catch (error) {
    console.error('Error submitting review:', error)
    alert('Failed to submit review')
  }
}

// Initialize
onMounted(() => {
  loadBookings()
})
</script>

<style scoped>
.booking-history {
  min-height: 100vh;
  background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%);
  color: #f4e4bc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(212, 175, 55, 0.3);
}

.page-header h1 {
  margin: 0;
  color: #d4af37;
  font-size: 2.5rem;
}

.filters {
  display: flex;
  gap: 1rem;
}

.filters select,
.date-filter {
  padding: 0.5rem 1rem;
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: 8px;
  background: rgba(244, 228, 188, 0.1);
  color: #f4e4bc;
  font-size: 0.9rem;
}

.filters select:focus,
.date-filter:focus {
  outline: none;
  border-color: #d4af37;
}

.loading {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(212, 175, 55, 0.3);
  border-top: 4px solid #d4af37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  margin: 0 0 1rem;
  color: #d4af37;
}

.cta-btn {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  color: #2c2c2c;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
}

.bookings-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat {
  background: rgba(244, 228, 188, 0.1);
  padding: 1.5rem;
  border-radius: 10px;
  text-align: center;
  border: 2px solid rgba(212, 175, 55, 0.2);
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #d4af37;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.booking-card {
  background: rgba(244, 228, 188, 0.05);
  border: 2px solid rgba(212, 175, 55, 0.2);
  border-radius: 15px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.booking-card:hover {
  border-color: rgba(212, 175, 55, 0.4);
  transform: translateY(-2px);
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.service-info h3 {
  margin: 0 0 0.5rem;
  color: #d4af37;
  font-size: 1.3rem;
}

.service-description {
  margin: 0;
  opacity: 0.8;
  font-size: 0.9rem;
}

.booking-status {
  text-align: right;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.status-badge.pending {
  background: #ffeaa7;
  color: #d63031;
}

.status-badge.confirmed {
  background: #81ecec;
  color: #00b894;
}

.status-badge.completed {
  background: #55a3ff;
  color: white;
}

.status-badge.cancelled {
  background: #fab1a0;
  color: #e17055;
}

.booking-id {
  display: block;
  font-size: 0.8rem;
  opacity: 0.6;
}

.booking-details {
  margin-bottom: 1rem;
}

.detail-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.detail-item i {
  color: #d4af37;
  width: 16px;
}

.booking-notes,
.payment-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 8px;
}

.payment-status {
  margin-left: auto;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
}

.payment-status.completed {
  background: #55a3ff;
  color: white;
}

.payment-status.pending {
  background: #ffeaa7;
  color: #d63031;
}

.booking-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.action-btn.review {
  background: #d4af37;
  color: #2c2c2c;
}

.action-btn.reschedule {
  background: #74b9ff;
  color: white;
}

.action-btn.cancel {
  background: #e17055;
  color: white;
}

.action-btn.details {
  background: rgba(244, 228, 188, 0.2);
  color: #f4e4bc;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  background: rgba(244, 228, 188, 0.1);
  border: 2px solid rgba(212, 175, 55, 0.3);
  color: #f4e4bc;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: #d4af37;
  background: rgba(212, 175, 55, 0.1);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-weight: 600;
  color: #d4af37;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #2c2c2c;
  border-radius: 15px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  border: 2px solid rgba(212, 175, 55, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

.modal-header h3 {
  margin: 0;
  color: #d4af37;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #f4e4bc;
}

.modal-content {
  padding: 1.5rem;
}

.booking-summary {
  background: rgba(244, 228, 188, 0.1);
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.rating-input {
  margin-bottom: 1.5rem;
}

.rating-input label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #d4af37;
}

.stars-input {
  display: flex;
  gap: 0.25rem;
}

.star {
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.3;
  transition: opacity 0.2s;
}

.star.active {
  opacity: 1;
}

.comment-input label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #d4af37;
}

.comment-input textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: 8px;
  background: rgba(244, 228, 188, 0.1);
  color: #f4e4bc;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
}

.comment-input textarea:focus {
  outline: none;
  border-color: #d4af37;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(212, 175, 55, 0.2);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn.primary {
  background: #d4af37;
  color: #2c2c2c;
}

.btn.secondary {
  background: rgba(244, 228, 188, 0.1);
  color: #f4e4bc;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .filters {
    width: 100%;
    justify-content: space-between;
  }

  .detail-row {
    grid-template-columns: 1fr;
  }

  .booking-actions {
    justify-content: space-between;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
