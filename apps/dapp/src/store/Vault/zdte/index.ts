import { ERC20__factory } from '@dopex-io/sdk';
import { ZdtePositionMinter__factory } from './../../../mocks/factories/ZdtePositionMinter__factory';
import { BigNumber } from 'ethers';
import { Zdte__factory } from './../../../mocks/factories/Zdte__factory';
import { ZdteLP__factory } from './../../../mocks/factories/ZdteLP__factory';
import { StateCreator } from 'zustand';

import { CommonSlice } from 'store/Vault/common';
import { WalletSlice } from 'store/Wallet';

export interface IZdteData {
  zdteAddress: string;
  // dpx, weth
  baseTokenAddress: string;
  baseTokenSymbol: string;
  userBaseTokenBalance: BigNumber;
  // usdc
  quoteTokenAddress: string;
  quoteTokenSymbol: string;
  userQuoteTokenBalance: BigNumber;
}

export interface IZdteLpData {
  baseLpContractAddress: string;
  baseLpSymbol: string;
  baseLpBalance: BigNumber;
  quoteLpContractAddress: string;
  quoteLpSymbol: string;
  quoteLpBalance: BigNumber;
}

export interface IZdtePurchaseData {
  isOpen: boolean;
  positions: BigNumber;
  longStrike: BigNumber;
  shortStrike: BigNumber;
  longPremium: BigNumber;
  shortPremium: BigNumber;
  fees: BigNumber;
  pnl: BigNumber;
  livePnl: number;
  openedAt: BigNumber;
  expiry: BigNumber;
  positionType: number;
}

export interface ZdteSlice {
  getZdteContract: Function;
  getQuoteLpContract: Function;
  getBaseLpContract: Function;
  userZdteLpData?: IZdteLpData;
  updateUserZdteLpData: Function;
  userZdtePurchaseData?: IZdtePurchaseData[];
  updateUserZdtePurchaseData: Function;
  zdteData?: IZdteData;
  updateZdteData: Function;
}

export const createZdteSlice: StateCreator<
  ZdteSlice & WalletSlice & CommonSlice,
  [['zustand/devtools', never]],
  [],
  ZdteSlice
> = (set, get) => ({
  getZdteContract: () => {
    const { selectedPoolName, provider } = get();

    if (!selectedPoolName || !provider) return;

    try {
      // Addresses[42161].ZDTE[selectedPoolName],
      return Zdte__factory.connect(
        '0x1cc4f03d9fe1e5d58b6369df796eb8739b989b57',
        provider
      );
    } catch (err) {
      console.log(err);
      throw Error('fail to create address');
    }
  },
  getBaseLpContract: async () => {
    const { selectedPoolName, provider, getZdteContract } = get();

    if (!selectedPoolName || !provider) return;

    try {
      const baseLpTokenAddress = await getZdteContract().baseLp();
      return ZdteLP__factory.connect(baseLpTokenAddress, provider);
    } catch (err) {
      console.log(err);
      throw Error('fail to create baseLp address');
    }
  },
  getQuoteLpContract: async () => {
    const { selectedPoolName, provider, getZdteContract } = get();

    if (!selectedPoolName || !provider) return;

    try {
      const quoteLpTokenAddress = await getZdteContract().quoteLp();
      return ZdteLP__factory.connect(quoteLpTokenAddress, provider);
    } catch (err) {
      console.log(err);
      throw Error('fail to create quoteLp address');
    }
  },
  updateUserZdteLpData: async () => {
    const { getBaseLpContract, getQuoteLpContract, accountAddress } = get();

    if (!getBaseLpContract || !getQuoteLpContract || !accountAddress) return;

    try {
      const baseLpContract = await getBaseLpContract();
      const baseLpBalance = await baseLpContract.balanceOf(accountAddress);
      const baseLpSymbol = await baseLpContract.symbol();

      const quoteLpContract = await getQuoteLpContract();
      const quoteLpBalance = await quoteLpContract.balanceOf(accountAddress);
      const quoteLpSymbol = await quoteLpContract.symbol();

      set((prevState) => ({
        ...prevState,
        userZdteLpData: {
          baseLpContractAddress: baseLpContract.address,
          baseLpSymbol: baseLpSymbol,
          baseLpBalance: baseLpBalance,
          quoteLpContractAddress: quoteLpContract.address,
          quoteLpBalance: quoteLpBalance,
          quoteLpSymbol: quoteLpSymbol,
        },
      }));
    } catch (err) {
      console.log(err);
      throw Error('fail to update userZdteLpData');
    }
  },
  userZdtePurchaseData: [],
  updateUserZdtePurchaseData: async () => {
    try {
      const { accountAddress, getZdteContract, provider } = get();

      if (!accountAddress || !getZdteContract || !provider) return;

      const zdteContract = await getZdteContract();
      const zdteMinterAddress = await zdteContract.zdtePositionMinter();

      const zdteMinter = ZdtePositionMinter__factory.connect(
        zdteMinterAddress,
        provider
      );

      const numTokens = await zdteMinter.balanceOf(accountAddress);

      const ranges = Array.from({ length: numTokens.toNumber() }, (_, i) => i);

      const positions = await Promise.all(
        ranges.map(async (i) => {
          const tokenId = await zdteMinter.tokenOfOwnerByIndex(
            accountAddress,
            i
          );
          const zdtePosition = await zdteContract.zdtePositions(tokenId);
          return {
            ...zdtePosition,
            livePnl: 0, // await zdteContract.calcPnl(tokenId),
          } as IZdtePurchaseData;
        })
      );

      set((prevState) => ({
        ...prevState,
        userZdtePurchaseData: positions,
      }));
    } catch (err) {
      console.log(err);
      throw new Error('fail to update userZdtePurchaseData');
    }
  },
  updateZdteData: async () => {
    const {
      selectedPoolName,
      provider,
      getZdteContract,
      accountAddress,
      updateUserZdteLpData,
      updateUserZdtePurchaseData,
    } = get();

    if (!selectedPoolName || !provider || !getZdteContract || !accountAddress)
      return;

    try {
      await updateUserZdteLpData();
      await updateUserZdtePurchaseData();

      const zdteContract = await getZdteContract();
      const zdteAddress = zdteContract.address;

      const baseTokenAddress = await zdteContract.base();
      const baseTokenContract = ERC20__factory.connect(
        baseTokenAddress,
        provider
      );
      const baseTokenSymbol = await baseTokenContract.symbol();
      const userBaseTokenBalance = await baseTokenContract.balanceOf(
        accountAddress
      );

      const quoteTokenAddress = await zdteContract.quote();
      const quoteTokenContract = ERC20__factory.connect(
        quoteTokenAddress,
        provider
      );
      const quoteTokenSymbol = await quoteTokenContract.symbol();
      const userQuoteTokenBalance = await quoteTokenContract.balanceOf(
        accountAddress
      );

      set((prevState) => ({
        ...prevState,
        zdteData: {
          zdteAddress,
          baseTokenAddress,
          baseTokenSymbol,
          userBaseTokenBalance,
          quoteTokenAddress,
          quoteTokenSymbol,
          userQuoteTokenBalance,
        },
      }));
    } catch (err) {
      console.log(err);
      throw new Error('fail to update zdte data');
    }
  },
});
