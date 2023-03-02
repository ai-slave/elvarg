import { StateCreator } from 'zustand';
import { BigNumber } from 'ethers';
import {
  CurveStableswapPair,
  RdpxV2Treasury,
  RdpxV2Bond,
  RdpxV2Treasury__factory,
  ERC20__factory,
  RdpxV2Bond__factory,
  DscToken__factory,
  DscToken,
  MockToken,
  MockToken__factory,
  // DPXVotingEscrow,
  // DPXVotingEscrow__factory,
} from '@dopex-io/sdk';

import { WalletSlice } from 'store/Wallet';
import { AssetsSlice } from 'store/Assets';
import { getContractReadableAmount } from 'utils/contracts';

interface RdpxV2TreasuryContractState {
  contracts?: {
    bond: RdpxV2Bond;
    treasury: RdpxV2Treasury;
    curvePool?: CurveStableswapPair;
    dsc: DscToken;
    rdpx: MockToken;
  };
  re_lp_factor: BigNumber;
  rdpx_reserve: BigNumber;
  lp_reserve: BigNumber;
  alphatoken_reserve: BigNumber;
  dsc_upper_peg: BigNumber;
  dsc_first_lower_depeg: BigNumber;
  dsc_second_lower_depeg: BigNumber;
  bond_maturity: BigNumber;
  discount_factor: BigNumber;
}

interface Token {
  address: string;
  symbol: string;
}

interface RdpxV2TreasuryData {
  reserveA: BigNumber;
  reserveB: BigNumber;
  tokenA: Token;
  tokenB: Token;
  bondCostPerDsc: [BigNumber, BigNumber];
  lpPrice: BigNumber; // rdpxWETH price
  dscPrice: BigNumber;
  dscSupply: BigNumber;
  rdpxSupply: BigNumber;
  rdpxPriceInAlpha: BigNumber;
  ammReserves: [BigNumber, BigNumber, string, string]; // [reserve A, reserve B, token A, token B]
}

export interface RdpxBond {
  tokenId: number;
  amount: BigNumber | number;
  maturity: BigNumber | number;
  timestamp: BigNumber | number;
}

interface RdpxV2TreasuryUserData {
  bonds: RdpxBond[];
  isEligibleForMint: boolean;
}

const initialTreasuryContractState: RdpxV2TreasuryContractState = {
  re_lp_factor: BigNumber.from(0),
  rdpx_reserve: BigNumber.from(0),
  lp_reserve: BigNumber.from(0),
  alphatoken_reserve: BigNumber.from(0),
  dsc_upper_peg: BigNumber.from(0),
  dsc_first_lower_depeg: BigNumber.from(0),
  dsc_second_lower_depeg: BigNumber.from(0),
  bond_maturity: BigNumber.from(0),
  discount_factor: BigNumber.from(0),
};

export interface DpxusdBondingSlice {
  treasuryContractState: RdpxV2TreasuryContractState;
  updateTreasuryContractState: Function;
  treasuryData: RdpxV2TreasuryData;
  updateTreasuryData: Function;
  userDscBondsData: RdpxV2TreasuryUserData;
  updateUserDscBondsData: Function;
}

const initialUserDscBondData: RdpxV2TreasuryUserData = {
  bonds: [],
  isEligibleForMint: false,
};

export const createDpxusdBondingSlice: StateCreator<
  WalletSlice & AssetsSlice & DpxusdBondingSlice,
  [],
  [['zustand/devtools', never]],
  DpxusdBondingSlice
> = (set, get) => ({
  treasuryContractState: initialTreasuryContractState,
  updateTreasuryContractState: async () => {
    const { contractAddresses, provider } = get();

    if (!contractAddresses || !contractAddresses['RDPX-V2'] || !provider)
      return;

    const treasuryAddress = contractAddresses['RDPX-V2']['Treasury'];
    const bondAddress = contractAddresses['RDPX-V2']['Bond'];
    const dscAddress = contractAddresses['RDPX-V2']['DSC'];
    const rdpxAddress = contractAddresses['RDPX'];
    const treasury: RdpxV2Treasury = RdpxV2Treasury__factory.connect(
      treasuryAddress,
      provider
    );
    const bond: RdpxV2Bond = RdpxV2Bond__factory.connect(bondAddress, provider);
    const dsc: DscToken = DscToken__factory.connect(dscAddress, provider);
    const rdpx: MockToken = MockToken__factory.connect(rdpxAddress, provider);

    const [
      re_lp_factor,
      rdpx_reserve,
      lp_reserve,
      alphatoken_reserve,
      dsc_upper_peg,
      dsc_first_lower_depeg,
      dsc_second_lower_depeg,
      bond_maturity,
      discount_factor,
    ] = await Promise.all([
      treasury.reLpFactor(),
      treasury.rdpxReserve(),
      treasury.lpReserve(),
      BigNumber.from(0),
      treasury.DSC_UPPER_PEG(),
      treasury.DSC_FIRST_LOWER_PEG(),
      treasury.DSC_SECOND_LOWER_PEG(),
      treasury.bondMaturity(),
      treasury.bondDiscountFactor(),
    ]);

    set((prevState) => ({
      ...prevState,
      treasuryContractState: {
        contracts: {
          treasury,
          bond,
          dsc,
          rdpx,
        },
        rdpx_reserve,
        lp_reserve,
        dsc_upper_peg,
        dsc_first_lower_depeg,
        dsc_second_lower_depeg,
        alphatoken_reserve,
        re_lp_factor,
        bond_maturity,
        discount_factor,
      },
    }));
  },
  treasuryData: {
    reserveA: BigNumber.from(0),
    reserveB: BigNumber.from(0),
    tokenA: {
      symbol: '',
      address: '',
    },
    tokenB: {
      symbol: '',
      address: '',
    },
    bondCostPerDsc: [BigNumber.from(0), BigNumber.from(0)],
    lpPrice: BigNumber.from(0), // rdpxWETH price
    dscPrice: BigNumber.from(0),
    dscSupply: BigNumber.from(0),
    rdpxSupply: BigNumber.from(0),
    rdpxPriceInAlpha: BigNumber.from(0),
    ammReserves: [BigNumber.from(0), BigNumber.from(0), '', ''], // [reserve A, reserve B, token A, token B]
  },
  updateTreasuryData: async () => {
    const { provider, contractAddresses, treasuryContractState } = get();

    if (!contractAddresses || !treasuryContractState.contracts) return;

    const treasury = treasuryContractState.contracts.treasury;

    if (!treasury) return;

    const [reserveA, reserveB, tokenAAddress, tokenBAddress] =
      await treasury.getRdpxAlphaLpReserves();

    const [tokenASymbol, tokenBSymbol] = await Promise.all([
      ERC20__factory.connect(tokenAAddress, provider).symbol(),
      ERC20__factory.connect(tokenBAddress, provider).symbol(),
    ]);

    const [bondCostPerDsc, lpPrice, dscPrice, rdpxPriceInAlpha] =
      await Promise.all([
        treasury.calculateBondCost(getContractReadableAmount(1, 18)),
        treasury.getLpPrice(),
        treasury.getDscPrice(),
        treasury.getRdpxPrice(),
      ]);

    const dscSupply = await treasuryContractState.contracts.dsc.totalSupply();
    const rdpxSupply = await treasuryContractState.contracts.rdpx.totalSupply();

    set((prevState) => ({
      ...prevState,
      treasuryData: {
        reserveA,
        reserveB,
        tokenA: {
          address: tokenAAddress,
          symbol: tokenASymbol,
        },
        tokenB: {
          address: tokenBAddress,
          symbol: tokenBSymbol,
        },
        bondCostPerDsc,
        lpPrice,
        dscPrice,
        dscSupply,
        rdpxSupply,
        rdpxPriceInAlpha,
        ammReserves: [reserveA, reserveB, tokenAAddress, tokenBAddress],
      },
    }));
  },
  userDscBondsData: initialUserDscBondData,
  updateUserDscBondsData: async () => {
    const {
      accountAddress,
      provider,
      contractAddresses,
      treasuryContractState,
    } = get();

    if (
      !provider ||
      !treasuryContractState.contracts ||
      !contractAddresses ||
      !accountAddress
    )
      return;

    const { bond } = treasuryContractState.contracts;

    if (!bond) return;

    const userBalance = (await bond.balanceOf(accountAddress)).toNumber();

    const bondCalls: Promise<any>[] = [];
    const bondIds: number[] = [];

    for (let i = 0; i < userBalance; i++) {
      const tokenID = await bond.tokenOfOwnerByIndex(accountAddress, i);
      bondIds.push(tokenID.toNumber());
      bondCalls.push(treasuryContractState.contracts.treasury.bonds(tokenID));
    }

    let bonds: RdpxBond[] = await Promise.all(bondCalls);

    bonds = bonds.map((bond, i) => ({ ...bond, tokenId: bondIds[i] || 0 }));

    // const veDPX: DPXVotingEscrow = DPXVotingEscrow__factory.connect(
    //   contractAddresses['WETH'], // todo change to veDPX
    //   provider
    // );

    // const isEligibleForMint = (await veDPX.balanceOf(accountAddress)).gte(
    //   getContractReadableAmount(1000, 18)
    // );

    set((prevState) => ({
      ...prevState,
      userDscBondsData: {
        bonds, // bonds,
        isEligibleForMint: true,
      },
    }));
  },
});
