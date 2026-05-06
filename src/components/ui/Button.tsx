'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, className, children, ...props }, ref) => {
    const variantStyles = {
      primary: 'bg-accent text-white hover:bg-accent-hover tracking-[0.06em]',
      ghost: 'bg-transparent text-ink hover:bg-ink/5 tracking-normal',
      subtle: 'bg-ink/5 text-ink hover:bg-ink/10 tracking-normal',
    };

    const sizeStyles = {
      sm: 'h-9 px-3 text-xs',
      md: 'h-11 px-5 text-sm',
      lg: 'h-12 px-6 text-sm',
    };

    // Extract props that conflict with Framer Motion
    const { onDrag, onDragStart, onDragEnd, onAnimationStart, onAnimationEnd, ...buttonProps } = props;

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={cn(
          'inline-flex items-center justify-center gap-2.5',
          'font-sans font-medium',
          'rounded-sm',
          'border-none',
          'cursor-pointer',
          'transition-colors duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'focus-visible:outline-none',
          'focus-visible:shadow-[0_0_0_3px_var(--focus-ring)]',
          variantStyles[variant],
          sizeStyles[size],
          loading && 'pointer-events-none',
          className
        )}
        aria-disabled={loading ? 'true' : undefined}
        type="button"
        {...buttonProps}
      >
        {loading && (
          <motion.svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="28 10"
            />
          </motion.svg>
        )}
        <span style={{ opacity: loading ? 0.6 : 1 }}>{children}</span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
