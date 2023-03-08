import { useCallback } from 'react';

import { BigNumber } from 'ethers';
import format from 'date-fns/format';
import Countdown from 'react-countdown';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import useSendTx from 'hooks/useSendTx';

import { useBoundStore } from 'store';

import CustomButton from 'components/UI/Button';
import Typography from 'components/UI/Typography';
import { TableHeader } from 'components/straddles/Deposits/DepositsTable';

import getUserReadableAmount from 'utils/contracts/getUserReadableAmount';
import formatAmount from 'utils/general/formatAmount';

const PositionsTable = () => {
  const sendTx = useSendTx();

  const {
    signer,
    optionScalpUserData,
    optionScalpData,
    updateOptionScalp,
    updateOptionScalpUserData,
  } = useBoundStore();

  const handleClose = useCallback(
    async (id: BigNumber) => {
      await sendTx(
        optionScalpData?.optionScalpContract.connect(signer),
        'closePosition',
        [id]
      );
      await updateOptionScalp();
      await updateOptionScalpUserData();
    },
    [
      optionScalpData,
      signer,
      sendTx,
      updateOptionScalp,
      updateOptionScalpUserData,
    ]
  );

  return (
    <Box>
      <TableContainer className="rounded-xl">
        <Table className="rounded-xl">
          <TableHead className="rounded-xl">
            <TableRow>
              <TableHeader label="Positions" showArrowIcon />
              <TableHeader label="Average Open Price" />
              <TableHeader label="PnL" />
              <TableHeader label="Margin" />
              <TableHeader label="Premium" />
              <TableHeader label="Expiry" />
            </TableRow>
          </TableHead>
          <TableBody className="rounded-lg">
            {optionScalpUserData?.scalpPositions?.map((position, i) => (
              <TableRow key={i}>
                <TableCell className="pt-2 border-0">
                  <Box>
                    <Box
                      className={`rounded-md flex items-center px-2 py-2 w-fit`}
                    >
                      <Typography variant="h6" className={'pr-7 pt-[2px]'}>
                        <span
                          className={
                            position.isShort
                              ? 'text-[#FF617D]'
                              : 'text-[#6DFFB9]'
                          }
                        >
                          {position.isShort ? '-' : '+'}
                          {formatAmount(
                            getUserReadableAmount(position.positions, 8),
                            8
                          )}
                        </span>
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell className="pt-1 border-0">
                  <Typography variant="h6" color="white" className="text-left">
                    ${getUserReadableAmount(position.entry, 8).toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell className="pt-1 border-0">
                  <Typography variant="h6" color="white" className="text-left">
                    ${getUserReadableAmount(position.pnl, 6).toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell className="pt-1 border-0">
                  <Typography variant="h6" color="white" className="text-left">
                    ${getUserReadableAmount(position.margin, 6).toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell className="pt-1 border-0">
                  <Typography variant="h6" color="white" className="text-left">
                    ${getUserReadableAmount(position.premium, 6).toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell className="pt-1 border-0">
                  <Typography variant="h6" color="white" className="text-left">
                    <Countdown
                      date={format(
                        new Date(
                          Number(
                            BigNumber.from('1000').mul(
                              position.openedAt.add(position.timeframe)
                            )
                          )
                        ),
                        'd LLL, yyyy'
                      )}
                      renderer={({ days, hours, minutes }) => {
                        return (
                          <Typography
                            variant="h5"
                            className="text-stieglitz mr-1"
                          >
                            {days}d {hours}h {minutes}m
                          </Typography>
                        );
                      }}
                    />
                  </Typography>
                </TableCell>
                <TableCell className="flex justify-end border-0">
                  <CustomButton
                    className="cursor-pointer text-white"
                    color={'primary'}
                    onClick={() => handleClose(position.id)}
                  >
                    Close
                  </CustomButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box className="flex">
        {optionScalpUserData?.scalpPositions?.length === 0 ? (
          <Box className="text-center mt-3 mb-3 ml-auto w-full">-</Box>
        ) : null}
      </Box>
    </Box>
  );
};

export default PositionsTable;
