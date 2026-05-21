import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AptosWalletAdapterProvider autoConnect={false}>
      <App />
    </AptosWalletAdapterProvider>
  </StrictMode>
)