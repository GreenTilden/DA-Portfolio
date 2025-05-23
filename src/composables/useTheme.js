import { ref, computed } from 'vue'

const themes = {
  forest: {
    '--bg-color': '#1b2a26',
    '--section-bg': '#253f3a',
    '--card-bg': '#2e4a45',
    '--primary-color': '#4ecca3',
    '--primary-dark': '#2e8b67',
    '--secondary-color': '#e3b23c',
    '--text-color': '#f0f0f0',
    '--text-light': '#f0f0f0',
    '--text-faded': '#c5c5c5',
    '--border-color': '#3f4f65',
    '--primary-color-rgb': '78, 204, 163',
    '--secondary-color-rgb': '227, 178, 60',
    '--icon-color': '#4ecca3',
    '--icon-bg': 'rgba(78, 204, 163, 0.2)',
    '--icon-border': 'rgba(78, 204, 163, 0.4)',
    '--bg-light': '#2e4a45',
    '--card-gradient-start': '#2e4a45',
    '--card-gradient-end': 'rgba(78, 204, 163, 0.7)',
    '--button-text-dark': '#ffffff',
    '--button-text-light': '#1b2a26',
    '--hover-bg': 'rgba(78, 204, 163, 0.1)',
    '--success-color': '#10B981',
    '--error-color': '#EF4444',
    '--warning-color': '#F59E0B'
  },
  ocean: {
    '--bg-color': '#1e2a38',
    '--section-bg': '#2a3648',
    '--card-bg': '#324158',
    '--primary-color': '#4a90e2',
    '--primary-dark': '#3367b2',
    '--secondary-color': '#6e88a6',
    '--text-color': '#f0f0f0',
    '--text-light': '#f0f0f0',
    '--text-faded': '#c5c5c5',
    '--border-color': '#4a5568',
    '--primary-color-rgb': '74, 144, 226',
    '--secondary-color-rgb': '110, 136, 166',
    '--icon-color': '#5fa4ff',
    '--icon-bg': 'rgba(74, 144, 226, 0.2)',
    '--icon-border': 'rgba(74, 144, 226, 0.4)',
    '--bg-light': '#324158',
    '--card-gradient-start': '#324158',
    '--card-gradient-end': 'rgba(74, 144, 226, 0.7)',
    '--button-text-dark': '#ffffff',
    '--button-text-light': '#1e2a38',
    '--hover-bg': 'rgba(74, 144, 226, 0.1)',
    '--success-color': '#10B981',
    '--error-color': '#EF4444',
    '--warning-color': '#F59E0B'
  },
  monochrome: {
    '--bg-color': '#1a1a1a',
    '--section-bg': '#2d2d2d',
    '--card-bg': '#3a3a3a',
    '--primary-color': '#d0d0d0',
    '--primary-dark': '#b0b0b0',
    '--secondary-color': '#a0a0a0',
    '--text-color': '#f0f0f0',
    '--text-light': '#f0f0f0',
    '--text-faded': '#b0b0b0',
    '--border-color': '#555555',
    '--primary-color-rgb': '208, 208, 208',
    '--secondary-color-rgb': '160, 160, 160',
    '--icon-color': '#d0d0d0',
    '--icon-bg': 'rgba(208, 208, 208, 0.2)',
    '--icon-border': 'rgba(208, 208, 208, 0.4)',
    '--bg-light': '#3a3a3a',
    '--card-gradient-start': '#3a3a3a',
    '--card-gradient-end': 'rgba(70, 70, 70, 0.9)',
    '--button-text-dark': '#000000',
    '--button-text-light': '#ffffff',
    '--hover-bg': 'rgba(208, 208, 208, 0.1)',
    '--success-color': '#10B981',
    '--error-color': '#EF4444',
    '--warning-color': '#F59E0B'
  },
  purdue: {
    '--bg-color': '#1a1612',
    '--section-bg': '#2a241f',
    '--card-bg': '#3d342a',
    '--primary-color': '#cfb53b',
    '--primary-dark': '#b19d2e',
    '--secondary-color': '#8b7355',
    '--text-color': '#f0f0f0',
    '--text-light': '#f0f0f0',
    '--text-faded': '#c5c5c5',
    '--border-color': '#5d4a37',
    '--primary-color-rgb': '207, 181, 59',
    '--secondary-color-rgb': '139, 115, 85',
    '--icon-color': '#3d342a',  // Fixed to match background
    '--icon-bg': 'rgba(207, 181, 59, 0.2)',
    '--icon-border': 'rgba(207, 181, 59, 0.6)',
    '--bg-light': '#3d342a',
    '--card-gradient-start': '#3d342a',
    '--card-gradient-end': 'rgba(207, 181, 59, 0.7)',
    '--button-text-dark': '#1a1612',
    '--button-text-light': '#ffffff',
    '--hover-bg': 'rgba(207, 181, 59, 0.15)',
    '--success-color': '#10B981',
    '--error-color': '#EF4444',
    '--warning-color': '#F59E0B'
  },
  pacers: {
    '--bg-color': '#0a1929',
    '--section-bg': '#1e2a3a',
    '--card-bg': '#2d3748',
    '--primary-color': '#fdbb30',
    '--primary-dark': '#e6a829',
    '--secondary-color': '#4a90e2',
    '--text-color': '#f0f0f0',
    '--text-light': '#f0f0f0',
    '--text-faded': '#c5c5c5',
    '--border-color': '#3d4b61',
    '--primary-color-rgb': '253, 187, 48',
    '--secondary-color-rgb': '74, 144, 226',
    '--icon-color': '#00285e',
    '--icon-bg': 'rgba(0, 40, 94, 0.2)',
    '--icon-border': 'rgba(0, 40, 94, 0.4)',
    '--bg-light': '#2d3748',
    '--card-gradient-start': '#2d3748',
    '--card-gradient-end': 'rgba(253, 187, 48, 0.7)',
    '--button-text-dark': '#0a1929',
    '--button-text-light': '#ffffff',
    '--hover-bg': 'rgba(253, 187, 48, 0.1)',
    '--success-color': '#10B981',
    '--error-color': '#EF4444',
    '--warning-color': '#F59E0B'
  }
}

const currentTheme = ref('pacers')

export function useTheme() {
  const setTheme = (themeName) => {
    if (themes[themeName]) {
      currentTheme.value = themeName
      const root = document.documentElement
      root.setAttribute('data-theme', themeName)
      Object.entries(themes[themeName]).forEach(([property, value]) => {
        root.style.setProperty(property, value)
      })
    }
  }

  const getThemeDisplayName = (themeName) => {
    const displayNames = {
      forest: '🌲 Forest',
      ocean: '🌊 Ocean', 
      monochrome: '⚫ Monochrome',
      purdue: '🚂 Purdue',
      pacers: '🏀🌽 Pacers'
    }
    return displayNames[themeName] || themeName
  }

  return {
    currentTheme: computed(() => currentTheme.value),
    setTheme,
    availableThemes: Object.keys(themes),
    getThemeDisplayName
  }
}