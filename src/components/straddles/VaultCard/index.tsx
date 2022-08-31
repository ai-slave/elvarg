import { useMemo } from 'react';
import cx from 'classnames';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Link from 'next/link';
import { styled } from '@mui/material/styles';
import format from 'date-fns/format';

import CustomButton from 'components/UI/Button';
import Typography from 'components/UI/Typography';
import InfoBox from 'components/ir/InfoBox';

import Coin from 'svgs/icons/Coin';

import formatAmount from 'utils/general/formatAmount';
import getUserReadableAmount from 'utils/contracts/getUserReadableAmount';

interface Props {
  className?: string;
  data: {
    currentEpoch: number;
    totalDeposits: string;
    tvl: number;
    underlyingSymbol: string;
    retired: boolean;
    symbol: string;
    epochTimes: {
      startTime: string;
      expiry: string;
    };
  };
}

const StyledWrapper = styled(Box)`
  ${(props: { symbol: string }) => {
    if (props.symbol === 'ETH-ATLANTIC-STRADDLE-3')
      return 'background: linear-gradient(359.05deg, #3e3e3e 0.72%, #7818c4 100%)';
    else if (props.symbol === 'RDPX-ATLANTIC-STRADDLE-3')
      return 'background: linear-gradient(359.05deg, #3e3e3e 0.72%, #0400ff 99.1%)';
    return '';
  }};
`;

function VaultCard(props: Props) {
  const { className, data } = props;
  const {
    currentEpoch,
    tvl,
    underlyingSymbol: name,
    retired,
    symbol,
    epochTimes,
  } = data;
  const info = useMemo(() => {
    return [
      {
        heading: 'Total Value Locked ($)',
        value:
          tvl === 0
            ? '...'
            : formatAmount(getUserReadableAmount(tvl, 8), 0, true),
        Icon: Coin,
      },
    ];
  }, [tvl]);

  return (
    <StyledWrapper symbol={symbol} className="p-[1px] rounded-xl w-[350px]">
      <Box
        className={cx(
          'flex flex-col bg-cod-gray p-4 rounded-xl h-full mx-auto',
          className
        )}
      >
        <Box>
          <Box className="flex flex-row mb-4">
            <Box className="mr-4 h-8 max-w-14 flex flex-row">
              <img
                className="w-9 h-9"
                alt={name}
                src={`/images/tokens/${name.toLowerCase()}.svg`}
              />
            </Box>
            <Box className="flex flex-grow items-center justify-between">
              <Typography variant="h4" className="mr-2 font-bold">
                {symbol.split('-')[0]}
                {retired ? (
                  <span className="bg-red-500 p-1 text-sm rounded-sm ml-4">
                    RETIRED
                  </span>
                ) : null}
              </Typography>
            </Box>
          </Box>
          <Box className="grid grid-cols-1 gap-2 mb-2">
            {info.map((item) => {
              return <InfoBox key={item.heading} {...item} />;
            })}
          </Box>
          <Link href={`/vaults/straddles/pool/${name}`} passHref>
            <CustomButton size="medium" className="my-4" fullWidth>
              Manage
            </CustomButton>
          </Link>
          <Box className="flex justify-between">
            <Typography variant="h6" className="text-stieglitz">
              Epoch {currentEpoch}
            </Typography>
            {!retired ? (
              <Tooltip
                className="text-stieglitz"
                arrow={true}
                title="Epoch Start & Expiry Times"
              >
                <Box>
                  <Typography variant="h6" color="stieglitz">
                    {format(Number(epochTimes.startTime) * 1000, 'd LLL')} -{' '}
                    {format(Number(epochTimes.expiry) * 1000, 'd LLL')}
                  </Typography>
                </Box>
              </Tooltip>
            ) : null}
          </Box>
        </Box>
      </Box>
    </StyledWrapper>
  );
}

export default VaultCard;
