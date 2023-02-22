import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { globalStyles } from "@/styles/config";
import { ChainDataContextProvider } from "../context/chainDataContext";
import { ClientContextProvider } from "../context/clientContext";
import { JsonRpcContextProvider } from "../context/JsonRpcContext";

export default function App({ Component, pageProps }: AppProps) {
  globalStyles();

  return (
    <ChainDataContextProvider>
      <ClientContextProvider>
        <JsonRpcContextProvider>
          <Component {...pageProps} />
        </JsonRpcContextProvider>
      </ClientContextProvider>
    </ChainDataContextProvider>
  );
}
