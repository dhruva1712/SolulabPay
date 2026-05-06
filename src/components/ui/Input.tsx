'use client';

import React from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  leadingSlot?: React.ReactNode;
  trailingSlot?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leadingSlot, trailingSlot, className, ...props }, ref) => {
    const inputId = React.useId();
    const errorId = React.useId();
    const hintId = React.useId();

    const hasLeading = !!leadingSlot;
    const hasTrailing = !!trailingSlot;

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
              error ? 'border-danger' : 'border-border',
              hasLeading ? 'pl-10' : 'pl-3.5',
              hasTrailing ? 'pr-12' : 'pr-3.5',
              'text-sm text-ink font-sans',
              'placeholder:text-ink-subtle',
              'transition-[border-color,box-shadow] duration-200',
              'outline-none',
              error
                ? 'focus:border-danger focus:shadow-[0_0_0_3px_rgba(168,67,43,0.18)]'
                : 'focus:border-accent focus:shadow-[0_0_0_3px_var(--focus-ring)]',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            {...props}
          />

          {trailingSlot && (
            <div className="absolute right-3.5 pointer-events-none">{trailingSlot}</div>
          )}
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
