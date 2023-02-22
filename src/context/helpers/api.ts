import { apiGetKadenaAccountBalance } from "./kadena";

import { AssetData } from "./types";

export interface AccountBalances {
  [account: string]: AssetData[];
}

export async function apiGetAccountBalance(
  address: string,
  chainId: string
): Promise<AssetData> {
  const [_namespace, networkId] = chainId.split(":");

  return await apiGetKadenaAccountBalance(address, networkId) as unknown as Promise<AssetData>;
}
