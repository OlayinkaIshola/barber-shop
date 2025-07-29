<template>
  <div class="customer-dashboard">
    <div class="dashboard-header">
      <div class="header-content">
        <div class="user-info">
          <div class="avatar">
            <img v-if="user?.profileImage" :src="user.profileImage" :alt="user.firstName">
            <div v-else class="avatar-placeholder">
              {{ user?.firstName?.charAt(0) }}{{ user?.lastName?.charAt(0) }}
            </div>
          </div>
          <div class="user-details">
            <h1>Welcome back, {{ user?.firstName }}!</h1>
            <p>{{ user?.email }}</p>
          </div>
        </div>
        <div class="quick-actions">
          <button @click="$router.push('/services')" class="action-btn primary">
            <i class="fas fa-plus"></i>
            Book Appointment
          </button>
          <button @click="$router.push('/stylists')" class="action-btn secondary">
            <i class="fas fa-users"></i>
            Browse Stylists
          </button>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-info">
            <h3>{{ stats.totalBookings }}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <h3>{{ stats.completedBookings }}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <h3>${{ stats.totalSpent }}</h3>
            <p>Total Spent</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-info">
            <h3>{{ stats.averageRating }}</h3>
            <p>Avg Rating Given</p>
          </div>
        </div>
      </div>

      <div class="dashboard-sections">
        <div class="section">
          <div class="section-header">
            <h2>Recent Bookings</h2>
            <button @click="viewAllBookings" class="view-all-btn">View All</button>
          </div>
          <div v-if="recentBookings.length === 0" class="empty-state">
            <div class="empty-icon">📅</div>
            <h3>No bookings yet</h3>
            <p>Book your first appointment to get started!</p>
            <button @click="$router.push('/services')" class="cta-btn">Book Now</button>
          </div>
          <div v-else class="bookings-list">
            <div v-for="booking in recentBookings" :key="booking._id" class="booking-card">
              <div class="booking-info">
                <div class="service-name">{{ booking.serviceSnapshot?.name }}</div>
                <div class="booking-details">
                  <span class="stylist">with {{ booking.stylistSnapshot?.name }}</span>
                  <span class="date">{{ formatDate(booking.date) }} at {{ booking.time }}</span>
                </div>
              </div>
              <div class="booking-status">
                <span :class="['status-badge', booking.status]">{{ booking.status }}</span>
                <span class="amount">${{ booking.totalAmount }}</span>
              </div>
              <div class="booking-actions">
                <button v-if="booking.status === 'completed' && !booking.review" 
                        @click="openReviewModal(booking)" 
                        class="action-btn small">
                  <i class="fas fa-star"></i>
                  Review
                </button>
                <button v-if="canCancelBooking(booking)" 
                        @click="cancelBooking(booking._id)" 
                        class="action-btn small danger">
                  <i class="fas fa-times"></i>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <h2>Favorite Stylists</h2>
          </div>
          <div v-if="favoriteStylists.length === 0" class="empty-state">
            <div class="empty-icon">💇‍♂️</div>
            <h3>No favorite stylists yet</h3>
            <p>Book with stylists to add them to your favorites!</p>
          </div>
          <div v-else class="stylists-grid">
            <div v-for="stylist in favoriteStylists" :key="stylist._id" class="stylist-card">
              <div class="stylist-avatar">
                <img v-if="stylist.profileImage" :src="stylist.profileImage" :alt="stylist.name">
                <div v-else class="avatar-placeholder">{{ stylist.name.charAt(0) }}</div>
              </div>
              <div class="stylist-info">
                <h4>{{ stylist.name }}</h4>
                <div class="rating">
                  <span class="stars">⭐ {{ stylist.rating }}</span>
                  <span class="bookings">({{ stylist.totalBookings }} bookings)</span>
                </div>
              </div>
              <button @click="bookWithStylist(stylist)" class="book-btn">Book</button>
            </div>
          </div>
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
import { bookingAPI, authAPI } from '../services/api.js'

const router = useRouter()

// Reactive data
const user = ref(null)
const recentBookings = ref([])
const favoriteStylists = ref([])
const stats = ref({
  totalBookings: 0,
  completedBookings: 0,
  totalSpent: 0,
  averageRating: 0
})

// Review modal
const showReviewModal = ref(false)
const selectedBooking = ref(null)
const reviewForm = ref({
  rating: 0,
  comment: ''
})

// Load user data
const loadUserData = async () => {
  try {
    const response = await authAPI.getMe()
    user.value = response.data
  } catch (error) {
    console.error('Error loading user data:', error)
    router.push('/login')
  }
}

// Load bookings
const loadBookings = async () => {
  try {
    const response = await bookingAPI.getMyBookings()
    const bookings = response.data

    recentBookings.value = bookings.slice(0, 5)
    
    // Calculate stats
    stats.value = {
      totalBookings: bookings.length,
      completedBookings: bookings.filter(b => b.status === 'completed').length,
      totalSpent: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      averageRating: 4.5 // Calculate from reviews when implemented
    }

    // Extract favorite stylists (most booked)
    const stylistCounts = {}
    bookings.forEach(booking => {
      if (booking.stylistSnapshot) {
        const stylistId = booking.stylist
        if (!stylistCounts[stylistId]) {
          stylistCounts[stylistId] = {
            ...booking.stylistSnapshot,
            _id: stylistId,
            totalBookings: 0
          }
        }
        stylistCounts[stylistId].totalBookings++
      }
    })

    favoriteStylists.value = Object.values(stylistCounts)
      .sort((a, b) => b.totalBookings - a.totalBookings)
      .slice(0, 3)

  } catch (error) {
    console.error('Error loading bookings:', error)
  }
}

// Utility functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const canCancelBooking = (booking) => {
  const bookingDate = new Date(booking.date)
  const now = new Date()
  const hoursDiff = (bookingDate - now) / (1000 * 60 * 60)
  
  return ['pending', 'confirmed'].includes(booking.status) && hoursDiff > 24
}

// Actions
const viewAllBookings = () => {
  router.push('/booking-history')
}

const bookWithStylist = (stylist) => {
  router.push({
    path: '/booking',
    query: { stylist: stylist._id }
  })
}

const cancelBooking = async (bookingId) => {
  if (!confirm('Are you sure you want to cancel this booking?')) return

  try {
    await bookingAPI.cancel(bookingId, 'Cancelled by customer')
    await loadBookings()
    alert('Booking cancelled successfully')
  } catch (error) {
    console.error('Error cancelling booking:', error)
    alert('Failed to cancel booking')
  }
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
onMounted(async () => {
  await loadUserData()
  await loadBookings()
})
</script>

<style scoped>
.customer-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f4e4bc 0%, #f0d49c 100%);
}

.dashboard-header {
  background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%);
  color: #f4e4bc;
  padding: 2rem;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #d4af37;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #d4af37;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #2c2c2c;
  font-size: 1.2rem;
}

.user-details h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #d4af37;
}

.user-details p {
  margin: 0.5rem 0 0;
  opacity: 0.8;
}

.quick-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn.primary {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  color: #2c2c2c;
}

.action-btn.secondary {
  background: transparent;
  color: #f4e4bc;
  border: 2px solid #d4af37;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(44, 44, 44, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 2px solid rgba(212, 175, 55, 0.1);
}

.stat-icon {
  font-size: 2rem;
}

.stat-info h3 {
  margin: 0;
  font-size: 1.8rem;
  color: #2c2c2c;
}

.stat-info p {
  margin: 0.25rem 0 0;
  color: #666;
  font-size: 0.9rem;
}

.dashboard-sections {
  display: grid;
  gap: 2rem;
}

.section {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 5px 15px rgba(44, 44, 44, 0.1);
  border: 2px solid rgba(212, 175, 55, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(212, 175, 55, 0.2);
}

.section-header h2 {
  margin: 0;
  color: #2c2c2c;
}

.view-all-btn {
  background: none;
  border: none;
  color: #d4af37;
  cursor: pointer;
  font-weight: 600;
  text-decoration: underline;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem;
  color: #2c2c2c;
}

.cta-btn {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  color: #2c2c2c;
  border: none;
  padding: 0.75rem 2rem;
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

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.booking-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(244, 228, 188, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.booking-info {
  flex: 1;
}

.service-name {
  font-weight: 600;
  color: #2c2c2c;
  margin-bottom: 0.25rem;
}

.booking-details {
  font-size: 0.9rem;
  color: #666;
}

.booking-details span {
  margin-right: 1rem;
}

.booking-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
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

.amount {
  font-weight: 600;
  color: #d4af37;
}

.booking-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn.small {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
}

.action-btn.danger {
  background: #e17055;
  color: white;
}

.stylists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.stylist-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(244, 228, 188, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.stylist-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #d4af37;
}

.stylist-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stylist-info {
  flex: 1;
}

.stylist-info h4 {
  margin: 0 0 0.25rem;
  color: #2c2c2c;
}

.rating {
  font-size: 0.9rem;
  color: #666;
}

.book-btn {
  background: #d4af37;
  color: #2c2c2c;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.book-btn:hover {
  background: #f4e4bc;
  transform: translateY(-1px);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 15px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #2c2c2c;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-content {
  padding: 1.5rem;
}

.booking-summary {
  background: rgba(244, 228, 188, 0.1);
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
}

.rating-input {
  margin-bottom: 1.5rem;
}

.rating-input label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c2c2c;
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
  color: #2c2c2c;
}

.comment-input textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: 8px;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #eee;
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
  background: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .booking-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .booking-actions {
    align-self: stretch;
    justify-content: space-between;
  }
}
</style>
