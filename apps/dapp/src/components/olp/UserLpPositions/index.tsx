import { useCallback, useState } from 'react';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import useSendTx from 'hooks/useSendTx';
import { useBoundStore } from 'store';

import TablePaginationActions from 'components/UI/TablePaginationActions';
import Typography from 'components/UI/Typography';
import {
  StyleLeftTableCell,
  StyleRightTableCell,
  StyleTable,
  StyleTableCell,
} from 'components/common/LpCommon/Table';
import UserPositionsTable from 'components/olp/UserLpPositions/UserPositionsTable';

const ROWS_PER_PAGE = 5;

const UserLpPositions = () => {
  const sendTx = useSendTx();
  const {
    getOlpContract,
    olpData,
    signer,
    olpUserData,
    updateOlpEpochData,
    updateOlpUserData,
  } = useBoundStore();

  const olpContract = getOlpContract();
  const [page, setPage] = useState<number>(0);

  const handleChangePage = useCallback(
    (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      setPage(newPage);
    },
    [setPage]
  );

  const handleKill = useCallback(
    async (selectedIndex: number) => {
      if (
        !olpData ||
        !olpUserData?.userPositions ||
        !olpContract ||
        !signer ||
        selectedIndex === undefined
      )
        return;

      const selectedPosition = olpUserData?.userPositions[selectedIndex];

      if (!selectedPosition) {
        throw new Error('Invalid position');
      }

      const selectedStrikeToken = await olpContract.getSsovOptionToken(
        olpData.ssov,
        selectedPosition.epoch,
        selectedPosition.strike
      );

      try {
        await sendTx(olpContract.connect(signer), 'killLpPosition', [
          selectedStrikeToken,
          selectedPosition.lpId,
        ]);
        await updateOlpEpochData!();
        await updateOlpUserData!();
      } catch (err) {
        console.log(err);
      }
    },
    [
      sendTx,
      signer,
      olpContract,
      olpData,
      olpUserData,
      updateOlpEpochData,
      updateOlpUserData,
    ]
  );

  return (
    <Box className="balances-table text-white space-y-2">
      <Typography variant="h5" className="ml-1">
        User LP Positions
      </Typography>
      <StyleTable className="bg-cod-gray rounded-t-lg p-2 rounded-md">
        <Table>
          <TableHead className="bg-cod-gray">
            <TableRow>
              <StyleLeftTableCell align="left" className="flex flex-row">
                <ArrowDownwardIcon
                  sx={{
                    width: '1.25rem',
                    marginTop: '0.125rem',
                    marginLeft: '-8px',
                    color: '#8E8E8E',
                  }}
                />
                <Typography
                  variant="caption"
                  color="stieglitz"
                  className="mt-1.5"
                >
                  Strike
                </Typography>
              </StyleLeftTableCell>
              <StyleTableCell align="center">
                <Typography variant="caption" color="stieglitz">
                  Liquidity
                </Typography>
              </StyleTableCell>
              <StyleTableCell align="center">
                <Typography variant="caption" color="stieglitz">
                  Utilization
                </Typography>
              </StyleTableCell>
              <StyleTableCell align="center">
                <Typography variant="caption" color="stieglitz">
                  Discount
                </Typography>
              </StyleTableCell>
              <StyleTableCell align="center">
                <Typography variant="caption" color="stieglitz">
                  Tokens Purchased
                </Typography>
              </StyleTableCell>
              <StyleRightTableCell align="right">
                <Typography variant="caption" color="stieglitz">
                  Action
                </Typography>
              </StyleRightTableCell>
            </TableRow>
          </TableHead>
          <TableBody className="rounded-lg">
            {olpUserData
              ?.userPositions!.slice(
                page * ROWS_PER_PAGE,
                page * ROWS_PER_PAGE + ROWS_PER_PAGE
              )
              .map((p, idx) => {
                return (
                  <UserPositionsTable
                    key={idx}
                    lpPosition={p}
                    actions={() => handleKill(idx)}
                    underlyingSymbol={olpData?.underlyingSymbol!}
                  />
                );
              })}
          </TableBody>
        </Table>
      </StyleTable>
      {olpUserData!.userPositions!.length > ROWS_PER_PAGE ? (
        <TablePagination
          component="div"
          id="stats"
          rowsPerPageOptions={[ROWS_PER_PAGE]}
          count={olpUserData!.userPositions!.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={ROWS_PER_PAGE}
          className="text-stieglitz border-0 flex flex-grow justify-center"
          ActionsComponent={TablePaginationActions}
        />
      ) : null}
    </Box>
  );
};

export default UserLpPositions;
