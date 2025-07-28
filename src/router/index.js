import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Services from '../views/Services.vue'
import Stylists from '../views/Stylists.vue'
import Booking from '../views/Booking.vue'
import Payment from '../views/Payment.vue'
import PaymentSuccess from '../views/PaymentSuccess.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/services', component: Services },
  { path: '/stylists', component: Stylists },
  { path: '/booking', component: Booking },
  { path: '/payment', component: Payment },
  { path: '/payment-success', component: PaymentSuccess }
]

export default createRouter({
  history: createWebHistory(),
  routes
})