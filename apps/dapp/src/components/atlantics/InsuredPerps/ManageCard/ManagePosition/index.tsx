/*
 *   The commented code contains the logic and UI for token selector.
 *   Users can either use underlying or the collateral asset to create
 *   their positions. For our initial rollup, the UI is restricted to
 *   use the collateral asset (USDC).
 */

import React, {
  ChangeEvent,
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { BigNumber, ethers } from 'ethers';

import {
  ERC20__factory,
  GmxVault__factory,
  InsuredLongsStrategy__factory,
} from '@dopex-io/sdk';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Slider from '@mui/material/Slider';
import axios from 'axios';
import { AtlanticsContext } from 'contexts/Atlantics';
import useSendTx from 'hooks/useSendTx';
import { useBoundStore } from 'store';
import { useDebounce } from 'use-debounce';

import { IAtlanticPoolEpochStrikeData } from 'store/Vault/atlantics';

import CustomButton from 'components/UI/Button';
import Input from 'components/UI/Input';
import Typography from 'components/UI/Typography';
import StrategyDetails from 'components/atlantics/InsuredPerps/ManageCard/ManagePosition/StrategyDetails';
import TokenSelector from 'components/atlantics/TokenSelector';

import {
  getEligiblePutStrike,
  getStrategyFee,
} from 'utils/contracts/atlantics/insuredPerps';
import {
  BLACKOUT_WINDOW,
  OPTIONS_TOKEN_DECIMALS,
  getFundingFees,
  getPurchaseFees,
} from 'utils/contracts/atlantics/pool';
import getContractReadableAmount from 'utils/contracts/getContractReadableAmount';
import getUserReadableAmount from 'utils/contracts/getUserReadableAmount';
import {
  LIQUIDATION_FEE_USD,
  getPositionFee,
  getSwapFees,
  tokenToUsdMin,
  usdToTokenMin,
} from 'utils/contracts/gmx';
import formatAmount from 'utils/general/formatAmount';
import { getBlockTime } from 'utils/general/getBlocktime';
import getTokenDecimals from 'utils/general/getTokenDecimals';

import { CHAINS } from 'constants/chains';
import { DOPEX_API_BASE_URL } from 'constants/env';
import { MIN_EXECUTION_FEE } from 'constants/gmx';
import { MAX_VALUE } from 'constants/index';

const steps = 0.1;
const minMarks = 2;
const maxMarks = 10;

const INITIAL_LEVERAGE = getContractReadableAmount(2, 30);

const customSliderStyle = {
  '.MuiSlider-markLabel': {
    color: 'white',
  },
  '.MuiSlider-rail': {
    color: '#3E3E3E',
  },
  '.MuiSlider-mark': {
    color: 'white',
  },
  '.MuiSlider-thumb': {
    color: 'white',
  },
  '.MuiSlider-track': {
    color: '#22E1FF',
  },
};

export interface IStrategyDetails {
  positionSize: BigNumber;
  putOptionsPremium: BigNumber;
  putOptionsfees: BigNumber;
  positionFee: BigNumber;
  optionsAmount: BigNumber;
  markPrice: BigNumber;
  liquidationPrice: BigNumber;
  putStrike: BigNumber;
  expiry: BigNumber;
  swapFees: BigNumber;
  strategyFee: BigNumber;
  fundingFees: BigNumber;
  totalFeesUsd: BigNumber;
  collateralDeltaUsd: BigNumber;
  availableLiquidityForLongs: number;
  optionsPurchasable?: number;
  feesWithoutDiscount: {
    purchaseFees: BigNumber;
    strategyFee: BigNumber;
  };
}

interface IncreaseOrderParams {
  path: string[];
  indexToken: string;
  collateralDelta: BigNumber;
  positionSizeDelta: BigNumber;
  acceptablePrice: BigNumber;
  isLong: boolean;
}

const ManagePosition = () => {
  const {
    signer,
    accountAddress,
    provider,
    contractAddresses,
    chainId,
    atlanticPool,
    atlanticPoolEpochData,
    userAssetBalances,
    setSelectedEpoch,
  } = useBoundStore();
  const { selectedPool } = useContext(AtlanticsContext);
  const [leverage, setLeverage] = useState<BigNumber>(INITIAL_LEVERAGE);
  const [increaseOrderParams, setIncreaseOrderParams] =
    useState<IncreaseOrderParams>({
      path: [],
      indexToken: '',
      collateralDelta: BigNumber.from(0),
      positionSizeDelta: BigNumber.from(0),
      acceptablePrice: BigNumber.from(0),
      isLong: true,
    });
  const [approved, setApproved] = useState<{
    quote: boolean;
    base: boolean;
  }>({
    quote: false,
    base: false,
  });
  const [openTokenSelector, setOpenTokenSelector] = useState<boolean>(false);
  const [selectedToken, setSelectedToken] = useState<string>('USDC');
  const [positionBalance, setPositionBalance] = useState<string>('');
  const [strategyDetails, setStrategyDetails] = useState<IStrategyDetails>({
    positionSize: BigNumber.from(0),
    putOptionsPremium: BigNumber.from(0),
    putOptionsfees: BigNumber.from(0),
    optionsAmount: BigNumber.from(0),
    positionFee: BigNumber.from(0),
    markPrice: BigNumber.from(0),
    liquidationPrice: BigNumber.from(0),
    putStrike: BigNumber.from(0),
    expiry: BigNumber.from(0),
    swapFees: BigNumber.from(0),
    strategyFee: BigNumber.from(0),
    fundingFees: BigNumber.from(0),
    totalFeesUsd: BigNumber.from(0),
    collateralDeltaUsd: BigNumber.from(0),
    availableLiquidityForLongs: 0,
    optionsPurchasable: 0,
    feesWithoutDiscount: {
      purchaseFees: BigNumber.from(0),
      strategyFee: BigNumber.from(0),
    },
  });
  const [, setLoading] = useState<boolean>(true);
  const [strategyDetailsLoading, setStrategyDetailsLoading] = useState(false);
  const [longLimitExceeded, setLongLimitExceeded] = useState(false);
  const [isBlackoutWindow, setIsBlackoutWindow] = useState(false);

  const debouncedStrategyDetails = useDebounce(strategyDetails, 500, {});

  const containerRef = React.useRef(null);

  const sendTx = useSendTx();

  const error = useMemo(() => {
    let errorMessage = '';
    if (!atlanticPoolEpochData) return errorMessage;
    const {
      putStrike,
      optionsAmount,
      putOptionsPremium,
      putOptionsfees,
      positionFee,
      swapFees,
      strategyFee,
      totalFeesUsd,
      collateralDeltaUsd,
    } = strategyDetails;

    const collateralRequired = putStrike
      .mul(optionsAmount)
      .div(getContractReadableAmount(1, 18 + 8 - 6));

    if (putStrike.isZero()) return errorMessage;

    const availableStrikesData = atlanticPoolEpochData.epochStrikeData.filter(
      (data: any) => {
        return data.strike.gte(putStrike);
      }
    );
    let availableLiquidity = BigNumber.from(0);
    for (const i in availableStrikesData) {
      const { totalEpochMaxStrikeLiquidity, activeCollateral } =
        availableStrikesData[i] ?? {
          totalEpochMaxStrikeLiquidity: BigNumber.from(0),
          activeCollateral: BigNumber.from(0),
        };
      availableLiquidity = availableLiquidity.add(
        totalEpochMaxStrikeLiquidity.sub(activeCollateral)
      );
    }

    const userBalance = userAssetBalances[selectedToken];

    const totalCost = putOptionsPremium
      .add(putOptionsfees)
      .add(
        increaseOrderParams.collateralDelta
          .add(positionFee)
          .add(strategyFee)
          .add(swapFees)
      );

    const [highestStrikeData] = availableStrikesData;

    let unavailableStrike = false;
    if (highestStrikeData) {
      const { strike } = highestStrikeData as IAtlanticPoolEpochStrikeData;
      unavailableStrike = strategyDetails.putStrike.gt(strike);
    }

    if (collateralDeltaUsd.lt(totalFeesUsd)) {
      errorMessage = 'Insufficent collateral for fees.';
    }
    if (collateralRequired.gt(availableLiquidity)) {
      errorMessage = 'Insufficient liquidity for options';
    } else if (totalCost.gt(userBalance ?? '0')) {
      errorMessage = 'Insufficient balance to pay premium & fees';
    } else if (longLimitExceeded) {
      errorMessage = 'Insufficient liquidity to open long positions';
    } else if (unavailableStrike) {
      errorMessage = `Put Strike exceeds highest strike. Highest strike available: ${getUserReadableAmount(
        availableStrikesData[0]?.strike ?? 0,
        8
      )} `;
    } else if (Number(positionBalance) <= 0) {
      errorMessage = 'Invalid input amount';
    } else if (isBlackoutWindow) {
      errorMessage =
        'Within blackout window to settle positions. Please wait for next epoch to start.';
    }

    return errorMessage;
  }, [
    isBlackoutWindow,
    atlanticPoolEpochData,
    strategyDetails,
    userAssetBalances,
    selectedToken,
    increaseOrderParams.collateralDelta,
    longLimitExceeded,
    positionBalance,
  ]);

  const selectedPoolTokens = useMemo((): {
    deposit: string;
    underlying: string;
  } => {
    let _tokens = {
      deposit: '',
      underlying: '',
    };
    if (!selectedPool.tokens) return _tokens;
    const { deposit, underlying } = selectedPool.tokens;
    if (!deposit || !underlying) return _tokens;
    _tokens = {
      deposit,
      underlying,
    };
    return _tokens;
  }, [selectedPool.tokens]);

  const allowedTokens = useMemo(() => {
    let tokens = [{ symbol: '', address: '' }];
    if (!selectedPool || !contractAddresses || !selectedPool.tokens) return [];
    tokens = Object.keys(selectedPool.tokens).map((key: string) => {
      let symbol = selectedPool.tokens[key];
      if (symbol !== undefined) {
        return {
          symbol: symbol,
          address: contractAddresses[symbol],
        };
      } else {
        return { symbol: '', address: '' };
      }
    });
    return tokens;
  }, [selectedPool, contractAddresses]);

  const selectToken = (token: string) => {
    setSelectedToken(() => token);
  };

  const updatePurchasableOptionsForMaxStrike = useCallback(async () => {
    if (
      !strategyDetails.putStrike ||
      !atlanticPool ||
      !atlanticPool.tokens.underlying
    )
      return;

    const apData = await axios
      .get(`${DOPEX_API_BASE_URL}/v2/atlantics`)
      .then((res) => res.data);
    const apPoolData = apData[atlanticPool.tokens.underlying][0];
    const apEpochStrikeData = apPoolData['epochStrikeData'];

    if (!apEpochStrikeData) return;

    const filteredMaxStrikesData: {
      strike: string;
      activeCollateral: string;
      unlockedCollateral: string;
      totalLiquidity: string;
      premiumAccrued: string;
      borrowFeesAccrued: string;
      liquidityBalance: string;
    }[] = apEpochStrikeData
      .slice()
      .reverse()
      .filter(
        (strikeData: {
          strike: string;
          activeCollateral: string;
          unlockedCollateral: string;
          totalLiquidity: string;
          premiumAccrued: string;
          borrowFeesAccrued: string;
          liquidityBalance: string;
        }) =>
          Number(strikeData.strike) >=
          Number(strategyDetails.putStrike.div(1e8))
      );

    let accumulatedOptionsPurchasable = filteredMaxStrikesData.reduce(
      (prev, curr) => {
        return (
          prev +
          (Number(curr['totalLiquidity']) - Number(curr['activeCollateral'])) /
            Number(strategyDetails.putStrike.div(1e8))
        );
      },
      0
    );

    setStrategyDetails((prevState) => ({
      ...prevState,
      optionsPurchasable: accumulatedOptionsPurchasable,
    }));
  }, [strategyDetails.putStrike, atlanticPool]);

  const handleStrategyCalculations = useCallback(async () => {
    if (
      !atlanticPool ||
      !contractAddresses ||
      !atlanticPoolEpochData ||
      !signer ||
      !accountAddress ||
      !atlanticPoolEpochData
    )
      return;

    try {
      setStrategyDetailsLoading(true);
      const { underlying, depositToken } = atlanticPool.tokens;
      const gmxVaultAddress = contractAddresses['GMX-VAULT'];
      const depositTokenAddress = contractAddresses[depositToken];
      const underlyingTokenAddress = contractAddresses[underlying];
      const selectedTokenAddress = contractAddresses[selectedToken];

      if (!selectedTokenAddress) return;

      const gmxVault = GmxVault__factory.connect(gmxVaultAddress, signer);

      const positionRouter = new ethers.Contract(
        '0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868',
        [
          'function maxGlobalLongSizes(address) external view returns (uint256)',
        ],
        provider
      );

      const [
        underlyingMaxPrice,
        underlyingMinPrice,
        selectedTokenMaxPrice,
        selectedTokenMinPrice,
        collateralTokenMinPrice,
        currentTimestamp,
        maxLongsLimit,
        currentLongsUsd,
      ] = await Promise.all([
        gmxVault.getMaxPrice(underlyingTokenAddress),
        gmxVault.getMinPrice(underlyingTokenAddress),
        gmxVault.getMaxPrice(selectedTokenAddress),
        gmxVault.getMinPrice(selectedTokenAddress),
        gmxVault.getMinPrice(depositTokenAddress),
        getBlockTime(provider),
        positionRouter['maxGlobalLongSizes'](underlyingTokenAddress),
        gmxVault.guaranteedUsd(underlyingTokenAddress),
      ]);

      let inputAmount: string | BigNumber = positionBalance;
      if (inputAmount === '') {
        inputAmount = '0';
      }

      let swapFees = BigNumber.from(0);

      const selectedTokenDecimals = getTokenDecimals(selectedToken, chainId);
      const collateralTokenDecimals = getTokenDecimals(depositToken, chainId);
      const selectedTokenInputAmount = getContractReadableAmount(
        inputAmount,
        selectedTokenDecimals
      );

      if (selectedTokenInputAmount.eq(0)) {
        setStrategyDetailsLoading(false);
        return;
      }

      if (selectedTokenAddress !== underlyingTokenAddress) {
        swapFees = getSwapFees(
          selectedTokenMinPrice,
          underlyingMaxPrice,
          selectedTokenInputAmount,
          selectedTokenDecimals,
          getTokenDecimals(underlying, chainId)
        );
      }

      const collateralUsd = tokenToUsdMin(
        selectedTokenMinPrice,
        selectedTokenInputAmount,
        selectedTokenDecimals
      );

      let sizeUsd = collateralUsd
        .mul(leverage)
        .div(getContractReadableAmount(1, 30));

      const positionFeeUsd = getPositionFee(sizeUsd);

      if (sizeUsd.add(currentLongsUsd).gt(maxLongsLimit)) {
        setLongLimitExceeded(true);
      }

      const priceDelta = underlyingMinPrice
        .mul(collateralUsd.sub(positionFeeUsd.add(LIQUIDATION_FEE_USD)))
        .div(sizeUsd);

      const liquidationUsd = underlyingMinPrice.sub(priceDelta);

      const liquidationPrice = liquidationUsd.div(
        getContractReadableAmount(1, 22)
      );

      let putStrike = BigNumber.from(1);

      if (liquidationUsd.lt(underlyingMaxPrice)) {
        putStrike = getEligiblePutStrike(
          liquidationPrice,
          atlanticPool.vaultConfig.tickSize
        );
      }

      const [highestStrike] = atlanticPoolEpochData.maxStrikes;

      if (!highestStrike) {
        setStrategyDetailsLoading(false);
        return;
      }

      const collateralAccessInCollateralToken = usdToTokenMin(
        collateralTokenMinPrice,
        sizeUsd.sub(collateralUsd),
        collateralTokenDecimals
      );

      const optionsAmount = collateralAccessInCollateralToken
        .mul(getContractReadableAmount(1, OPTIONS_TOKEN_DECIMALS + 2))
        .div(putStrike);

      let putOptionsPremium = BigNumber.from(0);

      if (!putStrike.gt(highestStrike)) {
        putOptionsPremium =
          await atlanticPool.contracts.atlanticPool.calculatePremium(
            putStrike,
            optionsAmount
          );
      }

      const purchaseFees = getPurchaseFees(
        collateralTokenMinPrice.div(getContractReadableAmount(1, 22)),
        putStrike,
        optionsAmount,
        collateralTokenDecimals
      );

      const fundingFees = getFundingFees(
        collateralAccessInCollateralToken,
        currentTimestamp,
        atlanticPoolEpochData.expiry
      );

      const strategyFee = usdToTokenMin(
        selectedTokenMinPrice,
        getStrategyFee(sizeUsd),
        selectedTokenDecimals
      );

      setStrategyDetails(() => ({
        fundingFees,
        positionSize: sizeUsd,
        putOptionsPremium,
        putOptionsfees: purchaseFees,
        positionFee: usdToTokenMin(
          selectedTokenMinPrice,
          positionFeeUsd,
          selectedTokenDecimals
        ),
        optionsAmount,
        liquidationPrice,
        markPrice: underlyingMaxPrice,
        putStrike,
        expiry: atlanticPoolEpochData.expiry,
        swapFees,
        strategyFee,
        totalFeesUsd: positionFeeUsd.add(LIQUIDATION_FEE_USD),
        collateralDeltaUsd: collateralUsd,
        availableLiquidityForLongs: getUserReadableAmount(
          maxLongsLimit.sub(currentLongsUsd).gt(0)
            ? maxLongsLimit.sub(currentLongsUsd)
            : 0,
          30
        ),
        optionsPurchasable: 0,
        feesWithoutDiscount: {
          purchaseFees: purchaseFees /* purchaseFeesWithoutDiscount */,
          strategyFee: BigNumber.from(0) /* strategyFeeWithoutDiscount */,
        },
      }));

      const acceptablePrice = underlyingMinPrice.mul(100050).div(100000);

      let path = [underlyingTokenAddress];
      if (selectedTokenAddress != underlyingTokenAddress) {
        path = [selectedTokenAddress, underlyingTokenAddress];
      }

      setIncreaseOrderParams(() => ({
        path,
        indexToken: underlyingTokenAddress,
        collateralDelta: usdToTokenMin(
          selectedTokenMaxPrice,
          collateralUsd.add(positionFeeUsd),
          selectedTokenDecimals
        ).add(swapFees),
        positionSizeDelta: sizeUsd,
        acceptablePrice,
        isLong: true,
      }));

      setStrategyDetailsLoading(false);
    } catch (e) {
      console.log(e);
    }
  }, [
    selectedToken,
    signer,
    chainId,
    atlanticPool,
    accountAddress,
    positionBalance,
    leverage,
    contractAddresses,
    atlanticPoolEpochData,
    provider,
  ]);

  const updatePrice = useCallback(async () => {
    if (
      !contractAddresses['GMX-VAULT'] ||
      !signer ||
      !atlanticPool ||
      !provider ||
      !atlanticPoolEpochData
    )
      return;

    const gmxVault = GmxVault__factory.connect(
      contractAddresses['GMX-VAULT'],
      signer
    );

    const positionRouter = new ethers.Contract(
      '0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868',
      ['function maxGlobalLongSizes(address) external view returns (uint256)'],
      provider
    );

    const underlyingTokenAddress =
      contractAddresses[atlanticPool.tokens.underlying];

    const [price, maxLongs, currentLongs, currentTimestamp] = await Promise.all(
      [
        gmxVault.getMaxPrice(contractAddresses[atlanticPool.tokens.underlying]),
        positionRouter['maxGlobalLongSizes'](underlyingTokenAddress),
        gmxVault.guaranteedUsd(underlyingTokenAddress),
        getBlockTime(provider),
      ]
    );

    if (
      currentTimestamp >
      Number(atlanticPoolEpochData.expiry) - BLACKOUT_WINDOW
    ) {
      setIsBlackoutWindow(true);
    } else {
      setIsBlackoutWindow(false);
    }

    if (strategyDetails.positionSize.add(currentLongs).gte(maxLongs)) {
      setLongLimitExceeded(true);
    }

    setStrategyDetails((prev) => ({
      ...prev,
      markPrice: price,
      availableLiquidityForLongs: getUserReadableAmount(
        maxLongs.sub(currentLongs).gt(0) ? maxLongs.sub(currentLongs) : 0,
        30
      ),
    }));
  }, [
    signer,
    contractAddresses,
    atlanticPool,
    atlanticPoolEpochData,
    strategyDetails.positionSize,
    provider,
  ]);

  const handleChangeLeverage = useCallback(
    (_: Event | SyntheticEvent<Element, Event>, value: number | number[]) => {
      setLeverage(() =>
        getContractReadableAmount(
          typeof value == 'number' ? value : value.pop() ?? 0,
          30
        )
      );
      handleStrategyCalculations();
    },
    [handleStrategyCalculations]
  );

  const handlePositionBalanceChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = event.target;
    setPositionBalance(value);
    handleStrategyCalculations();
  };

  const handleMax = useCallback(async () => {
    if (!accountAddress || !selectedToken) return;
    const tokenContract = ERC20__factory.connect(
      contractAddresses[selectedToken],
      provider
    );
    const balance = await tokenContract.balanceOf(accountAddress);
    const tokenDecimals = getTokenDecimals(selectedToken, chainId);
    setPositionBalance(() =>
      getUserReadableAmount(balance, tokenDecimals).toString()
    );
  }, [accountAddress, chainId, contractAddresses, provider, selectedToken]);

  const handleApproveQuoteToken = useCallback(async () => {
    if (!signer || !contractAddresses || !atlanticPool) return;
    const strategyContractAddress =
      contractAddresses['STRATEGIES']['INSURED-PERPS']['STRATEGY'];

    const { depositToken } = atlanticPool.tokens;

    if (!depositToken) return;
    const tokenContract = ERC20__factory.connect(
      contractAddresses[depositToken],
      signer
    );

    try {
      await sendTx(tokenContract, 'approve', [
        strategyContractAddress,
        MAX_VALUE,
      ]);
      setApproved((prevState) => ({ ...prevState, quote: true }));
    } catch (err) {
      console.error(err);
    }
  }, [signer, atlanticPool, contractAddresses, sendTx]);

  const handleApproveBaseToken = useCallback(async () => {
    if (!signer || !contractAddresses || !atlanticPool) return;
    try {
      const strategyContractAddress =
        contractAddresses['STRATEGIES']['INSURED-PERPS']['STRATEGY'];
      const { underlying } = atlanticPool.tokens;
      if (!underlying) return;
      const tokenContract = ERC20__factory.connect(
        contractAddresses[underlying],
        signer
      );
      await sendTx(tokenContract, 'approve', [
        strategyContractAddress,
        MAX_VALUE,
      ]);
      setApproved((prevState) => ({ ...prevState, base: true }));
    } catch (err) {
      console.error(err);
    }
  }, [signer, atlanticPool, contractAddresses, sendTx]);

  const checkApprove = useCallback(async () => {
    const { putOptionsPremium, putOptionsfees, strategyFee, fundingFees } =
      strategyDetails;

    if (!atlanticPool || !accountAddress) return;
    const quoteToken = ERC20__factory.connect(
      contractAddresses[atlanticPool.tokens.depositToken],
      provider
    );
    const baseToken = ERC20__factory.connect(
      contractAddresses[atlanticPool.tokens.underlying],
      provider
    );

    const strategyAddress =
      contractAddresses['STRATEGIES']['INSURED-PERPS']['STRATEGY'];

    const quoteTokenAllowance = await quoteToken.allowance(
      accountAddress,
      strategyAddress
    );
    const baseTokenAllowance = await baseToken.allowance(
      accountAddress,
      strategyAddress
    );

    setApproved(() => ({
      quote: quoteTokenAllowance.gte(
        putOptionsPremium.add(putOptionsfees.add(fundingFees))
      ),
      base:
        increaseOrderParams.path.length === 1
          ? baseTokenAllowance.gte(
              increaseOrderParams.collateralDelta.add(strategyFee)
            )
          : true,
    }));
  }, [
    accountAddress,
    atlanticPool,
    contractAddresses,
    increaseOrderParams.collateralDelta,
    increaseOrderParams.path.length,
    provider,
    strategyDetails,
  ]);

  // check approved
  useEffect(() => {
    checkApprove();
  }, [checkApprove]);

  useEffect(() => {
    handleStrategyCalculations();
  }, [handleStrategyCalculations]);

  useEffect(() => {
    updatePurchasableOptionsForMaxStrike();
  }, [updatePurchasableOptionsForMaxStrike]);

  useEffect(() => {
    const interval = setInterval(() => {
      updatePrice();
    }, 5000);
    return () => clearInterval(interval);
  }, [updatePrice]);

  useEffect(() => {
    setLoading(
      debouncedStrategyDetails[0].expiry.eq('0') ||
        positionBalance.length === 0 ||
        selectedToken === '' ||
        !approved.quote
    );
  }, [debouncedStrategyDetails, approved, positionBalance, selectedToken]);

  const useStrategy = useCallback(async () => {
    if (
      !contractAddresses['STRATEGIES']['INSURED-PERPS']['STRATEGY'] ||
      !signer ||
      !chainId ||
      !atlanticPool ||
      !positionBalance ||
      !selectedToken ||
      !chainId ||
      !atlanticPoolEpochData
    ) {
      return;
    }
    const strategyContract = InsuredLongsStrategy__factory.connect(
      contractAddresses['STRATEGIES']['INSURED-PERPS']['STRATEGY'],
      signer
    );

    const { depositToken } = atlanticPool.tokens;

    const depositTokenAddress = contractAddresses[depositToken];
    const overrides = {
      value: MIN_EXECUTION_FEE,
    };

    try {
      await sendTx(strategyContract, 'useStrategyAndOpenLongPosition', [
        increaseOrderParams,
        depositTokenAddress,
        atlanticPoolEpochData.expiry,
        false,
        overrides,
      ]);
    } catch (err) {
      console.error(err);
    }
  }, [
    atlanticPoolEpochData,
    atlanticPool,
    contractAddresses,
    signer,
    chainId,
    positionBalance,
    selectedToken,
    increaseOrderParams,
    sendTx,
  ]);

  useEffect(() => {
    if (!atlanticPool) {
      return;
    }
    setSelectedEpoch(atlanticPool.contracts.atlanticPool.currentEpoch());
  }, [atlanticPool, setSelectedEpoch]);

  return (
    <Box>
      <Box className="bg-umbra rounded-xl space-y-2" ref={containerRef}>
        <Input
          size="small"
          variant="default"
          type="number"
          placeholder="0.0"
          value={positionBalance}
          onChange={handlePositionBalanceChange}
          leftElement={
            <Box
              className="flex my-auto w-full space-x-2 rounded-lg cursor-pointer bg-carbon"
              role="button"
              onClick={() => setOpenTokenSelector((prev) => !prev)}
            >
              <Box className="flex w-full bg-carbon rounded-full space-x-2 pr-1 items-center justify-center">
                <img
                  src={`/images/tokens/${selectedToken.toLowerCase()}.svg`}
                  alt={selectedToken}
                  className="w-10"
                />
                <h6>{selectedToken}</h6>
                {openTokenSelector ? (
                  <KeyboardArrowUpRoundedIcon className="fill-current text-white my-auto" />
                ) : (
                  <KeyboardArrowDownRoundedIcon className="fill-current text-white my-auto" />
                )}
              </Box>
            </Box>
          }
        />
        <Box className="flex bg-umbra justify-between px-3 pb-3">
          <Typography variant="h6" color="stieglitz">
            Balance
          </Typography>
          <Typography
            variant="h6"
            className="underline cursor-pointer"
            role="button"
            onClick={handleMax}
          >
            {formatAmount(
              getUserReadableAmount(
                userAssetBalances[selectedToken] ?? '0',
                CHAINS[chainId]?.tokenDecimals[selectedToken]
              ),
              3,
              true
            )}{' '}
            {selectedToken}
          </Typography>
        </Box>
        <TokenSelector
          setSelection={selectToken}
          open={openTokenSelector}
          setOpen={setOpenTokenSelector}
          tokens={allowedTokens}
          containerRef={containerRef}
        />
      </Box>
      <Box className="w-full flex flex-col border-t-2 border-cod-gray space-y-2">
        <Box className="flex flex-col items-center p-3 bg-umbra rounded-b-lg">
          <Typography
            variant="h6"
            className="text-left w-full"
            color="stieglitz"
          >
            Leverage
          </Typography>
          <Box className="w-full px-5 pt-2">
            <Slider
              sx={customSliderStyle}
              onChange={handleChangeLeverage}
              className="w-full"
              aria-label="Small steps"
              defaultValue={1.1}
              onChangeCommitted={handleChangeLeverage}
              step={steps}
              min={minMarks}
              max={maxMarks}
              valueLabelDisplay="auto"
            />
          </Box>
        </Box>
        {/* <Box className="flex w-full bg-umbra justify-between border-t-2 border-cod-gray p-3 mb-2 rounded-b-xl"> */}
        {/* <Box className="flex">
            <Typography variant="h6" className="my-auto" color="stieglitz">
              Deposit underlying
            </Typography>
            <Tooltip
              title="Choose whether to deposit underlying and keep borrowed collateral incase your long position has collateral that was added when trigger price was crossed and would like to keep the position post expiry."
              enterTouchDelay={0}
              leaveTouchDelay={1000}
            >
              <InfoOutlined className="fill-current text-stieglitz p-1 my-auto" />
            </Tooltip>
          </Box> */}
        {/* <Switch value={depositUnderlying} onChange={handleToggle} /> */}
        {/* </Box> */}
        <StrategyDetails
          data={debouncedStrategyDetails[0]}
          loading={strategyDetailsLoading}
          selectedCollateral={'selectedCollateral'}
          selectedToken={selectedToken}
          positionCollateral={getContractReadableAmount(
            positionBalance,
            getTokenDecimals(selectedToken, chainId)
          )}
          quoteToken={selectedPoolTokens.deposit}
          baseToken={selectedPoolTokens.underlying}
        />
        <Box className="flex flex-col w-full space-y-3 mt-2">
          {approved.quote && approved.base ? (
            <CustomButton
              disabled={
                error !== '' ||
                strategyDetailsLoading ||
                strategyDetails.putStrike.isZero() ||
                strategyDetails.collateralDeltaUsd.isZero()
              }
              onClick={useStrategy}
            >
              {strategyDetailsLoading ? (
                <CircularProgress className="text-white p-3" />
              ) : error !== '' ? (
                error
              ) : (
                'Long'
              )}
            </CustomButton>
          ) : (
            <Box className="flex space-x-2 items-center justify-content w-full">
              {!approved.quote ? (
                <CustomButton
                  className="flex-1 w-[10rem]"
                  onClick={handleApproveQuoteToken}
                  disabled={
                    increaseOrderParams.collateralDelta.isZero() || error !== ''
                  }
                >
                  Approve {selectedPoolTokens.deposit}
                </CustomButton>
              ) : null}
              {!approved.base ? (
                <CustomButton
                  className="flex-1 w-[10rem]"
                  onClick={handleApproveBaseToken}
                  disabled={
                    increaseOrderParams.collateralDelta.isZero() || error !== ''
                  }
                >
                  Approve {selectedPoolTokens.underlying}
                </CustomButton>
              ) : null}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ManagePosition;
