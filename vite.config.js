import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'
import path from 'path'
import { createHtmlPlugin } from 'vite-plugin-html'

export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    VueDevTools(),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          title: 'Darren Arney - Automation Professional',
          favicon: '/favicon.png'
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5176,
    historyApiFallback: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router'],
          'element-plus': ['element-plus'],
          'particles': ['vue3-particles', 'tsparticles'],
          'draggable': ['vue-draggable-next'],
          'workflow-utils': [
            './src/utils/optimizationEngine.ts',
            './src/composables/useWorkflowState.ts',
            './src/composables/useModalWorkflowEditor.ts'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
})