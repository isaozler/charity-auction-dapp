import { PactCommand } from '@kadena/client';
import { hash } from "@kadena/cryptography-utils";
import { ChainId, ICommandPayload, ICommandResult } from "@kadena/types";
import { DEFAULT_CHAINS, NETWORKMAP } from '../constants';




type Network = keyof typeof NETWORKMAP;

export const apiHost = (
  chainId: string | number,
  network: Network,
  apiVersion: string = '0.0',
): string => {
  return `https://${NETWORKMAP[network].host}/chainweb/${apiVersion}/${NETWORKMAP[network].networkId}/chain/${chainId}/pact`;
};

export async function getKadenaChainAmount(
  WCNetworkId: string
): Promise<number> {
  const ENDPOINT = WCNetworkId === "testnet04" ? "testnet." : "" as Network;

  try {
    const response = await fetch(`https://api.${ENDPOINT}chainweb.com/info`, {
      mode: "cors",
    });

    const json = await response.json();
    return json.nodeNumberOfChains;
  } catch (e) {
    console.error("Error fetching Kadena chain info", e);
    return 0;
  }
}

async function getKadenaBalanceForChain(
  publicKey: string,
  WCNetworkId: string,
  kadenaChainID: string
) {
  const ENDPOINT = WCNetworkId === "testnet04" ? "testnet" : "mainnet" as Network;
  const API_HOST = apiHost(kadenaChainID, ENDPOINT);

  const pact = new PactCommand();
  pact.code = `(coin.get-balance "${publicKey}")`
  const { result } = (await pact.local(API_HOST)) as ICommandResult;

  if (result.status !== "success") return 0;

  return result.data;
}


const kadenaNumberOfChains: Record<string, number> = DEFAULT_CHAINS.reduce((map, chain) => {
  const [, network] = chain.split(':')
  return {
    ...map,
    [network]: 0,
  }
}, {})

export async function getAllChains(
  publicKey: string,
  WCNetworkId: string
) {
  if (!kadenaNumberOfChains[WCNetworkId]) {
    kadenaNumberOfChains[WCNetworkId] = await getKadenaChainAmount(WCNetworkId);
  }

  if (publicKey.split(':').length === 1) {
    publicKey = 'k:' + publicKey
  }

  const chainBalances = await Promise.all(
    Array.from(Array(kadenaNumberOfChains[WCNetworkId])).map(
      async (_val, chainNumber) =>
        getKadenaBalanceForChain(publicKey, WCNetworkId, chainNumber.toString())
    )
  );

  return chainBalances
}

export async function apiGetKadenaAccountBalance(
  publicKey: string,
  WCNetworkId: string,
) {
  const chainBalances = await getAllChains(publicKey, WCNetworkId)
  const totalBalance = (chainBalances as number[]).reduce((acc, item) => acc + item, 0);

  return {
    chainBalances,
    balance: totalBalance * 10e11,
    rawBalance: (totalBalance * 10e11).toString(),
    symbol: "KDA",
    name: "KDA",
  };
}
