'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  leadingSlot?: React.ReactNode;
  trailingSlot?: React.ReactNode;
  isValid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leadingSlot, trailingSlot, isValid, className, ...props }, ref) => {
    const inputId = React.useId();
    const errorId = React.useId();
    const hintId = React.useId();

    const hasLeading = !!leadingSlot;
    const hasTrailing = !!trailingSlot;
    const showValidCheck = isValid && !trailingSlot;

    return (
      <div className="relative flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className={cn(
            'font-mono text-[10px] tracking-[0.15em] uppercase',
            error ? 'text-danger' : 'text-ink-muted'
          )}
        >
          {label}
        </label>

        <div className="relative flex items-center">
          {leadingSlot && (
            <div className="absolute left-3.5 pointer-events-none">{leadingSlot}</div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-12 bg-surface rounded-sm',
              'border',
              error ? 'border-danger' : isValid ? 'border-[rgba(63,93,58,0.5)]' : 'border-border',
              hasLeading ? 'pl-10' : 'pl-3.5',
              hasTrailing || showValidCheck ? 'pr-12' : 'pr-3.5',
              'text-sm text-ink font-sans',
              'placeholder:text-ink-subtle',
              'transition-[border-color,box-shadow] duration-500',
              'outline-none',
              error
                ? 'focus:border-danger focus:shadow-[0_0_0_3px_rgba(168,67,43,0.18)]'
                : 'focus:border-accent focus:shadow-[0_0_0_3px_var(--focus-ring)]',
              className
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            {...props}
          />

          {trailingSlot && (
            <div className="absolute right-3.5 pointer-events-none">{trailingSlot}</div>
          )}

          {/* Valid state checkmark */}
          <AnimatePresence>
            {showValidCheck && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="var(--success)" strokeWidth="1" opacity="0.5"/>
                  <path d="M4.5 7L6.5 9L9.5 5.5" stroke="var(--success)" strokeWidth="1.2"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-[11px] text-danger mt-1">
            {error}
          </p>
        )}

        {!error && hint && (
          <p id={hintId} className="text-[11px] text-ink-subtle mt-1">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
