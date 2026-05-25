import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Stamp the service worker with a build timestamp so every new deploy
// produces a new cache name, triggering the update flow in browsers.
function stampServiceWorker() {
  return {
    name: 'stamp-sw',
    closeBundle() {
      const swPath = path.resolve(__dirname, 'dist/sw.js')
      if (fs.existsSync(swPath)) {
        let src = fs.readFileSync(swPath, 'utf8')
        src = src.replace('__BUILD_VERSION__', Date.now().toString())
        fs.writeFileSync(swPath, src)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), stampServiceWorker()],
  // Copy sw.js from public → dist without hashing (must stay at /sw.js)
  publicDir: 'public',
})
