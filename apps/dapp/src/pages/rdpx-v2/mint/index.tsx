import Head from 'next/head';

import { useEffect } from 'react';

import Box from '@mui/material/Box';
import { useBoundStore } from 'store';

import AppBar from 'components/common/AppBar';
import RdpxV2Main from 'components/rdpx-v2';

const Mint = () => {
  const {
    provider,
    setIsLoading,
    updateTreasuryContractState,
    updateTreasuryData,
    updateUserDscBondsData,
  } = useBoundStore();

  useEffect(() => {
    setIsLoading(true);
    updateTreasuryContractState().then(() =>
      updateTreasuryData().then(() =>
        updateUserDscBondsData().then(() => setIsLoading(false))
      )
    );
  }, [
    provider,
    updateTreasuryContractState,
    updateTreasuryData,
    updateUserDscBondsData,
    setIsLoading,
  ]);

  return (
    <Box className="bg-contain min-h-screen">
      <Head>
        <title>Mint | Dopex</title>
      </Head>
      <AppBar active="Mint" />
      <Box className="pt-1 pb-32 lg:max-w-7xl md:max-w-3xl sm:max-w-xl max-w-md mx-auto px-4 lg:px-0 min-h-screen">
        <RdpxV2Main />
      </Box>
    </Box>
  );
};

export default Mint;
