import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

import { CHAINS } from 'constants/chains';

const NETWORKS = {
  1: {
    chainId: '0x1',
  },
  5: {
    chainId: '0x5',
    params: [
      {
        chainId: '0x5',
        chainName: 'Goerli Testnet',
        nativeCurrency: {
          name: 'Goerli Testnet',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://eth-goerli.g.alchemy.com/'],
        blockExplorerUrls: ['https://goerli.etherscan.io/'],
      },
    ],
  },
  56: {
    chainId: '0x38',
    params: [
      {
        chainId: '0x38',
        chainName: 'Binance Smart Chain Mainnet',
        nativeCurrency: {
          name: 'Binance Coin',
          symbol: 'BNB',
          decimals: 18,
        },
        rpcUrls: ['https://bsc-dataseed1.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com/'],
      },
    ],
  },
  42161: {
    chainId: '0xA4B1',
    params: [
      {
        chainId: '0xA4B1',
        chainName: 'Arbitrum',
        nativeCurrency: {
          name: 'Arbitrum One',
          symbol: 'AETH',
          decimals: 18,
        },
        rpcUrls: ['https://arb1.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://arbiscan.io/'],
      },
    ],
  },
  421613: {
    chainId: '0x66EED',
    params: [
      {
        chainId: '0x66EED',
        chainName: 'Arbitrum Testnet',
        nativeCurrency: {
          name: 'Arbitrum Testnet',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://goerli-rollup.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://testnet.arbiscan.io/'],
      },
    ],
  },
  43114: {
    chainId: '0xA86A',
    params: [
      {
        chainId: '0xA86A',
        chainName: 'Avalanche',
        nativeCurrency: {
          name: 'Avalanche',
          symbol: 'AVAX',
          decimals: 18,
        },
        rpcUrls: ['https://rpc.ankr.com/avalanche'],
        blockExplorerUrls: ['https://snowtrace.io/'],
      },
    ],
  },
  1088: {
    chainId: '0x440',
    params: [
      {
        chainId: '0x440',
        chainName: 'Metis',
        nativeCurrency: {
          name: 'Metis Andromeda',
          symbol: 'METIS',
          decimals: 18,
        },
        rpcUrls: ['https://andromeda.metis.io/?owner=1088'],
        blockExplorerUrls: ['https://andromeda-explorer.metis.io/'],
      },
    ],
  },
  137: {
    chainId: '0x89',
    params: [
      {
        chainId: '0x89',
        chainName: 'Polygon',
        nativeCurrency: {
          name: 'Polygon MATIC',
          symbol: 'MATIC',
          decimals: 18,
        },
        rpcUrls: ['https://polygon-rpc.com'],
        blockExplorerUrls: ['https://polygonscan.com/'],
      },
    ],
  },
};

export default async function changeOrAddNetwork(chainId: number) {
  if (!window) return;
  if (!window.ethereum) {
    // Initialize Coinbase Wallet SDK
    const coinbaseWallet = new CoinbaseWalletSDK({
      appName: 'Dopex',
      appLogoUrl: '/images/tokens/dpx.svg',
    });

    let rpcUrl = CHAINS[chainId]?.publicRpc;

    window.ethereum = coinbaseWallet.makeWeb3Provider(rpcUrl, chainId);
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      // @ts-ignore TODO: FIX
      params: [{ chainId: NETWORKS[chainId].chainId }],
    });
  } catch (switchError) {
    window.alert('Please open your wallet and switch chain manually');
    // This error code indicates that the chain has not been added to MetaMask.
    // @ts-ignore TODO: FIX
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          // @ts-ignore TODO: FIX
          params: NETWORKS[chainId].params,
        });
      } catch (addError) {
        // handle "add" error
      }
    }
    // handle other "switch" errors
  }
}
