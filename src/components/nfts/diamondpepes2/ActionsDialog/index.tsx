import { useEffect, useContext, useState, useMemo, useCallback } from 'react';

import cx from 'classnames';
import { BigNumber, ethers } from 'ethers';
import Countdown from 'react-countdown';
import { emojisplosions } from 'emojisplosion';

import Box from '@mui/material/Box';
import Input from '@mui/material/Input';
import IconButton from '@mui/material/IconButton';

import Dialog from 'components/UI/Dialog';
import Typography from 'components/UI/Typography';
import CustomButton from 'components/UI/Button';

import EstimatedGasCostButton from 'components/common/EstimatedGasCostButton';

import BigCrossIcon from 'svgs/icons/BigCrossIcon';

import formatAmount from 'utils/general/formatAmount';
import getContractReadableAmount from 'utils/contracts/getContractReadableAmount';

import { WalletContext } from 'contexts/Wallet';

import styles from './styles.module.scss';

const ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_whitelist',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_layerZeroEndpoint',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_endMintId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_mintPrice',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'approved',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'approved',
        type: 'bool',
      },
    ],
    name: 'ApprovalForAll',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint16',
        name: '_srcChainId',
        type: 'uint16',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: '_srcAddress',
        type: 'bytes',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: '_nonce',
        type: 'uint64',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: '_payload',
        type: 'bytes',
      },
    ],
    name: 'MessageFailed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint16',
        name: '_srcChainId',
        type: 'uint16',
      },
      {
        indexed: false,
        internalType: 'address',
        name: '_toAddress',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: '_nonce',
        type: 'uint64',
      },
    ],
    name: 'ReceiveFromChain',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: '_sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint16',
        name: '_dstChainId',
        type: 'uint16',
      },
      {
        indexed: true,
        internalType: 'bytes',
        name: '_toAddress',
        type: 'bytes',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: '_nonce',
        type: 'uint64',
      },
    ],
    name: 'SendToChain',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint16',
        name: '_srcChainId',
        type: 'uint16',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: '_srcAddress',
        type: 'bytes',
      },
    ],
    name: 'SetTrustedRemote',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [],
    name: 'adminMint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'time',
        type: 'uint256',
      },
    ],
    name: 'adminSetEndTime',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'time',
        type: 'uint256',
      },
    ],
    name: 'adminSetStartTime',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'adminWithdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'endTime',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: '_dstChainId',
        type: 'uint16',
      },
      {
        internalType: 'bytes',
        name: '_toAddress',
        type: 'bytes',
      },
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: '_useZro',
        type: 'bool',
      },
      {
        internalType: 'bytes',
        name: '_adapterParams',
        type: 'bytes',
      },
    ],
    name: 'estimateSendFee',
    outputs: [
      {
        internalType: 'uint256',
        name: 'nativeFee',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'zroFee',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    name: 'failedMessages',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: '_srcChainId',
        type: 'uint16',
      },
      {
        internalType: 'bytes',
        name: '_srcAddress',
        type: 'bytes',
      },
    ],
    name: 'forceResumeReceive',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'getApproved',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: '_version',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: '_chainId',
        type: 'uint16',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_configType',
        type: 'uint256',
      },
    ],
    name: 'getConfig',
    outputs: [
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
    ],
    name: 'isApprovedForAll',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: '_srcChainId',
        type: 'uint16',
      },
      {
        internalType: 'bytes',
        name: '_srcAddress',
        type: 'bytes',
      },
    ],
    name: 'isTrustedRemote',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lzEndpoint',
    outputs: [
      {
        internalType: 'contract ILayerZeroEndpoint',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: '_srcChainId',
        type: 'uint16',
      },
      {
        internalType: 'bytes',
        name: '_srcAddress',
        type: 'bytes',
      },
      {
        internalType: 'uint64',
        name: '_nonce',
        type: 'uint64',
      },
      {
        internalType: 'bytes',
        name: '_payload',
        type: 'bytes',
      },
    ],
    name: 'lzReceive',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maxPublicMints',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'number',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'mintPrice',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nextMintId',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: '_srcChainId',
        type: 'uint16',
      },
      {
        internalType: 'bytes',
        name: '_srcAddress',
        type: 'bytes',
      },
      {
        internalType: 'uint64',
        name: '_nonce',
        type: 'uint64',
      },
      {
        internalType: 'bytes',
        name: '_payload',
        type: 'bytes',
      },
    ],
    name: 'nonblockingLzReceive',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'ownerOf',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'publicMints',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: '_srcChainId',
        type: 'uint16',
      },
      {
        internalType: 'bytes',
        name: '_srcAddress',
        type: 'bytes',
      },
      {
        internalType: 'uint64',
        name: '_nonce',
        type: 'uint64',
      },
      {
        internalType: 'bytes',
        name: '_payload',
        type: 'bytes',
      },
    ],
    name: 'retryMessage',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '_data',
        type: 'bytes',
      },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: '_dstChainId',
        type: 'uint16',
      },
      {
        internalType: 'bytes',
        name: '_toAddress',
        type: 'bytes',
      },
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256',
      },
      {
        internalType: 'address payable',
        name: '_refundAddress',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_zroPaymentAddress',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: '_adapterParams',
        type: 'bytes',
      },
    ],
    name: 'send',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_from',
        type: 'address',
      },
      {
        internalType: 'uint16',
        name: '_dstChainId',
        type: 'uint16',
      },
      {
        internalType: 'bytes',
        name: '_toAddress',
        type: 'bytes',
      },
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256',
      },
      {
        internalType: 'address payable',
        name: '_refundAddress',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_zroPaymentAddress',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: '_adapterParams',
        type: 'bytes',
      },
    ],
    name: 'sendFrom',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'approved',
        type: 'bool',
      },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: '_version',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: '_chainId',
        type: 'uint16',
      },
      {
        internalType: 'uint256',
        name: '_configType',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '_config',
        type: 'bytes',
      },
    ],
    name: 'setConfig',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: '_version',
        type: 'uint16',
      },
    ],
    name: 'setReceiveVersion',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: '_version',
        type: 'uint16',
      },
    ],
    name: 'setSendVersion',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: '_srcChainId',
        type: 'uint16',
      },
      {
        internalType: 'bytes',
        name: '_srcAddress',
        type: 'bytes',
      },
    ],
    name: 'setTrustedRemote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'startTime',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'tokenURI',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    name: 'trustedRemoteLookup',
    outputs: [
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'whitelist',
    outputs: [
      {
        internalType: 'contract IDuelPepesWhitelist',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export interface Props {
  open: boolean;
  tab: string;
  handleClose: () => void;
  updateData: () => void;
  data: {
    publicMints: BigNumber;
    nextMintId: BigNumber;
    maxPublicMints: BigNumber;
    mintPrice: BigNumber;
    endTime: BigNumber;
    startTime: BigNumber;
  };
}

const Hero = ({
  active,
  heroColor,
  letter,
}: {
  active: boolean;
  heroColor: string;
  letter: string;
}) => {
  const heroColorToClass = useMemo(() => {
    if (heroColor === 'blue') return styles['blueBackground'];
    if (heroColor === 'orange') return styles['orangeBackground'];
    if (heroColor === 'diamond') return styles['diamondBackground'];
    else return styles[`goldBackground`];
  }, [heroColor]);

  return active ? (
    <Box>
      <img
        src={`/assets/pepe-frame-${heroColor}.png`}
        className="w-full"
        alt={'Pepe'}
      />
      <Box
        className={cx(
          heroColorToClass,
          'absolute w-14 text-center rounded-xl left-[1.2rem] top-[4rem] z-50'
        )}
      >
        <Typography
          variant="h6"
          className={"text-stieglitz font-['Minecraft'] text-black pt-0.5"}
        >
          {letter}
        </Typography>
      </Box>
    </Box>
  ) : (
    <Box>
      <img src={`/assets/pepe-frame.png`} className="w-full" alt={'Pepe'} />
      <Box className="bg-[#232935] absolute w-14 text-center rounded-xl left-[1.2rem] top-[4rem] z-50">
        <Typography variant="h6" className="text-stieglitz font-['Minecraft']">
          ?
        </Typography>
      </Box>
    </Box>
  );
};

const quotes = [
  {
    avatar: 'tz-pepe.png',
    text: 'Atlanteenis',
    author: '- Tz',
  },
  {
    avatar: 'ceo-pepe.png',
    text: 'Booba',
    author: '- Esteemed CEO',
  },
  {
    avatar: 'ceo-pepe.png',
    text: 'Welcome and Good Nueenis',
    author: '- Esteemed CEO',
  },
  {
    avatar: 'intern-pepe.png',
    text: 'Weenis',
    author: '- Dopex Intern',
  },
];

const ActionsDialog = ({ open, handleClose, data, updateData }: Props) => {
  const { chainId, signer } = useContext(WalletContext);
  const [toMint, setToMint] = useState<number>(1);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const decreaseToMintAmount = () => {
    if (toMint > 1) setToMint(toMint - 1);
  };

  const increaseToMintAmount = () => {
    setToMint(toMint + 1);
  };

  const heroColor = useMemo(() => {
    if (toMint === 1) return 'blue';
    else if (toMint === 2) return 'orange';
    else if (toMint === 3) return 'diamond';
    else return 'gold';
  }, [toMint]);

  const [activeQuoteIndex, setActiveQuoteIndex] = useState<number>(
    Math.floor(Math.random() * quotes.length)
  );

  const quote = useMemo(() => {
    return quotes[activeQuoteIndex] || { avatar: '', text: '', author: '' };
  }, [activeQuoteIndex]);

  const canBuy = useMemo(() => {
    if (
      data?.endTime?.toNumber() > new Date().getTime() / 1000 &&
      data?.startTime?.toNumber() < new Date().getTime() / 1000
    )
      return true;
    else return false;
  }, [data]);

  const handleMint = useCallback(async () => {
    if (!signer) return;

    const publicSaleContract = new ethers.Contract(
      '0x12F0a58FD2cf60b929f6Ff4523A13B56585a2b4D',
      ABI,
      signer
    );

    try {
      await publicSaleContract.connect(signer)['mint'](toMint, {
        value: getContractReadableAmount(toMint * 0.88, 18),
      });
      setSubmitted(true);
      explodeEmojis();
      await updateData();
    } catch (err) {
      alert('Insufficient balance');
    }
  }, [updateData, signer, toMint]);

  const explodeEmojis = () => {
    const toExplode = document.getElementById('emojisplosion');
    if (toExplode) {
      emojisplosions({
        container: toExplode,
        emojis: ['💎'],
      });
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      let newIndex = Math.floor(Math.random() * quotes.length);
      if (newIndex === activeQuoteIndex) {
        if (newIndex === 0) newIndex = 1;
        else newIndex - 1;
      }
      setActiveQuoteIndex(newIndex);
      const el = document.getElementById('typewriter');
      if (el) {
        let copy = el.cloneNode(true) as HTMLElement;
        copy.innerHTML = quotes[newIndex]?.text || '';
        el.parentNode?.replaceChild(copy, el);
      }
    }, 3500);

    return () => clearInterval(intervalId);
  }, [activeQuoteIndex]);

  const boxes = useMemo(
    () =>
      submitted
        ? [
            {
              title: (
                <Box className={'flex'}>
                  <img
                    src={'/assets/export.svg'}
                    className={'w-4 ml-auto'}
                    alt={'Export'}
                  />
                  <Typography
                    variant="h5"
                    className="text-[#78859E] font-['Minecraft'] relative z-1 mr-auto ml-2"
                  >
                    <span className={styles['pepeLink']}>Tofunft</span>
                  </Typography>
                </Box>
              ),
              subTitle: 'MARKET',
            },
            { title: toMint, subTitle: 'MINTED' },
          ]
        : [
            { title: '0.88 ETH', subTitle: '1 PEPE' },
            {
              title: (
                <Countdown
                  date={new Date(data?.endTime?.toNumber() * 1000)}
                  renderer={({ days, hours, minutes, seconds, completed }) => {
                    if (completed) {
                      return (
                        <span className="text-wave-blue">
                          This epoch has expired.
                        </span>
                      );
                    } else {
                      return (
                        <span className="text-wave-blue">
                          Mint ends in: {days}d {hours}h {minutes}m {seconds}s
                        </span>
                      );
                    }
                  }}
                />
              ),
              subTitle: 'REMAINING',
            },
          ],
    [submitted, data, toMint]
  );

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
      <Box className="flex flex-row items-center mb-4" id="emojisplosion">
        <img
          src={'/assets/mint-fighter-button.png'}
          className={'w-46 mr-1 ml-auto'}
          alt={'Mint fighter'}
        />
        <IconButton
          className="p-0 pb-1 mr-0 mt-0.5 ml-auto"
          onClick={handleClose}
          size="large"
        >
          <BigCrossIcon className="" />
        </IconButton>
      </Box>
      <Box className="flex lg:grid lg:grid-cols-12">
        <Box className="col-span-3 pl-2 pr-2 relative">
          <Hero active={toMint >= 1} heroColor={heroColor} letter={'H'} />
        </Box>
        <Box className="col-span-3 pl-2 pr-2 relative">
          <Hero active={toMint >= 2} heroColor={heroColor} letter={'O'} />
        </Box>
        <Box className="col-span-3 pl-2 pr-2 relative">
          <Hero active={toMint >= 3} heroColor={heroColor} letter={'D'} />
        </Box>
        <Box className="col-span-3 pl-2 pr-2 relative">
          <Hero active={toMint >= 4} heroColor={heroColor} letter={'L'} />
        </Box>
      </Box>
      <Box className="p-2 mt-5 md:flex">
        {boxes.map((box, i) => (
          <Box className="md:w-1/2 p-2 text-center" key={i}>
            <Typography
              variant="h5"
              className="text-white font-display font-['Minecraft'] relative z-1"
            >
              <span className={styles['pepeText']}>{box.title}</span>
            </Typography>
            <Typography
              variant="h5"
              className="text-[#78859E] font-['Minecraft'] relative z-1"
            >
              {box.subTitle}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box className={!submitted ? 'mt-2' : ''}>
        {!submitted ? (
          <Box className="bg-[#232935] rounded-xl flex flex-col p-3">
            <Box className="flex pl-2 pr-2">
              <button
                className={styles['pepeButtonSquare']}
                disabled={toMint < 2}
                onClick={decreaseToMintAmount}
              >
                -
              </button>
              <button
                className={cx('ml-2', styles['pepeButtonSquare'])}
                onClick={increaseToMintAmount}
              >
                +
              </button>
              <Input
                id="amount"
                name="amount"
                className={
                  'ml-4 bg-[#343C4D] text-white text-right w-full pl-3 pr-3'
                }
                type="number"
                value={toMint}
                classes={{ input: 'text-right' }}
              />
            </Box>
          </Box>
        ) : null}
        {!submitted ? (
          <Box className="rounded-xl p-4 pb-1 border border-neutral-800 w-full bg-[#232935] mt-3">
            <Box className="rounded-md flex flex-col mb-4 p-4 pt-3.5 pb-3.5 border border-neutral-800 w-full bg-[#343C4D]">
              <EstimatedGasCostButton
                gas={400000 + 200000 * toMint}
                chainId={chainId}
              />
              <Box className={'flex mt-3'}>
                <Typography
                  variant="h6"
                  className="text-stieglitz ml-0 mr-auto"
                >
                  Total cost
                </Typography>
                <Box className={'text-right'}>
                  <Typography variant="h6" className="text-white mr-auto ml-0">
                    {formatAmount(0.88 * toMint, 3) + ' ETH'}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box className="flex mb-2">
              <img
                src={`/assets/${quote.avatar}`}
                className="ml-[2px] w-16"
                alt={''}
              />

              <Box className="bg-[#343C4D] rounded-xs flex flex-col p-3 pb-1.5 w-full ml-4 relative">
                <img
                  src="/assets/polygon-left.svg"
                  className="absolute left-[-7px] top-[20px] w-3"
                  alt={'Left'}
                />
                <Typography
                  variant="h6"
                  className="text-white font-['Minecraft'] typewriter"
                  id="typewriter"
                >
                  {quote.text}
                </Typography>
                <Typography
                  variant="h6"
                  className="text-stieglitz font-['Minecraft']"
                >
                  {quote.author}
                </Typography>
              </Box>
            </Box>
            <CustomButton
              size="medium"
              className={styles['pepeButton']!}
              disabled={!canBuy}
              onClick={handleMint}
            >
              <Typography variant="h5" className={styles['pepeButtonText']!}>
                {canBuy ? 'Mint' : 'Not ready yet'}
              </Typography>
            </CustomButton>
          </Box>
        ) : (
          <Box className="rounded-xl p-4 pb-1 border border-neutral-800 w-full bg-[#232935] mt-3">
            <Box className="rounded-md flex flex-col p-4 pt-3.5 pb-3.5 border border-neutral-800 w-full bg-[#343C4D]">
              <Typography
                variant="h5"
                className="text-white text-base font-['Minecraft']"
              >
                Welcome to the company. <br />
                <br />
                Please wait for the esteemed to make an announcement.
              </Typography>
            </Box>

            <CustomButton
              size="medium"
              className={styles['pepeButton']!}
              onClick={() => setSubmitted(false)}
            >
              <Typography variant="h5" className={styles['pepeButtonText']!}>
                Mint more
              </Typography>
            </CustomButton>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default ActionsDialog;
