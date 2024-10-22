"use client"

import { WalletProvider } from '@txnlab/use-wallet-react'
import { PeraWalletConnect } from '@perawallet/connect'
import { useEffect, useState } from 'react'
import { WalletManager, WalletId, NetworkId } from '@txnlab/use-wallet-react';

const wallets = [{ id: WalletId.PERA, name: 'Pera Wallet', connect: PeraWalletConnect }]

const manager = new WalletManager({
  wallets: wallets,
  network: NetworkId.TESTNET,
})

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <WalletProvider
      manager={manager}
    >
      {children}
    </WalletProvider>
  )
}
