<template>
  <div id="app" @click.self="closeMenu">
    <header class="header">
      <div class="content-container">
        <div class="header-content">
          <div class="header-left">
            <div class="logo">
              <router-link to="/">
                <h1 class="site-title">Darren Arney</h1>
                <p class="tagline">Automation Professional</p>
              </router-link>
            </div>
            <!-- Theme Selector anchored to bottom -->
            <div class="header-theme-selector">
              <button @click="toggleThemeMenu" class="theme-toggle" :class="{ active: showThemeMenu }">
                {{ getThemeDisplayName(currentTheme) }}
                <svg class="dropdown-icon" :class="{ rotated: showThemeMenu }" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </button>
              <div v-show="showThemeMenu" class="theme-dropdown">
                <button 
                  v-for="theme in availableThemes" 
                  :key="theme"
                  @click="selectTheme(theme)"
                  class="theme-choice"
                  :class="{ active: currentTheme === theme }"
                >
                  {{ getThemeDisplayName(theme) }}
                </button>
              </div>
            </div>
          </div>
          <nav class="main-nav">
            <div class="menu-toggle" @click.stop="toggleMenu" :class="{ 'active': menuActive }">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <ul class="nav-links desktop-links">
              <li><router-link to="/" exact>Home</router-link></li>
              <li><router-link to="/demos">Interactive Demos</router-link></li>
              <li><router-link to="/projects">Projects</router-link></li>
              <li><router-link to="/experience">Experience</router-link></li>
              <li><router-link to="/contact">Contact</router-link></li>
            </ul>
          </nav>
          
          <!-- Custom mobile menu pop-out -->
          <div class="mobile-menu-overlay" v-if="menuActive" :class="{ 'active': menuActive }" @click.self="closeMenu">
            <div class="mobile-menu-popout">
              <div class="mobile-menu-header">
                <div class="mobile-menu-title">Menu</div>
                <button class="mobile-menu-close" @click="closeMenu">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <ul class="nav-links mobile-links">
                <li><router-link to="/" exact @click="closeMenu">Home</router-link></li>
                <li><router-link to="/demos" @click="closeMenu">Interactive Demos</router-link></li>
                <li><router-link to="/projects" @click="closeMenu">Projects</router-link></li>
                <li><router-link to="/experience" @click="closeMenu">Experience</router-link></li>
                <li><router-link to="/contact" @click="closeMenu">Contact</router-link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
    
    <main class="main-content">
      <div class="content-container">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <footer class="footer">
      <div class="content-container">
        <div class="footer-content">
          <div class="copyright">
            &copy; {{ new Date().getFullYear() }} Darren Arney 
          </div>
          <div class="social-links">
            <a href="https://github.com/greentilden" target="_blank" rel="noopener" title="GitHub">
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
import { useTheme } from '@/composables/useTheme';

export default {
  components: {},
  setup() {
    const { currentTheme, setTheme, availableThemes, getThemeDisplayName } = useTheme();
    return {
      currentTheme,
      setTheme,
      availableThemes,
      getThemeDisplayName
    };
  },
  data() {
    return {
      menuActive: false,
      isMobile: false,
      showThemeMenu: false
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    // Close theme menu when clicking outside
    document.addEventListener('click', this.closeThemeMenu);
    // Initialize the theme on mount
    this.setTheme('monochrome');
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
    document.removeEventListener('click', this.closeThemeMenu);
  },
  methods: {
    checkIfMobile() {
      this.isMobile = window.innerWidth < 768;
      if (!this.isMobile && this.menuActive) {
        this.menuActive = false;
        document.body.style.overflow = '';
      }
    },
    toggleMenu() {
      this.menuActive = !this.menuActive;
      // Prevent body scroll when menu is active on mobile
      if (this.isMobile) {
        document.body.style.overflow = this.menuActive ? 'hidden' : '';
      }
    },
    closeMenu() {
      this.menuActive = false;
      document.body.style.overflow = '';
    },
    toggleThemeMenu(event) {
      event.stopPropagation();
      this.showThemeMenu = !this.showThemeMenu;
    },
    selectTheme(theme) {
      this.setTheme(theme);
      this.showThemeMenu = false;
    },
    closeThemeMenu(event) {
      if (!event.target.closest('.header-theme-selector')) {
        this.showThemeMenu = false;
      }
    }
  },
  watch: {
    $route() {
      this.menuActive = false;
      document.body.style.overflow = '';
    }
  }
}
</script>

<style>
/* Import professional fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@500;600;700&family=Roboto+Mono:wght@400;500&display=swap');

/* Root variables - this provides the foundation colors and spacing for the entire app */
:root {
  --bg-color: #1b2a26;             /* Deep forest green - Main page background */
  --section-bg: #253f3a;           /* Dark pine - Hero and specialty sections */
  --card-bg: #2e4a45;              /* Medium forest - Individual cards */
  --primary-color: #4ecca3;        /* Mint/sage green - CTA buttons and highlights */
  --primary-dark: #2e8b67;         /* Darker mint - Hover states */
  --secondary-color: #e3b23c;      /* Warm amber/gold - Secondary accents */
  --text-color: #f0f0f0;           /* Light text - Primary text */
  --text-light: #f0f0f0;           /* Light text - Emphasized text */
  --text-faded: #c5c5c5;           /* Muted text - Secondary/muted text */
  --border-color: #3f4f65;         /* Card borders and dividers */
  --success-color: #10B981;
  --error-color: #EF4444;
  --warning-color: #F59E0B;
  --shadow-sm: 0 2px 5px rgba(0, 0, 0, 0.15);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.25);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.3);
}

/* Base elements - sets up fundamental styling for the entire application */
body {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-light);
  background-color: var(--bg-color);
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

a {
  color: var(--primary-color);
  text-decoration: none;
  transition: all 0.3s ease;
}

a:hover {
  color: var(--primary-dark);
}

/* Layout containers - provides consistent page structure and responsive behavior */
#app {
  width: 100%;
  margin: 0 auto;
  padding: 0.5rem;
  box-sizing: border-box;
}

.content-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  box-sizing: border-box;
}

/* Header & Navigation - creates the sticky header with responsive navigation */
.header {
  background-color: var(--section-bg);
  color: var(--text-light);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid var(--border-color);
  border-radius: 1rem 1rem 0.5rem 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  overflow: visible;
  padding: 0.25rem 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem 0.5rem;
  position: relative;
}

/* Header left section - column layout with theme selector anchored to bottom */
.header-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: auto;
  padding: 0;
  gap: 0;
}

/* Logo styles - ensures consistent branding presentation */
.logo a {
  color: var(--text-light);
  display: block;
  width: 100%;
  line-height: 1;
}

.site-title, .logo h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  line-height: 1;
}

.tagline {
  font-size: 0.875rem;
  color: var(--text-faded);
  margin: 0;
  line-height: 1;
  text-align: left;
  white-space: nowrap;
}

/* Header theme selector - positioned directly under the tagline */
.header-theme-selector {
  position: relative;
  margin-top: -1.5rem;
  align-self: flex-start;
}

.theme-toggle {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.35rem 0.7rem;
  border-radius: 0.4rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 120px;
  justify-content: space-between;
  text-align: left;
  position: relative;
  z-index: 1;
}

/* Improve contrast for monochrome theme */
[data-theme="monochrome"] .theme-toggle {
  color: #000000;
  background-color: #d0d0d0;
  border: 1px solid #707070;
}

[data-theme="monochrome"] .theme-toggle:hover {
  background-color: #e0e0e0;
}

.theme-toggle:hover {
  background-color: var(--primary-dark);
  transform: translateY(-1px);
}

.theme-toggle.active {
  background-color: var(--primary-dark);
}

.dropdown-icon {
  transition: transform 0.3s ease;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

/* Theme dropdown improvements */
.theme-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.4rem;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.4rem;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  min-width: 140px;
  z-index: 1100;
}

.theme-choice {
  display: block;
  width: 100%;
  padding: 0.6rem 1rem;
  background: transparent;
  color: var(--text-light);
  border: none;
  cursor: pointer;
  font-size: 0.75rem;
  text-align: left;
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--border-color);
}

.theme-choice:last-child {
  border-bottom: none;
}

.theme-choice:hover {
  background-color: var(--primary-color);
  color: white;
}

[data-theme="monochrome"] .theme-choice:hover {
  background-color: #d0d0d0;
  color: #000000;
}

.theme-choice.active {
  background-color: var(--primary-color);
  color: white;
  font-weight: 600;
}

[data-theme="monochrome"] .theme-choice.active {
  background-color: #d0d0d0;
  color: #000000;
}

/* Main navigation - handles both desktop and mobile navigation states */
.main-nav {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  align-self: stretch;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 1.25rem;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
}

.nav-links li {
  margin-left: 1.5rem;
  white-space: nowrap;
}

.nav-links a {
  color: var(--text-light);
  opacity: 0.9;
  font-weight: 500;
  padding: 0.5rem 0.25rem;
  position: relative;
  display: inline-block;
  text-align: center;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  opacity: 1;
  color: var(--primary-color);
}

.nav-links a.router-link-active:after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-color);
  border-radius: 1px;
}

/* Hamburger menu toggle - Enhanced styling */
.menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  cursor: pointer;
  position: relative;
  z-index: 2100;
  background: var(--primary-color);
  border-radius: 8px;
  transition: all 0.3s ease;
  gap: 4px;
}

.menu-toggle:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.menu-toggle span {
  display: block;
  height: 2px;
  width: 20px;
  background-color: white;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border-radius: 2px;
  transform-origin: center;
  position: relative;
}

.menu-toggle.active {
  background: var(--primary-dark);
}

.menu-toggle.active span:nth-child(1) {
  transform: rotate(45deg) translate(0px, 6px);
}

.menu-toggle.active span:nth-child(2) {
  opacity: 0;
  transform: scale(0);
}

.menu-toggle.active span:nth-child(3) {
  transform: rotate(-45deg) translate(0px, -6px);
}

/* Monochrome theme adjustments */
[data-theme="monochrome"] .menu-toggle {
  background: #d0d0d0;
  border: 1px solid #707070;
}

[data-theme="monochrome"] .menu-toggle span {
  background-color: #000000;
}

[data-theme="monochrome"] .menu-toggle:hover {
  background: #e0e0e0;
}

[data-theme="monochrome"] .menu-toggle.active {
  background: #b0b0b0;
}

/* Mobile Menu Pop-out Styling */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 2000;
  display: flex;
  justify-content: flex-end;
  overflow: hidden;
  opacity: 0;
  visibility: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.mobile-menu-overlay.active {
  opacity: 1;
  visibility: visible;
}

.mobile-menu-popout {
  width: 80%;
  max-width: 320px;
  height: 100%;
  background-color: var(--section-bg);
  box-shadow: -5px 0 25px rgba(0, 0, 0, 0.3);
  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
  padding: 0;
  border-left: 1px solid var(--border-color);
}

.mobile-menu-overlay.active .mobile-menu-popout {
  transform: translateX(0);
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.mobile-menu-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-light);
}

.mobile-menu-close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

[data-theme="monochrome"] .mobile-menu-close {
  background-color: #d0d0d0;
  color: #000000;
}

.mobile-menu-close:hover {
  transform: rotate(90deg);
  background-color: var(--primary-dark);
}

[data-theme="monochrome"] .mobile-menu-close:hover {
  background-color: #b0b0b0;
}

.mobile-links {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  gap: 0.5rem;
}

.mobile-links li {
  margin: 0;
  padding: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

[data-theme="monochrome"] .mobile-links li {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.mobile-links li:last-child {
  border-bottom: none;
}

.mobile-links a {
  display: block;
  padding: 0.75rem 1rem;
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--text-light);
  transition: all 0.3s ease;
  border-radius: 0.5rem;
  margin: 0.5rem 0;
}

.mobile-links a:hover {
  background-color: var(--primary-color);
  color: white;
  transform: translateX(8px);
}

[data-theme="monochrome"] .mobile-links a:hover {
  background-color: #d0d0d0;
  color: #000000;
}

.mobile-links a.router-link-active {
  color: var(--primary-color);
  font-weight: 600;
}

[data-theme="monochrome"] .mobile-links a.router-link-active {
  color: #000000;
}

/* Animation for menu items */
.mobile-links li {
  opacity: 0;
  transform: translateX(20px);
  transition: opacity 0.4s ease, transform 0.4s ease;
  transition-delay: 0s;
}

.mobile-menu-overlay.active .mobile-links li {
  opacity: 1;
  transform: translateX(0);
  transition-delay: calc(0.1s + (0.05s * var(--index, 0)));
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Apply animation delays to each menu item */
.mobile-links li:nth-child(1) { --index: 1; }
.mobile-links li:nth-child(2) { --index: 2; }
.mobile-links li:nth-child(3) { --index: 3; }
.mobile-links li:nth-child(4) { --index: 4; }
.mobile-links li:nth-child(5) { --index: 5; }

/* Main content - provides consistent spacing for page content */
.main-content {
  min-height: calc(100vh - 140px);
  padding: 2rem 0;
}

/* Footer - creates consistent bottom section across all pages */
.footer {
  background-color: var(--section-bg);
  color: var(--text-faded);
  padding: 1.5rem 0;
  border-top: 1px solid var(--border-color);
  border-radius: 1rem;
  margin-top: 2rem;
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
  color: var(--text-light);
  opacity: 0.8;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
}

.social-links a:hover {
  opacity: 1;
  color: var(--primary-color);
}

/* Transitions and animations - provides smooth page transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* UI components styling - ensures consistent button and card styling across the app */
button, .btn, .el-button {
  border-radius: 6px !important;
  font-weight: 500 !important;
  letter-spacing: 0.3px !important;
  transition: all 0.3s ease !important;
}

.el-card {
  background-color: var(--card-bg) !important;
  border-color: var(--border-color) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

code, pre {
  font-family: 'Roboto Mono', monospace !important;
  background-color: rgba(0, 0, 0, 0.2) !important;
  border-radius: 4px !important;
}

/* Mobile responsiveness - adjusts layout and navigation for smaller screens */
@media (max-width: 768px) {
  .content-container {
    padding: 0 1rem;
  }
  
  .header-content {
    padding: 1rem 0.5rem;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }

  /* Header left section adjustments for mobile */
  .header-left {
    flex: 1;
    width: auto;
    max-width: 70%;
  }
  
  .main-nav {
    flex: 0 0 auto;
    align-items: center;
  }

  .theme-toggle {
    font-size: 0.8rem;
    padding: 0.35rem 0.7rem;
    min-width: 110px;
  }

  /* Show hamburger menu on mobile */
  .menu-toggle {
    display: flex;
  }
  
  /* Hide desktop links on mobile */
  .desktop-links {
    display: none;
  }

  /* Mobile footer adjustments */
  .footer-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}

/* Medium screen navigation adjustments - handles the tricky middle screen sizes */
@media (min-width: 768px) and (max-width: 1024px) {
  .header-content {
    align-items: flex-start;
  }
  
  .header-left {
    align-items: flex-start;
  }
  
  .nav-links {
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }

  .nav-links li {
    margin-left: 0;
  }

  .nav-links a {
    font-size: 0.85rem;
    padding: 0.375rem 0.25rem;
  }
}

/* Responsive tuning for tighter control */
@media (max-width: 880px) {
  .header-left {
    align-items: flex-start;
  }
}
</style>