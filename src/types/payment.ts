// Type contract for the payment layer. All data structures used across store, hooks, components, and API are defined here.

export type CardType = 'visa' | 'mastercard' | 'amex' | 'unknown';

export type Currency = 'INR' | 'USD';

export type TransactionStatus = 'success' | 'failed' | 'timeout';

export interface Transaction {
  id: string;           // UUID from crypto.randomUUID()
  amount: number;
  currency: Currency;
  status: TransactionStatus;
  reason?: string;      // populated for failed and timeout
  cardLast4: string;
  cardType: CardType;
  cardholderName: string;
  createdAt: number;    // unix ms — Date.now()
  attempts: number;     // total attempts used, 1..3
}

export interface PaymentPayload {
  txId: string;
  cardholderName: string;
  cardNumber: string;   // digits only, no spaces — 15 for amex, 16 otherwise
  expiry: string;       // 'MM/YY'
  cvv: string;
  amount: number;
  currency: Currency;
  cardType: CardType;
  attempt: number;      // 1..3
}

export type PaymentStatus =
  | { kind: 'idle' }
  | { kind: 'processing'; txId: string; attempt: number }
  | { kind: 'success'; txId: string; transaction: Transaction }
  | { kind: 'failed'; txId: string; reason: string; attempt: number; canRetry: boolean }
  | { kind: 'timeout'; txId: string; attempt: number; canRetry: boolean };

export type GatewayResponse =
  | { outcome: 'success'; txId: string; processedAt: number }
  | { outcome: 'failed'; txId: string; reason: string };

// Timeout is never a server response — the client aborts at 6s via AbortController.
// The server's 8s delayed response would look like a failed response if it ever arrived.

export const MAX_ATTEMPTS = 3 as const;
export const REQUEST_TIMEOUT_MS = 6000 as const;
