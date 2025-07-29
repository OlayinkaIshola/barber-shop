// Simple test to verify API connection from frontend
import axios from 'axios'

const testAPI = async () => {
  try {
    console.log('Testing API connection...')
    
    // Test health endpoint
    const response = await axios.get('http://localhost:5000/api/health')
    console.log('✅ API Health Check:', response.data)
    
    // Test services endpoint
    const services = await axios.get('http://localhost:5000/api/services')
    console.log('✅ Services:', services.data.count, 'services found')
    
    // Test login
    const login = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'mike.johnson@elitebarbershop.com',
      password: 'barber123'
    })
    console.log('✅ Login successful for:', login.data.data.fullName)
    
    return true
  } catch (error) {
    console.error('❌ API Test Failed:', error.message)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
    return false
  }
}

// Export for use in components
export default testAPI
