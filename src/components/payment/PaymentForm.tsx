'use client';

import { useForm, Controller, type ResolverResult, type ResolverOptions } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { buildPaymentFormSchema, type PaymentFormValues } from '@/utils/validation';
import { detectCardType, formatCardNumber, getCardNumberMaxLength, getCvvLength } from '@/utils/cardDetection';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import CardPreview from '@/components/payment/CardPreview';
import TransactionSidebar from '@/components/payment/TransactionSidebar';
import { useHistory, useStatus } from '@/store/paymentStore';
import { cn } from '@/utils/cn';
import type { CardType, Currency } from '@/types/payment';

interface PaymentFormProps {
  onSubmit: (values: PaymentFormValues) => void;
  isSubmitting: boolean;
}

export default function PaymentForm({ onSubmit, isSubmitting }: PaymentFormProps) {
  const [cardType, setCardType] = useState<CardType>('unknown');
  const [isCvvFocused, setIsCvvFocused] = useState(false);
  const [currency, setCurrency] = useState<Currency>('INR');
  const [cardDisplayValue, setCardDisplayValue] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isBackspaceRef = useRef(false);
  const cardTypeRef = useRef<CardType>('unknown');
  const history = useHistory();
  const status = useStatus();

  // Custom resolver that reads latest cardType from ref
  const resolver = useCallback(
    async (
      data: PaymentFormValues,
      context: unknown,
      options: ResolverOptions<PaymentFormValues>
    ): Promise<ResolverResult<PaymentFormValues>> =>
      zodResolver(buildPaymentFormSchema(cardTypeRef.current))(data, context, options),
    []
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    clearErrors,
    formState: { errors, isValid, touchedFields },
  } = useForm<PaymentFormValues>({
    resolver,
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: {
      cardholderName: '',
      cardNumber: '',
      expiry: '',
      cvv: '',
      amount: undefined,
      currency: 'INR',
    },
  });

  // Update cardTypeRef when cardType changes
  useEffect(() => {
    cardTypeRef.current = cardType;
    clearErrors(['cardNumber', 'cvv']);
  }, [cardType, clearErrors]);

  const handleFormSubmit = (values: PaymentFormValues) => {
    if (isSubmitting) return;
    onSubmit(values);
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    setValue('currency', newCurrency);
    trigger('amount');
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg/95 backdrop-blur-sm border-b border-border px-6 md:px-12 py-4 flex justify-between items-center">
        <div className="font-sans font-medium text-[13px] tracking-[0.2em] uppercase text-ink flex items-center">
          <div
            className="inline-block mr-2"
            style={{
              width: '5px',
              height: '5px',
              backgroundColor: 'var(--accent)',
            }}
          />
          SoluLab
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase text-ink-muted hover:text-ink transition-colors duration-150 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--focus-ring)] rounded-sm"
            aria-label={`Open transaction history, ${history.length} transactions`}
          >
            <Clock size={12} aria-hidden="true" />
            Transactions
            {history.length > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 bg-accent text-white font-mono text-[9px] rounded-full">
                {history.length > 9 ? '9+' : history.length}
              </span>
            )}
          </button>
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-muted hidden sm:block">
            Secure · TLS 1.3
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1200px] mx-auto px-6 md:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left column - Form */}
          <div>
            {/* Page title */}
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-muted mb-4">
              Confirm payment
            </p>
            <h1 className="font-sans font-light text-[42px] md:text-[48px] leading-[1.1] tracking-[-0.025em] text-ink mb-4">
              A quiet, <span className="font-serif italic text-accent">considered</span> checkout.
            </h1>
            <p className="text-[15px] text-ink-muted mb-10 max-w-[36ch]">
              Enter your card details below. Your information is encrypted end-to-end.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" noValidate>
              {/* Cardholder name */}
              <Input
                label="Cardholder name"
                placeholder="Name on the card"
                error={touchedFields.cardholderName ? errors.cardholderName?.message : undefined}
                aria-required="true"
                {...register('cardholderName')}
              />

              {/* Card number */}
              <Controller
                name="cardNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Card number"
                    placeholder="0000 0000 0000 0000"
                    value={cardDisplayValue}
                    onChange={(e) => {
                      const input = e.target.value;
                      const rawDigits = input.replace(/\D/g, '');
                      
                      const newCardType = detectCardType(rawDigits);
                      setCardType(newCardType);
                      cardTypeRef.current = newCardType;

                      const maxLength = getCardNumberMaxLength(newCardType);
                      const truncated = rawDigits.slice(0, maxLength);
                      
                      const formatted = formatCardNumber(truncated, newCardType);
                      setCardDisplayValue(formatted);
                      
                      field.onChange(truncated);
                    }}
                    onBlur={field.onBlur}
                    error={touchedFields.cardNumber ? errors.cardNumber?.message : undefined}
                    inputMode="numeric"
                    maxLength={19}
                    className="font-mono"
                    aria-required="true"
                    trailingSlot={<Badge cardType={cardType} visible={cardType !== 'unknown'} />}
                  />
                )}
              />

              {/* Expiry + CVV */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Expiry"
                  placeholder="MM/YY"
                  inputMode="numeric"
                  maxLength={5}
                  className="font-mono"
                  error={touchedFields.expiry ? errors.expiry?.message : undefined}
                  aria-required="true"
                  onKeyDown={(e) => {
                    isBackspaceRef.current = e.key === 'Backspace';
                  }}
                  {...register('expiry', {
                    onChange: (e) => {
                      const input = e.target.value;
                      const digits = input.replace(/\D/g, '');
                      
                      let formatted = digits;
                      if (digits.length >= 2 && !isBackspaceRef.current) {
                        formatted = digits.slice(0, 2) + '/' + digits.slice(2, 4);
                      }
                      
                      e.target.value = formatted;
                    },
                  })}
                />

                <Input
                  label="CVV"
                  placeholder="•••"
                  type="password"
                  inputMode="numeric"
                  maxLength={getCvvLength(cardType)}
                  className="font-mono"
                  error={touchedFields.cvv ? errors.cvv?.message : undefined}
                  aria-required="true"
                  onFocus={() => setIsCvvFocused(true)}
                  {...register('cvv', {
                    onBlur: () => setIsCvvFocused(false),
                  })}
                />
              </div>

              {/* Amount */}
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Amount"
                    placeholder="0.00"
                    inputMode="decimal"
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      const parsed = parseFloat(value);
                      field.onChange(isNaN(parsed) ? undefined : parsed);
                    }}
                    onBlur={field.onBlur}
                    error={touchedFields.amount ? errors.amount?.message : undefined}
                    aria-required="true"
                    trailingSlot={
                      <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.1em]">
                        <button
                          type="button"
                          onClick={() => handleCurrencyChange('INR')}
                          className={cn(
                            'transition-colors',
                            currency === 'INR'
                              ? 'text-accent border-b border-accent font-medium'
                              : 'text-ink-muted hover:text-ink'
                          )}
                        >
                          INR
                        </button>
                        <span className="text-ink-subtle">/</span>
                        <button
                          type="button"
                          onClick={() => handleCurrencyChange('USD')}
                          className={cn(
                            'transition-colors',
                            currency === 'USD'
                              ? 'text-accent border-b border-accent font-medium'
                              : 'text-ink-muted hover:text-ink'
                          )}
                        >
                          USD
                        </button>
                      </div>
                    }
                  />
                )}
              />

              {/* Submit button */}
              <div className="mt-8 flex items-center gap-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  disabled={!isValid || isSubmitting}
                  className='flex flex-row gap-3'
                >
                  Pay securely
                </Button>
                <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-subtle">
                  256-bit encryption
                </span>
              </div>
            </form>
          </div>

          {/* Right column - Card preview */}
          <div className="lg:sticky lg:top-[88px] lg:self-start">
            <CardPreview
              cardholderName={watch('cardholderName') || ''}
              cardNumber={watch('cardNumber') || ''}
              expiry={watch('expiry') || ''}
              cardType={cardType}
              isCvvFocused={isCvvFocused}
              isProcessing={status.kind === 'processing'}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-24 px-6 md:px-12 py-6 flex justify-between items-center">
        <div className="font-mono text-[10px] text-ink-subtle tracking-[0.1em] uppercase">
          © 2026 SoluLab Pay
        </div>
        <div className="font-mono text-[10px] text-ink-subtle tracking-[0.1em] uppercase">
          Assignment Demo
        </div>
      </footer>

      {/* Transaction Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <TransactionSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
