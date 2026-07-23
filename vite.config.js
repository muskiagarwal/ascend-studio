import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { ascendApi } from './server/generate.js'

// Relative asset paths so the built site works on GitHub Pages project
// subpaths (https://<user>.github.io/ascend-studio/) with no extra config.
export default defineConfig(({ mode }) => {
  // '' = load every var, not just VITE_*. ANTHROPIC_API_KEY stays server-side:
  // it is handed to the API middleware below and is never exposed to the client
  // (only VITE_-prefixed vars reach the browser bundle).
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY

  return {
    plugins: [react(), ascendApi(apiKey)],
    base: './',
    server: {
      port: process.env.PORT ? Number(process.env.PORT) : 5173,
    },
  }
})
