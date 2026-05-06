'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { CardType } from '@/types/payment';
import { cn } from '@/utils/cn';

interface BadgeProps {
  cardType: CardType;
  visible: boolean;
}

const cardTypeLabels: Record<CardType, string> = {
  visa: 'Visa',
  mastercard: 'MC',
  amex: 'Amex',
  unknown: '',
};

function CardIcon({ cardType }: { cardType: CardType }) {
  if (cardType === 'visa') {
    return (
      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 0L6 8L10 0" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="miter" />
      </svg>
    );
  }

  if (cardType === 'mastercard') {
    return (
      <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1" fill="none" />
        <circle cx="9" cy="5" r="4" stroke="currentColor" strokeWidth="1" fill="none" />
      </svg>
    );
  }

  if (cardType === 'amex') {
    return (
      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M2 8L6 0L10 8M3.5 5.5H8.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return null;
}

export default function Badge({ cardType, visible }: BadgeProps) {
  return (
    <AnimatePresence>
      {visible && cardType !== 'unknown' && (
        <motion.span
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className={cn(
            'inline-flex items-center gap-1.5',
            'h-6 px-2',
            'border rounded-sm',
            'font-mono text-[10px] tracking-[0.1em] uppercase',
            'transition-colors duration-200',
            'border-accent text-accent bg-accent/5'
          )}
        >
          <CardIcon cardType={cardType} />
          {cardTypeLabels[cardType]}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
