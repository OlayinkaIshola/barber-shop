<template>
  <div class="stylists">
    <div class="stylists-header">
      <h1>Our Expert Stylists</h1>
      <p class="header-description">Meet our talented team of professional stylists who are passionate about making you look and feel your best.</p>
    </div>

    <div class="stylists-grid">
      <div v-for="stylist in stylists" :key="stylist.id" class="stylist-card">
        <div class="stylist-image">
          <img :src="stylist.image" :alt="stylist.name" />
          <div class="image-overlay">
            <div class="social-links">
              <a href="#" class="social-link">📧</a>
              <a href="#" class="social-link">📱</a>
            </div>
          </div>
        </div>
        <div class="stylist-info">
          <h3>{{ stylist.name }}</h3>
          <p class="stylist-title">{{ stylist.title }}</p>
          <p class="stylist-experience">{{ stylist.experience }} years experience</p>
          <div class="stylist-specialties">
            <h4>Specialties:</h4>
            <div class="specialty-tags">
              <span v-for="specialty in stylist.specialties" :key="specialty" class="specialty-tag">
                {{ specialty }}
              </span>
            </div>
          </div>
          <p class="stylist-bio">{{ stylist.bio }}</p>
          <div class="stylist-rating">
            <div class="stars">
              <span v-for="star in 5" :key="star" class="star" :class="{ filled: star <= stylist.rating }">⭐</span>
            </div>
            <span class="rating-text">({{ stylist.rating }}/5)</span>
          </div>
          <button
            v-if="selectedService"
            @click="continueWithStylist(stylist)"
            class="continue-btn"
          >
            Continue with {{ stylist.name }}
          </button>
          <div v-else class="no-service-message">
            <p>Select a service first to book with {{ stylist.name }}</p>
            <router-link to="/services" class="select-service-btn">Choose Service</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const selectedService = ref(null)

const stylists = ref([
  {
    id: 1,
    name: 'Mike Johnson',
    title: 'Master Barber',
    experience: 8,
    rating: 4.9,
    image: require('@/asset/images/man-with-beard-hairdresser-with-client-man-with-comb-scissors.jpg'),
    specialties: ['Classic Cuts', 'Beard Styling', 'Fade Cuts'],
    bio: 'Mike is our master barber with over 8 years of experience. He specializes in classic cuts and modern fades, ensuring every client leaves looking sharp and confident.'
  },
  {
    id: 2,
    name: 'Sarah Williams',
    title: 'Senior Stylist',
    experience: 6,
    rating: 4.8,
    image: require('@/asset/images/medium-shot-man-hair-salon.jpg'),
    specialties: ['Hair Washing', 'Styling', 'Color Consultation'],
    bio: 'Sarah brings creativity and precision to every cut. With 6 years of experience, she excels in hair washing, styling, and helping clients find their perfect look.'
  },
  {
    id: 3,
    name: 'David Brown',
    title: 'Barber Specialist',
    experience: 5,
    rating: 4.7,
    image: require('@/asset/images/close-up-half-face-portrait-afro-american-man.jpg'),
    specialties: ['Buzz Cuts', 'Trimming', 'Precision Cuts'],
    bio: 'David is known for his attention to detail and precision. He specializes in buzz cuts and trimming, delivering consistent, high-quality results every time.'
  },
  {
    id: 4,
    name: 'Lisa Davis',
    title: 'Style Consultant',
    experience: 7,
    rating: 4.9,
    image: require('@/asset/images/african-american-man-guy-sitting-chair-wash-hair.jpg'),
    specialties: ['Consultations', 'Premium Services', 'Hair Care'],
    bio: 'Lisa is our style consultant who helps clients choose the perfect look. With 7 years of experience, she offers premium services and expert hair care advice.'
  }
])

const continueWithStylist = (stylist) => {
  if (!selectedService.value) {
    alert('Please select a service first')
    return
  }

  // Navigate to booking page with both service and stylist information
  router.push({
    path: '/booking',
    query: {
      serviceId: selectedService.value.id,
      serviceName: selectedService.value.name,
      price: selectedService.value.price,
      duration: selectedService.value.duration,
      stylistId: stylist.id,
      stylistName: stylist.name,
      preferredStylist: stylist.name
    }
  })
}

onMounted(() => {
  // Check if a service was selected from the services page
  const storedService = localStorage.getItem('selectedService')
  if (storedService) {
    selectedService.value = JSON.parse(storedService)
  }
})
</script>

<style scoped>
.stylists {
  padding: 2rem;
  background: linear-gradient(135deg, #f4e4bc 0%, #f0d49c 100%);
  min-height: 100vh;
}

.stylists-header {
  text-align: center;
  margin-bottom: 4rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.stylists-header h1 {
  color: #2c2c2c;
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.header-description {
  color: #5a5a5a;
  font-size: 1.2rem;
  line-height: 1.6;
  margin: 0;
}

.stylists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 3rem;
  max-width: 1400px;
  margin: 0 auto;
}

.stylist-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
}

.stylist-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(212, 175, 55, 0.2);
}

.stylist-image {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.stylist-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.stylist-card:hover .stylist-image img {
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

.stylist-card:hover .image-overlay {
  opacity: 1;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  background: white;
  color: #d4af37;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.social-link:hover {
  transform: scale(1.1);
  background: #d4af37;
  color: white;
}

.stylist-info {
  padding: 2rem;
}

.stylist-info h3 {
  color: #2c2c2c;
  font-size: 1.8rem;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
}

.stylist-title {
  color: #d4af37;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.stylist-experience {
  color: #5a5a5a;
  font-size: 0.9rem;
  margin: 0 0 1.5rem 0;
  font-style: italic;
}

.stylist-specialties h4 {
  color: #2c2c2c;
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.specialty-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.specialty-tag {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  color: #2c2c2c;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.stylist-bio {
  color: #5a5a5a;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.stylist-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.stars {
  display: flex;
  gap: 0.2rem;
}

.star {
  font-size: 1.2rem;
  filter: grayscale(100%);
  transition: filter 0.3s ease;
}

.star.filled {
  filter: grayscale(0%);
}

.rating-text {
  color: #5a5a5a;
  font-size: 0.9rem;
  font-weight: 600;
}

.continue-btn {
  width: 100%;
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  color: #2c2c2c;
  border: none;
  padding: 15px 24px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.continue-btn:hover {
  background: linear-gradient(135deg, #f4e4bc 0%, #d4af37 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(212, 175, 55, 0.4);
}

.no-service-message {
  text-align: center;
  padding: 1rem;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 10px;
  border: 2px dashed rgba(212, 175, 55, 0.3);
}

.no-service-message p {
  color: #5a5a5a;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.select-service-btn {
  display: inline-block;
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
  color: #2c2c2c;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.select-service-btn:hover {
  background: linear-gradient(135deg, #f4e4bc 0%, #d4af37 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(212, 175, 55, 0.4);
}

@media (max-width: 768px) {
  .stylists {
    padding: 1rem;
  }

  .stylists-header h1 {
    font-size: 2.5rem;
  }

  .stylists-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .stylist-card {
    margin: 0 auto;
    max-width: 400px;
  }
}
</style>
