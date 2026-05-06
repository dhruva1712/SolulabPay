# Payment Gateway

A payment gateway UI built with Next.js 15 (App Router) and TypeScript. Demonstrates a complete payment lifecycle — form validation, gateway simulation, retry logic, and transaction history — without any third-party payment SDK.

## Stack

- **Next.js 15** (App Router, Turbopack)
- **TypeScript** — strict mode, no `any`
- **Zustand** — global state with localStorage persistence for transaction history
- **react-hook-form + zod** — form validation with real-time per-field errors
- **Framer Motion** — page transitions, card flip animation, status screen entrances

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  app/
    api/pay/        # Mock gateway route handler
    page.tsx        # Root page — orchestrates form and status screens
  components/
    payment/        # PaymentForm, CardPreview, StatusScreen, TransactionHistory, TransactionDetail, ProcessingOverlay
    ui/             # Button, Input, Badge — design system primitives
  hooks/
    usePayment.ts   # Payment lifecycle hook — fetch, abort, retry, store writes
  store/
    paymentStore.ts # Zustand store — status, history, actions
  types/
    payment.ts      # All shared types and constants
  utils/
    cardDetection.ts  # Card type detection, number formatting
    validation.ts     # Zod schemas, Luhn check
    formatting.ts     # Currency, timestamp, masking helpers
    cn.ts             # Tailwind class composition
```

## Architecture notes

**State management:** Zustand was chosen over Redux Toolkit for this scope. The state surface is small — payment lifecycle status (a discriminated union of five states), transaction history, and the current transaction ID. Zustand's `persist` middleware handles localStorage serialisation with `partialize` to ensure only `history` survives a page refresh. Persisting `status` would leave users stuck in a "processing" state after a hard refresh.

**Payment lifecycle:** modelled as a TypeScript discriminated union (`PaymentStatus`) with kinds: `idle`, `processing`, `success`, `failed`, `timeout`. Each state carries only the data relevant to that state — the `success` state carries the full transaction, `failed` carries the reason and retry eligibility, and so on. This makes exhaustive handling straightforward throughout the component tree.

**Idempotency:** a UUID is generated once per logical transaction via `crypto.randomUUID()` before the first attempt. The same ID is passed on every retry, so the transaction history never contains duplicates for the same payment attempt sequence.

**Timeout handling:** the frontend sets a 6-second `AbortController` signal on every fetch. The mock gateway has a 15% chance of responding after 8 seconds — in normal flow this response is never received. If the abort fires, the `AbortError` is caught, distinguished from other network errors, and the timeout lifecycle state is set.

**Form validation:** `buildPaymentFormSchema` is a factory function that takes the detected card type and returns a zod schema with the correct card number length (15 for Amex, 16 otherwise) and CVV length (3 or 4). The schema is rebuilt via a ref-based resolver whenever card type changes, without resetting the form.

**Card number input:** raw digits are stored in react-hook-form; formatted display is maintained in a separate `useState`. This keeps the store and API payload clean while the UI shows formatted output.

## Gateway simulation

The mock route at `/api/pay` returns one of three outcomes, weighted server-side:

| Outcome | Weight | Behaviour |
|---------|--------|-----------|
| Success | 60% | Responds after 1.5–2.2s |
| Failed  | 25% | Responds after 1.5–2.2s with a reason string |
| Timeout | 15% | Responds after 8s (client aborts at 6s) |

During development, the header `x-force-outcome: success | failed | timeout` overrides the random pick for predictable testing.

## Assumptions

- Currency conversion is not implemented — INR and USD are display labels only; amounts are stored as entered.
- The card preview shows "SoluLab" brand name — in a real integration this would reflect the merchant.
- Luhn validation runs client-side only. The server validates card number format (digit count) but not the Luhn checksum — a real gateway would perform its own validation.
- Transaction history is stored in `localStorage` under the key `payment-gateway-v1`. Clearing browser storage resets history.
- The 3-attempt retry limit is per logical transaction (one `txId`). Starting a new payment resets the counter.

## What I would improve given more time

- **Animations:** a number ticker on the amount display as the user types, and a shimmer/holographic effect on the card preview.
- **Accessibility:** a live region (`aria-live="polite"`) announcing payment status changes to screen readers, beyond the current focus management.
- **Testing:** unit tests for the Luhn check, card detection, and expiry validation; integration tests for the retry logic using MSW to mock the gateway.
- **History UX:** pagination or a "load more" pattern for long transaction lists; filtering by status.
- **Real persistence:** replace `localStorage` with a proper backend store so history survives across devices and browsers.
- **Error boundaries:** React error boundaries around the payment form and status screens to handle unexpected render failures gracefully.
