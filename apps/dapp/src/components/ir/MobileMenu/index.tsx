import { useCallback, useMemo } from 'react';
import Countdown from 'react-countdown';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import styled from '@emotion/styled';

import Typography from 'components/UI/Typography';
import CircleIcon from 'svgs/icons/CircleIcon';

import { useBoundStore } from 'store';

import getFormattedDate from 'utils/date/getFormattedDate';

const EpochStatusButton = styled(Button)`
  color: white;
  padding-right: 15px;
  padding-left: 15px;
  cursor: not-allowed;
`;

const EpochStatusBox = styled(Box)`
  background: linear-gradient(318.43deg, #002eff -7.57%, #22e1ff 100%);
  border-radius: 5px;
`;

export interface Props {
  asset: string;
  activeView: string;
  setActiveView: Function;
}

const MobileMenu = ({ activeView, setActiveView }: Props) => {
  const { selectedEpoch, setSelectedEpoch, rateVaultEpochData } =
    useBoundStore();

  const handleSelectChange = useCallback(
    (event: SelectChangeEvent) => {
      if (setSelectedEpoch)
        setSelectedEpoch(Number((event?.target as HTMLInputElement).value));
    },
    [setSelectedEpoch]
  );

  const epochs = useMemo(() => {
    let _epoch = [selectedEpoch];

    return Array(_epoch)
      .join()
      .split(',')
      .map((_i, index) => {
        return (
          <MenuItem
            value={index + 1}
            key={index + 1}
            className="text-stieglitz"
          >
            {index + 1}
          </MenuItem>
        );
      });
  }, [selectedEpoch]);

  return (
    <Box className={'w-full mb-7'}>
      <Box className={'flex'}>
        <Typography variant="h5" className="text-stieglitz">
          Epoch
        </Typography>
      </Box>
      <Box className={'bg-cod-gray sm:px-4 px-2 py-4 rounded-xl mt-5'}>
        <Box className={'flex'}>
          <Box
            className={'bg-[#2D2D2D] rounded-md mr-3 custom-select-no-border'}
          >
            <Select
              value={String(Math.max(selectedEpoch || 0, 1))}
              onChange={handleSelectChange}
              className="text-stieglitz"
              MenuProps={{
                classes: { paper: 'bg-umbra' },
              }}
              classes={{ icon: 'text-stieglitz' }}
              placeholder={'-'}
            >
              {epochs}
            </Select>
          </Box>
          <EpochStatusBox>
            <EpochStatusButton>
              <img src="/assets/lock.svg" className="mr-3" alt="Lock" />{' '}
              {rateVaultEpochData?.isEpochExpired
                ? 'Vault purchases are closed'
                : !rateVaultEpochData?.isVaultReady
                ? 'Vault open for deposits'
                : 'Vault open for purchases'}
            </EpochStatusButton>
          </EpochStatusBox>
        </Box>
        <Box className={'bg-[#2D2D2D] p-3 rounded-md mt-3'}>
          <Box className={'flex'}>
            <Typography variant="h5" className="text-stieglitz">
              Time remaining
            </Typography>
            {rateVaultEpochData!.epochEndTimes.eq(0) ? (
              <Typography variant="h5" className="text-white ml-auto">
                -
              </Typography>
            ) : (
              <Countdown
                date={
                  new Date(rateVaultEpochData!.epochEndTimes.toNumber() * 1000)
                }
                renderer={({ days, hours, minutes }) => {
                  return (
                    <Typography variant="h5" className="text-white ml-auto">
                      {days}d {hours}h {minutes}m
                    </Typography>
                  );
                }}
              />
            )}
          </Box>
          <Box className={'flex mt-1'}>
            <Typography variant="h5" className="text-stieglitz">
              Next epoch
            </Typography>
            <Typography variant="h5" className="text-white ml-auto">
              {rateVaultEpochData!.epochEndTimes.eq(0)
                ? '-'
                : getFormattedDate(
                    new Date(
                      rateVaultEpochData!.epochEndTimes.toNumber() * 1000
                    )
                  )}
            </Typography>
          </Box>
        </Box>
        <Box className={'flex mt-6'}>
          <CircleIcon
            onClick={null}
            className={
              'ml-auto mr-auto h-5 w-5 fill-white stroke-white cursor-pointer'
            }
          />
          {/*
          <CircleIcon
            onClick={null}
            className={
              'mr-auto ml-0 h-5 w-5 fill-gray-800 stroke-gray-100 opacity-10 cursor-pointer'
            }
          />
          */}
        </Box>
      </Box>
      <Box className={'flex mt-8 mb-3'}>
        <Typography variant="h5" className="text-stieglitz">
          Views
        </Typography>
      </Box>
      <Box
        className={
          activeView === 'vault'
            ? 'rounded-md flex mb-4 p-3 border border-neutral-800 w-full bg-umbra cursor-pointer'
            : 'rounded-md flex mb-4 p-3 w-full group cursor-pointer hover:border hover:border-neutral-800 hover:bg-umbra'
        }
        onClick={() => setActiveView('vault')}
      >
        <img
          src="/assets/magicstars.svg"
          alt="Magic Stars"
          className={
            activeView === 'vault'
              ? 'w-5 h-4 mt-0.5 mr-3'
              : 'w-5 h-4 mt-0.5 mr-3 hidden group-hover:block'
          }
        />
        {activeView !== 'vault' ? (
          <img
            src="/assets/magicstars-disabled.svg"
            alt="Magic Stars"
            className="w-5 h-4 mt-0.5 mr-3 group-hover:hidden"
          />
        ) : null}
        <Typography
          variant="h6"
          className={
            activeView === 'vault'
              ? 'text-white'
              : 'text-stieglitz group-hover:text-white'
          }
        >
          Vault
        </Typography>
      </Box>
      <Box
        className={
          activeView === 'positions'
            ? 'rounded-md flex mb-4 p-3 border border-neutral-800 w-full bg-umbra cursor-pointer'
            : 'rounded-md flex mb-4 p-3 w-full group cursor-pointer hover:border hover:border-neutral-800 hover:bg-umbra'
        }
        onClick={() => setActiveView('positions')}
      >
        <img
          src="/assets/stars.svg"
          alt="Stars"
          className={
            activeView === 'positions'
              ? 'w-5 h-4 mt-0.5 mr-3'
              : 'w-5 h-4 mt-0.5 mr-3 hidden group-hover:block'
          }
        />
        {activeView !== 'positions' ? (
          <img
            alt="Stars"
            src="/assets/stars-disabled.svg"
            className="w-5 h-4 mt-0.5 mr-3 group-hover:hidden"
          />
        ) : null}
        <Typography
          variant="h6"
          className={
            activeView === 'positions'
              ? 'text-white'
              : 'text-stieglitz group-hover:text-white'
          }
        >
          Options & Positions
        </Typography>
      </Box>
    </Box>
  );
};

export default MobileMenu;
