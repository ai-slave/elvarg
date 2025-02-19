import { useEffect } from 'react';
import Head from 'next/head';
import Box from '@mui/material/Box';

import AppBar from 'components/common/AppBar';
import Overview from 'components/vedpx/Overview';
import UserVeDPX from 'components/vedpx/UserVeDPX';
import VeDPXYield from 'components/vedpx/VeDPXYield';

import { useBoundStore } from 'store';

const VeDPX = () => {
  const { signer, provider, updateVedpxData, updateUserVedpxData } =
    useBoundStore();

  useEffect(() => {
    updateVedpxData();
  }, [updateVedpxData]);

  useEffect(() => {
    updateUserVedpxData();
  }, [updateUserVedpxData, , signer, provider]);

  return (
    <Box className="bg-black min-h-screen">
      <Head>
        <title>veDPX | Dopex</title>
      </Head>
      <AppBar active="Governance" />
      <Box className="py-32 lg:max-w-5xl md:max-w-3xl sm:max-w-xl max-w-md mx-auto px-4 lg:px-0">
        <Overview />
        <Box className="flex flex-col space-x-0 lg:space-x-4 lg:flex-row">
          <UserVeDPX />
          <VeDPXYield />
        </Box>
      </Box>
    </Box>
  );
};

export default VeDPX;
