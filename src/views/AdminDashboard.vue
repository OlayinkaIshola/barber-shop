<template>
  <div class="admin-dashboard">
    <!-- Custom Dashboard Navigation -->
    <nav class="dashboard-nav">
      <div class="nav-brand">
        <h2>✂️ Elite Barber Shop</h2>
        <span class="nav-subtitle">Admin Panel</span>
      </div>
      <div class="nav-actions">
        <button @click="refreshData" class="nav-btn refresh-btn">
          <i class="fas fa-sync-alt"></i>
          <span>Refresh</span>
        </button>
        <button @click="logout" class="nav-btn logout-btn">
          <i class="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </div>
    </nav>

    <div class="dashboard-container">
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="welcome-section">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {{ adminData.fullName }}!</p>
          <div class="header-stats">
            <div class="stat-item">
              <i class="fas fa-users"></i>
              <div>
                <span class="stat-number">{{ totalUsers }}</span>
                <span class="stat-label">Total Users</span>
              </div>
            </div>
            <div class="stat-item">
              <i class="fas fa-user-clock"></i>
              <div>
                <span class="stat-number">{{ pendingBarbers.length }}</span>
                <span class="stat-label">Pending Barbers</span>
              </div>
            </div>
            <div class="stat-item">
              <i class="fas fa-calendar-check"></i>
              <div>
                <span class="stat-number">{{ totalBookings }}</span>
                <span class="stat-label">Total Bookings</span>
              </div>
            </div>
            <div class="stat-item">
              <i class="fas fa-dollar-sign"></i>
              <div>
                <span class="stat-number">${{ totalRevenue }}</span>
                <span class="stat-label">Revenue</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="dashboard-tabs">
        <button 
          @click="activeTab = 'pending'" 
          :class="{ active: activeTab === 'pending' }"
          class="tab-btn"
        >
          <i class="fas fa-user-clock"></i>
          Pending Barbers ({{ pendingBarbers.length }})
        </button>
        <button 
          @click="activeTab = 'users'" 
          :class="{ active: activeTab === 'users' }"
          class="tab-btn"
        >
          <i class="fas fa-users"></i>
          All Users
        </button>
        <button 
          @click="activeTab = 'bookings'" 
          :class="{ active: activeTab === 'bookings' }"
          class="tab-btn"
        >
          <i class="fas fa-calendar-alt"></i>
          Bookings
        </button>
        <button 
          @click="activeTab = 'services'" 
          :class="{ active: activeTab === 'services' }"
          class="tab-btn"
        >
          <i class="fas fa-cut"></i>
          Services
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Pending Barbers Tab -->
        <div v-if="activeTab === 'pending'" class="pending-barbers">
          <h2>Pending Barber Applications</h2>
          
          <div v-if="pendingBarbers.length === 0" class="no-data">
            <i class="fas fa-check-circle"></i>
            <p>No pending barber applications</p>
          </div>
          
          <div v-else class="barber-applications">
            <div 
              v-for="barber in pendingBarbers" 
              :key="barber._id" 
              class="barber-card"
            >
              <div class="barber-info">
                <div class="barber-header">
                  <h3>{{ barber.fullName }}</h3>
                  <span class="status-badge pending">Pending</span>
                </div>
                
                <div class="barber-details">
                  <div class="detail-row">
                    <i class="fas fa-envelope"></i>
                    <span>{{ barber.email }}</span>
                  </div>
                  <div class="detail-row">
                    <i class="fas fa-phone"></i>
                    <span>{{ barber.phone }}</span>
                  </div>
                  <div class="detail-row">
                    <i class="fas fa-briefcase"></i>
                    <span>{{ barber.title }} • {{ barber.experience }} years</span>
                  </div>
                  <div class="detail-row">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>{{ barber.address }}</span>
                  </div>
                </div>
                
                <div class="specialties">
                  <h4>Specialties:</h4>
                  <div class="specialty-tags">
                    <span 
                      v-for="specialty in barber.specialties" 
                      :key="specialty"
                      class="specialty-tag"
                    >
                      {{ specialty }}
                    </span>
                  </div>
                </div>
                
                <div class="bio" v-if="barber.bio">
                  <h4>Bio:</h4>
                  <p>{{ barber.bio }}</p>
                </div>
                
                <div class="application-date">
                  <i class="fas fa-calendar"></i>
                  Applied: {{ formatDate(barber.createdAt) }}
                </div>
              </div>
              
              <div class="barber-actions">
                <button 
                  @click="approveBarber(barber._id)"
                  class="approve-btn"
                  :disabled="processingBarber === barber._id"
                >
                  <i class="fas fa-check"></i>
                  {{ processingBarber === barber._id ? 'Processing...' : 'Approve' }}
                </button>
                <button 
                  @click="rejectBarber(barber._id)"
                  class="reject-btn"
                  :disabled="processingBarber === barber._id"
                >
                  <i class="fas fa-times"></i>
                  {{ processingBarber === barber._id ? 'Processing...' : 'Reject' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- All Users Tab -->
        <div v-if="activeTab === 'users'" class="all-users">
          <h2>All Users</h2>
          
          <div class="users-filters">
            <select v-model="userFilter" class="filter-select">
              <option value="all">All Users</option>
              <option value="customer">Customers</option>
              <option value="barber">Barbers</option>
              <option value="admin">Admins</option>
            </select>
            
            <input 
              v-model="userSearch" 
              type="text" 
              placeholder="Search users..."
              class="search-input"
            />
          </div>
          
          <div class="users-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user._id">
                  <td>{{ user.fullName }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span :class="`role-badge ${user.role}`">
                      {{ user.role }}
                    </span>
                  </td>
                  <td>
                    <span :class="`status-badge ${user.registrationStatus}`">
                      {{ user.registrationStatus }}
                    </span>
                  </td>
                  <td>{{ formatDate(user.createdAt) }}</td>
                  <td>
                    <button 
                      v-if="user.role !== 'admin'"
                      @click="toggleUserStatus(user._id, user.isActive)"
                      :class="user.isActive ? 'deactivate-btn' : 'activate-btn'"
                    >
                      {{ user.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Bookings Tab -->
        <div v-if="activeTab === 'bookings'" class="bookings-management">
          <h2>Bookings Management</h2>
          
          <div class="bookings-stats">
            <div class="stat-card">
              <i class="fas fa-calendar-check"></i>
              <div>
                <h3>{{ bookingStats.total }}</h3>
                <p>Total Bookings</p>
              </div>
            </div>
            <div class="stat-card">
              <i class="fas fa-clock"></i>
              <div>
                <h3>{{ bookingStats.pending }}</h3>
                <p>Pending</p>
              </div>
            </div>
            <div class="stat-card">
              <i class="fas fa-check-circle"></i>
              <div>
                <h3>{{ bookingStats.confirmed }}</h3>
                <p>Confirmed</p>
              </div>
            </div>
            <div class="stat-card">
              <i class="fas fa-times-circle"></i>
              <div>
                <h3>{{ bookingStats.cancelled }}</h3>
                <p>Cancelled</p>
              </div>
            </div>
          </div>
          
          <p class="coming-soon">
            <i class="fas fa-tools"></i>
            Detailed booking management features coming soon...
          </p>
        </div>

        <!-- Services Tab -->
        <div v-if="activeTab === 'services'" class="services-management">
          <h2>Services Management</h2>
          
          <div class="services-actions">
            <button @click="showAddService = true" class="add-service-btn">
              <i class="fas fa-plus"></i>
              Add New Service
            </button>
          </div>
          
          <div class="services-grid">
            <div 
              v-for="service in services" 
              :key="service._id"
              class="service-card"
            >
              <h3>{{ service.name }}</h3>
              <p>{{ service.description }}</p>
              <div class="service-details">
                <span class="price">${{ service.price }}</span>
                <span class="duration">{{ service.duration }}min</span>
                <span class="category">{{ service.category }}</span>
              </div>
              <div class="service-actions">
                <button @click="editService(service)" class="edit-btn">
                  <i class="fas fa-edit"></i>
                  Edit
                </button>
                <button 
                  @click="toggleServiceStatus(service._id, service.isActive)"
                  :class="service.isActive ? 'deactivate-btn' : 'activate-btn'"
                >
                  {{ service.isActive ? 'Deactivate' : 'Activate' }}
                </button>
              </div>
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
import { userAPI, bookingAPI, serviceAPI, stylistAPI } from '../services/api.js'

const router = useRouter()

// Reactive data
const activeTab = ref('pending')
const adminData = ref({})
const pendingBarbers = ref([])
const allUsers = ref([])
const bookings = ref([])
const services = ref([])
const processingBarber = ref(null)
const userFilter = ref('all')
const userSearch = ref('')
const showAddService = ref(false)

// Computed properties
const totalUsers = computed(() => allUsers.value.length)
const totalBookings = computed(() => bookings.value.length)
const totalRevenue = computed(() => {
  return bookings.value
    .filter(booking => booking.paymentStatus === 'paid')
    .reduce((total, booking) => total + booking.totalAmount, 0)
    .toFixed(2)
})

const filteredUsers = computed(() => {
  let filtered = allUsers.value
  
  if (userFilter.value !== 'all') {
    filtered = filtered.filter(user => user.role === userFilter.value)
  }
  
  if (userSearch.value) {
    const search = userSearch.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.fullName.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    )
  }
  
  return filtered
})

const bookingStats = computed(() => {
  const stats = {
    total: bookings.value.length,
    pending: 0,
    confirmed: 0,
    cancelled: 0
  }
  
  bookings.value.forEach(booking => {
    if (booking.status === 'pending') stats.pending++
    else if (booking.status === 'confirmed') stats.confirmed++
    else if (booking.status === 'cancelled') stats.cancelled++
  })
  
  return stats
})

// Methods
const loadAdminData = () => {
  const userData = localStorage.getItem('user')
  if (userData) {
    adminData.value = JSON.parse(userData)
  }
}

const loadPendingBarbers = async () => {
  try {
    const response = await userAPI.getPendingBarbers()
    pendingBarbers.value = response.data || []
  } catch (error) {
    console.error('Error loading pending barbers:', error)
    // Fallback to empty array if API fails
    pendingBarbers.value = []
  }
}

const loadAllUsers = async () => {
  try {
    const response = await userAPI.getAll()
    allUsers.value = response.data || []
  } catch (error) {
    console.error('Error loading users:', error)
    // Fallback to empty array if API fails
    allUsers.value = []
  }
}

const loadServices = async () => {
  try {
    const response = await serviceAPI.getAll()
    services.value = response.data || []
  } catch (error) {
    console.error('Error loading services:', error)
    // Fallback to empty array if API fails
    services.value = []
  }
}

const approveBarber = async (barberId) => {
  processingBarber.value = barberId

  try {
    // Use the proper stylist approval endpoint
    await stylistAPI.approve(barberId)

    // Remove from pending list
    pendingBarbers.value = pendingBarbers.value.filter(b => b._id !== barberId)

    // Refresh all users list
    await loadAllUsers()

    alert('Barber approved successfully! They are now available as a stylist for bookings.')

  } catch (error) {
    console.error('Error approving barber:', error)
    alert('Failed to approve barber. Please try again.')
  } finally {
    processingBarber.value = null
  }
}

const rejectBarber = async (barberId) => {
  const reason = prompt('Please provide a reason for rejection (optional):')

  if (!confirm('Are you sure you want to reject this barber application?')) {
    return
  }

  processingBarber.value = barberId

  try {
    // Use the proper stylist rejection endpoint
    await stylistAPI.reject(barberId, reason)

    // Remove from pending list
    pendingBarbers.value = pendingBarbers.value.filter(b => b._id !== barberId)

    // Refresh all users list
    await loadAllUsers()

    alert('Barber application rejected.')

  } catch (error) {
    console.error('Error rejecting barber:', error)
    alert('Failed to reject barber. Please try again.')
  } finally {
    processingBarber.value = null
  }
}

const toggleUserStatus = async (userId, currentStatus) => {
  try {
    // Update user status via API
    await userAPI.update(userId, { isActive: !currentStatus })

    // Update local state
    const user = allUsers.value.find(u => u._id === userId)
    if (user) {
      user.isActive = !currentStatus
    }

    alert(`User ${currentStatus ? 'deactivated' : 'activated'} successfully!`)

  } catch (error) {
    console.error('Error toggling user status:', error)
    alert('Failed to update user status. Please try again.')
  }
}

const toggleServiceStatus = async (serviceId, currentStatus) => {
  try {
    // Replace with actual API call
    console.log('Toggling service status:', serviceId, !currentStatus)
    
    const service = services.value.find(s => s._id === serviceId)
    if (service) {
      service.isActive = !currentStatus
    }
    
    alert(`Service ${currentStatus ? 'deactivated' : 'activated'} successfully!`)
    
  } catch (error) {
    console.error('Error toggling service status:', error)
    alert('Failed to update service status. Please try again.')
  }
}

const editService = (service) => {
  console.log('Editing service:', service)
  alert('Service editing feature coming soon!')
}

const refreshData = async () => {
  await Promise.all([
    loadPendingBarbers(),
    loadAllUsers(),
    loadServices()
  ])
  alert('Data refreshed successfully!')
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('isLoggedIn')
  router.push('/login')
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  loadAdminData()
  loadPendingBarbers()
  loadAllUsers()
  loadServices()
})
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

/* Dashboard Navigation */
.dashboard-nav {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: #f4e4bc;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #f4e4bc;
}

.nav-subtitle {
  font-size: 0.9rem;
  color: #bdc3c7;
  font-weight: 500;
}

.nav-actions {
  display: flex;
  gap: 1rem;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.nav-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.refresh-btn {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  color: white;
}

.refresh-btn:hover {
  background: linear-gradient(135deg, #229954 0%, #27ae60 100%);
}

.logout-btn {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
}

.logout-btn:hover {
  background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
}

.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* Header Section */
.dashboard-header {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-section h1 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.welcome-section p {
  color: #6c757d;
  margin: 0 0 1.5rem 0;
  font-size: 1.1rem;
}

.header-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-top: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f4e4bc 0%, #f0d49c 100%);
  border-radius: 10px;
}

.stat-item i {
  font-size: 2rem;
  color: #8b6914;
}

.stat-number {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #6c757d;
}

.admin-actions {
  display: flex;
  gap: 1rem;
}

.refresh-btn, .logout-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.refresh-btn {
  background: #28a745;
  color: white;
}

.refresh-btn:hover {
  background: #218838;
  transform: translateY(-2px);
}

.logout-btn {
  background: #dc3545;
  color: white;
}

.logout-btn:hover {
  background: #c82333;
  transform: translateY(-2px);
}

/* Navigation Tabs */
.dashboard-tabs {
  display: flex;
  background: white;
  border-radius: 15px;
  padding: 0.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.tab-btn {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #6c757d;
}

.tab-btn.active {
  background: linear-gradient(135deg, #f4e4bc 0%, #f0d49c 100%);
  color: #8b6914;
}

.tab-btn:hover:not(.active) {
  background: #f8f9fa;
}

/* Tab Content */
.tab-content {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.tab-content h2 {
  color: #2c3e50;
  margin: 0 0 2rem 0;
  font-size: 2rem;
  font-weight: 700;
}

/* Pending Barbers */
.no-data {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.no-data i {
  font-size: 3rem;
  color: #28a745;
  margin-bottom: 1rem;
}

.barber-applications {
  display: grid;
  gap: 2rem;
}

.barber-card {
  border: 1px solid #e9ecef;
  border-radius: 15px;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.3s ease;
}

.barber-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.barber-info {
  flex: 1;
}

.barber-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.barber-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.approved {
  background: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

.barber-details {
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  color: #6c757d;
}

.detail-row i {
  width: 16px;
  color: #8b6914;
}

.specialties {
  margin-bottom: 1.5rem;
}

.specialties h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.specialty-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.specialty-tag {
  background: linear-gradient(135deg, #f4e4bc 0%, #f0d49c 100%);
  color: #8b6914;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.bio {
  margin-bottom: 1.5rem;
}

.bio h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.bio p {
  color: #6c757d;
  line-height: 1.6;
  margin: 0;
}

.application-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.barber-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-left: 2rem;
}

.approve-btn, .reject-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: center;
}

.approve-btn {
  background: #28a745;
  color: white;
}

.approve-btn:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-2px);
}

.reject-btn {
  background: #dc3545;
  color: white;
}

.reject-btn:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-2px);
}

.approve-btn:disabled, .reject-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Users Management */
.users-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.filter-select, .search-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.filter-select {
  min-width: 150px;
}

.search-input {
  flex: 1;
  max-width: 300px;
}

.users-table {
  overflow-x: auto;
}

.users-table table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.users-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.role-badge.admin {
  background: #e7f3ff;
  color: #0066cc;
}

.role-badge.barber {
  background: #fff3cd;
  color: #856404;
}

.role-badge.customer {
  background: #d4edda;
  color: #155724;
}

.activate-btn, .deactivate-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.activate-btn {
  background: #28a745;
  color: white;
}

.deactivate-btn {
  background: #6c757d;
  color: white;
}

/* Bookings Management */
.bookings-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 2rem;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-card i {
  font-size: 2.5rem;
  color: #8b6914;
}

.stat-card h3 {
  margin: 0;
  font-size: 2rem;
  color: #2c3e50;
}

.stat-card p {
  margin: 0;
  color: #6c757d;
}

.coming-soon {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
  font-size: 1.1rem;
}

.coming-soon i {
  font-size: 2rem;
  margin-right: 0.5rem;
  color: #8b6914;
}

/* Services Management */
.services-actions {
  margin-bottom: 2rem;
}

.add-service-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-service-btn:hover {
  background: #0056b3;
  transform: translateY(-2px);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.service-card {
  border: 1px solid #e9ecef;
  border-radius: 15px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.service-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.service-card h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.service-card p {
  color: #6c757d;
  margin: 0 0 1rem 0;
  line-height: 1.6;
}

.service-details {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.service-details span {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.price {
  background: #d4edda;
  color: #155724;
}

.duration {
  background: #cce5ff;
  color: #0066cc;
}

.category {
  background: #fff3cd;
  color: #856404;
}

.service-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.edit-btn:hover {
  background: #0056b3;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 2rem;
  }

  .header-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-tabs {
    flex-direction: column;
  }

  .barber-card {
    flex-direction: column;
    gap: 2rem;
  }

  .barber-actions {
    flex-direction: row;
    margin-left: 0;
  }

  .bookings-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .services-grid {
    grid-template-columns: 1fr;
  }
}
</style>
