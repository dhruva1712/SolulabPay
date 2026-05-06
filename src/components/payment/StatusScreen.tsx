'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';
import TransactionSidebar from '@/components/payment/TransactionSidebar';
import { useHistory } from '@/store/paymentStore';
import { truncateTxId } from '@/utils/formatting';
import { MAX_ATTEMPTS } from '@/types/payment';
import type { PaymentStatus } from '@/types/payment';

interface StatusScreenProps {
  status: PaymentStatus;
  onRetry: () => void;
  onReset: () => void;
  formattedAmount: string;
  headingRef?: React.RefObject<HTMLHeadingElement | null>;
}

export default function StatusScreen({ status, onRetry, onReset, formattedAmount, headingRef }: StatusScreenProps) {
  const [copied, setCopied] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const history = useHistory();

  if (status.kind === 'idle' || status.kind === 'processing') {
    return null;
  }

  const handleCopyTxId = async () => {
    if (status.kind === 'success') {
      await navigator.clipboard.writeText(status.txId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg/95 backdrop-blur-sm border-b border-border px-6 md:px-12 py-4 flex justify-between items-center">
        <div className="font-sans font-medium text-[13px] tracking-[0.2em] uppercase text-ink flex items-center">
          <div
            className="inline-block mr-2"
            style={{
              width: '5px',
              height: '5px',
              backgroundColor: 'var(--accent)',
            }}
          />
          SoluLab
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase text-ink-muted hover:text-ink transition-colors duration-150 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--focus-ring)] rounded-sm"
            aria-label={`Open transaction history, ${history.length} transactions`}
          >
            <Clock size={12} aria-hidden="true" />
            Transactions
            {history.length > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 bg-accent text-white font-mono text-[9px] rounded-full">
                {history.length > 9 ? '9+' : history.length}
              </span>
            )}
          </button>
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-muted hidden sm:block">
            Secure · TLS 1.3
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-[480px] w-full mx-auto text-center flex flex-col items-center gap-6">
          {/* SUCCESS */}
          {status.kind === 'success' && (
            <>
              <motion.div
                className="w-14 h-14 border border-success rounded-full flex items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M5 10L8.5 13.5L15 7"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-success"
                  />
                </svg>
              </motion.div>

              <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-success">
                Payment confirmed
              </p>

              <h1 ref={headingRef} className="font-sans font-light text-[26px] tracking-[-0.015em] text-ink" tabIndex={-1}>
                Paid <span className="font-serif italic">instantly</span>.
              </h1>

              <motion.div
                className="font-sans font-light text-[52px] tracking-[-0.025em] leading-none text-ink"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {formattedAmount}
              </motion.div>

              <p className="font-mono text-[11px] text-ink-muted tracking-[0.05em]">
                Tx · {truncateTxId(status.txId)} · {status.transaction.attempts} attempt
                {status.transaction.attempts > 1 ? 's' : ''}
              </p>

              <Button variant="ghost" size="sm" onClick={handleCopyTxId} className='flex flex-row gap-3'>
                <Copy size={12} />
                <span className="font-mono text-[10px] tracking-[0.1em] uppercase">
                  {copied ? 'Copied!' : 'Copy ID'}
                </span>
              </Button>

              <div className="mt-4">
                <Button variant="subtle" size="md" onClick={onReset}>
                  New payment
                </Button>
              </div>
            </>
          )}

          {/* FAILED */}
          {status.kind === 'failed' && (
            <>
              <motion.div
                className="w-14 h-14 border border-danger rounded-full flex items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M6 6L14 14M14 6L6 14"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    className="text-danger"
                  />
                </svg>
              </motion.div>

              <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-danger">
                Payment declined
              </p>

              <h1 ref={headingRef} className="font-sans font-light text-[26px] tracking-[-0.015em] text-ink" tabIndex={-1}>
                <span className="font-serif italic">Something</span> went wrong.
              </h1>

              <div className="border border-border rounded-sm px-4 py-2.5 bg-surface">
                <p className="font-mono text-[12px] text-ink-muted">{status.reason}</p>
              </div>

              {status.canRetry && (
                <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-muted">
                  Attempt {status.attempt} of {MAX_ATTEMPTS}
                </p>
              )}

              <div className="font-sans font-light text-[40px] tracking-[-0.02em] text-ink-muted/60">
                {formattedAmount}
              </div>

              {status.canRetry ? (
                <Button variant="primary" size="lg" onClick={onRetry}>
                  Try again
                  <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                    <path d="M0 4H13M13 4L9 1M13 4L9 7" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </Button>
              ) : (
                <>
                  <p className="font-mono text-[11px] text-ink-muted tracking-[0.05em] max-w-[32ch] mx-auto text-center">
                    Maximum attempts reached. Please contact your bank or try a different card.
                  </p>
                  <Button variant="subtle" size="md" onClick={onReset}>
                    Start over
                  </Button>
                </>
              )}
            </>
          )}

          {/* TIMEOUT */}
          {status.kind === 'timeout' && (
            <>
              <motion.div
                className="w-14 h-14 border border-warning rounded-full flex items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-warning">
                  <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.2" fill="none" />
                  <path d="M 10 10 L 10 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M 10 10 L 13 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </motion.div>

              <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-warning">
                Request timed out
              </p>

              <h1 ref={headingRef} className="font-sans font-light text-[26px] tracking-[-0.015em] text-ink" tabIndex={-1}>
                The gateway took too <span className="font-serif italic">long</span>.
              </h1>

              <p className="font-mono text-[11px] text-ink-muted max-w-[36ch]">
                Your card has not been charged. This is a network delay, not a card error.
              </p>

              {status.canRetry && (
                <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-muted">
                  Attempt {status.attempt} of {MAX_ATTEMPTS}
                </p>
              )}

              <div className="font-sans font-light text-[40px] tracking-[-0.02em] text-ink-muted/60">
                {formattedAmount}
              </div>

              {status.canRetry ? (
                <Button variant="primary" size="lg" onClick={onRetry}>
                  Try again
                  <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                    <path d="M0 4H13M13 4L9 1M13 4L9 7" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </Button>
              ) : (
                <>
                  <p className="font-mono text-[11px] text-ink-muted tracking-[0.05em] max-w-[32ch] mx-auto text-center">
                    Maximum attempts reached. Please contact your bank or try a different card.
                  </p>
                  <Button variant="subtle" size="md" onClick={onReset}>
                    Start over
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* Transaction Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <TransactionSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
