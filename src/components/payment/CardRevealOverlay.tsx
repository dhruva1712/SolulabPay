'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2 } from 'lucide-react';
import CardPreview from '@/components/payment/CardPreview';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/utils/formatting';
import type { CardType, Currency } from '@/types/payment';

interface CardRevealOverlayProps {
  isVisible: boolean;
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cardType: CardType;
  amount: number | undefined;
  currency: Currency;
  isSubmitting: boolean;
  onPay: () => void;
  onEdit: () => void;
}

export default function CardRevealOverlay({
  isVisible,
  cardholderName,
  cardNumber,
  expiry,
  cardType,
  amount,
  currency,
  isSubmitting,
  onPay,
  onEdit,
}: CardRevealOverlayProps) {
  const [triggerShimmer, setTriggerShimmer] = useState(false);

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  // Trigger shimmer after card animation settles
  useEffect(() => {
    if (isVisible) {
      // Trigger after card animation settles (~900ms)
      const timer = setTimeout(() => setTriggerShimmer(true), 900);
      const resetTimer = setTimeout(() => setTriggerShimmer(false), 2100);
      return () => {
        clearTimeout(timer);
        clearTimeout(resetTimer);
      };
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="card-reveal-overlay"
          onClick={onEdit}
          className="lg:hidden fixed inset-0 z-50 bg-bg/80 backdrop-blur-md overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="min-h-full flex flex-col items-center justify-center px-6 py-12 gap-8"
          >
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="font-mono text-[10px] tracking-[0.25em] uppercase text-ink-muted"
            >
              Review your payment
            </motion.p>

            {/* Card — the hero animation */}
            <motion.div
              className="w-full max-w-[400px]"
              initial={{
                opacity: 0,
                scale: 0.3,
                rotateY: -90,
                rotateZ: -15,
                y: 40,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                rotateY: 0,
                rotateZ: 0,
                y: 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 80,
                damping: 15,
                delay: 0.15,
                opacity: { duration: 0.3, delay: 0.15 },
              }}
              style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
            >
              <CardPreview
                cardholderName={cardholderName}
                cardNumber={cardNumber}
                expiry={expiry}
                cardType={cardType}
                isCvvFocused={false}
                isProcessing={isSubmitting}
                activeSlot={null}
                isComplete={true}
                autoShimmer={triggerShimmer}
              />
            </motion.div>

            {/* Amount display */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.4, ease: [0.2, 0, 0, 1] }}
              className="text-center relative text-4xl bottom-[170px]"
            >
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-muted mb-2">
                Amount due
              </p>
              <p className="font-sans font-light text-[44px] tracking-[-0.025em] leading-none text-ink">
                {amount ? formatCurrency(amount, currency) : '—'}
              </p>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4, ease: [0.2, 0, 0, 1] }}
              className="w-full max-w-[400px] relative top-[230px] flex flex-col gap-3"
            >
              {/* Pay button */}
              <Button
                variant="primary"
                size="lg"
                loading={isSubmitting}
                disabled={isSubmitting}
                onClick={onPay}
                className="w-full"
              >
                {!isSubmitting && (
                  <span className='flex flex-row gap-3 items-center'>
                    Confirm payment
                    <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                      <path d="M0 4H13M13 4L9 1M13 4L9 7" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </span>
                )}
              </Button>

              {/* Edit details button */}
              <Button
                variant="ghost"
                size="md"
                onClick={onEdit}
                disabled={isSubmitting}
                className="w-full"
              >
                <span className='flex flex-row gap-3 items-center'>
                <Edit2 size={13} aria-hidden="true" />
                Edit details
              </span>

              </Button>
            </motion.div>

            {/* Security note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.4 }}
              className="font-mono text-[10px] pt-5 tracking-[0.1em] uppercase text-ink-subtle"
            >
             TLS 1.3
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
