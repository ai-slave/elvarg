import { BigNumber } from 'ethers';

import { Box, TableRow } from '@mui/material';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import SouthEastIcon from '@mui/icons-material/SouthEast';

import { CustomButton, Typography } from 'components/UI';
import {
  StyleCell,
  StyleLeftCell,
  StyleRightCell,
} from 'components/common/LpCommon/Table';
import { formatAmount } from 'utils/general';
import { getUserReadableAmount } from 'utils/contracts';
import { DECIMALS_STRIKE, DECIMALS_TOKEN } from 'constants/index';
import Countdown from 'react-countdown';
import ClosePositionDialog from './ClosePositionDialog';
import { useState } from 'react';
import { IZdtePurchaseData } from 'store/Vault/zdte';

export const OpenPositionsRow = ({
  position,
  idx,
}: {
  position: IZdtePurchaseData;
  idx: number;
}) => {
  let name = `${getUserReadableAmount(
    position?.longStrike || position.shortStrike,
    DECIMALS_STRIKE
  )}`;

  // enum PositionType {
  //     LONG_PUT,
  //     LONG_CALL,
  //     SPREAD_PUT,
  //     SPREAD_CALL
  // }
  const isPut = position.positionType === 0;

  name += isPut ? '-P' : '-C';

  const [closeDialogAnchorEl, setCloseDialogAnchorEl] =
    useState<null | HTMLElement>(null);

  return (
    <TableRow key={idx} className="text-white mb-2 rounded-lg">
      <StyleLeftCell align="left">
        <Box className="flex flex-row items-center w-max">
          <Typography variant="h6" color="white" className="capitalize">
            {isPut ? (
              <SouthEastIcon
                fontSize="small"
                className="fill-current text-down-bad"
              />
            ) : (
              <NorthEastIcon
                fontSize="small"
                className="fill-current text-up-only"
              />
            )}
          </Typography>
        </Box>
      </StyleLeftCell>
      <StyleCell align="left">
        <span className="text-sm text-white">{name}</span>
      </StyleCell>
      <StyleCell align="left">
        <Typography variant="h6" color="white">
          {`${formatAmount(
            getUserReadableAmount(position.positions, DECIMALS_TOKEN),
            2
          )}`}
        </Typography>
      </StyleCell>
      <StyleCell align="left">
        {position.pnl.gte(BigNumber.from(0)) ? (
          <Typography variant="h6" color="up-only">
            {`$${position.livePnl}`}
          </Typography>
        ) : (
          <Typography variant="h6" color="down-bad">
            {`-$${Math.abs(position.livePnl)}`}
          </Typography>
        )}
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
          onClick={(e) => setCloseDialogAnchorEl(e.currentTarget)}
        >
          Close
        </CustomButton>
        {closeDialogAnchorEl && (
          <ClosePositionDialog
            key={idx}
            anchorEl={closeDialogAnchorEl}
            setAnchorEl={setCloseDialogAnchorEl}
          />
        )}
      </StyleRightCell>
    </TableRow>
  );
};
