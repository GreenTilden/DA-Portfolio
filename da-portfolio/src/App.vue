<template>
  <div id="app">
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <router-link to="/">
              <h1>Darren Arney</h1>
              <p class="tagline">Laboratory Automation & Engineering</p>
            </router-link>
          </div>
          
          <nav class="main-nav">
            <div class="menu-toggle" @click="toggleMenu">
              <span></span>
              <span></span>
              <span></span>
            </div>
            
            <ul class="nav-links" :class="{ 'active': menuActive }">
              <li><router-link to="/" exact>Home</router-link></li>
              <li><router-link to="/demos">Interactive Demos</router-link></li>
              <li><router-link to="/projects">Projects</router-link></li>
              <li><router-link to="/experience">Experience</router-link></li>
              <li><router-link to="/contact">Contact</router-link></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>

    <main class="main-content">
      <transition name="fade" mode="out-in">
        <router-view/>
      </transition>
    </main>

    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="copyright">
            &copy; {{ new Date().getFullYear() }} Darren Arney | Laboratory Automation
          </div>
          <div class="social-links">
            <a href="https://github.com/yourusername" target="_blank" rel="noopener" title="GitHub">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
            <a href="https://www.linkedin.com/in/darren-arney" target="_blank" rel="noopener" title="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      menuActive: false
    }
  },
  methods: {
    toggleMenu() {
      this.menuActive = !this.menuActive
    }
  },
  watch: {
    $route() {
      // Close mobile menu when route changes
      this.menuActive = false
    }
  }
}
</script>

<style>
:root {
  --primary-color: #4A90E2;
  --primary-dark: #357ABD;
  --secondary-color: #2C3E50;
  --text-color: #333333;
  --text-light: #666666;
  --bg-color: #F7F9FC;
  --bg-light: #FFFFFF;
  --border-color: #E0E6ED;
  --success-color: #10B981;
  --error-color: #EF4444;
  --warning-color: #F59E0B;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-color);
  background-color: var(--bg-color);
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.3s ease;
}

a:hover {
  color: var(--primary-dark);
}

.header {
  background-color: var(--primary-color);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.logo a {
  color: white;
  display: block;
}

.logo h1 {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 700;
}

.tagline {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-top: 0.25rem;
}

.main-nav {
  display: flex;
  align-items: center;
}

.nav-links {
  display: flex;
  list-style: none;
}

.nav-links li {
  margin-left: 1.5rem;
}

.nav-links a {
  color: white;
  opacity: 0.9;
  font-weight: 500;
  padding: 0.5rem 0;
  position: relative;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  opacity: 1;
}

.nav-links a.router-link-active:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: white;
}

.menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  cursor: pointer;
}

.menu-toggle span {
  height: 2px;
  width: 100%;
  background-color: white;
  transition: all 0.3s ease;
}

.main-content {
  min-height: calc(100vh - 140px);
  padding: 2rem 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.footer {
  background-color: var(--secondary-color);
  color: white;
  padding: 1.5rem 0;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-links a {
  color: white;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.social-links a:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .menu-toggle {
    display: flex;
  }

  .nav-links {
    position: fixed;
    top: 64px;
    left: 0;
    width: 100%;
    background-color: var(--primary-color);
    flex-direction: column;
    padding: 1rem;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .nav-links.active {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-links li {
    margin: 0.5rem 0;
  }

  .footer-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>