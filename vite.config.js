import { defineConfig } from 'vite'

const production = process.env.VERCEL_PROJECT_PRODUCTION_URL
const site = production ? `https://${production}/` : ''

export default defineConfig({
  base: './',
  plugins: [
    {
      name: 'site-url',
      transformIndexHtml: html => html.replaceAll('__SITE__', site),
    },
  ],
})
