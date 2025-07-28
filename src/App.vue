<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-brand">
        <h2>✂️ Elite Barber Shop</h2>
      </div>
      <div class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/services">Services</router-link>
        <router-link to="/stylists">Stylists</router-link>
        <router-link to="/booking">Book Now</router-link>
        <router-link to="/payment">Payment</router-link>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #2c3e50;
  color: white;
}

.nav-links a {
  color: white;
  text-decoration: none;
  margin-left: 2rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background 0.3s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  background: #34495e;
}
</style>