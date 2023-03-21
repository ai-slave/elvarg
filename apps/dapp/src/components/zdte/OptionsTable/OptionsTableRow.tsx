import { Box, TableRow } from '@mui/material';

import { CustomButton, Typography } from 'components/UI';
import {
  StyleCell,
  StyleLeftCell,
  StyleRightCell,
} from 'components/common/LpCommon/Table';
import { OptionsTableData } from 'store/Vault/zdte';
import PurchaseOptionDialog from 'components/zdte/OptionsTable/PurchaseOptionsDialog';
import { useState } from 'react';

const FormatDollarColor = ({ value }: { value: number }) => {
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

const FormatPercentColor = ({ value }: { value: number }) => {
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

export const OptionsTableRow = ({
  optionsStats,
  tokenPrice,
  tokenSymbol,
  idx,
}: {
  optionsStats: OptionsTableData;
  tokenSymbol: string;
  tokenPrice: number;
  idx: number;
}) => {
  const direction = optionsStats.strike < tokenPrice ? 'Short' : 'Long';
  const [openDialogAnchorEl, setOpenDialogAnchorEl] =
    useState<null | HTMLElement>(null);
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
          onClick={(e) => setOpenDialogAnchorEl(e.currentTarget)}
        >
          {direction}
        </CustomButton>
        {openDialogAnchorEl && (
          <PurchaseOptionDialog
            key={idx}
            direction={direction}
            optionsStats={optionsStats}
            anchorEl={openDialogAnchorEl}
            setAnchorEl={setOpenDialogAnchorEl}
          />
        )}
      </StyleRightCell>
    </TableRow>
  );
};
