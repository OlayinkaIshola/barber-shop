import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Services from '../views/Services.vue'
import Stylists from '../views/Stylists.vue'
import Booking from '../views/Booking.vue'
import Payment from '../views/Payment.vue'
import PaymentSuccess from '../views/PaymentSuccess.vue'
import Register from '../views/Register.vue'
import Login from '../views/Login.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import EmployeeDashboard from '../views/EmployeeDashboard.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/services', component: Services },
  { path: '/stylists', component: Stylists },
  { path: '/booking', component: Booking },
  { path: '/payment', component: Payment },
  { path: '/payment-success', component: PaymentSuccess },
  { path: '/register', component: Register },
  { path: '/login', component: Login },
  { path: '/forgot-password', component: ForgotPassword },
  { path: '/employee-dashboard', component: EmployeeDashboard }
]

export default createRouter({
  history: createWebHistory(),
  routes
})