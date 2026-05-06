'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useStatus } from '@/store/paymentStore';
import { MAX_ATTEMPTS } from '@/types/payment';

export default function ProcessingOverlay() {
  const status = useStatus();

  return (
    <AnimatePresence>
      {status.kind === 'processing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-20 flex items-end justify-center pb-12 pointer-events-none"
        >
          <div className="pointer-events-auto bg-surface border border-border rounded-sm px-8 py-5 flex items-center gap-5 shadow-[var(--shadow-card-elevated)]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                  strokeDasharray="32 32"
                  fill="none"
                />
              </svg>
            </motion.div>

            <div>
              <p className="font-sans text-[14px] font-medium text-ink">Processing payment</p>
              <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-muted mt-0.5">
                Attempt {status.attempt} of {MAX_ATTEMPTS} · please wait
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
