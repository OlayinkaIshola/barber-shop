import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Services from '../views/Services.vue'
import Stylists from '../views/Stylists.vue'
import Booking from '../views/Booking.vue'
import Payment from '../views/Payment.vue'
import PaymentSuccess from '../views/PaymentSuccess.vue'
import Register from '../views/Register.vue'
import RegistrationSuccess from '../views/RegistrationSuccess.vue'
import Login from '../views/Login.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import EmployeeDashboard from '../views/EmployeeDashboard.vue'
import AdminDashboard from '../views/AdminDashboard.vue'

// Route guard function
const requireAuth = (to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  if (isLoggedIn) {
    next()
  } else {
    next('/login')
  }
}

const requireAdmin = (to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const userData = localStorage.getItem('user')

  if (isLoggedIn && userData) {
    try {
      const user = JSON.parse(userData)
      if (user.role === 'admin') {
        next()
      } else {
        next('/')
      }
    } catch (error) {
      next('/login')
    }
  } else {
    next('/login')
  }
}

const requireBarber = (to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const userData = localStorage.getItem('user')

  if (isLoggedIn && userData) {
    try {
      const user = JSON.parse(userData)
      if (user.role === 'barber' || user.role === 'admin') {
        next()
      } else {
        next('/')
      }
    } catch (error) {
      next('/login')
    }
  } else {
    next('/login')
  }
}

const routes = [
  { path: '/', component: Home },
  { path: '/services', component: Services },
  { path: '/stylists', component: Stylists },
  { path: '/booking', component: Booking },
  { path: '/payment', component: Payment },
  { path: '/payment-success', component: PaymentSuccess },
  { path: '/register', component: Register },
  { path: '/registration-success', component: RegistrationSuccess },
  { path: '/login', component: Login },
  { path: '/forgot-password', component: ForgotPassword },
  {
    path: '/employee-dashboard',
    component: EmployeeDashboard,
    beforeEnter: requireBarber
  },
  {
    path: '/admin-dashboard',
    component: AdminDashboard,
    beforeEnter: requireAdmin
  },
  {
    path: '/customer-dashboard',
    component: () => import('../views/CustomerDashboard.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/booking-history',
    component: () => import('../views/BookingHistory.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/reviews',
    component: () => import('../views/Reviews.vue')
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})