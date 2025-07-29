<template>
  <div class="reviews-page">
    <PageNavigation />
    
    <div class="container">
      <div class="page-header">
        <h1>Customer Reviews</h1>
        <div class="stats">
          <div class="stat">
            <span class="stat-number">{{ totalReviews }}</span>
            <span class="stat-label">Total Reviews</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ averageRating }}</span>
            <span class="stat-label">Average Rating</span>
          </div>
        </div>
      </div>

      <div class="filters">
        <select v-model="ratingFilter" @change="filterReviews">
          <option value="">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
        
        <select v-model="stylistFilter" @change="filterReviews">
          <option value="">All Stylists</option>
          <option v-for="stylist in stylists" :key="stylist._id" :value="stylist._id">
            {{ stylist.firstName }} {{ stylist.lastName }}
          </option>
        </select>
        
        <select v-model="sortBy" @change="sortReviews">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading reviews...</p>
      </div>

      <div v-else-if="filteredReviews.length === 0" class="empty-state">
        <div class="empty-icon">⭐</div>
        <h2>No reviews found</h2>
        <p v-if="ratingFilter || stylistFilter">Try adjusting your filters</p>
        <p v-else>No reviews have been submitted yet</p>
      </div>

      <div v-else class="reviews-container">
        <div class="rating-distribution">
          <h3>Rating Distribution</h3>
          <div class="rating-bars">
            <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="rating-bar">
              <span class="rating-label">{{ rating }} ⭐</span>
              <div class="bar-container">
                <div 
                  class="bar-fill" 
                  :style="{ width: getRatingPercentage(rating) + '%' }"
                ></div>
              </div>
              <span class="rating-count">{{ getRatingCount(rating) }}</span>
            </div>
          </div>
        </div>

        <div class="reviews-list">
          <div v-for="review in paginatedReviews" :key="review._id" class="review-card">
            <div class="review-header">
              <div class="customer-info">
                <div class="avatar">
                  <img v-if="review.customer?.profileImage" 
                       :src="review.customer.profileImage" 
                       :alt="review.customer.firstName">
                  <div v-else class="avatar-placeholder">
                    {{ review.customer?.firstName?.charAt(0) }}{{ review.customer?.lastName?.charAt(0) }}
                  </div>
                </div>
                <div class="customer-details">
                  <h4>{{ review.customer?.firstName }} {{ review.customer?.lastName }}</h4>
                  <p class="review-date">{{ formatDate(review.reviewDate) }}</p>
                </div>
              </div>
              <div class="rating-display">
                <div class="stars">
                  <span v-for="star in 5" :key="star" 
                        :class="['star', { filled: star <= review.rating }]">
                    ⭐
                  </span>
                </div>
                <span class="rating-number">{{ review.rating }}/5</span>
              </div>
            </div>

            <div class="service-info">
              <span class="service-name">{{ review.serviceSnapshot?.name }}</span>
              <span class="stylist-name">with {{ review.stylistSnapshot?.name }}</span>
              <span class="booking-date">on {{ formatDate(review.date) }}</span>
            </div>

            <div v-if="review.comment" class="review-comment">
              <p>{{ review.comment }}</p>
            </div>

            <div class="review-actions">
              <button v-if="canReply(review)" 
                      @click="openReplyModal(review)" 
                      class="reply-btn">
                <i class="fas fa-reply"></i>
                Reply
              </button>
              
              <button v-if="canReport(review)" 
                      @click="reportReview(review)" 
                      class="report-btn">
                <i class="fas fa-flag"></i>
                Report
              </button>
            </div>

            <!-- Stylist Reply -->
            <div v-if="review.stylistReply" class="stylist-reply">
              <div class="reply-header">
                <strong>{{ review.stylistSnapshot?.name }} replied:</strong>
                <span class="reply-date">{{ formatDate(review.stylistReply.date) }}</span>
              </div>
              <p>{{ review.stylistReply.comment }}</p>
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

    <!-- Reply Modal -->
    <div v-if="showReplyModal" class="modal-overlay" @click="closeReplyModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Reply to Review</h3>
          <button @click="closeReplyModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-content">
          <div class="review-summary">
            <p><strong>Customer:</strong> {{ selectedReview?.customer?.firstName }} {{ selectedReview?.customer?.lastName }}</p>
            <p><strong>Rating:</strong> {{ selectedReview?.rating }}/5 ⭐</p>
            <p><strong>Comment:</strong> {{ selectedReview?.comment }}</p>
          </div>
          <div class="reply-input">
            <label>Your Reply:</label>
            <textarea v-model="replyForm.comment" 
                      placeholder="Write your professional response..."
                      rows="4"></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeReplyModal" class="btn secondary">Cancel</button>
          <button @click="submitReply" class="btn primary" :disabled="!replyForm.comment.trim()">
            Submit Reply
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
import { bookingAPI, stylistAPI } from '../services/api.js'

const router = useRouter()

// Reactive data
const reviews = ref([])
const stylists = ref([])
const loading = ref(true)
const ratingFilter = ref('')
const stylistFilter = ref('')
const sortBy = ref('newest')
const currentPage = ref(1)
const itemsPerPage = 10

// Reply modal
const showReplyModal = ref(false)
const selectedReview = ref(null)
const replyForm = ref({
  comment: ''
})

// Computed properties
const filteredReviews = computed(() => {
  let filtered = reviews.value

  if (ratingFilter.value) {
    filtered = filtered.filter(review => review.rating === parseInt(ratingFilter.value))
  }

  if (stylistFilter.value) {
    filtered = filtered.filter(review => review.stylist === stylistFilter.value)
  }

  return filtered
})

const sortedReviews = computed(() => {
  const sorted = [...filteredReviews.value]
  
  switch (sortBy.value) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate))
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.reviewDate) - new Date(b.reviewDate))
    case 'highest':
      return sorted.sort((a, b) => b.rating - a.rating)
    case 'lowest':
      return sorted.sort((a, b) => a.rating - b.rating)
    default:
      return sorted
  }
})

const paginatedReviews = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return sortedReviews.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(sortedReviews.value.length / itemsPerPage)
})

const totalReviews = computed(() => {
  return reviews.value.length
})

const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((acc, review) => acc + review.rating, 0)
  return (sum / reviews.value.length).toFixed(1)
})

// Methods
const loadReviews = async () => {
  try {
    loading.value = true
    // Get all bookings with reviews
    const response = await bookingAPI.getAll({ hasReview: true })
    reviews.value = response.data.filter(booking => booking.review && booking.review.rating)
  } catch (error) {
    console.error('Error loading reviews:', error)
    alert('Failed to load reviews')
  } finally {
    loading.value = false
  }
}

const loadStylists = async () => {
  try {
    const response = await stylistAPI.getAll()
    stylists.value = response.data
  } catch (error) {
    console.error('Error loading stylists:', error)
  }
}

const filterReviews = () => {
  currentPage.value = 1
}

const sortReviews = () => {
  currentPage.value = 1
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getRatingCount = (rating) => {
  return reviews.value.filter(review => review.rating === rating).length
}

const getRatingPercentage = (rating) => {
  if (reviews.value.length === 0) return 0
  const count = getRatingCount(rating)
  return (count / reviews.value.length) * 100
}

const canReply = (review) => {
  // Only stylists can reply to their own reviews
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.role === 'barber' && review.stylist === user.id && !review.stylistReply
}

const canReport = (review) => {
  // Any logged-in user can report a review
  return localStorage.getItem('isLoggedIn') === 'true'
}

const openReplyModal = (review) => {
  selectedReview.value = review
  replyForm.value = { comment: '' }
  showReplyModal.value = true
}

const closeReplyModal = () => {
  showReplyModal.value = false
  selectedReview.value = null
}

const submitReply = async () => {
  try {
    await bookingAPI.replyToReview(selectedReview.value._id, replyForm.value)
    closeReplyModal()
    await loadReviews()
    alert('Reply submitted successfully!')
  } catch (error) {
    console.error('Error submitting reply:', error)
    alert('Failed to submit reply')
  }
}

const reportReview = async (review) => {
  const reason = prompt('Please provide a reason for reporting this review:')
  if (!reason) return

  try {
    await bookingAPI.reportReview(review._id, { reason })
    alert('Review reported successfully. Our team will review it.')
  } catch (error) {
    console.error('Error reporting review:', error)
    alert('Failed to report review')
  }
}

// Initialize
onMounted(async () => {
  await Promise.all([loadReviews(), loadStylists()])
})
</script>

<style scoped>
.reviews-page {
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

.stats {
  display: flex;
  gap: 2rem;
}

.stat {
  text-align: center;
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

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filters select {
  padding: 0.5rem 1rem;
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: 8px;
  background: rgba(244, 228, 188, 0.1);
  color: #f4e4bc;
  font-size: 0.9rem;
}

.filters select:focus {
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

.rating-distribution {
  background: rgba(244, 228, 188, 0.05);
  border: 2px solid rgba(212, 175, 55, 0.2);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.rating-distribution h3 {
  margin: 0 0 1rem;
  color: #d4af37;
}

.rating-bars {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.rating-label {
  min-width: 60px;
  font-size: 0.9rem;
}

.bar-container {
  flex: 1;
  height: 20px;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  transition: width 0.3s ease;
}

.rating-count {
  min-width: 30px;
  text-align: right;
  font-size: 0.9rem;
  opacity: 0.8;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-card {
  background: rgba(244, 228, 188, 0.05);
  border: 2px solid rgba(212, 175, 55, 0.2);
  border-radius: 15px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.review-card:hover {
  border-color: rgba(212, 175, 55, 0.4);
  transform: translateY(-2px);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #d4af37;
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
  font-size: 1rem;
}

.customer-details h4 {
  margin: 0 0 0.25rem;
  color: #d4af37;
}

.review-date {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.rating-display {
  text-align: right;
}

.stars {
  margin-bottom: 0.25rem;
}

.star {
  font-size: 1.2rem;
  opacity: 0.3;
}

.star.filled {
  opacity: 1;
}

.rating-number {
  font-size: 0.9rem;
  font-weight: 600;
  color: #d4af37;
}

.service-info {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  opacity: 0.8;
}

.service-name {
  font-weight: 600;
  color: #d4af37;
}

.review-comment {
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 8px;
  border-left: 4px solid #d4af37;
}

.review-comment p {
  margin: 0;
  line-height: 1.6;
}

.review-actions {
  display: flex;
  gap: 0.5rem;
}

.reply-btn,
.report-btn {
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

.reply-btn {
  background: #d4af37;
  color: #2c2c2c;
}

.report-btn {
  background: rgba(244, 228, 188, 0.2);
  color: #f4e4bc;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.reply-btn:hover,
.report-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.stylist-reply {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(116, 185, 255, 0.1);
  border-radius: 8px;
  border-left: 4px solid #74b9ff;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.reply-header strong {
  color: #74b9ff;
}

.reply-date {
  font-size: 0.8rem;
  opacity: 0.8;
}

.stylist-reply p {
  margin: 0;
  line-height: 1.6;
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

.review-summary {
  background: rgba(244, 228, 188, 0.1);
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.reply-input label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #d4af37;
}

.reply-input textarea {
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

.reply-input textarea:focus {
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

  .stats {
    align-self: stretch;
    justify-content: space-around;
  }

  .filters {
    width: 100%;
  }

  .filters select {
    flex: 1;
    min-width: 120px;
  }

  .review-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .rating-display {
    text-align: left;
  }

  .review-actions {
    justify-content: space-between;
  }

  .reply-btn,
  .report-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
