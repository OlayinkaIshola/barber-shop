<template>
  <div class="services">
    <h1>Our Services</h1>
    <div class="service-grid">
      <div v-for="service in services" :key="service.id" class="service-card">
        <div class="service-image">
          <img :src="service.image" :alt="service.name" />
        </div>
        <div class="service-content">
          <h3>{{ service.name }}</h3>
          <p>{{ service.description }}</p>
          <div class="price">${{ service.price }}</div>
          <div class="duration">{{ service.duration }} min</div>
          <button @click="bookService(service)" class="book-btn">Book Now</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const services = ref([
  {
    id: 1,
    name: 'Classic Haircut',
    description: 'Traditional scissor cut with professional styling',
    price: 25,
    duration: 30,
    image: require('@/asset/images/client-doing-hair-cut-barber-shop-salon.jpg')
  },
  {
    id: 2,
    name: 'Beard Trim',
    description: 'Professional beard styling and grooming',
    price: 15,
    duration: 20,
    image: require('@/asset/images/handsome-man-barbershop-shaving-beard.jpg')
  },
  {
    id: 3,
    name: 'Hair Wash & Style',
    description: 'Complete wash and professional styling',
    price: 35,
    duration: 45,
    image: require('@/asset/images/hairdresser-washing-woman-s-hair.jpg')
  },
  {
    id: 4,
    name: 'Buzz Cut',
    description: 'Clean clipper cut with precision',
    price: 20,
    duration: 15,
    image: require('@/asset/images/buzz-cut.jpg')
  },
  {
    id: 5,
    name: 'Premium Package',
    description: 'Haircut + beard trim + wash - Complete grooming experience',
    price: 50,
    duration: 60,
    image: require('@/asset/images/young-man-visiting-barbershop.jpg')
  },
  {
    id: 6,
    name: 'Hot Towel Shave',
    description: 'Traditional hot towel shave with premium oils and aftercare',
    price: 30,
    duration: 40,
    image: require('@/asset/images/side-view-barber-shaving-client-s-beard-close-up.jpg')
  }
])

const bookService = (service) => {
  // Navigate to booking page with service information
  router.push({
    path: '/booking',
    query: {
      serviceId: service.id,
      serviceName: service.name,
      price: service.price,
      duration: service.duration
    }
  })
}
</script>

<style scoped>
.services {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.services h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 3rem;
  font-size: 2.5rem;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.service-card {
  border: 1px solid #ddd;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: white;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

.service-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.service-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.service-card:hover .service-image img {
  transform: scale(1.05);
}

.service-content {
  padding: 1.5rem;
  text-align: center;
}

.service-content h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.4rem;
}

.service-content p {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.price {
  font-size: 1.8rem;
  font-weight: bold;
  color: #e74c3c;
  margin: 1rem 0;
}

.duration {
  color: #666;
  font-style: italic;
  margin-bottom: 1.5rem;
}

.book-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.book-btn:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.book-btn:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .services {
    padding: 1rem;
  }

  .service-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .services h1 {
    font-size: 2rem;
  }
}
</style>