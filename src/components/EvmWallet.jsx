import React from 'react'
import { useAccount, useBalance } from 'wagmi'
import { ethers } from 'ethers'

export function EvmWallet() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({
    address,
  })

  const handleTransfer = async () => {
    if (!isConnected || !window.ethereum) {
      alert('Please connect wallet first')
      return
    }

    try {
      const signer = provider.getSigner()

      // 这里需要替换为实际的接收地址
      const recipientAddress = 'YOUR_RECIPIENT_ADDRESS'
      const amount = ethers.parseEther('0.01') // 0.01 ETH

      const tx = await signer.sendTransaction({
        to: recipientAddress,
        value: amount
      })

      console.log('Transaction sent:', tx.hash)
      const receipt = await tx.wait()
      console.log('Transaction successful:', receipt)
      alert('Transaction successful!')
    } catch (e) {
      console.error('Transaction failed:', e)
      alert('Transaction failed: ' + e.message)
    }
  }

  return (
    <div className="space-y-4">
      {!isConnected ? (
        <button
          onClick={() => open()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-full"
        >
          Connect EVM Wallet
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded space-y-2">
            <div>
              <p className="text-sm">Connected Account:</p>
              <p className="font-mono text-sm truncate">{address}</p>
            </div>
            <div>
              <p className="text-sm">Balance:</p>
              <p className="font-mono text-sm">
                {balance?.formatted} {balance?.symbol}
              </p>
            </div>
          </div>
          <button
            onClick={handleTransfer}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors w-full"
          >
            Transfer ETH
          </button>
        </div>
      )}
    </div>
  )
}
