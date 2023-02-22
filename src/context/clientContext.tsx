import Client from "@walletconnect/sign-client";
import { PairingTypes, SessionTypes } from "@walletconnect/types";
import { Web3Modal } from "@web3modal/standalone";
import "@web3modal/ui";
import useSWR from "swr";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";

import {
  DEFAULT_APP_METADATA,
  DEFAULT_LOGGER,
  DEFAULT_PROJECT_ID,
  DEFAULT_RELAY_URL,
} from "./constants";
import { AccountBalances, apiGetAccountBalance } from "./helpers/api";
import { getAppMetadata, getSdkError } from "@walletconnect/utils";
import { getRequiredNamespaces } from "./helpers/namespaces";
import { IS_INITIALIZED } from "./helpers/utilities";
import { AssetData } from "./helpers/types";
// import { getKadenaChainAmount } from "./helpers/kadena";

/**
 * Types
 */
interface IContext {
  client: Client | undefined;
  session: SessionTypes.Struct | undefined;
  connect: (pairing?: { topic: string }) => Promise<void>;
  disconnect: () => Promise<void>;
  isInitialized: boolean;
  chains: string[];
  relayerRegion: string;
  pairings: PairingTypes.Struct[];
  accounts: string[];
  kAccount: string | undefined;
  publicKey: string | undefined;
  balances: number[];
  currentBalance?: AssetData;
  isFetchingBalances: boolean;
  setChains: any;
  setRelayerRegion: any;
}

export const setBalanceAmount = (account: AssetData) => {
  account.balance = parseInt(account.rawBalance, 10) / 10e11;

  return account;
};

/**
 * Context
 */
export const ClientContext = createContext<IContext>({} as IContext);

let web3Modal: Web3Modal;

/**
 * Provider
 */
export function ClientContextProvider({
  children,
}: {
  children: ReactNode | ReactNode[];
}) {
  const [client, setClient] = useState<Client>();
  const [pairings, setPairings] = useState<PairingTypes.Struct[]>([]);
  const [session, setSession] = useState<SessionTypes.Struct>();

  const [isFetchingBalances, setIsFetchingBalances] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const prevRelayerValue = useRef<string>("");

  const [balances, setBalances] = useState<number[]>([]);
  const [currentBalance, setCurrentBalance] = useState<AssetData>();
  const [accounts, setAccounts] = useState<string[]>([]);
  const [kAccount, setKAccount] = useState<string>();
  const [publicKey, setPublicKey] = useState<string>();
  const [chains, setChains] = useState<string[]>([]);
  const [relayerRegion, setRelayerRegion] = useState<string>(
    DEFAULT_RELAY_URL!
  );

  const reset = () => {
    setSession(undefined);
    setBalances([]);
    setAccounts([]);
    setChains([]);
    setRelayerRegion(DEFAULT_RELAY_URL!);
  };

  const getAccountBalances = async (_accounts: string[]) => {
    setIsFetchingBalances(true);
    try {
      let _currentBalance: AssetData | undefined;
      const arr = await Promise.all(
        _accounts.map(async (account) => {
          const [namespace, networkId, address] = account.split(":");
          const chainId = `${namespace}:${networkId}`;
          const [protocol, publicKey] = address.split("**");
          const kAccount = `${protocol}:${publicKey}`;

          setKAccount(kAccount);
          const assets = await apiGetAccountBalance(kAccount, chainId);

          if (networkId === process.env.NEXT_PUBLIC_NETWORK_ID) {
            _currentBalance = assets;
          }

          return { account, publicKey, assets: [assets] };
        })
      );

      if (_currentBalance?.rawBalance && _currentBalance?.chainBalances) {
        setCurrentBalance(setBalanceAmount(_currentBalance));
        setBalances(_currentBalance.chainBalances);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingBalances(false);
    }
  };

  const onSessionConnected = useCallback(
    async (_session: SessionTypes.Struct) => {
      const allNamespaceAccounts = Object.values(_session.namespaces)
        .map((namespace) => namespace.accounts)
        .flat()
        .filter((namespace) => {
          const [, chainId] = namespace.split(":");

          if (
            process.env.NEXT_PUBLIC_ACTIVE_NETWORK_IDS?.split(",").includes(
              chainId
            )
          ) {
            return true;
          }

          return false;
        });
      const allNamespaceChains = Object.keys(_session.namespaces);

      setSession(_session);
      setChains(allNamespaceChains);
      setAccounts(allNamespaceAccounts);

      await getAccountBalances(allNamespaceAccounts);
    },
    []
  );

  const { data: modal } = useSWR(
    "/create-modal",
    async () => {
      return !web3Modal
        ? new Web3Modal({
            projectId: process.env.NEXT_PUBLIC_PROJECT_ID || "",
            walletConnectVersion: 2,
            defaultChain: 1,
            themeMode: "dark",
          })
        : null;
    },
    { dedupingInterval: 10000 }
  );

  if (modal && !web3Modal) {
    web3Modal = modal;
  }

  const connect = useCallback(
    async (pairing: any) => {
      if (!client) {
        return console.error("WalletConnect is not initialized");
      }

      try {
        const requiredNamespaces = getRequiredNamespaces(chains);
        const { uri, approval } = await client.connect({
          pairingTopic: pairing?.topic,
          requiredNamespaces,
        });

        // Open QRCode modal if a URI was returned (i.e. we're not connecting an existing pairing).
        if (uri) {
          // Create a flat array of all requested chains across namespaces.
          const standaloneChains = Object.values(requiredNamespaces)
            .map((namespace) => (namespace as any).chains)
            .filter(
              (chain) => chain === process.env.NEXT_PUBLIC_ACTIVE_NETWORK_IDS
            )
            .flat();

          web3Modal.openModal({ uri, standaloneChains });
        }

        const session = await approval();
        // console.log("Established session:", session);
        await onSessionConnected(session);
        // Update known pairings after session is connected.
        setPairings(client.pairing.getAll({ active: true }));
      } catch (e) {
        console.error(e);
        // ignore rejection
      } finally {
        // close modal in case it was open
        web3Modal.closeModal();
      }
    },
    [chains, client, onSessionConnected]
  );

  const disconnect = useCallback(async () => {
    if (typeof client === "undefined") {
      console.error("WalletConnect is not initialized");
    }
    if (typeof session === "undefined") {
      console.error("Session is not connected");
    }

    if (client && session) {
      await client.disconnect({
        topic: session.topic,
        reason: getSdkError("USER_DISCONNECTED"),
      });
    }
    // Reset app state after disconnect.
    reset();
  }, [client, session]);

  const _subscribeToEvents = useCallback(
    async (_client: Client) => {
      if (typeof _client === "undefined") {
        throw new Error("WalletConnect is not initialized");
      }

      _client.on("session_ping", (args) => {
        // console.log("EVENT", "session_ping", args);
      });

      _client.on("session_event", (args) => {
        // console.log("EVENT", "session_event", args);
      });

      _client.on("session_update", ({ topic, params }) => {
        // console.log("EVENT", "session_update", { topic, params });
        const { namespaces } = params;
        const _session = _client.session.get(topic);
        const updatedSession = { ..._session, namespaces };
        onSessionConnected(updatedSession);
      });

      _client.on("session_delete", () => {
        // console.log("EVENT", "session_delete");
        // reset();
      });
    },
    [onSessionConnected]
  );

  const _checkPersistedState = useCallback(
    async (_client: Client) => {
      if (typeof _client === "undefined") {
        console.error("WalletConnect is not initialized");
        return;
      }
      // populates existing pairings to state
      setPairings(_client.pairing.getAll({ active: true }));
      // console.log(
      //   "RESTORED PAIRINGS: ",
      //   _client.pairing.getAll({ active: true })
      // );

      if (typeof session !== "undefined") return;
      // populates (the last) existing session to state
      if (_client.session.length) {
        const lastKeyIndex = _client.session.keys.length - 1;
        const _session = _client.session.get(
          _client.session.keys[lastKeyIndex]
        );
        // console.log("RESTORED SESSION:", _session);
        await onSessionConnected(_session);
        return _session;
      }
    },
    [session, onSessionConnected]
  );

  const createClient = useCallback(async () => {
    try {
      console.log(".>>");
      const _client = await Client.init({
        logger: DEFAULT_LOGGER,
        relayUrl: relayerRegion,
        projectId: DEFAULT_PROJECT_ID,
        metadata: getAppMetadata() || DEFAULT_APP_METADATA,
      });

      // console.log("CREATED CLIENT: ", _client);
      // console.log("relayerRegion ", relayerRegion);
      setClient(_client);
      prevRelayerValue.current = relayerRegion;
      await _subscribeToEvents(_client);
      await _checkPersistedState(_client);

      return client;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [_checkPersistedState, _subscribeToEvents, relayerRegion]);

  useEffect(() => {
    if (!!kAccount) {
      const [, publicKey] = kAccount.split(":");

      if (!!publicKey) {
        setPublicKey(publicKey);
      }
    }
  }, [kAccount]);

  useSWR("/wallet-connect-client", createClient, {
    dedupingInterval: 2000,
  });

  const value = useMemo(
    () => ({
      pairings,
      isInitialized,
      balances,
      currentBalance,
      isFetchingBalances,
      accounts,
      kAccount,
      publicKey,
      chains,
      relayerRegion,
      client,
      session,
      connect,
      disconnect,
      setChains,
      setRelayerRegion,
    }),
    [
      pairings,
      isInitialized,
      balances,
      currentBalance,
      isFetchingBalances,
      accounts,
      kAccount,
      publicKey,
      chains,
      relayerRegion,
      client,
      session,
      connect,
      disconnect,
      setChains,
      setRelayerRegion,
    ]
  );

  return (
    <ClientContext.Provider value={value}>
      <>{children}</>
    </ClientContext.Provider>
  );
}

export function useWalletConnectClient() {
  const context = useContext(ClientContext);

  console.log("useContext", context);

  if (context === undefined) {
    throw new Error(
      "useWalletConnectClient must be used within a ClientContextProvider"
    );
  }
  return context;
}
