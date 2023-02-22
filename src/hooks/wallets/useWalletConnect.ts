import Pact from 'pact-lang-api'
import { useCallback, useEffect, useState } from "react";
import { Web3Modal } from "@web3modal/standalone";
import type { SessionTypes } from "@walletconnect/types";
import { AccountAction } from "@/context/helpers/types";
import { useWalletConnectClient } from "@/context/clientContext";
import { useJsonRpc } from "@/context/JsonRpcContext";
import { DEFAULT_RECEIVER_CHAINID, DEFAULT_TEST_CHAINS, DEFAULT_MAIN_CHAINS } from '@/context/constants';
import { apiHost } from '@/context/helpers/kadena';
import { TTransferParams } from './useForm';

export enum DEFAULT_KADENA_METHODS {
  KADENA_SIGN_TRANSACTION = "kadena_signTransaction",
  KADENA_SIGN_MESSAGE = "kadena_signMessage",
}

export type TTransactionStatus = {
  message: string
  type: 'failed' | 'success'
}

const web3Modal = new Web3Modal({
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID || "",
  walletConnectVersion: 2,
  defaultChain: 1,
  themeMode: 'dark'
});

export const useWalletConnectV2 = () => {
  const [modal, setModal] = useState("");
  const [isClientActive, setIsClientActive] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isAutoLoad, setIsAutoLoad] = useState<boolean>(false);

  const openRequestModal = () => setModal("request");

  const {
    client,
    pairings,
    session,
    connect,
    disconnect,
    kAccount,
    publicKey,
    currentBalance,
    balances,
    ...contextData
  } = useWalletConnectClient();

  const {
    kadenaRpc,
    isTestnet,
  } = useJsonRpc();

  const [activeSession, setActiveSession] = useState<SessionTypes.Struct | null>(session || null)
  const [topic, setTopic] = useState<string | null>(null)
  const [isWalletConnectPaired, setIsWalletConnectPaired] = useState(false)
  const [pairingURI, setPairingURI] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<TTransactionStatus>()

  const resetState = useCallback(() => {
    setTopic(null)
    setIsConnected(false)
    setIsWalletConnectPaired(false)
  }, [])

  const getKadenaActions = (): AccountAction[] => {
    const testSignTransaction = async (chainId: string, address: string) => {
      openRequestModal();
      await kadenaRpc.testSignTransaction(chainId, address);
    };

    const testSignMessage = async (chainId: string, address: string) => {
      openRequestModal();
      await kadenaRpc.testSignMessage(chainId, address);
    };

    return [
      {
        method: DEFAULT_KADENA_METHODS.KADENA_SIGN_TRANSACTION,
        callback: testSignTransaction,
      },
      {
        method: DEFAULT_KADENA_METHODS.KADENA_SIGN_MESSAGE,
        callback: testSignMessage,
      },
    ];
  };

  const disconnectHandler = useCallback(async () => {
    if (!client) {
      console.error("WalletConnect is not initialized");
      return
    }
    if (!session) {
      console.error("Session is not connected");
      return
    }

    await disconnect()

    resetState()
  }, [client, session])

  const initClientConnect = useCallback(async (): Promise<{
    uri?: string | undefined;
    approval: () => Promise<SessionTypes.Struct>;
  } | null> => {
    if (client) {
      const clientConnect = await client.connect({
        ...(session?.topic ? { pairingTopic: session.topic } : {}),
        requiredNamespaces: {
          kadena: {
            methods: [
              "kadena_sign",
              "kadena_quicksign"
            ],
            chains: [
              "kadena:mainnet01",
              "kadena:testnet04",
              "kadena:development"
            ],
            events: [
              "kadena_transaction_updated"
            ]
          },
        },
      })

      return clientConnect
    }

    return null
  }, [client, session])

  const getTopic = useCallback(() => {
    if (client) {
      const [pair] = client.core.pairing.getPairings() || []
      let pairingTopic

      if (pair) {
        pairingTopic = pair.topic
        setTopic(pairingTopic)

        return pairingTopic
      }
    }

    return null
  }, [client])

  const connectHandler = useCallback(async () => {
    if (!client) {
      await connect()
      return
    }

    const { uri, approval } = await initClientConnect() || {}

    if (uri && approval) {
      setPairingURI(uri)
      await web3Modal.openModal({ uri });

      try {
        const approvedSession = await approval();
        setActiveSession(approvedSession);
        setIsConnected(!!approvedSession);
      } catch (error) {
        console.error(error)
      } finally {
        web3Modal.closeModal();
      }
    }
  }, [client])

  const signTransaction = useCallback(async (commandToSign: any, chainId: string) => {
    try {
      if (client && session) {
        const response: any = await client.request({
          topic: session.topic,
          chainId,
          request: {
            method: 'kadena_sign',
            params: commandToSign
          }
        })

        const { signedCmd } = response
        return signedCmd
      }
    } catch (error) {
      console.error('signTransaction ??? ', error)
    }

    return null
  }, [session, topic, client, pairingURI])

  const sendTransaction = useCallback(async (signedCmd: any) => {
    try {
      const data = await Pact.wallet.sendSigned(signedCmd, apiHost(DEFAULT_RECEIVER_CHAINID, isTestnet ? 'testnet' : 'mainnet'))
      const requestKey = data.requestKeys[0]
    } catch (error) {
      setTransactionStatus({
        message: (error as any).message as string,
        type: 'failed',
      })
      console.error('sendTransaction ??>?>', error)
    }
  }, [])

  const transferCoins = useCallback(async ({ amount, to: account, chainId }: TTransferParams) => {
    if (!kAccount || !publicKey) {
      return;
    }

    try {
      const [mainChain] = DEFAULT_MAIN_CHAINS
      const [testChain] = DEFAULT_TEST_CHAINS
      const fullNetworkId = isTestnet ? testChain : mainChain
      const [, networkId] = fullNetworkId.split(':')

      amount = Math.trunc(parseFloat(amount.toFixed(1)) * Math.pow(10, 1)) / Math.pow(10, 1);

      const meta = Pact.lang.mkMeta(
        kAccount,
        chainId,
        0.000001,
        2320,
        Date.now(),
        28800,
      )

      const commandToSign = {
        pactCode: `(coin.transfer "${kAccount}" "${account}" (read-decimal 'amount))`,
        caps: [
          Pact.lang.mkCap('transfer capability', 'transfer token', `coin.TRANSFER`, [
            kAccount,
            account,
            amount
          ]),
          Pact.lang.mkCap('gas', 'pay gas', 'coin.GAS')
        ],
        envData: {
          amount,
        },
        ...meta,
        signingPubKey: publicKey,
        networkId
      }

      const signedCmd = await signTransaction(commandToSign, fullNetworkId)

      if (signedCmd) {
        await sendTransaction(signedCmd)
      } else {
        console.error('NOT SIGNED', signedCmd)
      }
    } catch (error) {
      console.error('transferCoins ??? >', error)
    }

  }, [kAccount, publicKey])

  useEffect(() => {
    setIsWalletConnectPaired(!!session)
    setIsConnected(!!kAccount && !!publicKey)
  }, [session, kAccount, publicKey])

  useEffect(() => {
    async function init() {
      setIsInitialized(true)
      await connect();
    }

    if (
      typeof connect === "function" &&
      !isInitialized &&
      client && !session
      && isAutoLoad
    ) {
      init()
    }
  }, [connect, isInitialized, client, session, isAutoLoad]);

  useEffect(() => {
    if (client) {
      setIsClientActive(true)
      getTopic()
    }
  }, [client])

  return {
    client,
    isClientActive,
    isConnected,
    disconnectHandler,
    connectHandler,
    session: kAccount && publicKey ? {
      account: kAccount,
      publicKey,
    } : null,
    transferCoins,
    status: transactionStatus,
    currentBalance,
    balances,
  }
}