import { FC } from 'react';
import { DECIMALS_USD, DECIMALS_TOKEN } from 'constants/index';
import { getUserReadableAmount } from 'utils/contracts';
import { formatAmount } from 'utils/general';
import { Box } from '@mui/material';

interface StatsProps {}

const Stats: FC<StatsProps> = ({}) => {
  const tokenSymbol = 'ETH';
  return (
    <>
      <Box className="flex items-center text-sm">
        <span className="lg:ml-2 bg-primary rounded-lg p-2 font-bold h-[fit-content]">
          BETA
        </span>
        <Box sx={{ p: 1 }} className="flex -space-x-4">
          <img
            className="w-9 h-9 z-10 border border-gray-500 rounded-full"
            src={`/images/tokens/${tokenSymbol.toLowerCase()}.svg`}
            alt={tokenSymbol}
          />
          <img
            className="w-9 h-9 z-0"
            src="/images/tokens/usdc.svg"
            alt="USDC"
          />
        </Box>
        <Box className="ml-2 flex flex-col">
          <span className="h5 capitalize">zero day to expiry options</span>
          <span className="text-gray-500">{`${tokenSymbol}/USDC`}</span>
        </Box>
        <span className="md:ml-4 text-xl ml-auto">$123</span>
      </Box>
      <div className="grid grid-rows-4 grid-flow-col border border-neutral-800 md:grid-rows-2 rounded-xl text-sm">
        <div className="border border-neutral-800 md:rounded-tr-none rounded-t-xl p-2 flex justify-between">
          <span className="text-stieglitz">
            {`Available Call Liquidity (${tokenSymbol})`}
          </span>
          <span>
            {formatAmount(getUserReadableAmount(0, DECIMALS_TOKEN), 2)}{' '}
            {tokenSymbol}
          </span>
        </div>
        <div className="border border-neutral-800 md:rounded-bl-xl rounded-none p-2 flex justify-between">
          <span className="text-stieglitz">
            {`Total Call Liquidity (${tokenSymbol})`}
          </span>
          <span>
            {formatAmount(getUserReadableAmount(0, DECIMALS_TOKEN), 2)}{' '}
            {tokenSymbol}
          </span>
        </div>
        <div className="border border-neutral-800 md:rounded-tr-xl rounded-none p-2 flex justify-between">
          <span className="text-stieglitz">
            {`Available Put Liquidity (USDC)`}
          </span>
          <span>
            ${formatAmount(getUserReadableAmount(0, DECIMALS_USD), 2)}
          </span>
        </div>
        <div className="border border-neutral-800 md:rounded-bl-none rounded-b-xl p-2 flex justify-between">
          <span className="text-stieglitz">{`Total Put Liquidity (USDC)`}</span>
          <span>
            ${formatAmount(getUserReadableAmount(0, DECIMALS_USD), 2)}
          </span>
        </div>
      </div>
    </>
  );
};

export default Stats;
