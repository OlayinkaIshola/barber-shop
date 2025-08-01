<template>
  <div class="services">
    <PageNavigation />
    <div class="services-header">
      <div class="header-content">
        <h1 class="services-title">Our Premium Services</h1>
        <p class="services-subtitle">Choose from our range of professional grooming services</p>
        <div class="header-decoration">
          <div class="decoration-line"></div>
          <div class="decoration-diamond">💎</div>
          <div class="decoration-line"></div>
        </div>
      </div>
    </div>

    <div class="services-container">
      <div class="service-grid">
        <div
          v-for="(service, index) in services"
          :key="service.id"
          class="service-card"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="service-image">
            <img :src="service.image" :alt="service.name" />
            <div class="image-overlay">
              <div class="overlay-content">
                <div class="service-badge">${{ service.price }}</div>
              </div>
            </div>
          </div>
          <div class="service-content">
            <h3>{{ service.name }}</h3>
            <p>{{ service.description }}</p>
            <div class="service-details">
              <div class="price">${{ service.price }}</div>
              <div class="duration">{{ service.duration }} min</div>
            </div>
            <button @click="selectService(service)" class="select-btn">
              <span>Select Service</span>
              <div class="btn-shine"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageNavigation from '@/components/PageNavigation.vue'
import { serviceAPI } from '../services/api.js'

const router = useRouter()
const services = ref([])
const loading = ref(true)

const servicesData = [
  {
    id: 2,
    name: 'Beard Trim',
    description: 'Professional beard styling and grooming',
    price: 15,
    duration: 20,
    image: '@/assets/images/expert-grooming.svg'
  },
  {
    id: 4,
    name: 'Buzz Cut',
    description: 'Clean clipper cut with precision',
    price: 20,
    duration: 15,
    image: '@/assets/images/Buzz-cut2.svg'
  },
  {
    id: 1,
    name: 'Classic Haircut',
    description: 'Traditional scissor cut with professional styling',
    price: 25,
    duration: 30,
    image: '@/assets/images/client-doing-hair-cut-barber-shop-salon.svg'
  },
  {
    id: 7,
    name: 'Afro Buzz Cut',
    description: 'Specialized buzz cut for afro-textured hair with expert precision',
    price: 28,
    duration: 25,
    image: '@/assets/images/Buzz-cut2.svg'
  },
  {
    id: 6,
    name: 'Hot Towel Shave',
    description: 'Traditional hot towel shave with premium oils and aftercare',
    price: 30,
    duration: 40,
    image: '@/assets/images/expert-grooming.svg'
  },
  {
    id: 3,
    name: 'Hair Wash & Style',
    description: 'Complete wash and professional styling',
    price: 35,
    duration: 45,
    image: '@/assets/images/professional-styling.svg'
  },
  {
    id: 9,
    name: 'Trimmer Precision Cut',
    description: 'Detailed trimmer work for perfect edge-ups and fades',
    price: 22,
    duration: 20,
    image: '@/assets/images/professional-styling.svg'
  },
  {
    id: 11,
    name: 'Professional Hair Wash',
    description: 'Luxurious hair washing service with premium products',
    price: 25,
    duration: 30,
    image: '@/assets/images/professional-styling.svg'
  },
  {
    id: 12,
    name: 'Precision Beard Styling',
    description: 'Expert beard trimming and styling for the perfect look',
    price: 28,
    duration: 35,
    image: '@/assets/images/expert-grooming.svg'
  },
  {
    id: 8,
    name: 'Shiny Buzz Cut',
    description: 'Ultra-smooth buzz cut with finishing shine treatment',
    price: 32,
    duration: 30,
    image: '@/assets/images/Buzz-cut2.svg'
  },
  {
    id: 13,
    name: 'African Hair Styling',
    description: 'Specialized styling for African hair textures and patterns',
    price: 35,
    duration: 45,
    image: '@/assets/images/professional-styling.svg'
  },
  {
    id: 10,
    name: 'Salon Hair Treatment',
    description: 'Professional hair treatment and conditioning service',
    price: 40,
    duration: 50,
    image: '@/assets/images/professional-styling.svg'
  },
  {
    id: 14,
    name: 'Executive Cut & Style',
    description: 'Premium business-ready haircut with professional styling',
    price: 45,
    duration: 50,
    image: '@/assets/images/professional-styling.svg'
  },
  {
    id: 5,
    name: 'Premium Package',
    description: 'Haircut + beard trim + wash - Complete grooming experience',
    price: 50,
    duration: 60,
    image: '@/assets/images/client-doing-hair-cut-barber-shop-salon.svg'
  }
]

// Load services from API
const loadServices = async () => {
  try {
    loading.value = true
    const response = await serviceAPI.getAll()

    // Map API data to include fallback images
    const apiServices = response.data.map((service, index) => ({
      ...service,
      id: service._id || service.id,
      image: servicesData[index % servicesData.length]?.image || '@/assets/images/client-doing-hair-cut-barber-shop-salon.svg'
    }))

    // If API has no services, use fallback data
    services.value = apiServices.length > 0
      ? apiServices.sort((a, b) => a.price - b.price)
      : servicesData.sort((a, b) => a.price - b.price)

  } catch (error) {
    console.error('Error loading services:', error)
    // Fallback to hardcoded data if API fails
    services.value = servicesData.sort((a, b) => a.price - b.price)
  } finally {
    loading.value = false
  }
}

const selectService = (service) => {
  // Store complete service data with correct MongoDB _id
  const serviceData = {
    _id: service._id || service.id, // Use MongoDB _id
    id: service._id || service.id,  // Keep for compatibility
    name: service.name,
    price: service.price,
    duration: service.duration,
    description: service.description,
    category: service.category
  }

  localStorage.setItem('selectedService', JSON.stringify(serviceData))

  // Navigate to stylists page for stylist selection
  router.push({
    path: '/stylists',
    query: {
      serviceSelected: true,
      serviceId: serviceData._id,
      serviceName: service.name,
      servicePrice: service.price,
      serviceDuration: service.duration
    }
  })
}

// Load services on component mount
onMounted(() => {
  loadServices()
})
</script>

<style scoped>
.services {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

.services-header {
  background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%);
  color: #f4e4bc;
  padding: 4.8rem 2rem 3.2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.services-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.header-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

.services-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  animation: fadeInUp 1s ease-out;
}

.services-subtitle {
  font-size: 1.3rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  animation: fadeInUp 1s ease-out 0.2s both;
}

.header-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  animation: fadeInUp 1s ease-out 0.4s both;
}

.decoration-line {
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #d4af37, transparent);
}

.decoration-diamond {
  font-size: 1.5rem;
  animation: pulse 2s infinite;
  color: #d4af37;
}

.services-container {
  padding: 3.2rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 3rem;
  margin-top: 2rem;
}

.service-card {
  background: linear-gradient(135deg, #2c2c2c 0%, #3a3a3a 100%);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transition: all 0.4s ease;
  position: relative;
  animation: slideInUp 0.8s ease-out both;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.service-card:hover {
  transform: translateY(-15px) scale(1.02);
  box-shadow: 0 25px 50px rgba(212, 175, 55, 0.3);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.service-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.service-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.service-card:hover .service-image img {
  transform: scale(1.1);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.8) 0%, rgba(244, 228, 188, 0.8) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-card:hover .image-overlay {
  opacity: 1;
}

.overlay-content {
  text-align: center;
  color: #2c2c2c;
}

.service-badge {
  background: rgba(44, 44, 44, 0.2);
  backdrop-filter: blur(10px);
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 1.5rem;
  font-weight: bold;
  border: 2px solid rgba(44, 44, 44, 0.3);
  color: #2c2c2c;
}

.service-content {
  padding: 1.6rem;
  text-align: center;
}

.service-content h3 {
  color: #f4e4bc;
  margin-bottom: 1rem;
  font-size: 1.6rem;
  font-weight: 700;
}

.service-content p {
  color: #bdc3c7;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  font-size: 1rem;
}

.service-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.price {
  font-size: 2rem;
  font-weight: bold;
  color: #d4af37;
  margin: 0;
}

.duration {
  color: #bdc3c7;
  font-style: italic;
  font-size: 0.9rem;
  margin: 0;
}

.select-btn {
  position: relative;
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  color: #2c2c2c;
  border: none;
  padding: 15px 30px;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  width: 100%;
  overflow: hidden;
}

.select-btn:hover {
  background: linear-gradient(135deg, #f4e4bc 0%, #d4af37 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.4);
}

.select-btn:active {
  transform: translateY(-1px);
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.select-btn:hover .btn-shine {
  left: 100%;
}

@media (max-width: 768px) {
  .services-header {
    padding: 4rem 1rem 3rem;
  }

  .services-title {
    font-size: 2.5rem;
  }

  .services-container {
    padding: 2rem 1rem;
  }

  .service-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .service-card {
    max-width: 400px;
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .services-title {
    font-size: 2rem;
  }

  .services-subtitle {
    font-size: 1.1rem;
  }

  .service-details {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .price {
    font-size: 1.5rem;
  }
}
</style>