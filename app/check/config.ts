import { createWalletClient, createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base, polygonMumbai, optimismSepolia } from 'viem/chains'

export const walletClient = createWalletClient({
  chain: optimismSepolia,
  transport:  http(process.env.RPC_URL)
})

export const publicClient = createPublicClient({
  chain: optimismSepolia,
  transport: http(process.env.RPC_URL)
})

export const account = privateKeyToAccount(`0x${process.env.WK}`)