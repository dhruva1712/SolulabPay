import type { Currency, CardType } from '@/types/payment';
import { formatCardNumber } from '@/utils/cardDetection';

export function formatCurrency(amount: number, currency: Currency): string {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}

export function formatTimestamp(ms: number): string {
  const formatted = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(ms);

  // Replace 'am'/'pm' with 'AM'/'PM'
  return formatted.replace(/am$/i, 'AM').replace(/pm$/i, 'PM');
}

export function maskCardNumber(digits: string, cardType: CardType): string {
  const formatted = formatCardNumber(digits, cardType);
  
  // Get last 4 digits
  const last4 = digits.slice(-4);
  
  // Replace all characters except last 4 digits and spaces with '•'
  let result = '';
  let digitsEncountered = 0;
  const totalDigits = digits.length;
  
  for (let i = 0; i < formatted.length; i++) {
    const char = formatted[i];
    
    if (char === ' ') {
      result += ' ';
    } else {
      digitsEncountered++;
      if (digitsEncountered > totalDigits - 4) {
        result += char;
      } else {
        result += '•';
      }
    }
  }
  
  return result;
}

export function getLast4(digits: string): string {
  if (digits.length <= 4) return digits;
  return digits.slice(-4);
}

export function truncateTxId(id: string): string {
  if (id.length <= 9) return id;
  return `${id.slice(0, 4)}…${id.slice(-4)}`;
}
