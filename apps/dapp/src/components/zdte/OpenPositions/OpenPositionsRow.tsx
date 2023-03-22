import { Box, TableRow } from '@mui/material';
import { CustomButton, Typography } from 'components/UI';
import {
  StyleCell,
  StyleLeftCell,
  StyleRightCell,
} from 'components/common/LpCommon/Table';
import { formatAmount } from 'utils/general';
import { getUserReadableAmount } from 'utils/contracts';
import { DECIMALS_STRIKE, DECIMALS_TOKEN, DECIMALS_USD } from 'constants/index';
import Countdown from 'react-countdown';
import { useCallback } from 'react';
import { IZdtePurchaseData } from 'store/Vault/zdte';
import { FormatDollarColor } from 'components/zdte/OptionsTable/OptionsTableRow';
import { useBoundStore } from 'store';
import useSendTx from 'hooks/useSendTx';

function getPositionName(position: IZdtePurchaseData) {
  const shortStrike = getUserReadableAmount(
    position.shortStrike,
    DECIMALS_STRIKE
  );
  const longStrike = getUserReadableAmount(
    position.longStrike,
    DECIMALS_STRIKE
  );
  if (position.isSpread && position.isPut) {
    return `${longStrike}-P/${shortStrike}-C`;
  } else if (position.isSpread) {
    return `${longStrike}-C/${shortStrike}-P`;
  } else if (position.isPut) {
    return `${longStrike}-P`;
  }
  return `${longStrike}-C`;
}

export const OpenPositionsRow = ({
  position,
  idx,
}: {
  position: IZdtePurchaseData;
  idx: number;
}) => {
  const sendTx = useSendTx();

  const { signer, provider, getZdteContract, updateZdteData } = useBoundStore();

  const zdteContract = getZdteContract();

  let name = `${getUserReadableAmount(
    position?.longStrike || position.shortStrike,
    DECIMALS_STRIKE
  )}`;

  const isPut = position.isPut;
  name += isPut ? '-P' : '-C';

  const handleCloseOpenPosition = useCallback(async () => {
    if (!signer || !provider || !zdteContract || !position) return;
    try {
      await sendTx(zdteContract.connect(signer), 'expireLongOptionPosition', [
        position.positionId,
      ]);
      await updateZdteData();
    } catch (e) {
      console.log('fail to close', e);
    }
  }, [signer, provider, zdteContract, updateZdteData, sendTx, position]);

  return (
    <TableRow key={idx} className="text-white mb-2 rounded-lg">
      <StyleLeftCell align="left">
        <span className="text-sm text-white">{getPositionName(position)}</span>
      </StyleLeftCell>
      <StyleCell align="left">
        <Typography variant="h6" color="white">
          {`${formatAmount(
            getUserReadableAmount(position.positions, DECIMALS_TOKEN),
            2
          )}`}
        </Typography>
      </StyleCell>
      <StyleCell align="left">
        <FormatDollarColor
          value={getUserReadableAmount(position.livePnl, DECIMALS_USD)}
        />
      </StyleCell>
      <StyleCell align="left">
        <Typography variant="h6" color="white">
          <Countdown
            date={new Date(position.expiry.toNumber() * 1000)}
            renderer={({ days, hours, minutes }) => {
              return (
                <Box className="flex space-x-2">
                  <Typography variant="h6">
                    {days}d {hours}h {minutes}m
                  </Typography>
                </Box>
              );
            }}
          />
        </Typography>
      </StyleCell>
      <StyleRightCell align="right" className="pt-2">
        <CustomButton
          className="cursor-pointer text-white"
          onClick={handleCloseOpenPosition}
        >
          Close
        </CustomButton>
      </StyleRightCell>
    </TableRow>
  );
};
