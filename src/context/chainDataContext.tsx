import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { getAllChainNamespaces } from "./helpers/utilities";
import { ChainNamespaces } from "./helpers/types";
import { KADENA_CHAIN_DATA } from "./constants";

/**
 * Types
 */
interface IContext {
  chainData: ChainNamespaces;
}

/**
 * Context
 */
export const ChainDataContext = createContext<IContext>({} as IContext);

/**
 * Provider
 */
export function ChainDataContextProvider({
  children,
}: {
  children: ReactNode | ReactNode[];
}) {
  const [chainData, setChainData] = useState<ChainNamespaces>({});

  const loadChainData = async () => {
    const namespaces = getAllChainNamespaces();

    const chainData: ChainNamespaces = {};
    await Promise.all(
      namespaces.map(async (namespace: any) => {
        let chains;
        try {
          if (namespace === "kadena") {
            chains = KADENA_CHAIN_DATA;
          }
        } catch (e) {
          // ignore error
        }
        if (typeof chains !== "undefined") {
          chainData[namespace] = chains;
        }
      })
    );

    setChainData(chainData);
  };

  useEffect(() => {
    loadChainData();
  }, []);

  return (
    <ChainDataContext.Provider
      value={{
        chainData,
      }}
    >
      {children}
    </ChainDataContext.Provider>
  );
}

export function useChainData() {
  const context = useContext(ChainDataContext);

  console.log("useChainData", context);

  if (context === undefined) {
    throw new Error(
      "useChainData must be used within a ChainDataContextProvider"
    );
  }
  return context;
}
