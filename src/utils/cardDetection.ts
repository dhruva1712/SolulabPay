import type { CardType } from '@/types/payment';

export function detectCardType(digits: string): CardType {
  if (!digits) return 'unknown';

  // Visa: starts with '4'
  if (digits.startsWith('4')) return 'visa';

  // Amex: starts with '34' or '37'
  if (digits.startsWith('34') || digits.startsWith('37')) return 'amex';

  // Mastercard: starts with '51'..'55' OR first 4 digits as number is 2221..2720
  if (digits.startsWith('51') || digits.startsWith('52') || digits.startsWith('53') || 
      digits.startsWith('54') || digits.startsWith('55')) {
    return 'mastercard';
  }

  // Mastercard 2221-2720 range check
  if (digits.length >= 4) {
    const first4 = parseInt(digits.slice(0, 4), 10);
    if (first4 >= 2221 && first4 <= 2720) {
      return 'mastercard';
    }
  }

  return 'unknown';
}

export function getCvvLength(cardType: CardType): 3 | 4 {
  return cardType === 'amex' ? 4 : 3;
}

export function getCardNumberMaxLength(cardType: CardType): number {
  return cardType === 'amex' ? 15 : 16;
}

export function formatCardNumber(digits: string, cardType: CardType): string {
  // Strip non-digits defensively
  const cleaned = digits.replace(/\D/g, '');
  
  if (!cleaned) return '';

  if (cardType === 'amex') {
    // Amex: groups of 4-6-5
    const parts: string[] = [];
    if (cleaned.length > 0) parts.push(cleaned.slice(0, 4));
    if (cleaned.length > 4) parts.push(cleaned.slice(4, 10));
    if (cleaned.length > 10) parts.push(cleaned.slice(10, 15));
    return parts.join(' ');
  } else {
    // Others: groups of 4
    const parts: string[] = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      parts.push(cleaned.slice(i, i + 4));
    }
    return parts.join(' ');
  }
}
