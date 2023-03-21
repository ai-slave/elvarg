import { ERC20__factory } from '@dopex-io/sdk';
import { ZdtePositionMinter__factory } from './../../../mocks/factories/ZdtePositionMinter__factory';
import { BigNumber } from 'ethers';
import { Zdte__factory } from './../../../mocks/factories/Zdte__factory';
import { ZdteLP__factory } from './../../../mocks/factories/ZdteLP__factory';
import { StateCreator } from 'zustand';

import { CommonSlice } from 'store/Vault/common';
import { WalletSlice } from 'store/Wallet';
import { DECIMALS_STRIKE } from 'constants/index';
import { getUserReadableAmount } from 'utils/contracts';

export interface OptionsTableData {
  strike: number;
  breakeven: number;
  breakevenPercentage: number;
  change: number;
  changePercentage: number;
  premium: number;
}

export interface IZdteData {
  zdteAddress: string;
  tokenPrice: number;
  strikes: OptionsTableData[];
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
        '0xbfa98e6267fa1c1b8137a57c8637faaf9b34287a',
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
      const markPrice = await zdteContract.getMarkPrice();
      const strikeIncrement = await zdteContract.strikeIncrement();
      const maxOtmPercentage = await zdteContract.maxOtmPercentage();

      const step = getUserReadableAmount(strikeIncrement, DECIMALS_STRIKE);
      const tokenPrice = getUserReadableAmount(markPrice, DECIMALS_STRIKE);

      const upper = tokenPrice * (1 + maxOtmPercentage / 100);
      const upperRound = Math.ceil(upper / step) * step;
      const lower = tokenPrice * (1 - maxOtmPercentage / 100);
      const lowerRound = Math.floor(lower / step) * step;

      const strikes: OptionsTableData[] = [];

      for (let i = lowerRound; i <= upperRound; i += step) {
        strikes.push({
          strike: i,
          breakeven: roundToNearestHalf((i * 100) / tokenPrice),
          breakevenPercentage: roundToNearestHalf((i * 100) / tokenPrice),
          change: i - tokenPrice,
          changePercentage: roundToNearestHalf(
            ((i - tokenPrice) * 100) / tokenPrice
          ),
          premium: 43,
        });
      }

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
          tokenPrice,
          strikes,
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

function roundToNearestHalf(num: number): number {
  return Math.round(num * 2) / 2;
}
