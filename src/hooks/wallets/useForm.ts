import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";

import { useXWallet } from "@/hooks/wallets/useXWallet";
import { TTransactionStatus, useWalletConnectV2 } from "@/hooks/wallets/useWalletConnect";

import { availableOrganizations, DEFAULT_CHAIN_ID, TOrganization } from "@/context/constants";
import { TWalletHook } from "@/hooks/wallets/types";
import { apiGetKadenaAccountBalance } from "@/context/helpers/kadena";
import { AssetData } from "@/context/helpers/types";

export type TWalletType = "XWallet" | "WalletConnect";
export type TFormHook = {
  setShowModal: Dispatch<SetStateAction<boolean>>
}
export type TTransferParams = {
  amount: number
  to: string
  chainId: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '19'
}

export const useForm = ({ setShowModal }: TFormHook) => {
  /** HOOKS */
  const {
    client: clientXWallet,
    isConnected: isConnectedXWallet,
    isClientActive: isActiveXWallet,
    connectHandler: connectHandlerXWallet,
    disconnectHandler: disconnectHandlerXWallet,
    session: sessionXWallet,
    transferCoins: transferCoinsXWallet,
    currentBalance: currentBalanceXConnect,
    balances: xWalletBalances,
  } = useXWallet();
  const {
    client: clientWalletConnect,
    isConnected: isConnectedWalletConnect,
    isClientActive: isActiveWalletConnect,
    connectHandler: connectHandlerWalletConnect,
    disconnectHandler: disconnectHandlerWalletConnect,
    session: sessionWalletConnect,
    transferCoins: transferCoinsWalletConnect,
    status: statusWalletConnect,
    currentBalance: currentBalanceWalletConnect,
    balances: walletConnectBalances,
  } = useWalletConnectV2();
  /** END HOOKS */

  const initialAmount = 1;
  const [organizations] = useState<TOrganization[]>(availableOrganizations);
  const [selectedOrganization, setSelectedOrganization] =
    useState<TOrganization | null>(null);
  const [availableClients, setAvailableClients] = useState<TWalletType[]>([]);
  const [selectedChain, setSelectedChain] = useState<TTransferParams['chainId'] | null>(DEFAULT_CHAIN_ID);
  const [activeClient, setActiveClient] = useState<TWalletType | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [session, setSession] = useState<
    TWalletHook<unknown>["session"] | null
  >(null);
  const [amount, setAmount] = useState(initialAmount);
  const [transactionStatus, setTransactionStatus] = useState<TTransactionStatus>();
  const [balances, setBalances] = useState<number[]>([]);
  const [currentBalance, setCurrentBalance] = useState<AssetData>();

  const transferCoins = useCallback(async (amount: number, to: string, chainId: TTransferParams['chainId']) => {
    if (!amount || !to) {
      return;
    }

    if (isConnected) {
      if (activeClient === "WalletConnect") {
        await transferCoinsWalletConnect({ amount, to, chainId })
      } else if (activeClient === "XWallet") {
        await transferCoinsXWallet({ amount, to, chainId })
      }
    }
  }, [activeClient, isConnected]);

  const reset = useCallback(() => {
    setAmount(0)
    setActiveClient(null)
    setIsConnected(false)
    setSelectedChain(null)
  }, [])

  const connectHandler = useCallback(() => {
    setShowModal(true);
  }, []);

  const connectWalletHandler = useCallback((client: TWalletType) => {
    setActiveClient(client);
    setShowModal(false);
  }, []);

  const disconnectHandler = useCallback(() => {
    if (activeClient === "WalletConnect") {
      disconnectHandlerWalletConnect();
    } else if (activeClient === "XWallet") {
      disconnectHandlerXWallet();
    }

    reset();
  }, [activeClient, session]);

  /** END HANDLERS */

  useEffect(() => {
    setAvailableClients([
      ...(isActiveXWallet ? ["XWallet" as TWalletType] : []),
      ...(isActiveWalletConnect ? ["WalletConnect" as TWalletType] : []),
    ]);
  }, [isActiveXWallet, isActiveWalletConnect]);

  useEffect(() => {
    if (!isConnected) {
      if (activeClient === "WalletConnect" && isActiveWalletConnect) {
        connectHandlerWalletConnect();
      } else if (activeClient === "XWallet" && isActiveXWallet) {
        connectHandlerXWallet();
      }

      return;
    }

    if (activeClient) {
      if (activeClient === "WalletConnect") {
        setSession(sessionWalletConnect);
      } else if (activeClient === "XWallet") {
        if (sessionXWallet?.publicKey && process.env.NEXT_PUBLIC_NETWORK_ID) {
          apiGetKadenaAccountBalance(sessionXWallet.publicKey, process.env.NEXT_PUBLIC_NETWORK_ID)
        }
        setSession(sessionXWallet);
      }
    }

    if (isConnected) {
      if (isConnectedXWallet) {
        setActiveClient("XWallet")
      } else if (isConnectedWalletConnect) {
        setActiveClient("WalletConnect")
      }
    } else {
      setActiveClient(null)
    }

  }, [
    activeClient,
    isConnected,
    isActiveWalletConnect,
    isActiveXWallet,
    clientWalletConnect,
    isConnectedWalletConnect,
    isConnectedXWallet,
  ]);

  useEffect(() => {
    setIsConnected(
      !![isConnectedXWallet, isConnectedWalletConnect].includes(true)
    );
  }, [isConnectedXWallet, isConnectedWalletConnect]);

  useEffect(() => {
    setTransactionStatus(statusWalletConnect)
  }, [statusWalletConnect])


  useEffect(() => {
    if (activeClient === "WalletConnect") {
      setBalances(walletConnectBalances)
      setCurrentBalance(currentBalanceWalletConnect)
    } else if (activeClient === "XWallet") {
      setBalances(xWalletBalances)
      setCurrentBalance(currentBalanceXConnect)
    }
  }, [activeClient, currentBalanceXConnect, currentBalanceWalletConnect,
    walletConnectBalances,
    xWalletBalances])


  return {
    isConnected,
    activeClient,
    session,
    connectHandler,
    connectWalletHandler,
    disconnectHandler,
    organizations,
    selectedChain,
    setSelectedChain,
    setSelectedOrganization,
    selectedOrganization,
    initialAmount,
    setAmount,
    amount,
    availableClients,
    transferCoins,
    currentBalance,
    balances,
    transactionStatus,
  }
}
