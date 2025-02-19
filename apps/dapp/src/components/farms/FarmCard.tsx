import { ReactNode, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import LaunchIcon from '@mui/icons-material/Launch';
import { BigNumber, utils } from 'ethers';
import BN from 'bignumber.js';

import Typography from 'components/UI/Typography';
import CustomButton from 'components/UI/Button';
import Skeleton from 'components/UI/Skeleton';
import NumberDisplay from 'components/UI/NumberDisplay';
import Stat from './Stat';
import Chip from './Chip';
import LpRatios from './LpRatios';

import { useBoundStore } from 'store/index';

import formatAmount from 'utils/general/formatAmount';
import getExplorerUrl from 'utils/general/getExplorerUrl';

import { FarmStatus, LpData } from 'types/farms';

import SushiMigrationStepper from './SushiMigrationStepper';

const Header = ({
  stakingTokenSymbol,
  type,
  onManage,
  onMigrate,
  status,
  userStakingRewardsBalance,
}: {
  stakingTokenSymbol: string;
  type: 'SINGLE' | 'LP';
  status: FarmStatus;
  onManage: any;
  onMigrate: any;
  userStakingRewardsBalance: BigNumber;
}) => {
  return (
    <Box className="flex justify-between">
      <Box className="flex space-x-3 items-center">
        <img
          src={`/images/tokens/${stakingTokenSymbol.toLowerCase()}.svg`}
          alt={stakingTokenSymbol}
          className="w-8 h-8 block"
        />
        <Box>
          <Typography variant="h5">{stakingTokenSymbol}</Typography>
          <Typography variant="caption" color="stieglitz">
            {type === 'SINGLE' ? 'Single Side Farm' : 'LP Farm'}
            <span className="text-down-bad">
              {' '}
              {status !== 'ACTIVE' ? `(${status})` : null}
            </span>
          </Typography>
        </Box>
      </Box>
      {type === 'LP' && userStakingRewardsBalance.gt(0) ? (
        <CustomButton size="small" onClick={onMigrate}>
          Migrate
        </CustomButton>
      ) : null}
      <CustomButton size="small" onClick={onManage}>
        Manage
      </CustomButton>
    </Box>
  );
};

const UserStat = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <Box className="w-full mb-3">
      <Typography variant="caption" color="stieglitz" className="mb-3">
        {title}
      </Typography>
      <Box className="bg-carbon p-2 w-full rounded-md flex justify-between items-center mb-1">
        <Box className="flex items-center space-x-1">{children}</Box>
      </Box>
    </Box>
  );
};

interface Props {
  setDialog: Function;
  userStakingRewardsBalance: BigNumber;
  userStakingTokenBalance: BigNumber;
  farmTotalSupply: BigNumber;
  lpData: LpData;
  TVL: number;
  APR: number;
  stakingTokenSymbol: string;
  stakingRewardsAddress: string;
  stakingTokenAddress: string;
  farmsDataLoading: boolean;
  userDataLoading: boolean;
  status: FarmStatus;
  type: 'SINGLE' | 'LP';
  version: number;
}

const FarmCard = (props: Props) => {
  const {
    farmsDataLoading,
    userDataLoading,
    TVL,
    // APR,
    stakingTokenSymbol,
    userStakingRewardsBalance,
    stakingRewardsAddress,
    stakingTokenAddress,
    userStakingTokenBalance,
    type,
    status,
    setDialog,
    lpData,
    farmTotalSupply,
    version,
  } = props;

  const [sushiMigrationOpen, setSushiMigrationOpen] = useState(false);

  const { accountAddress, chainId, signer } = useBoundStore();

  const onManage = () => {
    setDialog({
      data: {
        status,
        stakingTokenSymbol,
        stakingTokenAddress,
        stakingRewardsAddress,
        userStakingTokenBalance,
        userStakingRewardsBalance,
        version,
      },
      open: true,
    });
  };

  const onMigrate = async () => {
    if (!signer) return;
    setSushiMigrationOpen(true);
  };

  const stakingTokenPrice = useMemo(() => {
    if (!lpData) return 0;
    if (stakingTokenSymbol === 'DPX') return lpData.dpxPrice;
    else if (stakingTokenSymbol === 'RDPX') return lpData.rdpxPrice;
    else if (stakingTokenSymbol === 'DPX-WETH')
      return lpData.dpxWethLpTokenRatios.lpPrice;
    else if (stakingTokenSymbol === 'RDPX-WETH')
      return lpData.rdpxWethLpTokenRatios.lpPrice;

    return 0;
  }, [lpData, stakingTokenSymbol]);

  if (userStakingRewardsBalance.isZero() && status !== 'ACTIVE') return <></>;

  return (
    <Box className="bg-cod-gray text-red rounded-2xl p-3 flex flex-col space-y-3 w-[343px]">
      <SushiMigrationStepper
        data={{
          status,
          stakingTokenSymbol,
          stakingTokenAddress,
          stakingRewardsAddress,
          userStakingTokenBalance,
          userStakingRewardsBalance,
          version,
        }}
        open={sushiMigrationOpen}
        handleClose={(_e, reason) => {
          if (reason !== 'backdropClick') setSushiMigrationOpen(false);
        }}
      />
      <Header
        stakingTokenSymbol={stakingTokenSymbol}
        type={type}
        status={status}
        onManage={onManage}
        onMigrate={onMigrate}
        userStakingRewardsBalance={userStakingRewardsBalance}
      />
      <Box className="flex space-x-3">
        {farmsDataLoading ? (
          <>
            <Skeleton variant="rectangular" width={153.5} height={64} />
            <Skeleton variant="rectangular" width={153.5} height={64} />
          </>
        ) : (
          <>
            <Stat name="APR" value="--" />
            <Stat
              name="TVL"
              value={TVL === 0 ? '--' : `$${formatAmount(TVL, 2)}`}
            />
          </>
        )}
      </Box>
      {userDataLoading ? (
        <Skeleton variant="rectangular" width={319} height={180} />
      ) : (
        <Box className="bg-umbra p-3 w-full rounded-md">
          {!accountAddress ? (
            <Box className="h-24 text-stieglitz text-base">
              Please connect your wallet to see your deposits
            </Box>
          ) : (
            <>
              <UserStat title="Deposits">
                <Box className="flex items-center space-x-1">
                  <Typography variant="caption">
                    <NumberDisplay
                      n={userStakingRewardsBalance}
                      decimals={18}
                    />
                  </Typography>
                </Box>
                {type === 'LP' ? (
                  <LpRatios
                    userStakingRewardsBalance={userStakingRewardsBalance}
                    stakingTokenSymbol={stakingTokenSymbol}
                  />
                ) : (
                  <Chip text={stakingTokenSymbol} />
                )}
              </UserStat>
              <Box className="flex space-x-3">
                <UserStat title="Pool Share">
                  <Typography variant="caption">
                    {formatAmount(
                      new BN(userStakingRewardsBalance.toString())
                        .multipliedBy(1e2)
                        .dividedBy(new BN(farmTotalSupply.toString()))
                        .toNumber(),
                      8
                    )}
                    %
                  </Typography>
                </UserStat>
                <UserStat title="USD Value">
                  <Typography variant="caption">
                    $
                    {formatAmount(
                      Number(utils.formatEther(userStakingRewardsBalance)) *
                        stakingTokenPrice,
                      2
                    )}
                  </Typography>
                </UserStat>
              </Box>
            </>
          )}
        </Box>
      )}
      <a
        href={`${getExplorerUrl(chainId)}address/${stakingRewardsAddress}`}
        target="_blank"
        rel="noopener noreferrer"
        className="self-end"
      >
        <Typography variant="caption" color="stieglitz" component="span">
          Contract <LaunchIcon className="w-3" />
        </Typography>
      </a>
    </Box>
  );
};

export default FarmCard;
