import React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useBoundStore } from 'store';

import Typography from 'components/UI/Typography';

import getUserReadableAmount from 'utils/contracts/getUserReadableAmount';
import displayAddress from 'utils/general/displayAddress';
import formatAmount from 'utils/general/formatAmount';
import getExplorerUrl from 'utils/general/getExplorerUrl';
import getExtendedLogoFromChainId from 'utils/general/getExtendedLogoFromChainId';

const Stats = () => {
  const { chainId, optionScalpData } = useBoundStore();

  return (
    <Box className="md:flex grid grid-cols-3 text-gray-400 mt-6 mb-6">
      <Box className="w-full">
        <Box className="border flex justify-between border-neutral-800 p-2">
          <Typography variant="h6" className="text-gray-400">
            Opening fees %
          </Typography>
          <Typography variant="h6" className="text-white">
            {getUserReadableAmount(
              optionScalpData?.feeOpenPosition!,
              8
            ).toString()}
            %
          </Typography>
        </Box>
        <Box className="border border-neutral-800 flex justify-between p-2">
          <Typography variant="h6" className="text-gray-400">
            Total deposits ({optionScalpData?.baseSymbol})
          </Typography>
          <Typography variant="h6" className="text-white ml-auto mr-1">
            {formatAmount(
              getUserReadableAmount(
                optionScalpData?.totalBaseDeposits!,
                optionScalpData?.baseDecimals!.toNumber()
              ),
              0
            )}{' '}
          </Typography>
        </Box>
        <Box className="border border-neutral-800 flex justify-between p-2">
          <Typography variant="h6" className="text-gray-400">
            Total deposits ({optionScalpData?.quoteSymbol})
          </Typography>
          <Typography variant="h6" className="text-white ml-auto mr-1">
            {formatAmount(
              getUserReadableAmount(
                optionScalpData?.totalQuoteDeposits!,
                optionScalpData?.quoteDecimals!.toNumber()
              ),
              0
            )}{' '}
          </Typography>
        </Box>
        <Box className="border border-neutral-800 flex justify-between p-2">
          <Typography variant="h6" className="text-gray-400">
            Total long
          </Typography>
          <Typography variant="h6" className="text-white ml-auto mr-1">
            <span className="text-gray-400">
              {optionScalpData?.quoteSymbol!}
            </span>{' '}
            {formatAmount(
              getUserReadableAmount(
                optionScalpData?.longOpenInterest!,
                optionScalpData?.quoteDecimals!.toNumber()
              ),
              0
            )}{' '}
          </Typography>
        </Box>
        <Box className="border rounded-bl-lg border-neutral-800 flex justify-between p-2">
          <Typography variant="h6" className="text-gray-400">
            Total short
          </Typography>
          <Typography variant="h6" className="text-white ml-auto mr-1">
            <span className="text-gray-400">
              {optionScalpData?.quoteSymbol!}
            </span>{' '}
            {formatAmount(
              getUserReadableAmount(
                optionScalpData?.shortOpenInterest!,
                optionScalpData?.quoteDecimals!.toNumber()
              ),
              0
            )}{' '}
          </Typography>
        </Box>
      </Box>
      <Box className="w-full">
        <Box className="border border-neutral-800 p-2 pb-[0.6rem]">
          <Typography variant="h6" className="mb-1 text-gray-400">
            Contract
          </Typography>
          <Button
            size="medium"
            color="secondary"
            className="text-white text-md h-8 p-2 hover:text-gray-200 hover:bg-slate-800 bg-slate-700"
          >
            <img
              className="w-auto h-6 mr-2"
              src={getExtendedLogoFromChainId(chainId)}
              alt={'Arbitrum'}
            />
            <a
              className={'cursor-pointer'}
              href={`${getExplorerUrl(chainId)}/address/${
                optionScalpData?.optionScalpContract?.address
              }`}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Typography variant="h5" className="text-white text-[11px]">
                {displayAddress(
                  optionScalpData?.optionScalpContract?.address,
                  undefined
                )}
              </Typography>
            </a>
          </Button>
        </Box>
        <Box className="border border-neutral-800 flex justify-between p-2">
          <Typography
            variant="h6"
            className="flex justify-center items-center text-gray-400"
          >
            Min. Margin
          </Typography>
          <Typography variant="h6" className="text-white">
            <span className="text-gray-400">
              {optionScalpData?.quoteSymbol!}
            </span>{' '}
            {getUserReadableAmount(
              optionScalpData?.minimumMargin!,
              optionScalpData?.quoteDecimals!.toNumber()
            )}
          </Typography>
        </Box>
        <Box className="border border-neutral-800 flex justify-between p-2">
          <Typography
            variant="h6"
            className="flex justify-center items-center text-gray-400"
          >
            Max. Size
          </Typography>
          <Typography variant="h6" className="text-white">
            <span className="text-gray-400">
              {optionScalpData?.quoteSymbol!}
            </span>{' '}
            {formatAmount(
              getUserReadableAmount(
                optionScalpData?.maxSize!,
                optionScalpData?.quoteDecimals!.toNumber()
              )
            )}
          </Typography>
        </Box>
      </Box>
      <Box className="w-full">
        <Box className="border border-neutral-800 rounded-tr-lg p-2 pb-[0.6rem]">
          <Typography variant="h6" className="mb-1 text-gray-400">
            Strategy
          </Typography>
          <Button
            size="medium"
            color="secondary"
            className="text-white text-md h-8 p-3 hover:text-gray-200 hover:bg-mineshaft bg-neutral-800"
          >
            Option Scalps
          </Button>
        </Box>
        <Box className="border border-neutral-800 flex justify-between p-2">
          <Typography variant="h6" className="text-gray-400">
            Max. OI
          </Typography>
          <Typography variant="h6" className="text-white">
            <span className="text-gray-400">
              {optionScalpData?.quoteSymbol!}
            </span>{' '}
            {formatAmount(
              getUserReadableAmount(
                optionScalpData?.maxOpenInterest!,
                optionScalpData?.quoteDecimals!.toNumber()
              )
            )}
          </Typography>
        </Box>
        <Box className="border border-neutral-800 flex justify-between p-2">
          <Typography variant="h6" className="text-gray-400">
            Open Interest
          </Typography>
          <Typography variant="h6" color="white">
            <span className="text-gray-400">
              {optionScalpData?.quoteSymbol!}
            </span>{' '}
            {formatAmount(
              getUserReadableAmount(
                optionScalpData?.longOpenInterest!,
                optionScalpData?.quoteDecimals!.toNumber()
              ) +
                getUserReadableAmount(
                  optionScalpData?.shortOpenInterest!,
                  optionScalpData?.quoteDecimals!.toNumber()
                ),
              0
            )}{' '}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Stats;
