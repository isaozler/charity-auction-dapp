import { useCallback, useEffect, useState } from "react";
import { setBalanceAmount } from "@/context/clientContext";
import { DEFAULT_RECEIVER_CHAINID } from "@/context/constants";
import { apiGetKadenaAccountBalance } from "@/context/helpers/kadena";
import { AssetData } from "@/context/helpers/types";
import { TWalletHook } from "./types";
import { TTransferParams } from "./useForm";

type TClient = {
  status: "success" | "fail",
  message: string,
  account: {
    account: string,
    publicKey: string,
    connectedSites: string[]
  }
}

export const useXWallet = (): TWalletHook<TClient> => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isClientActive, setIsClientActive] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [client, setClient] = useState<TClient | null>(null);
  const [currentBalance, setCurrentBalance] = useState<AssetData>();
  const [balances, setBalances] = useState<number[]>([]);
  const isXWalletInstalled = () => {
    const { kadena } = window as any;

    return Boolean(kadena && kadena.isKadena);
  };
  const checkWalletExtension = useCallback(() => {
    const state = isXWalletInstalled()
    setIsClientActive(state)
  }, [])

  const kadenaRequest = useCallback(async () => {
    const { kadena } = window as any;

    const _conn = await kadena.request({
      method: 'kda_connect',
      networkId: process.env.NEXT_PUBLIC_NETWORK_ID
    })
    setClient(_conn)
  }, [])

  const connectHandler = useCallback(async () => {
    try {
      const { kadena } = window as any;

      setIsInitialized(true)

      const client: TClient = await kadena.request({
        method: 'kda_checkStatus',
        networkId: process.env.NEXT_PUBLIC_NETWORK_ID,
      });

      if (client.status === 'success') {
        setClient(client)
        setIsConnected(true)
      } else if (client.status === 'fail') {
        await kadenaRequest()
        setIsConnected(false)
      }
    } catch (error) {
      console.error('error: ', error)
    }
  }, [])

  const disconnectHandler = useCallback(async () => {
    const { kadena } = window as any;

    resetConnection()

    await kadena.request({
      method: 'kda_disconnect',
      networkId: process.env.NEXT_PUBLIC_NETWORK_ID
    })

  }, [])

  const resetConnection = useCallback(() => {
    setClient(null)
    setIsConnected(false)
    window.localStorage.clear()
  }, [])

  const getAccountBalance = useCallback(async () => {
    if (client?.account?.publicKey && process.env.NEXT_PUBLIC_NETWORK_ID) {
      const {
        chainBalances,
        ..._currentBalance
      } = await apiGetKadenaAccountBalance(client.account.publicKey, process.env.NEXT_PUBLIC_NETWORK_ID)
      setCurrentBalance(setBalanceAmount({
        ..._currentBalance
      }));
      setBalances(chainBalances as number[])
    }
  }, [client?.account?.publicKey])

  const transferCoins = useCallback(async ({ amount, to: account, chainId }: TTransferParams) => {
    try {
      const { kadena } = window as any;

      const _ = await kadena.request({
        method: 'kda_sendKadena',
        data: {
          networkId: process.env.NEXT_PUBLIC_NETWORK_ID,
          account,
          sourceChainId: chainId,
          chainId: `${DEFAULT_RECEIVER_CHAINID}`,
          amount,
        },
      });
    } catch (error) {
      console.error(error)
    }
  }, [])

  useEffect(() => {
    if (client && isConnected) {
      setIsConnected(true)
    }
  }, [client, isConnected])

  useEffect(() => {
    if (!isClientActive) {
      checkWalletExtension()
    }
  }, [])

  useEffect(() => {
    if (client?.account?.publicKey) {
      getAccountBalance()
    }
  }, [client?.account?.publicKey])

  return {
    client,
    isClientActive,
    isConnected,
    connectHandler,
    disconnectHandler,
    session: client?.account ? {
      account: client.account.account,
      publicKey: client.account.publicKey,
    } : null,
    transferCoins,
    currentBalance,
    balances,
  }
}
