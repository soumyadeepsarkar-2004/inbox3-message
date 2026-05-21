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
    chunkSizeWarningLimit: 2000,
    commonjsOptions: { transformMixedEsModules: true, include: [/node_modules/] }
  }
})