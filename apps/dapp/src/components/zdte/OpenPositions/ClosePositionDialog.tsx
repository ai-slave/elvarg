import { useCallback, useEffect, useState } from 'react';

import { BigNumber, utils } from 'ethers';

import { ERC20__factory } from '@dopex-io/sdk';
import SouthEastRounded from '@mui/icons-material/SouthEastRounded';
import { Box, SelectChangeEvent, Switch } from '@mui/material';
import useSendTx from 'hooks/useSendTx';
import { useBoundStore } from 'store';

import { CustomButton, Dialog, Input, Typography } from 'components/UI';
import ContentRow from 'components/atlantics/InsuredPerps/ManageCard/ManagePosition/ContentRow';
import EstimatedGasCostButton from 'components/common/EstimatedGasCostButton';

import {
  allowanceApproval,
  getContractReadableAmount,
  getReadableTime,
  getUserReadableAmount,
} from 'utils/contracts';

import { DECIMALS_TOKEN, MAX_VALUE } from 'constants/index';
import { formatAmount } from 'utils/general';

interface Props {
  anchorEl: null | HTMLElement;
  setAnchorEl: Function;
}

export default function ClosePositionDialog({ anchorEl, setAnchorEl }: Props) {
  const { accountAddress, signer, provider } = useBoundStore();
  const [checked, setChecked] = useState(true);

  const collatBalance = 0;
  const tokenSymbol = 'ETH';

  const [tokenDepositAmount, setTokenDepositAmount] = useState<string | number>(
    2
  );

  const handleDepositAmount = useCallback(
    (e: { target: { value: React.SetStateAction<string | number> } }) =>
      setTokenDepositAmount(e.target.value),
    []
  );

  const handleMax = useCallback(() => {
    setTokenDepositAmount(utils.formatEther(0));
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  const handleClosePosition = useCallback(async () => {
    if (!signer || !provider) return;

    try {
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
    <Dialog
      open={anchorEl != null}
      handleClose={() => setAnchorEl(null)}
      disableScrollLock={true}
      sx={{
        '.MuiPaper-root': {
          padding: '18px',
          borderRadius: '24px',
        },
      }}
      width={368}
      showCloseIcon
    >
      <div>
        <Typography variant="h5">Close Position</Typography>
        <Box className="rounded-t-xl bg-carbon">
          <Input
            size="small"
            variant="zdte"
            type="number"
            outline="none"
            placeholder="0.0"
            value={tokenDepositAmount}
            onChange={handleDepositAmount}
            leftElement={
              <Box className="flex my-auto ml-2">
                <img
                  src={`/images/tokens/usdc.svg`}
                  alt="usdc"
                  className="h-8"
                />
              </Box>
            }
          />
          <Box className="flex justify-between p-2">
            <Typography variant="h5" color="stieglitz">
              Amount
            </Typography>
            <Box
              className="ml-auto mr-2 mt-1.5 cursor-pointer"
              onClick={handleMax!}
            >
              <img src="/assets/max.svg" alt="MAX" />
            </Box>
            <Typography variant="h5" className="flex justify-end">
              {`${formatAmount(getUserReadableAmount(0, DECIMALS_TOKEN), 2)}`}
              <span className="text-stieglitz ml-1">USDC</span>
            </Typography>
          </Box>
        </Box>
        <Box className="flex justify-between py-1 px-2 border border-carbon bg-carbon rounded-b-xl text-stieglitz mt-1">
          <span className="mt-1">Reduce Leverage</span>
          <Switch
            checked={checked}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        </Box>
      </div>
      <Box className="border border-neutral-800 space-y-1 mt-2 rounded-xl">
        <Box className="flex">
          <Box className="flex flex-col border border-neutral-800 rounded-tl-xl w-full p-2">
            <span className="text-white pb-1 pr-2">{tokenSymbol}</span>
            <span className="text-sm text-up-only pb-1 pr-2">
              Long <span className="text-stieglitz">5x</span>
            </span>
          </Box>
          <Box className="flex flex-col border border-neutral-800 rounded-tr-xl w-full p-2">
            <span className="text-white pb-1 pr-2">$233</span>
            <span className="text-sm text-up-only pb-1 pr-2">
              11% <span className="text-stieglitz">PNL</span>
            </span>
          </Box>
        </Box>
        <Box className="p-0.5 px-3">
          <ContentRow
            title="Mark Price"
            content={`$${formatAmount(
              getUserReadableAmount(0, DECIMALS_TOKEN),
              2
            )}`}
          />
        </Box>
        <Box className="p-0.5 px-3">
          <ContentRow
            title="Entry Price"
            content={`$${formatAmount(
              getUserReadableAmount(0, DECIMALS_TOKEN),
              2
            )}`}
          />
        </Box>
        <Box className="p-0.5 px-3">
          <ContentRow
            title="Liq Price"
            content={`$${formatAmount(
              getUserReadableAmount(0, DECIMALS_TOKEN),
              2
            )}`}
          />
        </Box>
        <Box className="p-0.5 px-3">
          <ContentRow
            title="Size"
            content={`${formatAmount(
              getUserReadableAmount(0, DECIMALS_TOKEN),
              2
            )} ${tokenSymbol}`}
          />
        </Box>
        <Box className="p-0.5 px-3 pb-2">
          <ContentRow title="Leverage" content={`5x`} />
        </Box>
      </Box>
      <Box className="bg-carbon p-3 rounded-xl mt-3">
        <ContentRow
          title="Fee Rebate"
          content={`${formatAmount(
            getUserReadableAmount(0, DECIMALS_TOKEN),
            2
          )}%`}
        />
        <ContentRow
          title="Fees"
          content={`${formatAmount(
            getUserReadableAmount(0, DECIMALS_TOKEN),
            2
          )} ${tokenSymbol}`}
        />
        <ContentRow
          title="Receive"
          content={`${formatAmount(
            getUserReadableAmount(0, DECIMALS_TOKEN),
            2
          )} ${tokenSymbol}`}
        />
        <CustomButton
          size="medium"
          className="w-full mt-4 !rounded-md"
          color={
            tokenDepositAmount > 0 &&
            tokenDepositAmount <=
              getUserReadableAmount(collatBalance, DECIMALS_TOKEN)
              ? 'primary'
              : 'mineshaft'
          }
          disabled={tokenDepositAmount <= 0}
          onClick={handleClosePosition}
        >
          {tokenDepositAmount == 0
            ? 'Insert an amount'
            : tokenDepositAmount >
              getUserReadableAmount(collatBalance, DECIMALS_TOKEN)
            ? 'Insufficient balance'
            : 'Close Position'}
        </CustomButton>
      </Box>
    </Dialog>
  );
}
