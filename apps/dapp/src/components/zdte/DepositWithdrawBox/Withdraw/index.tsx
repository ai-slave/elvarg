import { Box } from '@mui/material';
import ContentRow from 'components/atlantics/InsuredPerps/ManageCard/ManagePosition/ContentRow';
import { CustomButton, Input, Typography } from 'components/UI';
import { DECIMALS_TOKEN, MAX_VALUE } from 'constants/index';
import { BigNumber } from 'ethers';
import useSendTx from 'hooks/useSendTx';
import { ZdteLP__factory } from 'mocks/factories/ZdteLP__factory';
import { FC, useCallback, useEffect, useState } from 'react';
import { useBoundStore } from 'store';
import {
  getContractReadableAmount,
  getUserReadableAmount,
} from 'utils/contracts';
import { formatAmount } from 'utils/general';

interface WithdrawProps {}

const Withdraw: FC<WithdrawProps> = ({}) => {
  const sendTx = useSendTx();

  const {
    userZdteLpData,
    signer,
    provider,
    getZdteContract,
    updateZdteData,
    getBaseLpContract,
    zdteData,
    accountAddress,
  } = useBoundStore();

  const [tokenWithdrawAmount, setTokenWithdrawAmount] = useState<
    string | number
  >(0);
  const [approved, setApproved] = useState<boolean>(false);

  const handleApprove = useCallback(async () => {
    if (!signer || !getBaseLpContract) return;

    try {
      await sendTx(
        ZdteLP__factory.connect(zdteData?.baseTokenAddress!, signer),
        'approve',
        [zdteData?.zdteAddress, MAX_VALUE]
      );
      setApproved(true);
    } catch (err) {
      console.log(err);
    }
  }, [zdteData, signer, sendTx, getBaseLpContract]);

  useEffect(() => {
    (async () => {
      if (!signer || !accountAddress || !zdteData) return;
      try {
        const baseLpTokenContract = await ZdteLP__factory.connect(
          zdteData.baseTokenAddress,
          signer
        );
        const allowance: BigNumber = await baseLpTokenContract.allowance(
          accountAddress,
          zdteData.zdteAddress
        );
        setApproved(
          allowance.gte(
            getContractReadableAmount(tokenWithdrawAmount, DECIMALS_TOKEN)
          )
        );
      } catch (err) {
        console.log(err);
      }
    })();
  }, [signer, accountAddress, tokenWithdrawAmount, zdteData]);

  const handleWithdrawAmount = useCallback(
    (e: { target: { value: React.SetStateAction<string | number> } }) =>
      setTokenWithdrawAmount(e.target.value),
    []
  );

  const handleWithdraw = useCallback(async () => {
    if (!signer || !provider || !getZdteContract) return;

    const zdteContract = await getZdteContract();

    try {
      await sendTx(zdteContract.connect(signer), 'withdraw', [
        false,
        getContractReadableAmount(tokenWithdrawAmount, DECIMALS_TOKEN),
      ]).then(() => {
        setTokenWithdrawAmount('0');
      });
      await updateZdteData();
    } catch (e) {
      console.log('fail to withdraw', e);
    }
  }, [
    signer,
    provider,
    sendTx,
    updateZdteData,
    tokenWithdrawAmount,
    getZdteContract,
  ]);

  const canWithdraw = false;

  return (
    <Box className="rounded-xl space-y-2">
      <Box className="border border-neutral-800 bg-umbra rounded-xl">
        <Input
          size="small"
          variant="default"
          type="number"
          placeholder="0.0"
          value={tokenWithdrawAmount}
          onChange={handleWithdrawAmount}
          className=""
          leftElement={
            <Box className="flex my-auto">
              <Box className="flex w-36 mr-2 bg-cod-gray rounded-full space-x-2 p-1 pr-4">
                <img
                  src={`/images/tokens/${zdteData?.baseTokenSymbol}.svg`}
                  alt="tokenSymbol"
                  className="h-8"
                />
                <Typography
                  variant="h5"
                  color="white"
                  className="flex items-center ml-2"
                >
                  {userZdteLpData?.baseLpSymbol}
                </Typography>
              </Box>
            </Box>
          }
        />
      </Box>
      <Box className="space-y-2 p-2">
        <ContentRow
          title="Balance"
          content={`${formatAmount(
            getUserReadableAmount(
              userZdteLpData?.baseLpBalance!,
              DECIMALS_TOKEN
            ),
            2
          )} ${userZdteLpData?.baseLpSymbol}`}
        />
      </Box>
      <CustomButton
        size="medium"
        className="w-full mt-4 !rounded-md"
        color={
          !approved ||
          (tokenWithdrawAmount > 0 &&
            tokenWithdrawAmount <=
              getUserReadableAmount(
                zdteData?.userBaseTokenBalance!,
                DECIMALS_TOKEN
              ) &&
            canWithdraw)
            ? 'primary'
            : 'mineshaft'
        }
        disabled={tokenWithdrawAmount <= 0 || !canWithdraw}
        onClick={!approved ? handleApprove : handleWithdraw}
      >
        {approved
          ? tokenWithdrawAmount == 0
            ? 'Insert an amount'
            : tokenWithdrawAmount >
              getUserReadableAmount(
                zdteData?.userBaseTokenBalance!,
                DECIMALS_TOKEN
              )
            ? 'Insufficient balance'
            : 'Withdraw'
          : 'Approve'}
      </CustomButton>
    </Box>
  );
};

export default Withdraw;
