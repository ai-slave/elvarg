import { BigNumber } from 'ethers';

import { Box, TableRow } from '@mui/material';

import { CustomButton, Typography } from 'components/UI';
import {
  StyleCell,
  StyleLeftCell,
  StyleLeftTableCell,
  StyleRightCell,
  StyleRightTableCell,
  StyleTableCellHeader,
} from 'components/common/LpCommon/Table';
import { formatAmount } from 'utils/general';
import { getUserReadableAmount } from 'utils/contracts';
import { DECIMALS_TOKEN } from 'constants/index';

interface IOptionStats {
  strikePrice: BigNumber;
  breakEven: BigNumber;
  toBreakEven: number;
  pctChange: number;
  change: number;
  price: number;
}

export const OptionsTableRow = ({
  optionsStats,
  idx,
}: {
  optionsStats: IOptionStats;
  idx: number;
}) => {
  return (
    <TableRow key={idx} className="text-white mb-2 rounded-lg">
      <StyleLeftCell align="left">
        <Box className="flex flex-row items-center w-max">
          <Typography variant="h6" color="white" className="capitalize">
            $
            {formatAmount(
              getUserReadableAmount(optionsStats.strikePrice, DECIMALS_TOKEN),
              2
            )}
          </Typography>
        </Box>
      </StyleLeftCell>
      <StyleCell align="left">
        <Typography variant="h6" color="white">
          $
          {formatAmount(
            getUserReadableAmount(optionsStats.breakEven, DECIMALS_TOKEN),
            2
          )}
        </Typography>
      </StyleCell>
      <StyleCell align="left">
        <Typography variant="h6" color="white">
          {optionsStats.toBreakEven}%
        </Typography>
      </StyleCell>
      <StyleCell align="left">
        <Typography variant="h6" color="white">
          {optionsStats.pctChange}%
        </Typography>
      </StyleCell>
      <StyleCell align="left">
        <Typography variant="h6" color="white">
          ${optionsStats.change}
        </Typography>
      </StyleCell>
      <StyleCell align="left">
        <Typography variant="h6" color="white">
          ${optionsStats.price}
        </Typography>
      </StyleCell>
      <StyleRightCell align="right" className="pt-2">
        <CustomButton className="cursor-pointer text-white">Buy</CustomButton>
      </StyleRightCell>
    </TableRow>
  );
};
