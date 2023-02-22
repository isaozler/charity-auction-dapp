import { JsonRpcRequest } from "@walletconnect/jsonrpc-utils";
import { ChainMetadata, ChainRequestRender, NamespaceMetadata } from "./helpers/types";

export const KadenaMetadata: NamespaceMetadata = {
  mainnet01: {
    logo: "/assets/kadena.png",
    rgb: "237, 9, 143",
  },
  testnet04: {
    logo: "/assets/kadena.png",
    rgb: "237, 9, 143",
  },
};

export function getChainMetadata(chainId: string): ChainMetadata {
  const reference = chainId.split(":")[1];
  const metadata = KadenaMetadata[reference];
  if (typeof metadata === "undefined") {
    throw new Error(`No chain metadata found for chainId: ${chainId}`);
  }
  return metadata;
}

export function getChainRequestRender(
  request: JsonRpcRequest
): ChainRequestRender[] {
  let params = [{ label: "Method", value: request.method }];

  switch (request.method) {
    default:
      params = [
        ...params,
        {
          label: "params",
          value: JSON.stringify(request.params, null, "\t"),
        },
      ];
      break;
  }
  return params;
}