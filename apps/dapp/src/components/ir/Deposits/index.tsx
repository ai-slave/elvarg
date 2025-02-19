import { useState, useMemo, useCallback } from 'react';
import { BigNumber } from 'ethers';
import cx from 'classnames';
import Box from '@mui/material/Box';
import Countdown from 'react-countdown';
import TableHead from '@mui/material/TableHead';
import Button from '@mui/material/Button';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import Skeleton from '@mui/material/Skeleton';
import range from 'lodash/range';

import Typography from 'components/UI/Typography';
import TablePaginationActions from 'components/UI/TablePaginationActions';

import { useBoundStore } from 'store';

import useSendTx from 'hooks/useSendTx';

import getUserReadableAmount from 'utils/contracts/getUserReadableAmount';
import formatAmount from 'utils/general/formatAmount';
import displayAddress from 'utils/general/displayAddress';

import styles from './styles.module.scss';

interface DepositsTableDataProps {
  strikeIndex: number;
  strikePrice: number;
  totalUserDeposits: {
    amount: number;
    callLeverage: number;
    putLeverage: number;
  }[];
  totalUserPremiums: number;
  totalDeposits: number;
  totalPremiums: number;
  imgSrc: string;
  tokenSymbol: string;
  handleWithdraw: () => {};
}

const YEAR_SECONDS = 31536000;

const DepositsTableData = (
  props: DepositsTableDataProps & {
    price: number;
    epochTime: number;
    epochEndTime: Date;
    isBootstrapped: boolean;
  }
) => {
  const {
    strikePrice,
    totalDeposits,
    totalPremiums,
    totalUserDeposits,
    totalUserPremiums,
    epochTime,
    epochEndTime,
    handleWithdraw,
    isBootstrapped,
  } = props;

  const isTotalCallUserDepositsEmpty: boolean = useMemo(() => {
    let _isEmpty: boolean = true;
    totalUserDeposits.map((deposit) =>
      deposit.amount > 0 && deposit.callLeverage > 0 ? (_isEmpty = false) : null
    );
    return _isEmpty;
  }, [totalUserDeposits]);

  const isTotalPutUserDepositsEmpty: boolean = useMemo(() => {
    let _isEmpty: boolean = true;
    totalUserDeposits.map((deposit) =>
      deposit.amount > 0 && deposit.putLeverage > 0 ? (_isEmpty = false) : null
    );
    return _isEmpty;
  }, [totalUserDeposits]);

  const isWithdrawalEnabled: boolean = useMemo(() => {
    return (
      new Date() > epochEndTime &&
      epochTime != 0 &&
      (!isTotalCallUserDepositsEmpty || !isTotalPutUserDepositsEmpty) &&
      isBootstrapped
    );
  }, [
    epochEndTime,
    isTotalCallUserDepositsEmpty,
    isTotalPutUserDepositsEmpty,
    epochTime,
    isBootstrapped,
  ]);

  return (
    <TableRow className="text-white mb-2 rounded-lg mt-2">
      <TableCell align="left" className="mx-0 pt-2">
        <Box className="pt-2">
          <Box className={`rounded-md flex mb-4 p-3 pt-2 pb-2 bg-umbra w-fit`}>
            <Typography variant="h6">
              {formatAmount(strikePrice, 5)}%
            </Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell align="left" className="pt-2">
        {totalUserDeposits.map((deposits, i) =>
          deposits.amount > 0 && deposits.callLeverage > 0 ? (
            <Box className={'flex mb-0.5'} key={i}>
              <Typography variant="h6">
                {'$'}
                {formatAmount(
                  getUserReadableAmount(
                    deposits.amount * deposits.callLeverage,
                    18
                  ),
                  2
                )}
              </Typography>
              <Typography variant="h6" className={'ml-2'}>
                ({formatAmount(deposits.callLeverage, 2)}
                x)
              </Typography>
            </Box>
          ) : null
        )}
        {isTotalCallUserDepositsEmpty ? (
          <Typography variant="h6">{'$0'}</Typography>
        ) : null}
      </TableCell>

      <TableCell align="left" className="pt-2">
        {totalUserDeposits.map((deposits, i) =>
          deposits.amount > 0 && deposits.putLeverage > 0 ? (
            <Box className={'flex mb-0.5'} key={i}>
              <Typography variant="h6">
                {'$'}
                {formatAmount(
                  getUserReadableAmount(
                    deposits.amount * deposits.putLeverage,
                    18
                  ),
                  2
                )}
              </Typography>
              {deposits.amount > 0 ? (
                <Typography variant="h6" className={'ml-2'}>
                  ({formatAmount(deposits.putLeverage, 2)}
                  x)
                </Typography>
              ) : null}{' '}
            </Box>
          ) : null
        )}
        {isTotalPutUserDepositsEmpty ? (
          <Typography variant="h6">{'$0'}</Typography>
        ) : null}
      </TableCell>

      <TableCell align="left" className="px-6 pt-2">
        <Typography variant="h6">
          ${formatAmount(totalUserPremiums, 2)}
        </Typography>
      </TableCell>
      <TableCell align="left" className="px-6 pt-2">
        <Typography variant="h6" className="text-[#6DFFB9]">
          {formatAmount(
            epochTime > 0 && totalPremiums > 0
              ? 100 *
                  (YEAR_SECONDS / epochTime) *
                  (totalPremiums / totalDeposits)
              : 0,
            2
          )}
          {'%'}
        </Typography>
      </TableCell>

      <TableCell align="left" className="px-6 pt-2">
        <Button
          onClick={handleWithdraw}
          className={cx(
            'rounded-md h-10 ml-1 hover:bg-opacity-70 pl-2 pr-2',
            !isWithdrawalEnabled
              ? 'bg-umbra hover:bg-cod-gray'
              : 'bg-primary hover:bg-primary text-white'
          )}
          disabled={!isWithdrawalEnabled}
        >
          {isWithdrawalEnabled || !isBootstrapped ? (
            'Withdraw'
          ) : (
            <Countdown
              date={epochEndTime}
              renderer={({ days, hours, minutes }) => {
                return (
                  <Box className={'flex'}>
                    <img
                      src="/assets/timer.svg"
                      className="h-[1rem] mt-1 mr-2 ml-1"
                      alt="Timer"
                    />
                    <Typography
                      variant="h5"
                      className="ml-auto text-stieglitz mr-1"
                    >
                      {days}d {hours}h {minutes}m
                    </Typography>
                  </Box>
                );
              }}
            />
          )}
        </Button>
      </TableCell>
    </TableRow>
  );
};

const ROWS_PER_PAGE = 5;

const Deposits = () => {
  const {
    accountAddress,
    ensName,
    updateAssetBalances,
    selectedEpoch,
    rateVaultUserData,
    isLoading,
    rateVaultEpochData,
    rateVaultContract,
    updateRateVaultEpochData,
    updateRateVaultUserData,
  } = useBoundStore();

  const sendTx = useSendTx();

  const epochTime: number = useMemo(() => {
    return rateVaultEpochData!.epochStartTimes &&
      rateVaultEpochData!.epochEndTimes
      ? (rateVaultEpochData!.epochStartTimes as BigNumber)
          .sub(rateVaultEpochData!.epochEndTimes as BigNumber)
          .toNumber()
      : 0;
  }, [rateVaultEpochData]);

  const epochEndTime: Date = useMemo(() => {
    return new Date(rateVaultEpochData!.epochEndTimes.toNumber() * 1000);
  }, [rateVaultEpochData]);

  const [page, setPage] = useState(0);
  const handleChangePage = useCallback(
    (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      setPage(newPage);
    },
    [setPage]
  );

  const price: number = 1;

  const getStrikeIndex = useCallback(
    (strike: BigNumber) => {
      for (let i in rateVaultEpochData!.epochStrikes) {
        const epochStrike = rateVaultEpochData!.epochStrikes[i];
        if (epochStrike && strike.eq(epochStrike)) return parseInt(i);
      }
      return -1;
    },
    [rateVaultEpochData]
  );

  const deposits = useMemo(() => {
    const _deposits: { [key: string]: any } = {};

    rateVaultUserData?.userEpochStrikeDeposits.map((row) => {
      const strikePrice = getUserReadableAmount(row['strike'], 8);

      const totalUserDeposits = row['amount'];

      const strikeIndex = getStrikeIndex(row['strike']);

      const totalDeposits = rateVaultEpochData!.totalTokenDeposits;

      const callPremium =
        rateVaultEpochData!.callsPremiumCosts[strikeIndex] ||
        BigNumber.from('0');
      const putPremium =
        rateVaultEpochData!.putsPremiumCosts[strikeIndex] ||
        BigNumber.from('0');

      const totalPremiums = callPremium.add(putPremium);

      let totalUserPremiums = BigNumber.from('0');

      if (totalDeposits && totalPremiums && totalUserDeposits)
        totalUserPremiums = totalDeposits.gt(0)
          ? totalPremiums.mul(totalUserDeposits).div(totalDeposits)
          : BigNumber.from('0');

      if (!(strikeIndex in _deposits)) {
        _deposits[strikeIndex] = {
          strikePrice: strikePrice,
          totalUserPremiums: totalUserPremiums?.toNumber(),
          totalUserDeposits: [
            {
              callLeverage: row['callLeverage'],
              putLeverage: row['putLeverage'],
              amount: row['amount'],
            },
          ],
        };
      } else {
        _deposits[strikeIndex]['totalUserDeposits'].push({
          callLeverage: row['callLeverage'],
          putLeverage: row['putLeverage'],
          amount: row['amount'],
        });
      }
    });

    return _deposits;
  }, [
    getStrikeIndex,
    rateVaultEpochData,
    rateVaultUserData?.userEpochStrikeDeposits,
  ]);

  const withdrawData = useMemo(() => {
    const strikesIndexes: number[] = [];
    const callLeveragesIndexes: number[] = [];
    const putLeveragesIndexes: number[] = [];

    rateVaultUserData?.userEpochStrikeDeposits?.map((deposits) => {
      if (deposits.amount?.gt(0)) {
        strikesIndexes.push(deposits.strikeIndex);
        callLeveragesIndexes.push(deposits.callLeverageIndex);
        putLeveragesIndexes.push(deposits.putLeverageIndex);
      }
    });

    return {
      strikesIndexes: strikesIndexes,
      callLeveragesIndexes: callLeveragesIndexes,
      putLeveragesIndexes: putLeveragesIndexes,
    };
  }, [rateVaultUserData]);

  const handleWithdraw = useCallback(async () => {
    if (!rateVaultContract) return;
    await sendTx(rateVaultContract, 'withdrawMultiple', [
      selectedEpoch,
      withdrawData.strikesIndexes,
      withdrawData.callLeveragesIndexes,
      withdrawData.putLeveragesIndexes,
      accountAddress ?? '',
      { gasLimit: 3000000 },
    ]);

    updateAssetBalances();
    updateRateVaultEpochData();
    updateRateVaultUserData();
  }, [
    rateVaultContract,
    selectedEpoch,
    withdrawData.strikesIndexes,
    withdrawData.callLeveragesIndexes,
    withdrawData.putLeveragesIndexes,
    accountAddress,
    updateAssetBalances,
    updateRateVaultEpochData,
    updateRateVaultUserData,
    sendTx,
  ]);

  return rateVaultEpochData!.epochStrikes ? (
    <Box>
      <Typography variant="h4" className="text-white mb-7">
        Deposits
      </Typography>
      <Box className={'bg-cod-gray w-full p-4 pt-5 pb-4.5 pb-0 rounded-xl'}>
        <Box className={'flex pb-[3px] border-b border-[#1E1E1E]'}>
          <Box className="flex items-center justify-between mb-4">
            <Typography variant="h5" className="bg-umbra rounded-md py-1 px-2">
              {displayAddress(accountAddress, ensName)}
            </Typography>
          </Box>
        </Box>

        <Box className="balances-table text-white min-h-[12rem]">
          <TableContainer className={cx(styles['optionsTable'], 'bg-cod-gray')}>
            {isLoading ? (
              <Box className="border-4 border-umbra rounded-lg p-3 mb-2">
                {range(3).map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="text"
                    animation="wave"
                    height={60}
                    className="bg-umbra"
                  />
                ))}
              </Box>
            ) : (
              <Table>
                <TableHead className="bg-umbra">
                  <TableRow className="bg-umbra">
                    {[
                      'Strike',
                      'Call deposit',
                      'Put deposit',
                      'Premium',
                      'APY',
                      'Withdraw',
                    ].map((cellName) => (
                      <TableCell
                        align="left"
                        className="text-stieglitz bg-cod-gray border-0 pb-0"
                        key={cellName}
                      >
                        <Typography variant="h6">{cellName}</Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody className={cx('rounded-lg')}>
                  {Object.keys(deposits).map((strikeIndex) => {
                    return (
                      <DepositsTableData
                        handleWithdraw={handleWithdraw}
                        totalDeposits={deposits[strikeIndex].totalDeposits}
                        totalPremiums={deposits[strikeIndex].totalPremiums}
                        totalUserPremiums={
                          deposits[strikeIndex].totalUserPremiums
                        }
                        totalUserDeposits={
                          deposits[strikeIndex].totalUserDeposits
                        }
                        strikePrice={deposits[strikeIndex].strikePrice}
                        key={strikeIndex}
                        epochTime={epochTime}
                        strikeIndex={Number(strikeIndex)}
                        price={price}
                        epochEndTime={epochEndTime}
                        imgSrc={'2crv.svg'}
                        tokenSymbol={'2CRV'}
                        isBootstrapped={rateVaultEpochData!.isBootstrapped}
                      />
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </TableContainer>
          {(rateVaultEpochData?.epochStrikes.length ?? 0) > ROWS_PER_PAGE ? (
            <TablePagination
              component="div"
              id="stats"
              rowsPerPageOptions={[ROWS_PER_PAGE]}
              count={rateVaultEpochData?.epochStrikes.length ?? 0}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={ROWS_PER_PAGE}
              className="text-stieglitz border-0 flex flex-grow justify-center"
              ActionsComponent={TablePaginationActions}
            />
          ) : null}
        </Box>
      </Box>
    </Box>
  ) : null;
};

export default Deposits;
