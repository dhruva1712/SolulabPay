'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';
import { CountUp } from '@/components/ui/CountUp';
import TransactionSidebar from '@/components/payment/TransactionSidebar';
import { useHistory } from '@/store/paymentStore';
import { truncateTxId } from '@/utils/formatting';
import { MAX_ATTEMPTS } from '@/types/payment';
import type { PaymentStatus, Currency } from '@/types/payment';

interface StatusScreenProps {
  status: PaymentStatus;
  onRetry: () => void;
  onReset: () => void;
  formattedAmount: string;
  rawAmount?: number;
  currency?: Currency;
  headingRef?: React.RefObject<HTMLHeadingElement | null>;
}

function DotBurst() {
  // 8 dots radiating outward from center
  const dots = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * 360;
    const rad = (angle * Math.PI) / 180;
    const distance = 52; // px from center
    const x = Math.cos(rad) * distance;
    const y = Math.sin(rad) * distance;
    return { x, y, angle };
  });

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: '56px',
        height: '56px',
        pointerEvents: 'none',
      }}
    >
      {dots.map((dot, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: 'var(--success)',
            marginTop: '-2px',
            marginLeft: '-2px',
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: dot.x,
            y: dot.y,
            opacity: 0,
            scale: 0,
          }}
          transition={{
            duration: 0.6,
            delay: 0.5 + i * 0.02, // starts after checkmark completes
            ease: [0.2, 0, 0.8, 1],
          }}
        />
      ))}
    </div>
  );
}

export default function StatusScreen({
  status,
  onRetry,
  onReset,
  formattedAmount,
  rawAmount,
  currency,
  headingRef,
}: StatusScreenProps) {
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
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DotBurst />
                <motion.svg
                  width="56"
                  height="56"
                  viewBox="0 0 56 56"
                  fill="none"
                  initial="hidden"
                  animate="visible"
                >
                  <motion.circle
                    cx="28"
                    cy="28"
                    r="26"
                    fill="var(--success)"
                    variants={{
                      hidden: { scale: 0, opacity: 0 },
                      visible: {
                        scale: 1,
                        opacity: 1,
                        transition: { duration: 0.4, ease: 'easeOut' as const, delay: 0.1 },
                      },
                    }}
                  />
                  <motion.path
                    d="M18 28L24.5 34.5L38 21"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    variants={{
                      hidden: { pathLength: 0, opacity: 0 },
                      visible: {
                        pathLength: 1,
                        opacity: 1,
                        transition: { duration: 0.35, ease: 'easeOut' as const, delay: 0.5 },
                      },
                    }}
                  />
                </motion.svg>
              </div>

              <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-success">
                Payment confirmed
              </p>

              <h1 ref={headingRef} className="font-sans font-light text-[26px] tracking-[-0.015em] text-ink" tabIndex={-1}>
                Paid <span className="font-serif italic">instantly</span>.
              </h1>

              {rawAmount !== undefined && currency ? (
                <CountUp
                  value={rawAmount}
                  prefix={currency === 'INR' ? '₹ ' : '$ '}
                  duration={800}
                  className="font-sans font-light text-[52px] tracking-[-0.025em] leading-none text-ink"
                />
              ) : (
                <motion.div
                  className="font-sans font-light text-[52px] tracking-[-0.025em] leading-none text-ink"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {formattedAmount}
                </motion.div>
              )}

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
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 250, damping: 20, delay: 0.1 }}
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--danger)' }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M6 6L14 14M14 6L6 14"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </motion.div>

              <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-danger">
                Payment declined
              </p>

              <h1 ref={headingRef} className="font-sans font-light text-[26px] tracking-[-0.015em] text-ink" tabIndex={-1}>
                <span className="font-serif italic">Something</span> went wrong.
              </h1>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.35 }}
              >
                <div className="border border-border rounded-sm px-4 py-2.5 bg-surface">
                  <p className="font-mono text-[12px] text-ink-muted">{status.reason}</p>
                </div>
              </motion.div>

              {status.canRetry && (
                <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-muted">
                  Attempt {status.attempt} of {MAX_ATTEMPTS}
                </p>
              )}

              <div className="font-sans font-light text-[40px] tracking-[-0.02em] text-ink-muted/60">
                {formattedAmount}
              </div>

              {status.canRetry ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.45 }}
                >
                  <Button variant="primary" size="lg" onClick={onRetry}>
                    Try again
                  </Button>
                </motion.div>
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
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 250, damping: 20, delay: 0.1 }}
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--warning)' }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="1.4" fill="none" />
                    <path d="M 10 10 L 10 5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M 10 10 L 13 10" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </div>
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
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.45 }}
                >
                  <Button variant="primary" size="lg" onClick={onRetry}>
                    Try again
                  </Button>
                </motion.div>
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