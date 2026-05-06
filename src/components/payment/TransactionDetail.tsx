'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { formatCurrency, formatTimestamp, truncateTxId } from '@/utils/formatting';
import Button from '@/components/ui/Button';
import type { Transaction } from '@/types/payment';
import { MAX_ATTEMPTS } from '@/types/payment';

interface TransactionDetailProps {
  transaction: Transaction;
  onClose: () => void;
}

export default function TransactionDetail({ transaction, onClose }: TransactionDetailProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement;

    // Focus close button after mount
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 16);

    // ESC key handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap
      if (e.key === 'Tab' && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(transaction.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cardTypeLabel =
    transaction.cardType !== 'unknown'
      ? transaction.cardType.charAt(0).toUpperCase() + transaction.cardType.slice(1)
      : 'Card';

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-30 bg-ink/20 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <motion.div
        ref={panelRef}
        className="fixed z-40 bg-surface border-l border-border right-0 top-0 bottom-0 w-full max-w-[440px] flex flex-col overflow-y-auto shadow-[-8px_0_32px_rgba(28,26,23,0.08)]"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tx-detail-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-border">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-muted mb-1">
              Transaction detail
            </p>
            <h2 id="tx-detail-title" className="font-mono text-[14px] text-ink">
              {truncateTxId(transaction.id)}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-sm text-ink-muted hover:text-ink hover:bg-ink/5 transition-colors duration-150 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--focus-ring)]"
            aria-label="Close transaction detail"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-8 flex flex-col gap-8">
          {/* Status block */}
          <div>
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border text-[11px] font-mono tracking-[0.1em] uppercase ${
                transaction.status === 'success'
                  ? 'border-success text-success bg-success/5'
                  : transaction.status === 'failed'
                  ? 'border-danger text-danger bg-danger/5'
                  : 'border-warning text-warning bg-warning/5'
              }`}
            >
              {transaction.status === 'success'
                ? 'Confirmed'
                : transaction.status === 'failed'
                ? 'Declined'
                : 'Timed out'}
            </span>

            <div className="font-sans font-light text-[40px] tracking-[-0.025em] leading-none mt-4 text-ink">
              {formatCurrency(transaction.amount, transaction.currency)}
            </div>
          </div>

          {/* Detail rows */}
          <div>
            <div className="flex flex-col gap-1 py-4 border-b border-border">
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-muted">
                Transaction ID
              </span>
              <span className="font-sans text-[14px] text-ink break-all">{transaction.id}</span>
            </div>

            <div className="flex flex-col gap-1 py-4 border-b border-border">
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-muted">
                Date & time
              </span>
              <span className="font-sans text-[14px] text-ink">
                {formatTimestamp(transaction.createdAt)}
              </span>
            </div>

            <div className="flex flex-col gap-1 py-4 border-b border-border">
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-muted">
                Card
              </span>
              <span className="font-sans text-[14px] text-ink">
                {cardTypeLabel} ending in {transaction.cardLast4}
              </span>
            </div>

            <div className="flex flex-col gap-1 py-4 border-b border-border">
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-muted">
                Cardholder
              </span>
              <span className="font-sans text-[14px] text-ink">{transaction.cardholderName}</span>
            </div>

            <div className="flex flex-col gap-1 py-4 border-b border-border">
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-muted">
                Currency
              </span>
              <span className="font-sans text-[14px] text-ink">{transaction.currency}</span>
            </div>

            <div className="flex flex-col gap-1 py-4 border-b border-border">
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-muted">
                Attempts
              </span>
              <span className="font-sans text-[14px] text-ink">
                {transaction.attempts} of {MAX_ATTEMPTS}
              </span>
            </div>

            {(transaction.status === 'failed' || transaction.status === 'timeout') && (
              <div className="flex flex-col gap-1 py-4 border-b border-border last:border-0">
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-muted">
                  Reason
                </span>
                <span className="font-sans text-[14px] text-ink">{transaction.reason ?? '—'}</span>
              </div>
            )}
          </div>

          {/* Copy button */}
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            <span className="font-mono text-[10px] tracking-[0.1em] uppercase">
              {copied ? 'Copied!' : 'Copy transaction ID'}
            </span>
          </Button>

          {/* Close button */}
          <Button variant="subtle" size="md" onClick={onClose} className="mt-auto">
            Close
          </Button>
        </div>
      </motion.div>
    </>
  );
}
