import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { WebUploader } from '@irys/web-upload'
import { WebAptos } from '@irys/web-upload-aptos'
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react'

export function useIrysStorage() {
  const [uploading, setUploading] = useState(false)
  const [ephemeralMode, setEphemeralMode] = useState(false)
  
  // We need the raw wallet adapter to sign the Irys upload payload
  const { wallet, account } = useAptosWallet()

  const uploadPayload = useCallback(async (data: string): Promise<string | null> => {
    if (!wallet || !account) {
      toast.error('Wallet not connected for upload')
      return null
    }

    setUploading(true)
    
    try {
      const irysUploader = await WebUploader(WebAptos).withProvider(wallet).devnet()
      const receipt = await irysUploader.upload(data)
      return receipt.id
    } catch {
      toast.error('Failed to upload to storage')
      return null
    } finally {
      setUploading(false)
    }
  }, [wallet, account])

  return {
    uploadPayload,
    uploading,
    ephemeralMode,
    setEphemeralMode
  }
}
