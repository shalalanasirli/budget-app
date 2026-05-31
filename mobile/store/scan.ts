import { create } from 'zustand';

export interface ScanResult {
    merchant?: string;
    amount?: number;
    categoryId?: string;
}

interface ScanState {
    result: ScanResult | null;
    setResult: (result: ScanResult) => void;
    clearResult: () => void;
}

export const useScanStore = create<ScanState>((set) => ({
    result: null,
    setResult: (result) => set({ result }),
    clearResult: () => set({ result: null }),
}));
