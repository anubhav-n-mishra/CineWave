import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import nodePolyfills from 'rollup-plugin-node-polyfills'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      util:    'util',
      events:  'events',
      stream:  'stream-browserify',
      buffer:  'buffer',
      process: 'process/browser',
      path:    'path',
      crypto:  'crypto-browserify'
    }
  },
  optimizeDeps: {
    include: [
      'simple-peer',
      'react-youtube',
      'events',
      'stream-browserify',
      'util',
      'buffer',
      'process/browser',
      'path',
      'crypto-browserify'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
        'process.env': '{}'
      }
    }
  },
  build: {
    rollupOptions: {
      plugins: [
        nodePolyfills()
      ]
    }
  }
});