export interface TransactionPayload {
  function?: string
  typeArguments?: string[]
  functionArguments?: unknown[]
  content?: string
  recipient?: string
}

export interface WalletState {
  connected: boolean
  address: string | null
  walletName: string | null
  connect: () => Promise<void>
  disconnect: () => void
  signAndSubmit: (payload: TransactionPayload) => Promise<string | null>
}
