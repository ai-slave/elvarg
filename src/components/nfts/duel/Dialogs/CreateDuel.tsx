import React, {
  useEffect,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react';
import cx from 'classnames';
import { BigNumber } from 'ethers';
import { emojisplosions } from 'emojisplosion';

import Box from '@mui/material/Box';
import Input from '@mui/material/Input';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';

import Dialog from 'components/UI/Dialog';
import Typography from 'components/UI/Typography';
import CustomButton from 'components/UI/CustomButton';
import EstimatedGasCostButton from 'components/common/EstimatedGasCostButton';

import BigCrossIcon from 'svgs/icons/BigCrossIcon';

import { WalletContext } from 'contexts/Wallet';
import { AssetsContext } from 'contexts/Assets';

import formatAmount from 'utils/general/formatAmount';
import getUserReadableAmount from 'utils/contracts/getUserReadableAmount';

import styles from './styles.module.scss';
import getTokenDecimals from '../../../../utils/general/getTokenDecimals';

export interface Props {
  open: boolean;
  handleClose: () => void;
}

const CreateDuel = ({ open, handleClose }: Props) => {
  const { chainId, signer } = useContext(WalletContext);
  const [tokenName, setTokenName] = useState<string>('ETH');
  const [wager, setWager] = useState<number>(1);
  const { userAssetBalances } = useContext(AssetsContext);

  const readableBalance = useMemo(() => {
    return getUserReadableAmount(
      userAssetBalances[tokenName] || BigNumber.from('0'),
      getTokenDecimals(tokenName, chainId)
    );
  }, [tokenName, chainId]);

  return (
    <Dialog
      open={open}
      handleClose={handleClose}
      background={'bg-[#181C24]'}
      classes={{
        paper: 'rounded m-0',
        paperScrollPaper: 'overflow-x-hidden',
      }}
    >
      <Box className="flex flex-row items-center mb-4">
        <img
          src={'/images/nfts/pepes/create-duel-button.png'}
          className={'w-46 mr-1 ml-auto'}
          alt={'Create duel'}
        />
        <IconButton
          className="p-0 pb-1 mr-0 mt-0.5 ml-auto"
          onClick={handleClose}
          size="large"
        >
          <BigCrossIcon className="" />
        </IconButton>
      </Box>
      <Box className="bg-[#232935] rounded-2xl flex flex-col mb-4 p-3 pr-2">
        <Box className="flex flex-row justify-between">
          <Box className="h-10 bg-[#181C24] rounded-full pl-1 pr-1 pt-0 pb-0 flex flex-row items-center">
            <Box className="flex flex-row h-10 pr-14">
              <img
                src={`/images/tokens/${tokenName.toLowerCase()}.svg`}
                alt={tokenName}
                className="w-8 h-8 mt-1"
              />
              <Typography
                variant="h5"
                className="text-stieglitz text-sm pl-1 pt-1 ml-1 mt-1"
              >
                {tokenName}
              </Typography>
              <img
                src="/images/misc/arrow-down.svg"
                className="w-3 h-1 ml-3 mt-4"
              />
            </Box>
          </Box>
          <Input
            disableUnderline
            placeholder="0"
            type="number"
            className="h-12 text-2xl text-white ml-2 mr-3 font-mono"
            value={wager}
            onChange={(e) => setWager(Number(e.target.value))}
            classes={{ input: 'text-right' }}
          />
        </Box>
        <Box className="flex flex-row justify-between">
          <Box className="flex">
            <img
              src="/images/nfts/pepes/crown.svg"
              className="w-3 h-3 mt-auto mb-1 mr-0.5"
            />
            <Typography
              variant="h6"
              className="text-[#78859E] text-sm pl-1 pt-2"
            >
              Wager
            </Typography>
          </Box>
          <Box className="ml-auto mr-0">
            <Typography variant="h6" className="text-sm pl-1 pt-2 pr-3">
              <span className="text-[#78859E]">Balance: </span>
              {formatAmount(readableBalance, 2)}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box className="bg-[#232935] rounded-2xl flex flex-col mb-4 p-3 pr-2">
        <Box className="flex">
          <img
            src="/images/misc/person.svg"
            className="w-3.5 h-3.5 mr-1.5 mt-1"
          />
          <Typography variant="h6" className="text-[#78859E] text-sm">
            Select Challenger
          </Typography>
        </Box>
        <Box className="flex">
          <img src="/images/misc/plus.png" className="w-10 h-10 mt-3" />
          <Box className="ml-3 mt-2">
            <Typography variant="h5">-</Typography>
            <Typography variant="h6">
              <span className="text-stieglitz">-</span>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};

export default CreateDuel;
