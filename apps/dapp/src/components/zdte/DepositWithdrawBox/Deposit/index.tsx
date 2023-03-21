import { ERC20__factory } from '@dopex-io/sdk';
import { Box } from '@mui/material';
import { CustomButton, Input, Typography } from 'components/UI';
import { DECIMALS_TOKEN, MAX_VALUE } from 'constants/index';
import { BigNumber, utils } from 'ethers';
import useSendTx from 'hooks/useSendTx';
import { FC, useCallback, useEffect, useState } from 'react';
import { useBoundStore } from 'store';
import {
  getContractReadableAmount,
  getUserReadableAmount,
} from 'utils/contracts';
import { formatAmount } from 'utils/general';

interface DepositProps {}

const Deposit: FC<DepositProps> = ({}) => {
  const sendTx = useSendTx();

  const {
    signer,
    provider,
    zdteData,
    accountAddress,
    getZdteContract,
    updateZdteData,
  } = useBoundStore();

  const zdteContract = getZdteContract();
  const tokenSymbol = zdteData?.baseTokenSymbol.toUpperCase();

  const [baseTokenDepositAmount, setBaseTokenDepositAmount] = useState<
    string | number
  >(0);
  const [approved, setApproved] = useState<boolean>(false);

  const handleApprove = useCallback(async () => {
    if (!signer || !zdteData?.baseTokenAddress) return;

    try {
      await sendTx(
        ERC20__factory.connect(zdteData?.baseTokenAddress, signer),
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
        const baseTokenContract = await ERC20__factory.connect(
          zdteData.baseTokenAddress,
          signer
        );
        const allowance: BigNumber = await baseTokenContract.allowance(
          accountAddress,
          zdteData.zdteAddress
        );
        setApproved(
          allowance.gte(
            getContractReadableAmount(baseTokenDepositAmount, DECIMALS_TOKEN)
          )
        );
      } catch (err) {
        console.log(err);
      }
    })();
  }, [signer, accountAddress, baseTokenDepositAmount, zdteData]);

  const handleDepositAmount = useCallback(
    (e: { target: { value: React.SetStateAction<string | number> } }) =>
      setBaseTokenDepositAmount(e.target.value),
    []
  );

  const handleMax = useCallback(() => {
    setBaseTokenDepositAmount(
      utils.formatEther(zdteData?.userBaseTokenBalance!)
    );
  }, [zdteData]);

  const handleOpenPosition = useCallback(async () => {
    if (!signer || !provider || !zdteContract) return;
    try {
      await sendTx(zdteContract.connect(signer), 'deposit', [
        false,
        getContractReadableAmount(baseTokenDepositAmount, DECIMALS_TOKEN),
      ]).then(() => {
        setBaseTokenDepositAmount('0');
      });
      await updateZdteData();
    } catch (e) {
      console.log('fail to deposit', e);
    }
  }, [
    signer,
    provider,
    zdteContract,
    baseTokenDepositAmount,
    updateZdteData,
    sendTx,
  ]);

  return (
    <Box className="rounded-xl space-y-2">
      <Box className="border border-neutral-800 bg-umbra rounded-xl">
        <Input
          size="small"
          variant="default"
          type="number"
          placeholder="0.0"
          value={baseTokenDepositAmount}
          onChange={handleDepositAmount}
          className="p-0"
          leftElement={
            <Box className="flex my-auto">
              <Box className="flex w-24 mr-2 bg-cod-gray rounded-full space-x-2 p-1 pr-4">
                <img
                  src={`/images/tokens/${tokenSymbol}.svg`}
                  alt="tokenSymbol"
                  className="h-8"
                />
                <Typography
                  variant="h5"
                  color="white"
                  className="flex items-center ml-2"
                >
                  {tokenSymbol}
                </Typography>
              </Box>
            </Box>
          }
        />
      </Box>
      <Box className="flex justify-between p-2">
        <Typography variant="h6" color="stieglitz">
          Balance
        </Typography>
        <Box className="ml-auto mr-2 mt-1 cursor-pointer" onClick={handleMax!}>
          <img src="/assets/max.svg" alt="MAX" />
        </Box>
        <Typography variant="h6" className="flex justify-end">
          {`${formatAmount(
            getUserReadableAmount(
              zdteData?.userBaseTokenBalance!,
              DECIMALS_TOKEN
            ),
            2
          )}`}
          <span className="text-stieglitz ml-1">{tokenSymbol}</span>
        </Typography>
      </Box>
      {/* <span className="text-up-only text-sm p-2">
        Note: 50% of deposits will be zapped into {tokenSymbol}
      </span> */}
      {/* <Box className="space-y-2 p-2">
        <ContentRow
          title={`${tokenSymbol} Deposit`}
          content={`${formatAmount(
            getUserReadableAmount(42, DECIMALS_TOKEN),
            2
          )}`}
        />
        <ContentRow
          title={`Available Liquidity (${tokenSymbol})`}
          content={`${formatAmount(
            getUserReadableAmount(42, DECIMALS_TOKEN),
            2
          )}`}
        />
        <ContentRow
          title="Premium"
          content={`${formatAmount(
            getUserReadableAmount(42, DECIMALS_TOKEN),
            2
          )}`}
        />
      </Box> */}
      <CustomButton
        size="medium"
        className="w-full mt-5 !rounded-md"
        color={
          !approved ||
          (baseTokenDepositAmount > 0 &&
            baseTokenDepositAmount <=
              getUserReadableAmount(
                zdteData?.userBaseTokenBalance!,
                DECIMALS_TOKEN
              ))
            ? 'primary'
            : 'mineshaft'
        }
        disabled={baseTokenDepositAmount <= 0}
        onClick={!approved ? handleApprove : handleOpenPosition}
      >
        {approved
          ? baseTokenDepositAmount == 0
            ? 'Insert an amount'
            : baseTokenDepositAmount >
              getUserReadableAmount(
                zdteData?.userBaseTokenBalance!,
                DECIMALS_TOKEN
              )
            ? 'Insufficient balance'
            : 'Deposit'
          : 'Approve'}
      </CustomButton>
    </Box>
  );
};

export default Deposit;
