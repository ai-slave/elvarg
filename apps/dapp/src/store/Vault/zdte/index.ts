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
  baseLpContractAddress: string;
  baseLpSymbol: string;
  baseLpTokenLiquidty: BigNumber;
  baseLpAssetBalance: BigNumber;
  // usdc
  quoteTokenAddress: string;
  quoteTokenSymbol: string;
  quoteLpContractAddress: string;
  quoteLpSymbol: string;
  quoteLpTokenLiquidty: BigNumber;
  quoteLpAssetBalance: BigNumber;
}

export interface IZdteLpData {
  baseLpBalance: BigNumber;
  quoteLpBalance: BigNumber;
  userBaseTokenBalance: BigNumber;
  userQuoteTokenBalance: BigNumber;
}

export interface IZdtePurchaseData {
  isOpen: boolean;
  isPut: boolean;
  isSpread: boolean;
  positions: BigNumber;
  longStrike: BigNumber;
  shortStrike: BigNumber;
  longPremium: BigNumber;
  shortPremium: BigNumber;
  fees: BigNumber;
  pnl: BigNumber;
  openedAt: BigNumber;
  expiry: BigNumber;
  livePnl: BigNumber;
  positionId: BigNumber;
}

export interface ISpreadPair {
  longStrike: number;
  shortStrike: number;
  premium: BigNumber;
  fees: BigNumber;
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
  selectedSpreadPair?: ISpreadPair;
  setSelectedSpreadPair: Function;
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
        '0xb86f1d07a898a3ed6caa626d3b605542d6263792',
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
    const {
      getBaseLpContract,
      getQuoteLpContract,
      accountAddress,
      provider,
      getZdteContract,
    } = get();

    if (!getBaseLpContract || !getQuoteLpContract || !accountAddress) return;

    try {
      const [baseLpContract, quoteLpContract, zdteContract] = await Promise.all(
        [getBaseLpContract(), getQuoteLpContract(), getZdteContract()]
      );

      const [
        baseLpBalance,
        quoteLpBalance,
        baseTokenAddress,
        quoteTokenAddress,
      ] = await Promise.all([
        baseLpContract.balanceOf(accountAddress),
        quoteLpContract.balanceOf(accountAddress),
        zdteContract.base(),
        zdteContract.quote(),
      ]);

      const baseTokenContract = ERC20__factory.connect(
        baseTokenAddress,
        provider
      );
      const quoteTokenContract = ERC20__factory.connect(
        quoteTokenAddress,
        provider
      );

      const [userBaseTokenBalance, userQuoteTokenBalance] = await Promise.all([
        baseTokenContract.balanceOf(accountAddress),
        quoteTokenContract.balanceOf(accountAddress),
      ]);

      set((prevState) => ({
        ...prevState,
        userZdteLpData: {
          baseLpBalance: baseLpBalance,
          userBaseTokenBalance: userBaseTokenBalance,
          quoteLpBalance: quoteLpBalance,
          userQuoteTokenBalance: userQuoteTokenBalance,
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
            positionId: tokenId,
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
      getBaseLpContract,
      getQuoteLpContract,
    } = get();

    if (!selectedPoolName || !provider || !getZdteContract || !accountAddress)
      return;

    try {
      await updateUserZdteLpData();
      await updateUserZdtePurchaseData();

      const [zdteContract, baseLpContract, quoteLpContract] = await Promise.all(
        [getZdteContract(), getBaseLpContract(), getQuoteLpContract()]
      );

      const zdteAddress = zdteContract.address;
      const baseLpContractAddress = baseLpContract.address;
      const quoteLpContractAddress = quoteLpContract.address;

      const [
        baseLpSymbol,
        quoteLpSymbol,
        markPrice,
        strikeIncrement,
        maxOtmPercentage,
        baseTokenAddress,
        quoteTokenAddress,
        baseLpTokenLiquidty,
        quoteLpTokenLiquidty,
      ] = await Promise.all([
        baseLpContract.symbol(),
        quoteLpContract.symbol(),
        zdteContract.getMarkPrice(),
        zdteContract.strikeIncrement(),
        zdteContract.maxOtmPercentage(),
        zdteContract.base(),
        zdteContract.quote(),
        zdteContract.baseLpTokenLiquidty(),
        zdteContract.quoteLpTokenLiquidty(),
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
        const normalizedPremium = getUsdPrice(premium);

        strikes.push({
          strike: i,
          breakeven: i + normalizedPremium,
          breakevenPercentage: roundToNearestHalf(
            (i + normalizedPremium) / tokenPrice
          ),
          change: i - tokenPrice,
          changePercentage: roundToNearestHalf(
            ((i - tokenPrice) * 100) / tokenPrice
          ),
          premium: normalizedPremium,
          openingFees: getUsdPrice(openingFees),
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
        baseLpAssetBalance,
        quoteTokenSymbol,
        quoteLpAssetBalance,
      ] = await Promise.all([
        baseTokenContract.symbol(),
        baseLpContract.totalAvailableAssets(),
        quoteTokenContract.symbol(),
        quoteLpContract.totalAvailableAssets(),
      ]);

      set((prevState) => ({
        ...prevState,
        zdteData: {
          zdteAddress,
          tokenPrice,
          strikes,
          baseLpContractAddress,
          baseLpSymbol,
          baseTokenAddress,
          baseTokenSymbol,
          baseLpAssetBalance,
          baseLpTokenLiquidty,
          quoteTokenAddress,
          quoteTokenSymbol,
          quoteLpContractAddress,
          quoteLpSymbol,
          quoteLpAssetBalance,
          quoteLpTokenLiquidty,
        },
      }));
    } catch (err) {
      console.log(err);
      throw new Error('fail to update zdte data');
    }
  },
  setSelectedSpreadPair: async (pair: ISpreadPair) => {
    const { getZdteContract } = get();

    if (!getZdteContract) return;

    try {
      set((prevState) => ({
        ...prevState,
        selectedSpreadPair: pair,
      }));
    } catch (err) {
      console.log(err);
      throw new Error('fail to update selected spread pair');
    }
  },
});

function roundToNearestHalf(num: number): number {
  return Math.round(num * 2) / 2;
}

function getUsdPrice(value: BigNumber): number {
  return value.mul(100).div(oneEBigNumber(DECIMALS_USD)).toNumber() / 100;
}
