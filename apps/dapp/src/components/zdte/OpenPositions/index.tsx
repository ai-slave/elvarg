import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import {
  Box,
  Table,
  TableBody,
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
import { OpenPositionsRow } from 'components/zdte/OpenPositions/OpenPositionsRow';
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
    isPut: true,
    strike: BigNumber.from(2300000000),
    amount: BigNumber.from(100),
    pnl: 25,
    expiry: BigNumber.from(1683781962),
  },
  {
    isPut: false,
    strike: BigNumber.from(2300000000),
    amount: BigNumber.from(100),
    pnl: -25,
    expiry: BigNumber.from(1683781962),
  },
  {
    isPut: false,
    strike: BigNumber.from(2300000000),
    amount: BigNumber.from(100),
    pnl: 25,
    expiry: BigNumber.from(1683781962),
  },
];

export const OpenPositions = () => {
  return (
    <Box className="flex flex-col flex-grow w-full whitespace-nowrap">
      <span className="h5 mb-4">Open Positions</span>
      <StyleHeaderTable>
        <Table>
          <TableHead>
            <TableRow>
              <StyleLeftTableCell align="left" className="rounded-tl-xl">
                Direction
              </StyleLeftTableCell>
              <StyleTableCellHeader>Strike</StyleTableCellHeader>
              <StyleTableCellHeader>Amount</StyleTableCellHeader>
              <StyleTableCellHeader>Profit & Loss</StyleTableCellHeader>
              <StyleTableCellHeader>Time to Expiry</StyleTableCellHeader>
              <StyleRightTableCell align="right" className="rounded-tr-xl">
                <span className="text-sm text-stieglitz">Action</span>
              </StyleRightTableCell>
            </TableRow>
          </TableHead>
          <TableBody className="rounded-lg">
            {data?.map((position, index) => (
              <OpenPositionsRow key={index} position={position} idx={index} />
            ))}
          </TableBody>
        </Table>
      </StyleHeaderTable>
    </Box>
  );
};

export default OpenPositions;
