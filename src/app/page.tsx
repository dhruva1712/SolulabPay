'use client';

import PaymentForm from '@/components/payment/PaymentForm';
import type { PaymentFormValues } from '@/utils/validation';

export default function Home() {
  return (
    <PaymentForm
      onSubmit={(values) => console.log('submit', values)}
      isSubmitting={false}
    />
  );
}
