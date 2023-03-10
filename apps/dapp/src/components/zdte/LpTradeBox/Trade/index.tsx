import { Box } from '@mui/material';
import ContentRow from 'components/atlantics/InsuredPerps/ManageCard/ManagePosition/ContentRow';
import { CustomButton, Input, Typography } from 'components/UI';
import { DECIMALS_TOKEN, DECIMALS_USD } from 'constants/index';
import { utils } from 'ethers';
import { FC, useCallback, useEffect, useState } from 'react';
import { useBoundStore } from 'store';
import {
  allowanceApproval,
  getContractReadableAmount,
  getUserReadableAmount,
} from 'utils/contracts';
import { formatAmount } from 'utils/general';

interface TradeProps {}

const Trade: FC<TradeProps> = ({}) => {
  const { accountAddress, signer, provider } = useBoundStore();

  const collatBalance = 0;

  const [tokenDepositAmount, setTokenDepositAmount] = useState<string | number>(
    0
  );
  const [approved, setApproved] = useState<boolean>(false);

  const handleApprove = useCallback(async () => {
    try {
      // await sendTx(ERC20__factory.connect(tokenAddress, signer), 'approve', [
      //   assetDatum.address,
      //   MAX_VALUE,
      // ]);
      setApproved(true);
    } catch (err) {
      console.log(err);
    }
  }, []); // sendTx, signer, assetDatum, tokenAddress

  // useEffect(() => {
  //   (async () => {
  //     if (!signer || !accountAddress) return;
  //     try {
  //       allowanceApproval(
  //         '0',
  //         accountAddress,
  //         '0',
  //         signer,
  //         getContractReadableAmount(tokenDepositAmount, DECIMALS_TOKEN),
  //         setApproved,
  //         0
  //       );
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   })();
  // }, [signer, accountAddress, tokenDepositAmount]);

  const handleDepositAmount = useCallback(
    (e: { target: { value: React.SetStateAction<string | number> } }) =>
      setTokenDepositAmount(e.target.value),
    []
  );

  const handleOpenPosition = useCallback(async () => {
    if (!signer || !provider) return;

    // const contract = SsovV3LendingPut__factory.connect(
    //   assetDatum.address,
    //   provider
    // );

    try {
      console.log('provider: ', provider);

      // await sendTx(contract.connect(signer), 'deposit', [
      //   strikeIndex,
      //   getContractReadableAmount(tokenDepositAmount, DECIMALS_TOKEN),
      //   accountAddress,
      // ]).then(() => {
      //   setTokenDepositAmount('0');
      // });
      // await getSsovLending();
    } catch (e) {
      console.log('fail to lend');
      throw new Error('fail to lend');
    }
  }, [signer, provider]);

  return (
    <Box className="rounded-xl space-y-2">
      <Box className="border border-neutral-800 bg-umbra rounded-xl">
        <Input
          size="small"
          variant="default"
          type="number"
          placeholder="0.0"
          value={tokenDepositAmount}
          onChange={handleDepositAmount}
          className=""
          leftElement={
            <Box className="flex w-[7rem] mr-2 rounded-full space-x-2 p-1">
              <Typography
                variant="h4"
                color="white"
                className="flex items-center"
              >
                1625-C
              </Typography>
            </Box>
          }
        />
      </Box>
      <Box className="space-y-2 p-2">
        <ContentRow
          title="Margin"
          content={`${formatAmount(
            getUserReadableAmount(0, DECIMALS_USD),
            2
          )} USDC`}
        />
        <ContentRow
          title="Premium"
          content={`${formatAmount(
            getUserReadableAmount(0, DECIMALS_USD),
            2
          )} USDC`}
        />
        <ContentRow
          title="Fees"
          content={`${formatAmount(
            getUserReadableAmount(0, DECIMALS_USD),
            2
          )} USDC`}
        />
      </Box>
      <CustomButton
        size="medium"
        className="w-full mt-4 !rounded-md"
        color={
          !approved ||
          (tokenDepositAmount > 0 &&
            tokenDepositAmount <=
              getUserReadableAmount(collatBalance, DECIMALS_TOKEN))
            ? 'primary'
            : 'mineshaft'
        }
        disabled={tokenDepositAmount <= 0}
        onClick={!approved ? handleApprove : handleOpenPosition}
      >
        {approved
          ? tokenDepositAmount == 0
            ? 'Insert an amount'
            : tokenDepositAmount >
              getUserReadableAmount(collatBalance, DECIMALS_TOKEN)
            ? 'Insufficient balance'
            : 'Open Position'
          : 'Approve'}
      </CustomButton>
    </Box>
  );
};

export default Trade;
