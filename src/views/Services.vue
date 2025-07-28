<template>
  <div class="services">
    <h1>Our Services</h1>
    <div class="service-grid">
      <div v-for="service in services" :key="service.id" class="service-card">
        <h3>{{ service.name }}</h3>
        <p>{{ service.description }}</p>
        <div class="price">${{ service.price }}</div>
        <div class="duration">{{ service.duration }} min</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const services = ref([
  { id: 1, name: 'Classic Haircut', description: 'Traditional scissor cut', price: 25, duration: 30 },
  { id: 2, name: 'Beard Trim', description: 'Professional beard styling', price: 15, duration: 20 },
  { id: 3, name: 'Hair Wash & Style', description: 'Complete wash and styling', price: 35, duration: 45 },
  { id: 4, name: 'Buzz Cut', description: 'Clean clipper cut', price: 20, duration: 15 },
  { id: 5, name: 'Premium Package', description: 'Haircut + beard trim + wash', price: 50, duration: 60 }
])
</script>

<style scoped>
.services {
  padding: 2rem;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.service-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}

.price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #e74c3c;
  margin: 1rem 0;
}

.duration {
  color: #666;
  font-style: italic;
}
</style>