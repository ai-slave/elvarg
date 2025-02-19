import { useState, useEffect } from 'react';
import Head from 'next/head';
import Box from '@mui/material/Box';

import { CHAINS } from 'constants/chains';

import AppBar from 'components/common/AppBar';
import PageLoader from 'components/common/PageLoader';
import Typography from 'components/UI/Typography';
import Description from 'components/ir/Description';
import ManageCard from 'components/ir/ManageCard';
import MobileMenu from 'components/ir/MobileMenu';
import Sidebar from 'components/ir/Sidebar';
import SelectStrikeWidget from 'components/ir/SelectStrikeWidget';
import Deposits from 'components/ir/Deposits';
import Positions from 'components/ir/Positions';
import PurchaseCard from 'components/ir/PurchaseCard';
import PurchaseOptions from 'components/ir/PurchaseOptions';
import Stats from 'components/ir/Stats';
import WithdrawalInfo from 'components/ir/WithdrawalInfo';
import AutoExerciseInfo from 'components/ir/AutoExerciseInfo';

import { useBoundStore } from 'store';

interface Props {
  poolName: string;
}

const Manage = ({ poolName }: Props) => {
  const {
    accountAddress,
    connect,
    chainId,
    setSelectedPoolName,
    rateVaultData,
    updateRateVaultContract,
    updateRateVault,
    rateVaultEpochData,
    updateRateVaultEpochData,
  } = useBoundStore();

  const [activeVaultContextSide, setActiveVaultContextSide] =
    useState<string>('CALL');
  const [activeView, setActiveView] = useState<string>('vault');
  const [strikeIndex, setStrikeIndex] = useState<number>(0);
  const showWithdrawalInformation: boolean = true;

  useEffect(() => {
    if (poolName && setSelectedPoolName) setSelectedPoolName(poolName);
  }, [poolName, setSelectedPoolName]);

  useEffect(() => {
    if (!accountAddress) {
      connect();
    }
    updateRateVaultContract();
    updateRateVaultEpochData();
    updateRateVault();
  }, [
    accountAddress,
    connect,
    updateRateVaultContract,
    updateRateVault,
    updateRateVaultEpochData,
  ]);

  if (!rateVaultEpochData?.epochStartTimes)
    return (
      <Box className="overflow-x-hidden bg-black h-screen">
        <PageLoader />
      </Box>
    );

  return (
    <Box className="overflow-x-hidden bg-black h-screen">
      <Head>
        <title>Rate Vault | Dopex</title>
      </Head>
      <AppBar active="Rate Vaults" />

      <Box className="py-12 lg:max-w-full md:max-w-3xl sm:max-w-xl max-w-md mx-auto px-4 lg:px-0 lg:grid lg:grid-cols-12">
        <Box className="ml-10 mt-20 hidden lg:block lg:col-span-3">
          <Sidebar activeView={activeView} setActiveView={setActiveView} />
        </Box>

        <Box
          gridColumn="span 6"
          className="mt-10 lg:mt-20 lg:mb-20 lg:pl-5 lg:pr-5"
        >
          <Box className="flex md:flex-row flex-col mb-4 md:justify-between items-center md:items-start">
            <Description poolName={String(poolName)} />
          </Box>

          <Box className="lg:hidden">
            <MobileMenu
              asset={String(poolName)}
              activeView={activeView}
              setActiveView={setActiveView}
            />
          </Box>

          <Box className="mb-10">
            <Stats />
          </Box>

          {activeView === 'vault' ? (
            <Box>
              <Deposits />

              {showWithdrawalInformation ? (
                <Box className={'mt-12'}>
                  <WithdrawalInfo />
                </Box>
              ) : null}
            </Box>
          ) : (
            <Box>
              <PurchaseOptions
                setActiveVaultContextSide={setActiveVaultContextSide}
                setStrikeIndex={setStrikeIndex}
              />

              <Box className={'mt-12'}>
                <Positions />
              </Box>

              <Box className={'mt-12'}>
                <AutoExerciseInfo />
              </Box>
            </Box>
          )}
        </Box>

        <Box className="mt-6 lg:mt-20 flex lg:col-span-3">
          <Box className={'lg:absolute lg:right-[2.5rem] w-full lg:w-auto'}>
            {activeView === 'vault' ? (
              <ManageCard
                activeVaultContextSide={activeVaultContextSide}
                setActiveVaultContextSide={setActiveVaultContextSide}
              />
            ) : activeView === 'positions' ? (
              strikeIndex !== null ? (
                <PurchaseCard
                  activeVaultContextSide={activeVaultContextSide}
                  strikeIndex={strikeIndex}
                  setStrikeIndex={setStrikeIndex}
                  poolName={poolName}
                />
              ) : (
                <SelectStrikeWidget />
              )
            ) : null}
          </Box>
        </Box>
      </Box>
      <Box className="flex justify-center space-x-2 my-8">
        <Typography variant="h5" className="text-silver">
          Contract Address:
        </Typography>
        <Typography
          variant="h5"
          className="bg-gradient-to-r from-wave-blue to-primary text-transparent bg-clip-text"
        >
          <a
            href={`${CHAINS[chainId]?.explorer}/address/${rateVaultData?.rateVaultContract.address}`}
            rel="noopener noreferrer"
            target={'_blank'}
          >
            {rateVaultData?.rateVaultContract.address}
          </a>
        </Typography>
      </Box>
    </Box>
  );
};

export async function getServerSideProps(context: {
  query: { poolName: string };
}) {
  return {
    props: {
      poolName: context.query.poolName,
    },
  };
}

const ManagePage = ({ poolName }: Props) => {
  return <Manage poolName={poolName} />;
};

export default ManagePage;
