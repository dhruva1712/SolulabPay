import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PaymentStatus, Transaction } from '@/types/payment';

interface PaymentState {
  // State
  status: PaymentStatus;
  history: Transaction[];
  currentTxId: string | null;

  // Actions
  beginTransaction: () => string;
  setProcessing: (attempt: number) => void;
  setSuccess: (transaction: Transaction) => void;
  setFailed: (reason: string, attempt: number, canRetry: boolean) => void;
  setTimeoutStatus: (attempt: number, canRetry: boolean) => void;
  addTransactionToHistory: (tx: Transaction) => void;
  reset: () => void;
  clearHistory: () => void;
}

const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      // Initial state
      status: { kind: 'idle' },
      history: [],
      currentTxId: null,

      // Actions
      beginTransaction: () => {
        const txId = crypto.randomUUID();
        set((state) => ({
          currentTxId: txId,
          status: { kind: 'idle' },
        }));
        return txId;
      },

      setProcessing: (attempt) => {
        const currentTxId = get().currentTxId;
        if (currentTxId === null) return;

        set((state) => ({
          status: { kind: 'processing', txId: currentTxId, attempt },
        }));
      },

      setSuccess: (transaction) => {
        set((state) => ({
          history: [transaction, ...state.history],
          status: { kind: 'success', txId: transaction.id, transaction },
          currentTxId: null,
        }));
      },

      setFailed: (reason, attempt, canRetry) => {
        const currentTxId = get().currentTxId;
        if (currentTxId === null) return;

        set((state) => ({
          status: { kind: 'failed', txId: currentTxId, reason, attempt, canRetry },
        }));
      },

      setTimeoutStatus: (attempt, canRetry) => {
        const currentTxId = get().currentTxId;
        if (currentTxId === null) return;

        set((state) => ({
          status: { kind: 'timeout', txId: currentTxId, attempt, canRetry },
        }));
      },

      addTransactionToHistory: (tx) => {
        set((state) => ({
          history: [tx, ...state.history],
        }));
      },

      reset: () => {
        set((state) => ({
          status: { kind: 'idle' },
          currentTxId: null,
        }));
      },

      clearHistory: () => {
        set((state) => ({
          history: [],
        }));
      },
    }),
    {
      name: 'payment-gateway-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ history: state.history }),
      version: 1,
    }
  )
);

export default usePaymentStore;

export const useStatus = () => usePaymentStore((s) => s.status);
export const useHistory = () => usePaymentStore((s) => s.history);
export const useCurrentTxId = () => usePaymentStore((s) => s.currentTxId);
