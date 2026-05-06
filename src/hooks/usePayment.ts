'use client';

import { useCallback, useRef, useEffect } from 'react';
import usePaymentStore from '@/store/paymentStore';
import { MAX_ATTEMPTS, REQUEST_TIMEOUT_MS } from '@/types/payment';
import type { PaymentFormValues } from '@/utils/validation';
import type { Transaction, GatewayResponse, PaymentPayload } from '@/types/payment';
import { getLast4 } from '@/utils/formatting';
import { detectCardType } from '@/utils/cardDetection';

export function usePayment() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const isInFlightRef = useRef(false);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const submitPayment = useCallback(
    async (values: PaymentFormValues, forceTxId?: string) => {
      // Prevent multiple submits in flight
      if (isInFlightRef.current) return;
      isInFlightRef.current = true;

      // Step 1 — Determine txId and attempt number
      let txId: string;
      let attempt: number;

      if (forceTxId) {
        // Fresh transaction — txId passed directly from beginTransaction()
        txId = forceTxId;
        attempt = 1;
      } else {
        // Retry — read from current status
        const currentStatus = usePaymentStore.getState().status;
        if (currentStatus.kind !== 'failed' && currentStatus.kind !== 'timeout') {
          isInFlightRef.current = false;
          return;
        }
        txId = currentStatus.txId;
        attempt = currentStatus.attempt + 1;
      }

      if (!txId) {
        isInFlightRef.current = false;
        return;
      }

      attempt = Math.min(attempt, MAX_ATTEMPTS);

      // Step 2 — Set processing state (RACE B FIX — use getState())
      if (!isMountedRef.current) {
        isInFlightRef.current = false;
        return;
      }
      usePaymentStore.getState().setProcessing(attempt);

      // Step 3 — Create AbortController
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      const timeoutId = window.setTimeout(() => {
        abortControllerRef.current?.abort();
      }, REQUEST_TIMEOUT_MS);

      // Step 4 — Build payload
      const cardType = detectCardType(values.cardNumber);
      const payload: PaymentPayload = {
        txId,
        cardholderName: values.cardholderName,
        cardNumber: values.cardNumber,
        expiry: values.expiry,
        cvv: values.cvv,
        amount: values.amount,
        currency: values.currency,
        cardType,
        attempt,
      };

      // Step 5 — Fetch with try/catch
      try {
        const response = await fetch('/api/pay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data: GatewayResponse = await response.json();

        // Check mounted before store writes
        if (!isMountedRef.current) return;

        if (data.outcome === 'success') {
          const transaction: Transaction = {
            id: txId,
            amount: values.amount,
            currency: values.currency,
            status: 'success',
            cardLast4: getLast4(values.cardNumber),
            cardType,
            cardholderName: values.cardholderName,
            createdAt: Date.now(),
            attempts: attempt,
          };
          usePaymentStore.getState().setSuccess(transaction);
        } else {
          const canRetry = attempt < MAX_ATTEMPTS;
          usePaymentStore.getState().setFailed(data.reason, attempt, canRetry);

          if (!canRetry) {
            const transaction: Transaction = {
              id: txId,
              amount: values.amount,
              currency: values.currency,
              status: 'failed',
              reason: data.reason,
              cardLast4: getLast4(values.cardNumber),
              cardType,
              cardholderName: values.cardholderName,
              createdAt: Date.now(),
              attempts: attempt,
            };
            usePaymentStore.getState().addTransactionToHistory(transaction);
          }
        }
      } catch (error: unknown) {
        clearTimeout(timeoutId);

        // Check mounted before store writes
        if (!isMountedRef.current) return;

        const isAbort = error instanceof Error && error.name === 'AbortError';

        if (isAbort) {
          const canRetry = attempt < MAX_ATTEMPTS;
          usePaymentStore.getState().setTimeoutStatus(attempt, canRetry);

          if (!canRetry) {
            const transaction: Transaction = {
              id: txId,
              amount: values.amount,
              currency: values.currency,
              status: 'timeout',
              reason: 'Request timed out',
              cardLast4: getLast4(values.cardNumber),
              cardType,
              cardholderName: values.cardholderName,
              createdAt: Date.now(),
              attempts: attempt,
            };
            usePaymentStore.getState().addTransactionToHistory(transaction);
          }
        } else {
          const canRetry = attempt < MAX_ATTEMPTS;
          const reason = 'Something went wrong. Please try again.';
          usePaymentStore.getState().setFailed(reason, attempt, canRetry);

          if (!canRetry) {
            const transaction: Transaction = {
              id: txId,
              amount: values.amount,
              currency: values.currency,
              status: 'failed',
              reason,
              cardLast4: getLast4(values.cardNumber),
              cardType,
              cardholderName: values.cardholderName,
              createdAt: Date.now(),
              attempts: attempt,
            };
            usePaymentStore.getState().addTransactionToHistory(transaction);
          }
        }
      } finally {
        clearTimeout(timeoutId);
        isInFlightRef.current = false;
      }
    },
    []
  );

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    usePaymentStore.getState().reset();
  }, []);

  return { submitPayment, reset };
}
