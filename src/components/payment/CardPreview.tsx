'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCardNumber } from '@/utils/cardDetection';
import type { CardType } from '@/types/payment';

interface CardPreviewProps {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cardType: CardType;
  isCvvFocused: boolean;
  isProcessing?: boolean;
  activeSlot?: 'cardNumber' | 'cardholderName' | 'expiry' | 'cvv' | null;
  isComplete?: boolean;
  autoShimmer?: boolean;
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
  isProcessing = false,
  activeSlot = null,
  isComplete = false,
  autoShimmer = false,
}: CardPreviewProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const wasCompleteRef = useRef(false);
  const [showActivationShimmer, setShowActivationShimmer] = useState(false);

  //Detect touch devices and reduced motion preference
  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Track completion state for activation animation
  useEffect(() => {
    if (isComplete && !wasCompleteRef.current) {
      // Just became complete — trigger activation shimmer
      setShowActivationShimmer(true);
      setTimeout(() => setShowActivationShimmer(false), 1200);
    }
    wasCompleteRef.current = isComplete ?? false;
  }, [isComplete]);

  // Auto-trigger shimmer when autoShimmer prop becomes true
  useEffect(() => {
    if (autoShimmer) {
      setShowActivationShimmer(true);
      setTimeout(() => setShowActivationShimmer(false), 1200);
    }
  }, [autoShimmer]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  }, [isTouchDevice, prefersReducedMotion]);

  const handleMouseEnter = () => {
    if (isTouchDevice || prefersReducedMotion) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (isTouchDevice || prefersReducedMotion) return;
    setIsHovered(false);
    setMousePos({ x: 0.5, y: 0.5 });
  };

  const formattedNumber = cardNumber ? formatCardNumber(cardNumber, cardType) : '•••• •••• •••• ••••';
  const displayName = cardholderName || 'YOUR NAME';
  const displayExpiry = expiry || 'MM/YY';

  // Tilt follows mouse position — max 14 degrees
  const rotateX = isHovered ? (mousePos.y - 0.5) * -14 : 0;
  const rotateY = isHovered ? (mousePos.x - 0.5) * 14 : 0;

  // Slot state helper
  const getSlotState = (slot: 'cardNumber' | 'cardholderName' | 'expiry') => {
    if (!activeSlot) return 'idle';
    if (activeSlot === slot) return 'active';
    return 'dimmed';
  };

  return (
    <div style={{ perspective: '1200px' }} className="w-full">
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isCvvFocused ? 180 : 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 100, damping: 20 }}
      >
        {/* Front face */}
        <motion.div
          ref={cardRef}
          className="absolute inset-0 overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            aspectRatio: '1.586/1',
            borderRadius: 0,
            background: 'var(--card-gradient)',
            boxShadow: 'var(--shadow-card-elevated)',
          }}
          animate={{
            rotateX,
            rotateY,
            scale: isHovered ? 1.02 : 1,
            opacity: isMobile ? (isComplete ? 1 : 0.85) : 1,
          }}
          transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 25 }}
          onMouseMove={prefersReducedMotion ? undefined : handleMouseMove}
          onMouseEnter={handleMouseEnter}
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
              zIndex: 1,
            }}
          />

          {/* Holographic shimmer layer */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 0,
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 350ms ease',
              background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 220, 180, 0.22) 25%, rgba(200, 180, 255, 0.18) 50%, transparent 70%)`,
              pointerEvents: 'none',
              mixBlendMode: 'overlay',
              zIndex: 2,
            }}
          />

          {/* Rainbow iridescent layer */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 0,
              opacity: isHovered ? 0.15 : 0,
              transition: 'opacity 400ms ease',
              background: `linear-gradient(${105 + mousePos.x * 60}deg, rgba(255, 0, 128, 0) 0%, rgba(255, 0, 128, 0.3) 20%, rgba(255, 200, 0, 0.3) 35%, rgba(0, 255, 128, 0.3) 50%, rgba(0, 128, 255, 0.3) 65%, rgba(128, 0, 255, 0.3) 80%, rgba(255, 0, 128, 0) 100%)`,
              pointerEvents: 'none',
              mixBlendMode: 'color',
              zIndex: 3,
            }}
          />

          {/* Specular highlight */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 0,
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 250ms ease',
              background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.15) 25%, transparent 45%)`,
              pointerEvents: 'none',
              mixBlendMode: 'screen',
              zIndex: 4,
            }}
          />

          {/* Processing sweep animation */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 5,
                  pointerEvents: 'none',
                  borderRadius: 0,
                  overflow: 'hidden',
                }}
              >
                {/* Sweep element */}
                <motion.div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    width: '40%',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)',
                    filter: 'blur(8px)',
                  }}
                  animate={{ left: ['-40%', '140%'] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    repeatDelay: 0.4,
                  }}
                />

                {/* Border pulse */}
                <motion.div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    border: '1px solid rgba(122, 31, 43, 0.3)',
                    borderRadius: 0,
                  }}
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Activation shimmer on completion */}
          <AnimatePresence>
            {showActivationShimmer && (
              <motion.div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 10,
                  pointerEvents: 'none',
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  initial={{ left: '-60%' }}
                  animate={{ left: '160%' }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    width: '50%',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)',
                    filter: 'blur(12px)',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card content */}
          <div className="flex flex-col justify-between h-full p-7">
            {/* Top row */}
            <div className="flex justify-between items-start">
              {/* Brand mark */}
              <div className="font-sans gap-3 flex flex-row font-medium text-[11px] tracking-[0.22em] uppercase text-ink flex items-center">
                <img
                  src="/logo.svg"
                  alt="SoluLab"
                  className="h-7 w-auto"
                  style={{ display: 'block' }}
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
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.15)${isHovered ? `, ${(mousePos.x - 0.5) * 6}px ${(mousePos.y - 0.5) * 6}px 12px rgba(255,255,255,0.4)` : ', 0 0 0 transparent'}`,
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
            <motion.div
              className="font-mono text-[19px] tracking-[0.12em] text-ink mt-4"
              animate={{
                opacity: getSlotState('cardNumber') === 'dimmed' ? 0.4 : 1,
                scale: getSlotState('cardNumber') === 'active' ? 1.02 : 1,
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={formattedNumber}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {formattedNumber}
                  {activeSlot === 'cardNumber' && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      style={{
                        display: 'inline-block',
                        width: '2px',
                        height: '1em',
                        backgroundColor: 'var(--accent)',
                        marginLeft: '4px',
                        verticalAlign: 'middle',
                      }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Bottom row */}
            <div className="flex justify-between items-end">
              {/* Cardholder name */}
              <motion.div
                animate={{
                  opacity: getSlotState('cardholderName') === 'dimmed' ? 0.4 : 1,
                  scale: getSlotState('cardholderName') === 'active' ? 1.02 : 1,
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-ink-muted mb-1">
                  CARDHOLDER
                </div>
                <div className="font-sans font-medium text-[13px] tracking-[0.06em] uppercase text-ink">
                  {displayName}
                </div>
                {activeSlot === 'cardholderName' && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    style={{
                      height: '1px',
                      background: 'var(--accent)',
                      marginTop: '3px',
                      transformOrigin: 'left',
                      opacity: 0.6,
                    }}
                  />
                )}
              </motion.div>

              {/* Expiry */}
              <motion.div
                animate={{
                  opacity: getSlotState('expiry') === 'dimmed' ? 0.4 : 1,
                  scale: getSlotState('expiry') === 'active' ? 1.02 : 1,
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-ink-muted mb-1">
                  VALID THRU
                </div>
                <div className="font-mono text-[13px] tracking-[0.05em] text-ink">
                  {displayExpiry}
                </div>
                {activeSlot === 'expiry' && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    style={{
                      height: '1px',
                      background: 'var(--accent)',
                      marginTop: '3px',
                      transformOrigin: 'left',
                      opacity: 0.6,
                    }}
                  />
                )}
              </motion.div>

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
            background: 'var(--card-gradient)',
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
          <motion.div
            className="absolute mx-6 mt-4 h-10 flex items-center justify-end pr-4"
            style={{ top: 'calc(18% + 56px)', left: 0, right: 0, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
            animate={
              isCvvFocused
                ? {
                  boxShadow: [
                    '0 0 0 0 rgba(122,31,43,0)',
                    '0 0 0 4px rgba(122,31,43,0.2)',
                    '0 0 0 0 rgba(122,31,43,0)',
                  ],
                }
                : {}
            }
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="font-mono text-[9px] text-ink-muted mr-3">CVV</span>
            <span className="font-mono text-sm text-ink">•••</span>
          </motion.div>

          {/* Brand mark bottom left */}
          <div className="absolute bottom-6 left-6 font-sans flex flex-row gap-3 font-medium text-[9px] tracking-[0.22em] uppercase text-ink flex items-center">
            <img
              src="/logo.svg"
              alt="SoluLab"
              className="h-7 w-auto"
              style={{ display: 'block' }}
            />
            Solulab
          </div>
        </div>
      </motion.div>
    </div>
  );
}
