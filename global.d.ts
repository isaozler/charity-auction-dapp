declare global {
  interface Window {
    kadena?: {
      isKadena: boolean
      request: function
    };
  }
}

type TMetaObject = {
  sender: string
  chainId: string
  gasPrice: number
  gasLimit: number
  creationTime: number
  ttl: number
}

declare module 'pact-lang-api' {
  export const wallet: {
    sendSigned: (signedCmd: any, networkEndpoint: string) => Promise<{ requestKeys: number[] }>
  }
  export const lang = {
    mkCap: (capability: string, transferToken: string, command: string, params?: [string, string, number | string]) => any,
    mkExp: (fn: string, ...args: any) => string,
    mkMeta: (sender: string, chainId: string, gasPrice: number, gasLimit: number, creationTime: number, ttl: number) => TMetaObject,
  }
}
