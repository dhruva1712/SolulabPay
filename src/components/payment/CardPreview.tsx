'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCardNumber } from '@/utils/cardDetection';
import type { CardType } from '@/types/payment';

interface CardPreviewProps {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cardType: CardType;
  isCvvFocused: boolean;
}

const cardNetworkLabels: Record<CardType, string> = {
  visa: 'VISA',
  mastercard: 'MASTERCARD',
  amex: 'AMEX',
  unknown: '',
};

export default function CardPreview({
  cardholderName,
  cardNumber,
  expiry,
  cardType,
  isCvvFocused,
}: CardPreviewProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const halfWidth = rect.width / 2;
    const halfHeight = rect.height / 2;

    const rotateY = (dx / halfWidth) * 6;
    const rotateX = -(dy / halfHeight) * 6;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const formattedNumber = cardNumber ? formatCardNumber(cardNumber, cardType) : '•••• •••• •••• ••••';
  const displayName = cardholderName || 'YOUR NAME';
  const displayExpiry = expiry || 'MM/YY';

  return (
    <div style={{ perspective: '1200px' }} className="w-full">
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isCvvFocused ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        {/* Front face */}
        <motion.div
          className="absolute inset-0 overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            aspectRatio: '1.586/1',
            borderRadius: 0,
            background: 'linear-gradient(135deg, #F5EFE6 0%, #ECE3D2 100%)',
            boxShadow: 'var(--shadow-card-elevated)',
            rotateX: tilt.x,
            rotateY: tilt.y,
          }}
          initial={{ rotate: -1, y: 0 }}
          whileHover={{ rotate: 0, y: -4 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Noise texture overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              mixBlendMode: 'multiply',
              opacity: 0.06,
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />

          {/* Card content */}
          <div className="flex flex-col justify-between h-full p-7">
            {/* Top row */}
            <div className="flex justify-between items-start">
              {/* Brand mark */}
              <div className="font-sans font-medium text-[11px] tracking-[0.22em] uppercase text-ink flex items-center">
                <div
                  className="inline-block mr-2"
                  style={{
                    width: '5px',
                    height: '5px',
                    backgroundColor: 'var(--accent)',
                    verticalAlign: 'middle',
                  }}
                />
                SoluLab
              </div>

              {/* EMV chip */}
              <div
                className="relative"
                style={{
                  width: '44px',
                  height: '34px',
                  background: 'linear-gradient(135deg, #C9B894 0%, #A89669 50%, #8C7A4F 100%)',
                  borderRadius: '4px',
                  boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.15)',
                }}
              >
                <div
                  className="absolute"
                  style={{
                    inset: '6px',
                    borderRadius: '2px',
                    background: `
                      repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 6px),
                      repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 6px),
                      linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)
                    `,
                  }}
                />
              </div>
            </div>

            {/* Card number */}
            <div className="font-mono text-[19px] tracking-[0.12em] text-ink mt-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={formattedNumber}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {formattedNumber}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom row */}
            <div className="flex justify-between items-end">
              {/* Cardholder name */}
              <div>
                <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-ink-muted mb-1">
                  CARDHOLDER
                </div>
                <div className="font-sans font-medium text-[13px] tracking-[0.06em] uppercase text-ink">
                  {displayName}
                </div>
              </div>

              {/* Expiry */}
              <div>
                <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-ink-muted mb-1">
                  VALID THRU
                </div>
                <div className="font-mono text-[13px] tracking-[0.05em] text-ink">
                  {displayExpiry}
                </div>
              </div>

              {/* Network name */}
              <div className="font-sans font-semibold text-[13px] tracking-[0.18em] uppercase text-ink">
                {cardNetworkLabels[cardType]}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Back face */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            aspectRatio: '1.586/1',
            borderRadius: 0,
            background: 'linear-gradient(135deg, #F5EFE6 0%, #ECE3D2 100%)',
            boxShadow: 'var(--shadow-card-elevated)',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Noise texture overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              mixBlendMode: 'multiply',
              opacity: 0.06,
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />

          {/* Magnetic stripe */}
          <div
            className="absolute w-full h-10"
            style={{
              top: '18%',
              backgroundColor: 'rgba(28, 26, 23, 0.8)',
            }}
          />

          {/* Signature strip */}
          <div className="absolute mx-6 mt-4 h-10 flex items-center justify-end pr-4" style={{ top: 'calc(18% + 56px)', left: 0, right: 0, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <span className="font-mono text-[9px] text-ink-muted mr-3">CVV</span>
            <span className="font-mono text-sm text-ink">•••</span>
          </div>

          {/* Brand mark bottom left */}
          <div className="absolute bottom-6 left-6 font-sans font-medium text-[9px] tracking-[0.22em] uppercase text-ink flex items-center">
            <div
              className="inline-block mr-1.5"
              style={{
                width: '4px',
                height: '4px',
                backgroundColor: 'var(--accent)',
              }}
            />
            Solulab
          </div>
        </div>
      </motion.div>
    </div>
  );
}
