import { ERC20__factory } from '@dopex-io/sdk';
import { Box } from '@mui/material';
import ContentRow from 'components/atlantics/InsuredPerps/ManageCard/ManagePosition/ContentRow';
import { CustomButton, Dialog, Input, Typography } from 'components/UI';
import { DECIMALS_STRIKE, DECIMALS_TOKEN, MAX_VALUE } from 'constants/index';
import { BigNumber, utils } from 'ethers';
import useSendTx from 'hooks/useSendTx';
import { ZdteLP__factory } from 'mocks/factories/ZdteLP__factory';
import { FC, useCallback, useEffect, useState } from 'react';
import { useBoundStore } from 'store';
import { OptionsTableData } from 'store/Vault/zdte';
import {
  getContractReadableAmount,
  getUserReadableAmount,
} from 'utils/contracts';
import { formatAmount } from 'utils/general';

interface PurchaseOptionDialogProps {
  anchorEl: null | HTMLElement;
  setAnchorEl: Function;
  direction: string;
  optionsStats: OptionsTableData;
}

const PurchaseOptionDialog: FC<PurchaseOptionDialogProps> = ({
  anchorEl,
  setAnchorEl,
  direction,
  optionsStats,
}: PurchaseOptionDialogProps) => {
  const sendTx = useSendTx();

  const {
    signer,
    provider,
    getZdteContract,
    updateZdteData,
    zdteData,
    accountAddress,
  } = useBoundStore();
  const tokenSymbol = zdteData?.baseTokenSymbol.toUpperCase();
  const [baseTokenLongOptionAmount, setBaseTokenLongOptionAmount] = useState<
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
            getContractReadableAmount(baseTokenLongOptionAmount, DECIMALS_TOKEN)
          )
        );
      } catch (err) {
        console.log(err);
      }
    })();
  }, [signer, accountAddress, baseTokenLongOptionAmount, zdteData]);

  const handleLongOptionAmount = useCallback(
    (e: { target: { value: React.SetStateAction<string | number> } }) =>
      setBaseTokenLongOptionAmount(e.target.value),
    []
  );

  const handleOpenPosition = useCallback(async () => {
    if (!signer || !provider || !getZdteContract || !optionsStats) return;

    const zdteContract = await getZdteContract();

    try {
      await sendTx(zdteContract.connect(signer), 'longOptionPosition', [
        false,
        getContractReadableAmount(baseTokenLongOptionAmount, DECIMALS_TOKEN),
        getContractReadableAmount(optionsStats.strike, DECIMALS_STRIKE),
      ]).then(() => {
        setBaseTokenLongOptionAmount('0');
      });
      await updateZdteData();
    } catch (e) {
      console.log('fail to open position', e);
    }
  }, [
    signer,
    provider,
    sendTx,
    updateZdteData,
    baseTokenLongOptionAmount,
    getZdteContract,
    optionsStats,
  ]);

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
      <Typography variant="h5">{direction}</Typography>
      <Box className="rounded-xl space-y-2 mt-2">
        <Box className="border border-neutral-800 bg-umbra rounded-xl">
          <Input
            size="small"
            variant="default"
            type="number"
            placeholder="0.0"
            value={baseTokenLongOptionAmount}
            onChange={handleLongOptionAmount}
            className=""
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
        <Box className="p-2">
          <ContentRow
            title="Balance"
            content={`${formatAmount(
              getUserReadableAmount(
                zdteData?.userBaseTokenBalance!,
                DECIMALS_TOKEN
              ),
              2
            )} ${zdteData?.baseTokenSymbol}`}
          />
          <ContentRow title="Premium" content={`$${optionsStats.premium}`} />
          <ContentRow
            title="Opening fees"
            content={`$${optionsStats.premium}`}
          />
          <ContentRow title="Total cost" content={`$${optionsStats.premium}`} />
        </Box>
        <CustomButton
          size="medium"
          className="w-full mt-4 !rounded-md"
          color={
            !approved ||
            (baseTokenLongOptionAmount > 0 &&
              baseTokenLongOptionAmount <=
                getUserReadableAmount(
                  zdteData?.userBaseTokenBalance!,
                  DECIMALS_TOKEN
                ))
              ? 'primary'
              : 'mineshaft'
          }
          disabled={baseTokenLongOptionAmount <= 0}
          onClick={!approved ? handleApprove : handleOpenPosition}
        >
          {approved
            ? baseTokenLongOptionAmount == 0
              ? 'Insert an amount'
              : baseTokenLongOptionAmount >
                getUserReadableAmount(
                  zdteData?.userBaseTokenBalance!,
                  DECIMALS_TOKEN
                )
              ? 'Insufficient balance'
              : direction
            : 'Approve'}
        </CustomButton>
      </Box>
    </Dialog>
  );
};

export default PurchaseOptionDialog;
