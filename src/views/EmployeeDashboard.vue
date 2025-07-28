<template>
  <div class="employee-dashboard">
    <PageNavigation />
    
    <div class="dashboard-container">
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="welcome-section">
          <h1>Welcome back, {{ employeeData.name }}!</h1>
          <p>{{ employeeData.title }} • {{ employeeData.experience }} years experience</p>
          <div class="header-stats">
            <div class="stat-item">
              <i class="fas fa-calendar-check"></i>
              <div>
                <span class="stat-number">{{ todayBookings.length }}</span>
                <span class="stat-label">Today's Bookings</span>
              </div>
            </div>
            <div class="stat-item">
              <i class="fas fa-clock"></i>
              <div>
                <span class="stat-number">{{ upcomingBookings.length }}</span>
                <span class="stat-label">Upcoming</span>
              </div>
            </div>
            <div class="stat-item">
              <i class="fas fa-star"></i>
              <div>
                <span class="stat-number">{{ employeeData.rating }}</span>
                <span class="stat-label">Rating</span>
              </div>
            </div>
          </div>
        </div>
        <div class="profile-section">
          <div class="profile-image">
            <img :src="employeeData.image" :alt="employeeData.name" />
          </div>
          <button @click="editProfile" class="edit-profile-btn">
            <i class="fas fa-edit"></i>
            Edit Profile
          </button>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <button @click="viewTodaySchedule" class="action-btn primary">
            <i class="fas fa-calendar-day"></i>
            <span>Today's Schedule</span>
          </button>
          <button @click="viewAllBookings" class="action-btn">
            <i class="fas fa-calendar-alt"></i>
            <span>All Bookings</span>
          </button>
          <button @click="updateAvailability" class="action-btn">
            <i class="fas fa-clock"></i>
            <span>Update Availability</span>
          </button>
          <button @click="viewEarnings" class="action-btn">
            <i class="fas fa-dollar-sign"></i>
            <span>View Earnings</span>
          </button>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="filter-section">
        <h2>Bookings Overview</h2>
        <div class="filter-controls">
          <div class="filter-group">
            <label>Filter by Status:</label>
            <select v-model="selectedStatus" @change="filterBookings">
              <option value="all">All Bookings</option>
              <option value="upcoming">Upcoming</option>
              <option value="today">Today</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Date Range:</label>
            <input type="date" v-model="dateFrom" @change="filterBookings" />
            <span>to</span>
            <input type="date" v-model="dateTo" @change="filterBookings" />
          </div>
          <button @click="resetFilters" class="reset-btn">
            <i class="fas fa-undo"></i>
            Reset
          </button>
        </div>
      </div>

      <!-- Bookings List -->
      <div class="bookings-section">
        <div class="bookings-header">
          <h3>{{ getBookingsTitle() }} ({{ filteredBookings.length }})</h3>
          <div class="view-toggle">
            <button 
              @click="viewMode = 'list'" 
              :class="['toggle-btn', { active: viewMode === 'list' }]"
            >
              <i class="fas fa-list"></i>
              List
            </button>
            <button 
              @click="viewMode = 'grid'" 
              :class="['toggle-btn', { active: viewMode === 'grid' }]"
            >
              <i class="fas fa-th-large"></i>
              Grid
            </button>
          </div>
        </div>

        <div v-if="filteredBookings.length === 0" class="no-bookings">
          <i class="fas fa-calendar-times"></i>
          <h3>No bookings found</h3>
          <p>{{ getNoBookingsMessage() }}</p>
        </div>

        <div v-else :class="['bookings-container', viewMode]">
          <div 
            v-for="booking in filteredBookings" 
            :key="booking.id" 
            :class="['booking-card', booking.status]"
          >
            <div class="booking-header">
              <div class="booking-time">
                <i class="fas fa-clock"></i>
                <span>{{ formatDate(booking.date) }}</span>
                <span class="time">{{ booking.time }}</span>
              </div>
              <div :class="['booking-status', booking.status]">
                {{ booking.status.charAt(0).toUpperCase() + booking.status.slice(1) }}
              </div>
            </div>

            <div class="booking-content">
              <div class="customer-info">
                <div class="customer-header">
                  <i class="fas fa-user"></i>
                  <h4>{{ booking.customerName }}</h4>
                </div>
                <div class="customer-details">
                  <div class="detail-item">
                    <i class="fas fa-envelope"></i>
                    <span>{{ booking.customerEmail }}</span>
                  </div>
                  <div class="detail-item">
                    <i class="fas fa-phone"></i>
                    <span>{{ booking.customerPhone }}</span>
                  </div>
                  <div class="detail-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>{{ booking.customerLocation }}</span>
                  </div>
                  <div class="detail-item">
                    <i class="fas fa-venus-mars"></i>
                    <span>{{ booking.customerGender }}, {{ booking.customerAge }} years old</span>
                  </div>
                </div>
              </div>

              <div class="service-info">
                <div class="service-header">
                  <i class="fas fa-cut"></i>
                  <h4>{{ booking.serviceName }}</h4>
                  <span class="service-price">${{ booking.servicePrice }}</span>
                </div>
                <div class="service-details">
                  <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <span>{{ booking.serviceDuration }} minutes</span>
                  </div>
                  <div class="detail-item">
                    <i class="fas fa-dollar-sign"></i>
                    <span>Payment: {{ booking.paymentMethod }}</span>
                  </div>
                </div>
              </div>

              <div v-if="booking.notes" class="booking-notes">
                <div class="notes-header">
                  <i class="fas fa-sticky-note"></i>
                  <span>Special Notes:</span>
                </div>
                <p>{{ booking.notes }}</p>
              </div>
            </div>

            <div class="booking-actions">
              <button 
                v-if="booking.status === 'upcoming'" 
                @click="markCompleted(booking.id)"
                class="action-btn complete"
              >
                <i class="fas fa-check"></i>
                Mark Complete
              </button>
              <button 
                v-if="booking.status === 'upcoming'" 
                @click="cancelBooking(booking.id)"
                class="action-btn cancel"
              >
                <i class="fas fa-times"></i>
                Cancel
              </button>
              <button 
                @click="contactCustomer(booking)"
                class="action-btn contact"
              >
                <i class="fas fa-phone"></i>
                Contact
              </button>
              <button 
                @click="viewDetails(booking)"
                class="action-btn details"
              >
                <i class="fas fa-eye"></i>
                Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageNavigation from '@/components/PageNavigation.vue'

const router = useRouter()

// Employee data (in a real app, this would come from authentication/API)
const employeeData = ref({
  id: 1,
  name: 'Mike Johnson',
  title: 'Master Barber',
  experience: 8,
  rating: 4.9,
  image: require('@/asset/images/man-with-beard-hairdresser-with-client-man-with-comb-scissors.jpg')
})

// Filter states
const selectedStatus = ref('all')
const dateFrom = ref('')
const dateTo = ref('')
const viewMode = ref('list')

// Sample bookings data (in a real app, this would come from API)
const allBookings = ref([
  {
    id: 1,
    customerName: 'John Smith',
    customerEmail: 'john.smith@email.com',
    customerPhone: '(555) 123-4567',
    customerLocation: '123 Main St, Downtown',
    customerGender: 'Male',
    customerAge: 28,
    serviceName: 'Classic Haircut',
    servicePrice: 25,
    serviceDuration: 30,
    date: '2024-01-15',
    time: '10:00 AM',
    status: 'upcoming',
    paymentMethod: 'Credit Card',
    notes: 'Prefers shorter sides, keep length on top'
  },
  {
    id: 2,
    customerName: 'David Wilson',
    customerEmail: 'david.wilson@email.com',
    customerPhone: '(555) 234-5678',
    customerLocation: '456 Oak Ave, Midtown',
    customerGender: 'Male',
    customerAge: 35,
    serviceName: 'Beard Trim',
    servicePrice: 15,
    serviceDuration: 20,
    date: '2024-01-15',
    time: '11:30 AM',
    status: 'today',
    paymentMethod: 'Cash',
    notes: 'Regular customer, knows the usual style'
  },
  {
    id: 3,
    customerName: 'Michael Brown',
    customerEmail: 'michael.brown@email.com',
    customerPhone: '(555) 345-6789',
    customerLocation: '789 Pine St, Uptown',
    customerGender: 'Male',
    customerAge: 42,
    serviceName: 'Premium Package',
    servicePrice: 50,
    serviceDuration: 60,
    date: '2024-01-14',
    time: '2:00 PM',
    status: 'completed',
    paymentMethod: 'Credit Card',
    notes: 'First time customer, wants consultation on best style'
  },
  {
    id: 4,
    customerName: 'Robert Taylor',
    customerEmail: 'robert.taylor@email.com',
    customerPhone: '(555) 456-7890',
    customerLocation: '321 Elm St, Westside',
    customerGender: 'Male',
    customerAge: 31,
    serviceName: 'Fade Cut',
    servicePrice: 30,
    serviceDuration: 40,
    date: '2024-01-16',
    time: '3:30 PM',
    status: 'upcoming',
    paymentMethod: 'Bank Transfer',
    notes: 'Wants a mid-fade with textured top'
  },
  {
    id: 5,
    customerName: 'James Anderson',
    customerEmail: 'james.anderson@email.com',
    customerPhone: '(555) 567-8901',
    customerLocation: '654 Maple Dr, Eastside',
    customerGender: 'Male',
    customerAge: 26,
    serviceName: 'Hot Towel Shave',
    servicePrice: 30,
    serviceDuration: 40,
    date: '2024-01-13',
    time: '1:00 PM',
    status: 'cancelled',
    paymentMethod: 'Credit Card',
    notes: 'Customer cancelled due to emergency'
  }
])

// Computed properties
const filteredBookings = ref([])

const todayBookings = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return allBookings.value.filter(booking => 
    booking.date === today || booking.status === 'today'
  )
})

const upcomingBookings = computed(() => {
  return allBookings.value.filter(booking => booking.status === 'upcoming')
})

// Methods
const filterBookings = () => {
  let filtered = [...allBookings.value]

  // Filter by status
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(booking => booking.status === selectedStatus.value)
  }

  // Filter by date range
  if (dateFrom.value) {
    filtered = filtered.filter(booking => booking.date >= dateFrom.value)
  }
  if (dateTo.value) {
    filtered = filtered.filter(booking => booking.date <= dateTo.value)
  }

  // Sort by date and time
  filtered.sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`)
    const dateB = new Date(`${b.date} ${b.time}`)
    return dateB - dateA
  })

  filteredBookings.value = filtered
}

const resetFilters = () => {
  selectedStatus.value = 'all'
  dateFrom.value = ''
  dateTo.value = ''
  filterBookings()
}

const getBookingsTitle = () => {
  switch (selectedStatus.value) {
    case 'today': return "Today's Bookings"
    case 'upcoming': return 'Upcoming Bookings'
    case 'completed': return 'Completed Bookings'
    case 'cancelled': return 'Cancelled Bookings'
    default: return 'All Bookings'
  }
}

const getNoBookingsMessage = () => {
  switch (selectedStatus.value) {
    case 'today': return 'No bookings scheduled for today.'
    case 'upcoming': return 'No upcoming bookings found.'
    case 'completed': return 'No completed bookings found.'
    case 'cancelled': return 'No cancelled bookings found.'
    default: return 'No bookings found for the selected criteria.'
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Action methods
const viewTodaySchedule = () => {
  selectedStatus.value = 'today'
  filterBookings()
}

const viewAllBookings = () => {
  selectedStatus.value = 'all'
  filterBookings()
}

const updateAvailability = () => {
  alert('Availability update feature coming soon!')
}

const viewEarnings = () => {
  alert('Earnings report feature coming soon!')
}

const editProfile = () => {
  alert('Profile editing feature coming soon!')
}

const markCompleted = (bookingId) => {
  const booking = allBookings.value.find(b => b.id === bookingId)
  if (booking) {
    booking.status = 'completed'
    filterBookings()
    alert(`Booking for ${booking.customerName} marked as completed!`)
  }
}

const cancelBooking = (bookingId) => {
  const booking = allBookings.value.find(b => b.id === bookingId)
  if (booking && confirm(`Are you sure you want to cancel the booking for ${booking.customerName}?`)) {
    booking.status = 'cancelled'
    filterBookings()
    alert(`Booking for ${booking.customerName} has been cancelled.`)
  }
}

const contactCustomer = (booking) => {
  const message = `Hello ${booking.customerName}, this is ${employeeData.value.name} from Elite Barber Shop regarding your ${booking.serviceName} appointment on ${formatDate(booking.date)} at ${booking.time}.`
  
  if (confirm(`Contact ${booking.customerName}?\n\nPhone: ${booking.customerPhone}\nEmail: ${booking.customerEmail}\n\nWould you like to call them?`)) {
    window.open(`tel:${booking.customerPhone}`)
  }
}

const viewDetails = (booking) => {
  alert(`Booking Details:\n\nCustomer: ${booking.customerName}\nService: ${booking.serviceName}\nDate: ${formatDate(booking.date)}\nTime: ${booking.time}\nPrice: $${booking.servicePrice}\nDuration: ${booking.serviceDuration} minutes\nStatus: ${booking.status}\n\nNotes: ${booking.notes || 'No special notes'}`)
}

// Initialize
onMounted(() => {
  filterBookings()
})
</script>

<style scoped>
.employee-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f4e4bc 0%, #f0d49c 100%);
  padding: 2rem 0;
}

.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Header Section */
.dashboard-header {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(44, 44, 44, 0.1);
  border: 2px solid rgba(212, 175, 55, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.welcome-section h1 {
  color: #2c2c2c;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.welcome-section p {
  color: #5a5a5a;
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.header-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(244, 228, 188, 0.3);
  border-radius: 15px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.stat-item i {
  font-size: 2rem;
  color: #d4af37;
}

.stat-number {
  display: block;
  font-size: 1.8rem;
  font-weight: bold;
  color: #2c2c2c;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #5a5a5a;
}

.profile-section {
  text-align: center;
}

.profile-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 1rem;
  border: 4px solid #d4af37;
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.edit-profile-btn {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  color: #2c2c2c;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-profile-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
}

/* Quick Actions */
.quick-actions {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(44, 44, 44, 0.1);
  border: 2px solid rgba(212, 175, 55, 0.2);
}

.quick-actions h2 {
  color: #2c2c2c;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  background: rgba(244, 228, 188, 0.2);
  border: 2px solid rgba(212, 175, 55, 0.2);
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  color: #2c2c2c;
}

.action-btn:hover {
  background: rgba(212, 175, 55, 0.2);
  border-color: #d4af37;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.2);
}

.action-btn.primary {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  color: #2c2c2c;
}

.action-btn i {
  font-size: 1.5rem;
  color: #d4af37;
}

.action-btn.primary i {
  color: #2c2c2c;
}

/* Filter Section */
.filter-section {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(44, 44, 44, 0.1);
  border: 2px solid rgba(212, 175, 55, 0.2);
}

.filter-section h2 {
  color: #2c2c2c;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.filter-controls {
  display: flex;
  gap: 2rem;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  color: #2c2c2c;
  font-weight: 600;
  font-size: 0.9rem;
}

.filter-group select,
.filter-group input {
  padding: 0.75rem;
  border: 2px solid rgba(212, 175, 55, 0.2);
  border-radius: 10px;
  font-size: 1rem;
  background: white;
}

.filter-group select:focus,
.filter-group input:focus {
  outline: none;
  border-color: #d4af37;
}

.reset-btn {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 2px solid rgba(231, 76, 60, 0.2);
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reset-btn:hover {
  background: rgba(231, 76, 60, 0.2);
  border-color: #e74c3c;
}

/* Bookings Section */
.bookings-section {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(44, 44, 44, 0.1);
  border: 2px solid rgba(212, 175, 55, 0.2);
}

.bookings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.bookings-header h3 {
  color: #2c2c2c;
  font-size: 1.5rem;
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
}

.toggle-btn {
  padding: 0.5rem 1rem;
  background: rgba(244, 228, 188, 0.2);
  border: 2px solid rgba(212, 175, 55, 0.2);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #5a5a5a;
}

.toggle-btn.active {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  color: #2c2c2c;
  border-color: #d4af37;
}

.no-bookings {
  text-align: center;
  padding: 4rem 2rem;
  color: #5a5a5a;
}

.no-bookings i {
  font-size: 4rem;
  color: #d4af37;
  margin-bottom: 1rem;
}

.no-bookings h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

/* Bookings Container */
.bookings-container.list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.bookings-container.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.booking-card {
  background: rgba(244, 228, 188, 0.1);
  border: 2px solid rgba(212, 175, 55, 0.2);
  border-radius: 15px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.booking-card:hover {
  border-color: #d4af37;
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.2);
}

.booking-card.upcoming {
  border-left: 5px solid #3498db;
}

.booking-card.today {
  border-left: 5px solid #f39c12;
}

.booking-card.completed {
  border-left: 5px solid #27ae60;
}

.booking-card.cancelled {
  border-left: 5px solid #e74c3c;
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

.booking-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2c2c2c;
  font-weight: 600;
}

.booking-time i {
  color: #d4af37;
}

.time {
  background: rgba(212, 175, 55, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.9rem;
}

.booking-status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.booking-status.upcoming {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
}

.booking-status.today {
  background: rgba(243, 156, 18, 0.2);
  color: #f39c12;
}

.booking-status.completed {
  background: rgba(39, 174, 96, 0.2);
  color: #27ae60;
}

.booking-status.cancelled {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.booking-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.customer-info,
.service-info {
  background: white;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid rgba(212, 175, 55, 0.1);
}

.customer-header,
.service-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.customer-header i,
.service-header i {
  color: #d4af37;
}

.customer-header h4,
.service-header h4 {
  color: #2c2c2c;
  margin: 0;
  flex: 1;
}

.service-price {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  color: #2c2c2c;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-weight: bold;
  font-size: 0.9rem;
}

.customer-details,
.service-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #5a5a5a;
}

.detail-item i {
  color: #d4af37;
  width: 16px;
  text-align: center;
}

.booking-notes {
  grid-column: 1 / -1;
  background: rgba(212, 175, 55, 0.1);
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.notes-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c2c2c;
}

.notes-header i {
  color: #d4af37;
}

.booking-notes p {
  margin: 0;
  color: #5a5a5a;
  font-style: italic;
}

.booking-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.booking-actions .action-btn {
  flex-direction: row;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  min-width: auto;
}

.booking-actions .action-btn.complete {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
  border-color: rgba(39, 174, 96, 0.3);
}

.booking-actions .action-btn.cancel {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border-color: rgba(231, 76, 60, 0.3);
}

.booking-actions .action-btn.contact {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
  border-color: rgba(52, 152, 219, 0.3);
}

.booking-actions .action-btn.details {
  background: rgba(155, 89, 182, 0.1);
  color: #9b59b6;
  border-color: rgba(155, 89, 182, 0.3);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .dashboard-header {
    flex-direction: column;
    text-align: center;
  }

  .header-stats {
    justify-content: center;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .booking-content {
    grid-template-columns: 1fr;
  }

  .bookings-container.grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 0 1rem;
  }

  .dashboard-header,
  .quick-actions,
  .filter-section,
  .bookings-section {
    padding: 1.5rem;
  }

  .header-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .booking-actions {
    justify-content: center;
  }

  .booking-actions .action-btn {
    flex: 1;
    min-width: 0;
  }
}
</style>
