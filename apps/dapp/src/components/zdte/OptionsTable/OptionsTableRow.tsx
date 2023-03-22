import { Box, TableRow } from '@mui/material';

import { CustomButton, Typography } from 'components/UI';
import {
  StyleCell,
  StyleLeftCell,
  StyleRightCell,
} from 'components/common/LpCommon/Table';
import { ISpreadPair, OptionsTableData } from 'store/Vault/zdte';

export const FormatDollarColor = ({ value }: { value: number }) => {
  if (value > 0) {
    return (
      <Typography variant="h6" color="up-only">
        {`$${value}`}
      </Typography>
    );
  } else if (value < 0) {
    return (
      <Typography variant="h6" color="down-bad">
        {`-$${Math.abs(value)}`}
      </Typography>
    );
  } else {
    return (
      <Typography variant="h6" color="white">
        {`$${value}`}
      </Typography>
    );
  }
};

export const FormatPercentColor = ({ value }: { value: number }) => {
  if (value > 0) {
    return (
      <Typography variant="h6" color="up-only">
        {`${value}%`}
      </Typography>
    );
  } else if (value < 0) {
    return (
      <Typography variant="h6" color="down-bad">
        {`-${Math.abs(value)}%`}
      </Typography>
    );
  } else {
    return (
      <Typography variant="h6" color="white">
        {`${value}%`}
      </Typography>
    );
  }
};

function isDisabled(
  tokenPrice: number,
  selectedSpreadPair: ISpreadPair | undefined,
  strike: number
): boolean {
  if (
    selectedSpreadPair === undefined ||
    selectedSpreadPair.longStrike === undefined
  ) {
    return false;
  } else if (
    strike === tokenPrice ||
    selectedSpreadPair.shortStrike !== undefined
  ) {
    return true;
  } else if (
    selectedSpreadPair.longStrike <= tokenPrice &&
    strike < selectedSpreadPair.longStrike
  ) {
    return false;
  } else if (
    selectedSpreadPair.longStrike >= tokenPrice &&
    strike > selectedSpreadPair.longStrike
  ) {
    return false;
  }
  return true;
}

export const OptionsTableRow = ({
  tokenPrice,
  optionsStats,
  selectedSpreadPair,
  idx,
  handleSelectLongStrike,
}: {
  tokenPrice: number;
  optionsStats: OptionsTableData;
  selectedSpreadPair: ISpreadPair | undefined;
  idx: number;
  handleSelectLongStrike: (longStrike: number) => void;
}) => {
  const direction =
    selectedSpreadPair === undefined ||
    selectedSpreadPair.longStrike === undefined
      ? 'Long'
      : 'Short';

  return (
    <TableRow key={idx} className="text-white mb-2 rounded-lg">
      <StyleLeftCell align="left">
        <Box className="flex flex-row items-center w-max">
          <Typography variant="h6" color="white" className="capitalize">
            ${optionsStats.strike}
          </Typography>
        </Box>
      </StyleLeftCell>
      <StyleCell align="left">
        <Typography variant="h6" color="white">
          ${optionsStats.breakeven}
        </Typography>
      </StyleCell>
      <StyleCell align="left">
        <Typography variant="h6" color="white">
          {optionsStats.breakevenPercentage}%
        </Typography>
      </StyleCell>
      <StyleCell align="left">
        <FormatPercentColor value={optionsStats.changePercentage} />
      </StyleCell>
      <StyleCell align="left">
        <FormatDollarColor value={optionsStats.change} />
      </StyleCell>
      <StyleCell align="left">
        <Typography variant="h6" color="white">
          ${optionsStats.premium}
        </Typography>
      </StyleCell>
      <StyleRightCell align="right" className="pt-2">
        <CustomButton
          className="cursor-pointer text-white"
          disabled={isDisabled(
            tokenPrice,
            selectedSpreadPair,
            optionsStats.strike
          )}
          onClick={() => handleSelectLongStrike(optionsStats.strike)}
        >
          {direction}
        </CustomButton>
      </StyleRightCell>
    </TableRow>
  );
};
