import { AssetData } from "@/context/helpers/types"
import { TTransferParams } from "./useForm"

export type TWalletHook<T> = {
  client: T | null,
  isConnected: boolean
  isClientActive: boolean
  connectHandler: () => void
  disconnectHandler: () => void
  session: {
    account: string // k:publicKey
    publicKey: string
  } | null
  transferCoins: (arg: TTransferParams) => Promise<void>
  currentBalance: AssetData | undefined,
  balances: number[]
}