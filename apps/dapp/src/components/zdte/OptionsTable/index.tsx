import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import {
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import {
  StyleLeftTableCell,
  StyleRightTableCell,
  StyleTableCellHeader,
} from 'components/common/LpCommon/Table';
import { OptionsTableRow } from 'components/zdte/OptionsTable/OptionsTableRow';
import { DECIMALS_STRIKE, DECIMALS_USD } from 'constants/index';
import { BigNumber } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { useBoundStore } from 'store';
import { ISpreadPair } from 'store/Vault/zdte';
import { getUserReadableAmount } from 'utils/contracts';
import { formatAmount } from 'utils/general';
import oneEBigNumber from 'utils/math/oneEBigNumber';

const ONE_DAY = 24 * 3600;

const StyleHeaderTable = styled(TableContainer)`
  table {
    border-collapse: separate !important;
    border-spacing: 0;
    border-radius: 0.5rem;
  }
  tr:last-of-type td:first-of-type {
    border-radius: 0 0 0 10px;
  }
  tr:last-of-type td:last-of-type {
    border-radius: 0 0 10px 0;
  }
`;

export const OptionsTable = () => {
  const {
    zdteData,
    selectedSpreadPair,
    getZdteContract,
    signer,
    provider,
    setSelectedSpreadPair,
  } = useBoundStore();

  const zdteContract = getZdteContract();
  const tokenPrice = zdteData?.tokenPrice;

  const handleSelectLongStrike = useCallback(
    async (value: number) => {
      if (!signer || !provider || !zdteContract || !setSelectedSpreadPair)
        return;
      try {
        if (
          selectedSpreadPair === undefined ||
          selectedSpreadPair.longStrike === undefined
        ) {
          setSelectedSpreadPair({
            ...selectedSpreadPair,
            longStrike: value,
          });
        } else {
          setSelectedSpreadPair({
            ...selectedSpreadPair,
            shortStrike: value,
          });
        }
      } catch (e) {
        console.log('fail to set strike', e);
      }
    },
    [signer, provider, zdteContract, selectedSpreadPair, setSelectedSpreadPair]
  );

  if (zdteData === undefined) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress className="mb-[30rem]" size="40px" color="primary" />
      </Box>
    );
  }

  return (
    <Box className="flex flex-col flex-grow w-full whitespace-nowrap">
      <StyleHeaderTable>
        <Table>
          <TableHead>
            <TableRow>
              <StyleLeftTableCell
                align="left"
                className="flex space-x-1 rounded-tl-xl"
              >
                <ArrowDownwardIcon className="fill-current text-stieglitz w-4 my-auto" />
                <span className="text-sm text-stieglitz my-auto min-w-width">
                  Strike Price
                </span>
              </StyleLeftTableCell>
              <StyleTableCellHeader>Breakeven</StyleTableCellHeader>
              <StyleTableCellHeader>To Break Even</StyleTableCellHeader>
              <StyleTableCellHeader>% Change</StyleTableCellHeader>
              <StyleTableCellHeader>Change</StyleTableCellHeader>
              <StyleTableCellHeader>Price</StyleTableCellHeader>
              <StyleRightTableCell align="right" className="rounded-tr-xl">
                <span className="text-sm text-stieglitz">Action</span>
              </StyleRightTableCell>
            </TableRow>
          </TableHead>
          <TableBody className="rounded-lg">
            {zdteData.strikes
              .filter((s) => s.strike <= zdteData.tokenPrice)
              .map((optionsStats, index) => (
                <OptionsTableRow
                  key={index}
                  tokenPrice={tokenPrice}
                  optionsStats={optionsStats}
                  selectedSpreadPair={selectedSpreadPair}
                  handleSelectLongStrike={handleSelectLongStrike}
                  idx={index}
                />
              ))}
          </TableBody>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} align="center" className="border-none">
                <div className="relative flex py-5 items-center col-span-8">
                  <div className="flex-grow border-t border-stieglitz"></div>
                  <span className="flex-shrink px-3 py-1 text-up-only text-sm border border-stieglitz">
                    ${tokenPrice}
                  </span>
                  <div className="flex-grow border-t border-stieglitz"></div>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
          <TableBody className="rounded-lg">
            {zdteData.strikes
              .filter((s) => s.strike > zdteData.tokenPrice)
              .map((optionsStats, index) => (
                <OptionsTableRow
                  key={index}
                  tokenPrice={tokenPrice}
                  optionsStats={optionsStats}
                  selectedSpreadPair={selectedSpreadPair}
                  handleSelectLongStrike={handleSelectLongStrike}
                  idx={index}
                />
              ))}
          </TableBody>
        </Table>
      </StyleHeaderTable>
    </Box>
  );
};

export default OptionsTable;
