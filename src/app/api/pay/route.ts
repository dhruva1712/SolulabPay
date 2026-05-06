import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const serverPayloadSchema = z.object({
  txId: z.string().uuid(),
  cardholderName: z.string().min(2).max(50),
  cardNumber: z.string().regex(/^\d{15,16}$/),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/),
  cvv: z.string().regex(/^\d{3,4}$/),
  amount: z.number().positive().max(9_999_999),
  currency: z.enum(['INR', 'USD']),
  cardType: z.enum(['visa', 'mastercard', 'amex', 'unknown']),
  attempt: z.number().int().min(1).max(3),
});

type Outcome = 'success' | 'failed' | 'timeout';

function pickOutcome(): Outcome {
  const rand = Math.random();
  if (rand < 0.60) return 'success';
  if (rand < 0.85) return 'failed';
  return 'timeout';
}

function pickFailureReason(): string {
  const reasons = [
    'Insufficient funds',
    'Card declined by issuer',
    'Do not honour',
    'Suspected fraud — contact your bank',
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const result = serverPayloadSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { txId } = result.data;

  const forceOutcome = request.headers.get('x-force-outcome');
  const outcome: Outcome =
    forceOutcome === 'success' || forceOutcome === 'failed' || forceOutcome === 'timeout'
      ? forceOutcome
      : pickOutcome();

  // STEP C5 — Handle each outcome
  if (outcome === 'success') {
    const ms = Math.floor(Math.random() * (2200 - 1500 + 1)) + 1500;
    await delay(ms);
    return NextResponse.json(
      { outcome: 'success', txId, processedAt: Date.now() },
      { status: 200 }
    );
  }

  if (outcome === 'failed') {
    const ms = Math.floor(Math.random() * (2200 - 1500 + 1)) + 1500;
    await delay(ms);
    return NextResponse.json(
      { outcome: 'failed', txId, reason: pickFailureReason() },
      { status: 200 }
    );
  }

  if (outcome === 'timeout') {
    await delay(8000);
    return NextResponse.json(
      { outcome: 'failed', txId, reason: 'Gateway timeout' },
      { status: 200 }
    );
  }

  const _exhaustive: never = outcome;
  return _exhaustive;
}
