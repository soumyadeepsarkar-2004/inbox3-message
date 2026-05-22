import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['@aptos-labs/ts-sdk', '@aptos-labs/wallet-adapter-react', 'tweetnacl'],
    esbuildOptions: { target: 'esnext' }
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1500,
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
