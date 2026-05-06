'use client';

import { motion } from 'framer-motion';
import { useHistory } from '@/store/paymentStore';
import { formatCurrency, formatTimestamp, truncateTxId } from '@/utils/formatting';
import type { Transaction } from '@/types/payment';
import { cn } from '@/utils/cn';

interface TransactionHistoryProps {
  onSelect: (tx: Transaction) => void;
}

function TransactionHistory({ onSelect }: TransactionHistoryProps) {
  const history = useHistory();

  if (history.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-subtle">
          No transactions yet
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-baseline mb-5 pb-3 border-b border-border">
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-muted">
          {history.length.toString().padStart(2, '0')} records
        </span>
      </div>

      <ul role="list" className="flex flex-col">
        {history.map((tx, index) => (
          <motion.li
            key={tx.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.25, ease: 'easeOut' }}
          >
            <button
              onClick={() => onSelect(tx)}
              className="w-full text-left grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center py-4 border-b border-border hover:bg-ink/[0.02] hover:px-2 transition-all duration-200 rounded-sm focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--focus-ring)]"
              aria-label={`View details for transaction ${truncateTxId(tx.id)}, ${formatCurrency(tx.amount, tx.currency)}, ${tx.status}`}
            >
              {/* Status dot */}
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full flex-shrink-0',
                  tx.status === 'success' && 'bg-success',
                  tx.status === 'failed' && 'bg-danger',
                  tx.status === 'timeout' && 'bg-warning'
                )}
                aria-hidden="true"
              />

              {/* Meta column */}
              <div>
                <p className="font-mono text-[12px] text-ink">{truncateTxId(tx.id)}</p>
                <p className="font-mono text-[10px] text-ink-muted mt-0.5 tracking-[0.04em]">
                  {formatTimestamp(tx.createdAt)} ·{' '}
                  {tx.cardType !== 'unknown'
                    ? tx.cardType.charAt(0).toUpperCase() + tx.cardType.slice(1)
                    : 'Card'}{' '}
                  ••{tx.cardLast4}
                </p>
              </div>

              {/* Amount */}
              <span className="font-sans font-light text-[16px] tracking-[-0.01em] text-ink tabular-nums">
                {formatCurrency(tx.amount, tx.currency)}
              </span>

              {/* Arrow */}
              <svg
                width="14"
                height="8"
                viewBox="0 0 14 8"
                fill="none"
                aria-hidden="true"
                className="opacity-30 flex-shrink-0"
              >
                <path d="M0 4H13M13 4L9 1M13 4L9 7" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>
          </motion.li>
        ))}
      </ul>
    </>
  );
}

export default TransactionHistory;
export { TransactionHistory };
