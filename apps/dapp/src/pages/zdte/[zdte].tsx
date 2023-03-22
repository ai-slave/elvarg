import Head from 'next/head';
import Box from '@mui/material/Box';
import AppBar from 'components/common/AppBar';
import { OpenPositions, OptionsTable } from 'components/zdte';
import ManageCard from 'components/zdte/DepositWithdrawBox';
import ZdteTvChart from 'components/zdte/TvChart';
import Stats from 'components/zdte/Stats';
import { useBoundStore } from 'store';
import { Suspense, useEffect } from 'react';
import { Alert, AlertTitle, CircularProgress } from '@mui/material';
import React from 'react';
import ErrorBoundary from 'components/error/ErrorBoundary';

interface Props {
  zdte: string;
}
const Loading = () => {
  return (
    <Box className="flex justify-center items-center h-screen">
      <CircularProgress className="mb-[30rem]" size="40px" color="primary" />
    </Box>
  );
};

const Zdte = ({ zdte }: Props) => {
  const {
    setSelectedPoolName,
    selectedPoolName,
    updateZdteData,
    updateUserZdteLpData,
    updateUserZdtePurchaseData,
    chainId,
    getZdteContract,
    accountAddress,
  } = useBoundStore();

  useEffect(() => {
    if (zdte && setSelectedPoolName) setSelectedPoolName(zdte);
  }, [zdte, setSelectedPoolName]);

  useEffect(() => {
    updateZdteData().then(() => {
      updateUserZdteLpData().then(() => {
        updateUserZdtePurchaseData();
      });
    });
  }, [
    updateZdteData,
    updateUserZdteLpData,
    updateUserZdtePurchaseData,
    chainId,
    selectedPoolName,
    accountAddress,
    getZdteContract,
  ]);

  return (
    <Box className="bg-black min-h-screen">
      <Head>
        <title>ZDTE | Dopex</title>
      </Head>
      <AppBar active="OLPs" />
      <Box className="md:flex py-5 flex-row justify-around">
        <Box className="m-auto lg:w-[60%] space-y-8">
          <Box className="lg:pt-28 sm:pt-20 pt-20 lg:max-w-4xl md:max-w-3xl sm:max-w-2xl max-w-md mx-auto px-4 lg:px-0 space-y-6">
            <Stats />
          </Box>
          <Box className="lg:max-w-4xl md:max-w-3xl sm:max-w-2xl max-w-md mx-auto px-4 lg:px-0 space-y-6">
            {/* <ZdteTvChart /> */}
          </Box>
          <Box className="mb-5 lg:max-w-4xl md:max-w-3xl md:m-0 sm:max-w-3xl max-w-md lg:mx-auto px-2 lg:px-0 flex-auto mx-auto">
            <OptionsTable />
          </Box>
          <Box className="mb-5 lg:max-w-4xl md:max-w-3xl md:m-0 sm:max-w-3xl max-w-md lg:mx-auto px-2 lg:px-0 flex-auto mx-auto">
            <OpenPositions />
          </Box>
        </Box>
        <Box className="flex justify-around mb-8 px-3 mt-8 md:justify-start md:flex-col md:mt-24 md:mx-0 lg:mr-auto lg:px-0 lg:ml-5">
          <ManageCard />
        </Box>
      </Box>
    </Box>
  );
};

export async function getServerSideProps(context: { query: { zdte: string } }) {
  return {
    props: {
      zdte: context.query.zdte,
    },
  };
}

const ManagePage = ({ zdte }: Props) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Zdte zdte={zdte} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default ManagePage;
