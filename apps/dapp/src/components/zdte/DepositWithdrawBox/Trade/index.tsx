import { ERC20__factory } from '@dopex-io/sdk';
import { Box } from '@mui/material';
import ContentRow from 'components/atlantics/InsuredPerps/ManageCard/ManagePosition/ContentRow';
import { CustomButton, Input, Typography } from 'components/UI';
import {
  DECIMALS_STRIKE,
  DECIMALS_TOKEN,
  DECIMALS_USD,
  MAX_VALUE,
} from 'constants/index';
import { BigNumber } from 'ethers';
import useSendTx from 'hooks/useSendTx';
import { FC, useCallback, useEffect, useState } from 'react';
import { useBoundStore } from 'store';
import {
  getContractReadableAmount,
  getUserReadableAmount,
} from 'utils/contracts';
import { ISpreadPair } from 'store/Vault/zdte';
import oneEBigNumber from 'utils/math/oneEBigNumber';
import { formatAmount } from 'utils/general';

const ONE_DAY = 24 * 3600;

function orZero(value: number): BigNumber {
  return value
    ? getContractReadableAmount(value, DECIMALS_STRIKE)
    : BigNumber.from(0);
}

function getUsdPrice(value: BigNumber): number {
  return value.mul(100).div(oneEBigNumber(DECIMALS_USD)).toNumber() / 100;
}

function getStrikeDisplay(
  selectedSpreadPair: ISpreadPair | undefined,
  tokenPrice: number | undefined
): string {
  if (selectedSpreadPair === undefined || tokenPrice === undefined) {
    return 'Select Strike(s)';
  }
  let res: string = '';
  console.log('selectedSpreadPair: ', selectedSpreadPair);
  const longStrike = selectedSpreadPair.longStrike;
  const shortStrike = selectedSpreadPair.shortStrike;
  // # long >= current, long < short => isCall
  // # long <= current, long > short, => isPut
  if (selectedSpreadPair === undefined || longStrike === undefined) {
    return 'Select Strike(s)';
  }
  if (longStrike <= tokenPrice) {
    res = `${longStrike}-C`;
  }
  if (longStrike > tokenPrice) {
    res = `${longStrike}-P`;
  }
  if (shortStrike === undefined) {
    return res;
  }
  if (longStrike <= tokenPrice && shortStrike < longStrike) {
    res += ` / ${shortStrike}-P`;
  } else {
    res += ` / ${shortStrike}-C`;
  }
  return res;
}

interface TradeProps {}

const Trade: FC<TradeProps> = ({}) => {
  const sendTx = useSendTx();

  const {
    signer,
    provider,
    getZdteContract,
    updateZdteData,
    zdteData,
    accountAddress,
    userZdteLpData,
    selectedSpreadPair,
  } = useBoundStore();
  const tokenSymbol = zdteData?.quoteTokenSymbol.toUpperCase();
  const zdteContract = getZdteContract();

  const [amount, setAmount] = useState<string | number>(0);
  const [approved, setApproved] = useState<boolean>(false);

  const handleApprove = useCallback(async () => {
    if (!signer || !zdteData?.quoteTokenAddress) return;

    try {
      await sendTx(
        ERC20__factory.connect(zdteData?.quoteTokenAddress, signer),
        'approve',
        [zdteData?.zdteAddress, MAX_VALUE]
      );
      setApproved(true);
    } catch (err) {
      console.log(err);
    }
  }, [zdteData, signer, sendTx]);

  useEffect(() => {
    (async () => {
      if (!signer || !accountAddress || !zdteData) return;
      try {
        const quoteTokenContract = await ERC20__factory.connect(
          zdteData.quoteTokenAddress,
          signer
        );
        const allowance: BigNumber = await quoteTokenContract.allowance(
          accountAddress,
          zdteData.zdteAddress
        );
        setApproved(
          allowance.gte(getContractReadableAmount(amount, DECIMALS_TOKEN))
        );
      } catch (err) {
        console.log(err);
      }
    })();
  }, [signer, accountAddress, amount, zdteData]);

  const handleTradeAmount = useCallback(
    (e: { target: { value: React.SetStateAction<string | number> } }) =>
      setAmount(e.target.value),
    []
  );

  // TODO: update args and get long and short
  // TODO: how to determine if it's put or call
  const handleOpenPosition = useCallback(async () => {
    if (!signer || !provider || !zdteContract) return;
    try {
      await sendTx(zdteContract.connect(signer), 'spreadOptionPosition', [
        false,
        getContractReadableAmount(amount, DECIMALS_TOKEN),
      ]).then(() => {
        setAmount('0');
      });
      await updateZdteData();
    } catch (e) {
      console.log('fail to Trade', e);
    }
  }, [signer, provider, zdteContract, amount, updateZdteData, sendTx]);

  const [premium, setPremium] = useState<number>(0);
  const [openingFees, oetOpeningFees] = useState<number>(0);

  useEffect(() => {
    if (!zdteData) return;

    async function updatePremiumAndFees(selectedSpreadPair: ISpreadPair) {
      if (!selectedSpreadPair) return;

      const zdteContract = await getZdteContract();
      const ether = oneEBigNumber(18);

      const [longPremium, longOpeningFees, shortPremium, shortOpeningFees] =
        await Promise.all([
          zdteContract.calcPremium(
            orZero(selectedSpreadPair.longStrike),
            ether,
            ONE_DAY
          ),
          zdteContract.calcOpeningFees(
            ether,
            orZero(selectedSpreadPair.longStrike)
          ),
          zdteContract.calcPremium(
            orZero(selectedSpreadPair.shortStrike),
            ether,
            ONE_DAY
          ),
          zdteContract.calcOpeningFees(
            ether,
            orZero(selectedSpreadPair.shortStrike)
          ),
        ]);

      setPremium(getUsdPrice(longPremium.add(shortPremium)));
      oetOpeningFees(getUsdPrice(longOpeningFees.add(shortOpeningFees)));
    }
    updatePremiumAndFees(selectedSpreadPair!);
  }, [zdteData, selectedSpreadPair, getZdteContract]);

  return (
    <Box className="rounded-xl space-y-2">
      <Box className="border border-neutral-800 bg-umbra rounded-xl">
        <Input
          size="small"
          variant="default"
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={handleTradeAmount}
          className="p-0"
          leftElement={
            <Box className="flex my-auto">
              <Box className="flex w-40 mr-2 rounded-full space-x-2 p-1 pr-4">
                <Typography
                  variant="h5"
                  color="white"
                  className="flex items-center ml-2"
                >
                  {getStrikeDisplay(selectedSpreadPair, zdteData?.tokenPrice)}
                </Typography>
              </Box>
            </Box>
          }
        />
      </Box>
      <Box className="p-2">
        <ContentRow
          title="Balance"
          content={`${formatAmount(
            getUserReadableAmount(
              userZdteLpData?.userQuoteTokenBalance!,
              DECIMALS_USD
            ),
            2
          )} ${tokenSymbol}`}
        />
        <ContentRow title="Premium" content={`$${premium}`} />
        <ContentRow title="Opening fees" content={`$${openingFees}`} />
        <ContentRow
          title="Cost per option"
          content={`$${premium + openingFees}`}
        />
        <ContentRow
          title="Total cost"
          content={`$${formatAmount(
            (premium + openingFees) * Number(amount),
            2
          )}`}
        />
      </Box>
      <CustomButton
        size="medium"
        className="w-full mt-5 !rounded-md"
        color={
          !approved ||
          (amount > 0 &&
            amount <=
              getUserReadableAmount(
                userZdteLpData?.userQuoteTokenBalance!,
                DECIMALS_TOKEN
              ))
            ? 'primary'
            : 'mineshaft'
        }
        disabled={
          amount <= 0 ||
          amount >
            getUserReadableAmount(
              userZdteLpData?.userQuoteTokenBalance!,
              DECIMALS_TOKEN
            )
        }
        onClick={!approved ? handleApprove : handleOpenPosition}
      >
        {approved
          ? amount == 0
            ? 'Insert an amount'
            : amount >
              getUserReadableAmount(
                userZdteLpData?.userQuoteTokenBalance!,
                DECIMALS_TOKEN
              )
            ? 'Insufficient balance'
            : 'Open Position'
          : 'Approve'}
      </CustomButton>
    </Box>
  );
};

export default Trade;
