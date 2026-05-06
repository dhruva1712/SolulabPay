'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePayment } from '@/hooks/usePayment';
import { useStatus } from '@/store/paymentStore';
import usePaymentStore from '@/store/paymentStore';
import PaymentForm from '@/components/payment/PaymentForm';
import StatusScreen from '@/components/payment/StatusScreen';
import ProcessingOverlay from '@/components/payment/ProcessingOverlay';
import { formatCurrency } from '@/utils/formatting';
import type { PaymentFormValues } from '@/utils/validation';

export default function Home() {
  const status = useStatus();
  const { submitPayment, reset } = usePayment();
  const beginTransaction = usePaymentStore((s) => s.beginTransaction);

  const lastValuesRef = useRef<PaymentFormValues | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [formattedAmount, setFormattedAmount] = useState('');

  const handleSubmit = useCallback(
    async (values: PaymentFormValues) => {
      if (status.kind === 'idle') {
        beginTransaction();
      }

      lastValuesRef.current = values;
      setFormattedAmount(formatCurrency(values.amount, values.currency));

      await submitPayment(values);
    },
    [status.kind, beginTransaction, submitPayment]
  );

  const handleRetry = useCallback(async () => {
    if (lastValuesRef.current) {
      await submitPayment(lastValuesRef.current);
    }
  }, [submitPayment]);

  const handleReset = useCallback(() => {
    reset();
    lastValuesRef.current = null;
    setFormattedAmount('');
  }, [reset]);

  const isSubmitting = status.kind === 'processing';
  const showForm = status.kind === 'idle' || status.kind === 'processing';
  const showStatus = status.kind === 'success' || status.kind === 'failed' || status.kind === 'timeout';

  // ESC key handler for status screen
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showStatus) {
        handleReset();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showStatus, handleReset]);

  return (
    <main className="relative">
      <AnimatePresence mode="wait">
        {showForm && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
          >
            <PaymentForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </motion.div>
        )}

        {showStatus && (
          <motion.div
            key="status"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            onAnimationComplete={() => headingRef.current?.focus()}
          >
            <StatusScreen
              status={status}
              onRetry={handleRetry}
              onReset={handleReset}
              formattedAmount={formattedAmount}
              rawAmount={lastValuesRef.current?.amount}
              currency={lastValuesRef.current?.currency}
              headingRef={headingRef}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ProcessingOverlay />
    </main>
  );
}
