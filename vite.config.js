import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: ['index.html', 'poc-2/index.html'],
    },
  },
})
