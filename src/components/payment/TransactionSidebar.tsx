'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { useHistory } from '@/store/paymentStore';
import TransactionHistory from '@/components/payment/TransactionHistory';
import { formatCurrency, formatTimestamp, truncateTxId } from '@/utils/formatting';
import Button from '@/components/ui/Button';
import type { Transaction } from '@/types/payment';
import { MAX_ATTEMPTS } from '@/types/payment';
import { PaymentReceipt } from '@/components/payment/PaymentReceipt';
import { useDownloadReceipt } from '@/hooks/useDownloadReceipt';

interface TransactionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionSidebar({ isOpen, onClose }: TransactionSidebarProps) {
  const history = useHistory();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const { downloadReceipt, isDownloading } = useDownloadReceipt();

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement as HTMLElement;

    // Focus close button after mount
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 16);

    // ESC key handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedTx) {
          setSelectedTx(null);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen, selectedTx, onClose]);

  const handleCopy = async () => {
    if (selectedTx) {
      await navigator.clipboard.writeText(selectedTx.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const cardTypeLabel =
    selectedTx && selectedTx.cardType !== 'unknown'
      ? selectedTx.cardType.charAt(0).toUpperCase() + selectedTx.cardType.slice(1)
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
        onClick={() => {
          if (selectedTx) {
            setSelectedTx(null);
          } else {
            onClose();
          }
        }}
        aria-hidden="true"
      />

      {/* Panel */}
      <motion.div
        className="fixed z-40 right-0 top-0 bottom-0 w-full max-w-[480px] bg-surface border-l border-border flex flex-col shadow-[-8px_0_32px_rgba(28,26,23,0.08)]"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-border flex-shrink-0">
          {/* Left side - breadcrumb navigation */}
          {selectedTx === null ? (
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-muted mb-1">
                SoluLab Pay
              </p>
              <h2 id="sidebar-title" className="font-sans font-light text-[18px] tracking-[-0.005em] text-ink">
                Recent <span className="font-serif italic text-ink-muted">transactions</span>
              </h2>
            </div>
          ) : (
            <div>
              <button
                onClick={() => setSelectedTx(null)}
                className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-muted hover:text-ink transition-colors duration-150 flex items-center gap-2 mb-1"
                aria-label="Back to transaction list"
              >
                ← Transactions
              </button>
              <h2 id="sidebar-title" className="font-mono text-[14px] text-ink">
                {truncateTxId(selectedTx.id)}
              </h2>
            </div>
          )}

          {/* Right side - close button */}
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-sm text-ink-muted hover:text-ink hover:bg-ink/5 transition-colors duration-150 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--focus-ring)]"
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <AnimatePresence mode="wait">
            {selectedTx === null ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >
                <TransactionHistory onSelect={(tx) => setSelectedTx(tx)} />
              </motion.div>
            ) : (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.2 }}
              >
                {/* Detail content inline */}
                <div className="flex flex-col gap-8">
                  {/* Status block */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border text-[11px] font-mono tracking-[0.1em] uppercase ${
                        selectedTx.status === 'success'
                          ? 'border-success text-success bg-success/5'
                          : selectedTx.status === 'failed'
                          ? 'border-danger text-danger bg-danger/5'
                          : 'border-warning text-warning bg-warning/5'
                      }`}
                    >
                      {selectedTx.status === 'success'
                        ? 'Confirmed'
                        : selectedTx.status === 'failed'
                        ? 'Declined'
                        : 'Timed out'}
                    </span>

                    <div className="font-sans font-light text-[40px] tracking-[-0.025em] leading-none mt-4 text-ink">
                      {formatCurrency(selectedTx.amount, selectedTx.currency)}
                    </div>
                  </div>

                  {/* Detail rows */}
                  <div>
                    <div className="flex flex-col gap-1 py-4 border-b border-border">
                      <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-muted">
                        Transaction ID
                      </span>
                      <span className="font-sans text-[14px] text-ink break-all">{selectedTx.id}</span>
                    </div>

                    <div className="flex flex-col gap-1 py-4 border-b border-border">
                      <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-muted">
                        Date & time
                      </span>
                      <span className="font-sans text-[14px] text-ink">
                        {formatTimestamp(selectedTx.createdAt)}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 py-4 border-b border-border">
                      <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-muted">
                        Card
                      </span>
                      <span className="font-sans text-[14px] text-ink">
                        {cardTypeLabel} ending in {selectedTx.cardLast4}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 py-4 border-b border-border">
                      <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-muted">
                        Cardholder
                      </span>
                      <span className="font-sans text-[14px] text-ink">{selectedTx.cardholderName}</span>
                    </div>

                    <div className="flex flex-col gap-1 py-4 border-b border-border">
                      <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-muted">
                        Currency
                      </span>
                      <span className="font-sans text-[14px] text-ink">{selectedTx.currency}</span>
                    </div>

                    <div className="flex flex-col gap-1 py-4 border-b border-border">
                      <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-muted">
                        Attempts
                      </span>
                      <span className="font-sans text-[14px] text-ink">
                        {selectedTx.attempts} of {MAX_ATTEMPTS}
                      </span>
                    </div>

                    {(selectedTx.status === 'failed' || selectedTx.status === 'timeout') && (
                      <div className="flex flex-col gap-1 py-4 border-b border-border last:border-0">
                        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-muted">
                          Reason
                        </span>
                        <span className="font-sans text-[14px] text-ink">{selectedTx.reason ?? '—'}</span>
                      </div>
                    )}
                  </div>

                  {/* Copy button */}
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    <span className="font-mono text-[10px] tracking-[0.1em] uppercase">
                      {copied ? 'Copied!' : 'Copy transaction ID'}
                    </span>
                  </Button>

                  {/* Download receipt button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={isDownloading}
                    disabled={isDownloading}
                    onClick={() => downloadReceipt(selectedTx, receiptRef)}
                  >
                    <div className='flex flex-row gap-3 items-center'>
                    {!isDownloading && <Download size={12} aria-hidden="true" />}
                    {isDownloading ? 'Generating PDF...' : 'Download Receipt'}
                    </div>
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Off-screen receipt for PDF generation */}
      {selectedTx && <PaymentReceipt transaction={selectedTx} receiptRef={receiptRef} />}
    </>
  );
}
