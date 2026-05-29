import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    nodePolyfills({
      include: ['stream', 'crypto', 'events', 'util', 'path', 'os', 'fs', 'readline', 'tty', 'assert', 'vm'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  optimizeDeps: {
    include: ['@aptos-labs/ts-sdk', '@aptos-labs/wallet-adapter-react', 'tweetnacl'],
    esbuildOptions: { target: 'esnext' }
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 2100,
    commonjsOptions: { transformMixedEsModules: true, include: [/node_modules/] },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'aptos-vendor': ['@aptos-labs/ts-sdk', '@aptos-labs/wallet-adapter-react'],
          'motion-vendor': ['framer-motion'],
          'utils-vendor': ['zustand', 'lucide-react', 'sonner', 'tweetnacl', 'tweetnacl-util'],
        },
      },
    },
  },
})
