import { getContractReadableAmount } from 'utils/contracts';
import { ERC20__factory } from '@dopex-io/sdk';
import { ZdtePositionMinter__factory } from './../../../mocks/factories/ZdtePositionMinter__factory';
import { BigNumber } from 'ethers';
import { Zdte__factory } from './../../../mocks/factories/Zdte__factory';
import { ZdteLP__factory } from './../../../mocks/factories/ZdteLP__factory';
import { StateCreator } from 'zustand';

import { CommonSlice } from 'store/Vault/common';
import { WalletSlice } from 'store/Wallet';
import { DECIMALS_STRIKE, DECIMALS_USD } from 'constants/index';
import { getUserReadableAmount } from 'utils/contracts';
import oneEBigNumber from 'utils/math/oneEBigNumber';

const ONE_DAY = 24 * 3600;

export interface OptionsTableData {
  strike: number;
  breakeven: number;
  breakevenPercentage: number;
  change: number;
  changePercentage: number;
  premium: number;
  openingFees: number;
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
      const [baseLpContract, quoteLpContract] = await Promise.all([
        getBaseLpContract(),
        getQuoteLpContract(),
      ]);

      const [baseLpBalance, baseLpSymbol, quoteLpBalance, quoteLpSymbol] =
        await Promise.all([
          baseLpContract.balanceOf(accountAddress),
          baseLpContract.symbol(),
          quoteLpContract.balanceOf(accountAddress),
          quoteLpContract.symbol(),
        ]);

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
            livePnl: await zdteContract.calcPnl(tokenId),
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
      const [
        markPrice,
        strikeIncrement,
        maxOtmPercentage,
        baseTokenAddress,
        quoteTokenAddress,
      ] = await Promise.all([
        zdteContract.getMarkPrice(),
        zdteContract.strikeIncrement(),
        zdteContract.maxOtmPercentage(),
        zdteContract.base(),
        zdteContract.quote(),
      ]);

      const step = getUserReadableAmount(strikeIncrement, DECIMALS_STRIKE);
      const tokenPrice = getUserReadableAmount(markPrice, DECIMALS_STRIKE);

      const upper = tokenPrice * (1 + maxOtmPercentage / 100);
      const upperRound = Math.ceil(upper / step) * step;
      const lower = tokenPrice * (1 - maxOtmPercentage / 100);
      const lowerRound = Math.floor(lower / step) * step;

      const strikes: OptionsTableData[] = [];

      for (let i = lowerRound; i <= upperRound; i += step) {
        const ether = oneEBigNumber(18);
        const contractStrike = getContractReadableAmount(i, DECIMALS_STRIKE);
        const [premium, openingFees] = await Promise.all([
          zdteContract.calcPremium(contractStrike, ether, ONE_DAY),
          zdteContract.calcOpeningFees(ether, contractStrike),
        ]);

        // TODO: fix breakeven
        strikes.push({
          strike: i,
          breakeven: roundToNearestHalf((i * 100) / tokenPrice),
          breakevenPercentage: roundToNearestHalf((i * 100) / tokenPrice),
          change: i - tokenPrice,
          changePercentage: roundToNearestHalf(
            ((i - tokenPrice) * 100) / tokenPrice
          ),
          premium:
            premium.mul(100).div(oneEBigNumber(DECIMALS_USD)).toNumber() / 100,
          openingFees:
            openingFees.mul(100).div(oneEBigNumber(DECIMALS_USD)).toNumber() /
            100,
        });
      }

      const baseTokenContract = ERC20__factory.connect(
        baseTokenAddress,
        provider
      );
      const quoteTokenContract = ERC20__factory.connect(
        quoteTokenAddress,
        provider
      );

      const [
        baseTokenSymbol,
        userBaseTokenBalance,
        quoteTokenSymbol,
        userQuoteTokenBalance,
      ] = await Promise.all([
        baseTokenContract.symbol(),
        baseTokenContract.balanceOf(accountAddress),
        quoteTokenContract.symbol(),
        quoteTokenContract.balanceOf(accountAddress),
      ]);

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
