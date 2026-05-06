import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

const MAX_HISTORY = 50;

// Safe localStorage wrapper
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silent fail — private browsing or quota exceeded
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silent fail
    }
  },
};

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
          // ISSUE C FIX — Cap history at MAX_HISTORY
          history: [transaction, ...state.history].slice(0, MAX_HISTORY),
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
          // Cap history at MAX_HISTORY
          history: [tx, ...state.history].slice(0, MAX_HISTORY),
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
      storage: {
        getItem: (key) => {
          const value = safeStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: (key, value) => {
          safeStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: (key) => {
          safeStorage.removeItem(key);
        },
      },
      partialize: (state) => ({ history: state.history }),
      version: 1,
      // Migrate corrupted data
      migrate: (persistedState: unknown, version: number) => {
        // If state shape is unexpected, return clean default
        if (!persistedState || typeof persistedState !== 'object') {
          return { history: [] };
        }
        const state = persistedState as Record<string, unknown>;
        if (!Array.isArray(state.history)) {
          return { history: [] };
        }
        return state;
      },
    }
  )
);

export default usePaymentStore;

export const useStatus = () => usePaymentStore((s) => s.status);
export const useHistory = () => usePaymentStore((s) => s.history);
export const useCurrentTxId = () => usePaymentStore((s) => s.currentTxId);
