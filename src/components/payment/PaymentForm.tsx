'use client';

import { useForm, Controller, type ResolverResult, type ResolverOptions } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { buildPaymentFormSchema, type PaymentFormValues } from '@/utils/validation';
import { detectCardType, formatCardNumber, getCardNumberMaxLength, getCvvLength } from '@/utils/cardDetection';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import CardPreview from '@/components/payment/CardPreview';
import CardRevealOverlay from '@/components/payment/CardRevealOverlay';
import TransactionSidebar from '@/components/payment/TransactionSidebar';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
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
    const [expiryDisplay, setExpiryDisplay] = useState('');
    const [showOverlay, setShowOverlay] = useState(false);
    const cardTypeRef = useRef<CardType>('unknown');
    const expiryDigitsRef = useRef('');
    const formRef = useRef<HTMLFormElement>(null);
    const lastValidValuesRef = useRef<PaymentFormValues | null>(null);
    const history = useHistory();
    const status = useStatus();

    // Custom resolver that reads latest cardType from ref
    const resolver = useCallback(
        async (
            data: PaymentFormValues,
            context: unknown,
            options: ResolverOptions<PaymentFormValues>
        ): Promise<ResolverResult<PaymentFormValues>> => {
            const schema = buildPaymentFormSchema(cardTypeRef.current);
            const zodResolverFn = zodResolver(schema);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return zodResolverFn(data as any, context, options as any) as Promise<ResolverResult<PaymentFormValues>>;
        },
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
        mode: 'onTouched',
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

    const isComplete = isValid;

    // Update cardTypeRef when cardType changes
    useEffect(() => {
        cardTypeRef.current = cardType;
        clearErrors(['cardNumber', 'cvv']);
    }, [cardType, clearErrors]);

    const handleFormSubmit = (values: PaymentFormValues) => {
        if (isSubmitting) return;

        const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
        if (isMobile) {
            // Don't submit yet — show review overlay
            lastValidValuesRef.current = values;
            setShowOverlay(true);
            return;
        }

        // Desktop — submit directly
        onSubmit(values);
    };

    const handleEdit = () => {
        setShowOverlay(false);
        // Focus the first field after overlay closes
        setTimeout(() => {
            const firstInput = document.querySelector<HTMLInputElement>('input[name="cardholderName"]');
            firstInput?.focus();
        }, 350);
    };

    const handleOverlayPay = () => {
        if (lastValidValuesRef.current) {
            setShowOverlay(false);
            // Small delay so overlay exit animation plays before processing starts
            setTimeout(() => {
                if (lastValidValuesRef.current) {
                    onSubmit(lastValidValuesRef.current);
                }
            }, 300);
        }
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Strip everything except digits
        const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
        expiryDigitsRef.current = digits;

        // Build display: auto-insert slash after 2 digits
        let display = '';
        if (digits.length <= 2) {
            display = digits;
        } else {
            display = digits.slice(0, 2) + '/' + digits.slice(2);
        }
        setExpiryDisplay(display);

        // Store MM/YY in form only when 4 digits complete
        const formValue = digits.length === 4
            ? digits.slice(0, 2) + '/' + digits.slice(2, 4)
            : '';
        setValue('expiry', formValue, {
            shouldValidate: !!touchedFields.expiry,
            shouldDirty: true,
        });
    };

    const handleExpiryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            const digits = expiryDigitsRef.current;
            if (digits.length === 0) return;

            const newDigits = digits.slice(0, -1);
            expiryDigitsRef.current = newDigits;

            // Rebuild display
            let display = '';
            if (newDigits.length <= 2) {
                display = newDigits;
            } else {
                display = newDigits.slice(0, 2) + '/' + newDigits.slice(2);
            }
            setExpiryDisplay(display);

            const formValue = newDigits.length === 4
                ? newDigits.slice(0, 2) + '/' + newDigits.slice(2, 4)
                : '';
            setValue('expiry', formValue, {
                shouldValidate: !!touchedFields.expiry,
                shouldDirty: true,
            });
        }
    };

    const handleExpiryBlur = () => {
        const digits = expiryDigitsRef.current;
        const formValue = digits.length === 4
            ? digits.slice(0, 2) + '/' + digits.slice(2, 4)
            : '';
        setValue('expiry', formValue, { shouldValidate: true });
    };

    return (
        <div className="min-h-screen bg-bg">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-bg/95 backdrop-blur-sm border-b border-border px-6 md:px-12 py-4 flex justify-between items-center">
                <div className="font-sans gap-3 font-medium text-[13px] tracking-[0.2em] uppercase text-ink flex items-center">
                    <img
                        src="/logo.svg"
                        alt="SoluLab"
                        className="h-7 w-auto"
                        style={{ display: 'block' }}
                    />
                     SoluLab
                </div>
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase text-ink-muted hover:text-ink transition-colors duration-150 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--focus-ring)] rounded-sm min-h-[44px] min-w-[44px]"
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
                    <ThemeToggle />
                    <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-muted hidden sm:block">
                        Secure · TLS 1.3
                    </span>
                </div>
            </header>

            {/* Main content */}
            <main className="max-w-[1200px] mx-auto px-6 md:px-12 py-8 md:py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-24 items-start">
                    {/* Left column — title + form */}
                    <div className="order-2 lg:order-1 flex flex-col">
                        {/* Page title */}
                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: [0.2, 0, 0, 1], delay: 0 }}
                            className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-muted mb-4"
                        >
                            Confirm payment
                        </motion.p>
                        <motion.h1
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: [0.2, 0, 0, 1], delay: 0.08 }}
                            className="font-sans font-light text-[42px] md:text-[48px] leading-[1.1] tracking-[-0.025em] text-ink mb-4"
                        >
                            A quiet, <span className="font-serif italic text-accent">considered</span> checkout.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: [0.2, 0, 0, 1], delay: 0.16 }}
                            className="text-[15px] text-ink-muted mb-10 max-w-[36ch]"
                        >
                            Enter your card details below. Your information is encrypted end-to-end.
                        </motion.p>

                        {/* Form */}
                        <form ref={formRef} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5" noValidate>
                            {/* Cardholder name */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: [0.2, 0, 0, 1], delay: 0.24 }}
                            >
                                <Input
                                    label="Cardholder name"
                                    placeholder="Name on the card"
                                    error={touchedFields.cardholderName ? errors.cardholderName?.message : undefined}
                                    isValid={touchedFields.cardholderName && !errors.cardholderName}
                                    aria-required="true"
                                    {...register('cardholderName')}
                                />
                            </motion.div>

                            {/* Card number */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: [0.2, 0, 0, 1], delay: 0.3 }}
                            >
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
                                            isValid={touchedFields.cardNumber && !errors.cardNumber}
                                            inputMode="numeric"
                                            maxLength={19}
                                            className="font-mono"
                                            aria-required="true"
                                            trailingSlot={<Badge cardType={cardType} visible={cardType !== 'unknown'} />}
                                        />
                                    )}
                                />
                            </motion.div>

                            {/* Expiry + CVV */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: [0.2, 0, 0, 1], delay: 0.36 }}
                                className="grid grid-cols-2 gap-4"
                            >
                                <Input
                                    label="Expiry"
                                    placeholder="MM/YY"
                                    value={expiryDisplay}
                                    onChange={handleExpiryChange}
                                    onKeyDown={handleExpiryKeyDown}
                                    onBlur={handleExpiryBlur}
                                    inputMode="numeric"
                                    maxLength={5}
                                    className="font-mono"
                                    error={touchedFields.expiry ? errors.expiry?.message : undefined}
                                    isValid={touchedFields.expiry && !errors.expiry}
                                    aria-required="true"
                                    aria-label="Card expiry date"
                                />

                                <Input
                                    label="CVV"
                                    placeholder="•••"
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={getCvvLength(cardType)}
                                    className="font-mono"
                                    error={touchedFields.cvv ? errors.cvv?.message : undefined}
                                    isValid={touchedFields.cvv && !errors.cvv}
                                    aria-required="true"
                                    onFocus={() => setIsCvvFocused(true)}
                                    {...register('cvv', {
                                        onBlur: () => setIsCvvFocused(false),
                                    })}
                                />
                            </motion.div>

                            {/* Amount */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: [0.2, 0, 0, 1], delay: 0.42 }}
                            >
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
                                                // Strip non-numeric characters except decimal point
                                                const sanitised = value.replace(/[^0-9.]/g, '');
                                                // Only allow one decimal point
                                                const parts = sanitised.split('.');
                                                const cleaned = parts.length > 2
                                                    ? parts[0] + '.' + parts.slice(1).join('')
                                                    : sanitised;
                                                const parsed = parseFloat(cleaned);
                                                field.onChange(isNaN(parsed) ? undefined : parsed);
                                            }}
                                            onBlur={field.onBlur}
                                            error={touchedFields.amount ? errors.amount?.message : undefined}
                                            isValid={touchedFields.amount && !errors.amount}
                                            aria-required="true"
                                            leadingSlot={
                                                <AnimatePresence mode="wait">
                                                    <motion.span
                                                        key={currency}
                                                        initial={{ opacity: 0, y: -4 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 4 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="font-mono text-[14px] text-ink-muted select-none pointer-events-none"
                                                    >
                                                        {currency === 'INR' ? '₹' : '$'}
                                                    </motion.span>
                                                </AnimatePresence>
                                            }
                                            trailingSlot={
                                                <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.1em]">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setCurrency('INR');
                                                            setValue('currency', 'INR', { shouldValidate: true, shouldDirty: true });
                                                            trigger('amount');
                                                        }}
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
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setCurrency('USD');
                                                            setValue('currency', 'USD', { shouldValidate: true, shouldDirty: true });
                                                            trigger('amount');
                                                        }}
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
                            </motion.div>

                            {/* Submit button */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: [0.2, 0, 0, 1], delay: 0.54 }}
                                className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                            >
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    loading={isSubmitting}
                                    disabled={isSubmitting}
                                    className={cn(
                                        'flex flex-row gap-3 w-full sm:w-auto',
                                        !isValid && !isSubmitting && 'opacity-60 cursor-not-allowed'
                                    )}
                                >
                                    <span className='flex flex-row gap-3 items-center'>
                                        Pay securely
                                        <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                                            <path d="M0 4H13M13 4L9 1M13 4L9 7" stroke="currentColor" strokeWidth="1.2" />
                                        </svg>
                                    </span>
                                </Button>
                            </motion.div>
                        </form>
                    </div>
                    {/* Right column — card preview — hidden on mobile, visible on desktop */}
                    <div className="order-1 lg:order-2 hidden lg:block lg:sticky lg:top-[88px] lg:self-start">
                        <motion.div
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, ease: [0.2, 0, 0, 1], delay: 0.2 }}
                            className="w-full"
                        >
                            <CardPreview
                                cardholderName={watch('cardholderName') || ''}
                                cardNumber={watch('cardNumber') || ''}
                                expiry={expiryDisplay}
                                cardType={cardType}
                                isCvvFocused={isCvvFocused}
                                isProcessing={status.kind === 'processing'}
                            />
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border px-6 md:px-12 py-6 flex justify-between items-center">
                <div className="font-mono text-[10px] text-ink-subtle tracking-[0.1em] uppercase">
                    © 2026 SoluLab Pay
                </div>
                <div className="hidden md:block font-mono text-[10px] text-ink-subtle tracking-[0.08em]">
                    Crafted by Dhruv, powered by Claude 🤍 & Coffee ☕
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

            {/* Card Reveal Overlay — mobile only */}
            <CardRevealOverlay
                isVisible={showOverlay}
                cardholderName={watch('cardholderName') || ''}
                cardNumber={watch('cardNumber') || ''}
                expiry={expiryDisplay}
                cardType={cardType}
                amount={watch('amount')}
                currency={currency}
                isSubmitting={isSubmitting}
                onPay={handleOverlayPay}
                onEdit={handleEdit}
            />
        </div>
    );
}
