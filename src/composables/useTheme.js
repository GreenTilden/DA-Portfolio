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
  }
}

const currentTheme = ref('forest')

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

  return {
    currentTheme: computed(() => currentTheme.value),
    setTheme,
    availableThemes: Object.keys(themes)
  }
}