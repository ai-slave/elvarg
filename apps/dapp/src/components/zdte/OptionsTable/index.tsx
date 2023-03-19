import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import {
  Box,
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
import { BigNumber } from 'ethers';

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

const data = [
  {
    strikePrice: BigNumber.from(100),
    breakEven: BigNumber.from(100),
    toBreakEven: 100,
    pctChange: 100,
    change: 100,
    price: 100,
  },
  {
    strikePrice: BigNumber.from(100),
    breakEven: BigNumber.from(100),
    toBreakEven: 100,
    pctChange: 100,
    change: 100,
    price: 100,
  },
  {
    strikePrice: BigNumber.from(100),
    breakEven: BigNumber.from(100),
    toBreakEven: 100,
    pctChange: 100,
    change: 100,
    price: 100,
  },
];

export const OptionsTable = () => {
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
            {data?.map((optionsStats, index) => (
              <OptionsTableRow
                key={index}
                optionsStats={optionsStats}
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
                    $1600
                  </span>
                  <div className="flex-grow border-t border-stieglitz"></div>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
          <TableBody className="rounded-lg">
            {data?.map((optionsStats, index) => (
              <OptionsTableRow
                key={index}
                optionsStats={optionsStats}
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
