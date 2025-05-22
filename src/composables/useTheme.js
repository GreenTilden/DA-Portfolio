import { ref, computed } from 'vue'

const themes = {
  forest: {
    '--bg-color': '#1b2a26',
    '--section-bg': '#253f3a',
    '--card-bg': '#2e4a45',
    '--primary-color': '#4ecca3',
    '--primary-dark': '#2e8b67',
    '--secondary-color': '#e3b23c'
  },
  ocean: {
    '--bg-color': '#1e2a38',
    '--section-bg': '#2a3648',
    '--card-bg': '#324158',
    '--primary-color': '#4a90e2',
    '--primary-dark': '#3367b2',
    '--secondary-color': '#6e88a6'
  },
  monochrome: {
    '--bg-color': '#1a1a1a',
    '--section-bg': '#2d2d2d',
    '--card-bg': '#3a3a3a',
    '--primary-color': '#ffffff',
    '--primary-dark': '#e0e0e0',
    '--secondary-color': '#c0c0c0'
  },
  purdue: {
    '--bg-color': '#1a1612',
    '--section-bg': '#2a241f',
    '--card-bg': '#3d342a',
    '--primary-color': '#cfb53b',
    '--primary-dark': '#b19d2e',
    '--secondary-color': '#8b7355'
  },
  pacers: {
    '--bg-color': '#0a1929',
    '--section-bg': '#1e2a3a',
    '--card-bg': '#2d3748',
    '--primary-color': '#fdbb30',
    '--primary-dark': '#e6a829',
    '--secondary-color': '#4a90e2'
  }
}

const currentTheme = ref('monochrome')

export function useTheme() {
  const setTheme = (themeName) => {
    if (themes[themeName]) {
      currentTheme.value = themeName
      const root = document.documentElement
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