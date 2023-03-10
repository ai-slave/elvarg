import { StateCreator } from 'zustand';

import { WalletSlice } from 'store/Wallet';
import { CommonSlice } from 'store/Vault/common';

export interface ZdteSlice {
  getZdteContract: Function;
}

export const createZdteSlice: StateCreator<
  ZdteSlice & WalletSlice & CommonSlice,
  [['zustand/devtools', never]],
  [],
  ZdteSlice
> = (set, get) => ({
  getZdteContract: () => {
    return get();
  },
});
