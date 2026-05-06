import { z } from 'zod';
import type { CardType, Currency } from '@/types/payment';

export function luhnCheck(digits: string): boolean {
  if (!digits || !/^\d+$/.test(digits)) return false;

  let sum = 0;
  let shouldDouble = false;

  // Iterate right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export const cardholderNameSchema = z
  .string()
  .trim()
  .min(2, 'Required')
  .max(50, 'Maximum 50 characters')
  .regex(/^[\p{L}\s\-'.]+$/u, 'Only letters, spaces, hyphens, apostrophes, and periods')
  .refine((val) => /\p{L}/u.test(val), 'Must contain at least one letter');

export function buildCardNumberSchema(cardType: CardType) {
  if (cardType === 'amex') {
    return z
      .string()
      .refine((val) => /^\d{15}$/.test(val) && luhnCheck(val), 'Invalid card number');
  } else if (cardType === 'unknown') {
    return z
      .string()
      .refine((val) => /^\d{13,19}$/.test(val) && luhnCheck(val), 'Invalid card number');
  } else {
    return z
      .string()
      .refine((val) => /^\d{16}$/.test(val) && luhnCheck(val), 'Invalid card number');
  }
}

export const expirySchema = z
  .string()
  .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Use MM/YY format')
  .refine((val) => {
    const [mm, yy] = val.split('/');
    const month = parseInt(mm, 10);
    const year = 2000 + parseInt(yy, 10);
    
    // First day of next month after expiry
    const expiryDate = new Date(year, month, 1);
    
    return expiryDate.getTime() > Date.now();
  }, 'Card has expired');

export function buildCvvSchema(cardType: CardType): z.ZodString {
  const length = cardType === 'amex' ? 4 : 3;
  return z.string().regex(new RegExp(`^\\d{${length}}$`), 'Invalid CVV');
}

export const amountSchema = z
  .number()
  .refine((val) => Number.isFinite(val) && val > 0, 'Amount must be greater than zero')
  .refine((val) => val <= 9_999_999, 'Amount is too large')
  .refine((val) => Math.abs(val * 100 - Math.round(val * 100)) <= 1e-6, 'Maximum 2 decimal places');

export const currencySchema = z.enum(['INR', 'USD']);

export function buildPaymentFormSchema(cardType: CardType) {
  return z.object({
    cardholderName: cardholderNameSchema,
    cardNumber: buildCardNumberSchema(cardType),
    expiry: expirySchema,
    cvv: buildCvvSchema(cardType),
    amount: amountSchema,
    currency: currencySchema,
  });
}

export type PaymentFormValues = z.infer<ReturnType<typeof buildPaymentFormSchema>>;
