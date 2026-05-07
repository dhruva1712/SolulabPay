# SoluLab Pay

A payment gateway UI built with Next.js 15, TypeScript, and Zustand. Implements the full assignment spec — and then some. No third-party payment SDK. No shortcuts.

**Live:** https://solulab-pay.vercel.app/
**Repo:** [github.com/dhruva1712/solulab-pay](https://github.com/dhruva1712/solulab-pay)

---

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

> The autofill warning on localhost ("Automatic payment methods filling is disabled") is a Chrome security policy for HTTP. It disappears on the deployed HTTPS URL — no code change needed.

---

## Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.2.5 |
| Language | TypeScript (strict) | 5.x |
| State | Zustand + persist middleware | 5.0.x |
| Forms | react-hook-form + zod | 7.75 / 4.4 |
| Animation | Framer Motion | 12.38 |
| Styling | Tailwind CSS v4 | 4.x |
| Icons | lucide-react | 1.14 |
| PDF | html2canvas + jsPDF | 1.4 / 4.2 |

No UI component libraries. No shadcn. Every component is hand-built.

---

## Project structure

```
src/
  app/
    api/pay/          # Mock gateway route handler (104 lines)
    layout.tsx        # Font loading, theme script, metadata
    page.tsx          # Root — orchestrates form ↔ status transitions
  components/
    payment/
      CardPreview.tsx         # 3D tilt, holographic shimmer, CVV flip, processing pulse
      CardRevealOverlay.tsx   # Mobile-only full-screen card reveal on form completion
      PaymentForm.tsx         # Form, validation, card formatting, currency toggle
      PaymentReceipt.tsx      # Off-screen receipt component for PDF capture
      ProcessingOverlay.tsx   # Floating panel during payment processing
      StatusScreen.tsx        # Success, failed, timeout screens with animations
      TransactionDetail.tsx   # Individual transaction detail view
      TransactionHistory.tsx  # Transaction list with animated row entries
      TransactionSidebar.tsx  # Slide-in panel housing history + detail navigation
    ui/
      Badge.tsx         # Card type badge (Visa / MC / Amex) with SVG icons
      Button.tsx        # Primary, ghost, subtle variants with loading state
      CountUp.tsx       # Animated number count-up for success screen amount
      HelpButton.tsx    # ? icon that reopens the product tour
      Input.tsx         # Label, error, hint, leading/trailing slot, valid state
      ThemeToggle.tsx   # Dark/light toggle with View Transitions API radial wipe
      TourPopup.tsx     # First-visit product tour — 4 slides with live demos
  hooks/
    useDownloadReceipt.ts   # html2canvas → jsPDF → direct download, with loading state
    usePayment.ts           # Fetch, AbortController, retry logic, store writes (198 lines)
  store/
    paymentStore.ts         # Zustand store — status, history, actions (159 lines)
  types/
    payment.ts              # All shared types and constants (49 lines)
    view-transitions.d.ts   # View Transitions API type declarations
  utils/
    cardDetection.ts    # Card type detection, number formatting, Amex 4-6-5 grouping
    cn.ts               # clsx + tailwind-merge composition helper
    formatting.ts       # Currency, timestamp, card masking, TX ID truncation
    validation.ts       # Zod schemas, Luhn algorithm, expiry past-date check
```

---

## Architecture

### Payment lifecycle — discriminated union

The payment state is modelled as a TypeScript discriminated union rather than a string enum with nullable fields:

```typescript
type PaymentStatus =
  | { kind: 'idle' }
  | { kind: 'processing'; txId: string; attempt: number }
  | { kind: 'success'; txId: string; transaction: Transaction }
  | { kind: 'failed'; txId: string; reason: string; attempt: number; canRetry: boolean }
  | { kind: 'timeout'; txId: string; attempt: number; canRetry: boolean }
```

Every consumer gets exhaustive type narrowing. The `success` state carries the full transaction. The `failed` state carries the reason and retry eligibility. Nothing is nullable that shouldn't be.

### State management — Zustand with surgical persistence

Zustand was chosen over Redux Toolkit because the state surface is small and the ceremony wasn't justified. The more important decision is what gets persisted.

The `partialize` config exposes only `history` to localStorage:

```typescript
partialize: (state) => ({ history: state.history })
```

Persisting `status` would mean a user who refreshes mid-payment comes back to a permanently stuck "processing" screen. Persisting `currentTxId` would cause duplicate transaction entries on retry after refresh. Only history survives a page reload — everything else resets cleanly.

History is capped at 50 entries to prevent localStorage quota errors on extended testing.

### Idempotency

A UUID is generated once per logical transaction via `crypto.randomUUID()` before the first attempt. The same ID is passed on every retry. The transaction history never contains duplicates for the same payment sequence.

```typescript
beginTransaction: () => {
  const txId = crypto.randomUUID()
  set({ currentTxId: txId, status: { kind: 'idle' } })
  return txId  // returned directly to avoid stale Zustand read on immediate use
}
```

The `txId` is returned from `beginTransaction()` and passed directly to `submitPayment()` — not read back from the store — to avoid a race condition where the store write hasn't committed before the next read.

### Timeout handling

The frontend sets a 6-second `AbortController` signal on every fetch:

```typescript
const timeoutId = window.setTimeout(
  () => abortControllerRef.current?.abort(),
  REQUEST_TIMEOUT_MS // 6000ms
)
```

The mock gateway has a 15% chance of responding after 8 seconds. In normal flow this response is never received — the abort fires first. The `AbortError` is caught and distinguished from real network errors, then mapped to the `timeout` lifecycle state. Both are handled separately because they communicate different things to the user.

### Form validation — dynamic schema

`buildPaymentFormSchema` is a factory that takes the detected card type and returns a zod schema with correct constraints:

- Card number: 15 digits for Amex, 16 for others + Luhn check
- CVV: 3 digits for Visa/Mastercard, 4 for Amex
- Expiry: rejects past dates by computing the first day of the month after expiry

The schema is consumed via a ref-based resolver wrapper so card type changes rebuild the schema without resetting the form:

```typescript
const resolver = useCallback(
  async (data, context, options) =>
    zodResolver(buildPaymentFormSchema(cardTypeRef.current))(data, context, options),
  [] // stable reference — reads cardType via ref, not closure
)
```

### Card number input — raw digits vs display

Raw digits are stored in react-hook-form (what the API receives). Formatted display is maintained in a separate `useState` (what the user sees). These are explicitly kept separate — the store and API payload are always clean digit strings, while the input shows `4242 4242 4242 4242` or `3782 822463 10005` (Amex 4-6-5 grouping).

---

## Gateway simulation

The mock route at `POST /api/pay` returns weighted random outcomes server-side:

| Outcome | Weight | Server delay |
|---------|--------|--------------|
| Success | 60% | 1.5–2.2s |
| Failed | 25% | 1.5–2.2s with reason string |
| Timeout | 15% | 8s (client aborts at 6s) |

The route validates the payload independently with its own zod schema — it does not trust the client's validation. Invalid payloads return 400 with a generic error message (no field details leaked).

Failed payments return HTTP 200, not 4xx. The HTTP request succeeded — the payment failed. This is the correct behaviour and a common mistake in implementations that conflate transport errors with domain errors.

**Development override:** include the header `x-force-outcome: success | failed | timeout` to bypass the random pick for predictable testing.

---

## Design system

The visual language is warm-neutral — a private bank aesthetic rather than generic fintech SaaS.

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#FAF8F4` | Page background |
| `--surface` | `#FFFFFF` | Cards, panels |
| `--ink` | `#1C1A17` | Primary text |
| `--accent` | `#7A1F2B` | Oxblood — CTAs, focus rings, active states |
| `--success` | `#3F5D3A` | Forest green |
| `--danger` | `#A8432B` | Terracotta |
| `--warning` | `#B8862E` | Amber-brown |

**Typography:**
- **Inter** (300/400/500/600) — all UI, body, buttons
- **Newsreader italic** (400) — single editorial accent word per screen (`considered`, `instantly`, `transactions`)
- **JetBrains Mono** (400/500) — card numbers, transaction IDs, timestamps, eyebrow labels

The Newsreader italic appears at most once per screen surface. Every usage is intentional.

**Dark mode** uses the View Transitions API for a radial wipe effect — a circle expands from the toggle button's exact position outward, revealing the new theme underneath. Falls back to an instant toggle in browsers without support (`prefers-reduced-motion` is respected).

---

## Features beyond the spec

These were not required. They were built because they were the right thing to build.

**Holographic card shimmer**
The card preview responds to mouse position with three layered effects: a radial light reflection, an iridescent rainbow layer, and a tight specular highlight. The card tilts up to 8 degrees following the cursor. Disabled on touch devices.

**Mobile card reveal**
On screens below 1024px, the card is hidden during form entry. When the form is fully valid and the user taps "Pay securely", a full-screen overlay appears — the card animates in from nothing with spring physics (scale, rotation, opacity) and a holographic shimmer sweeps across it once it settles. The user confirms or taps "Edit details" to return to the form.

**PDF receipt download**
Every completed transaction — success or failure — generates a downloadable PDF receipt via html2canvas + jsPDF. Named `solulab-receipt-{txId}.pdf`. No print dialog. Available on the success screen and in the transaction history sidebar. The receipt component renders off-screen with inline styles (no CSS variables) for consistent html2canvas capture.

**Transaction history sidebar**
A slide-in panel accessible from the header. Lists all transactions with animated row entrances. Clicking a row navigates to a detail view inside the same panel (no separate modal). Persists across page refreshes via localStorage.

**Luhn validation**
Client-side Luhn check on the card number field. Not in the spec. Real card validation includes it.

**Product tour**
A first-visit popup (sessionStorage, shown once per session) with four slides — each containing a live interactive demo of a feature rather than just text describing it. The card slide has a real hoverable mini card with tilt and shimmer. The mobile slide shows an animated phone mockup of the card reveal sequence. The dark mode slide has a functional mini toggle. Dismissing the tour shows a 3-second animated countdown farewell screen and adds a `?` help button to the header.

**Race condition handling**
- An `isInFlight` ref prevents concurrent payment submissions
- Store actions use `getState()` inside async functions to avoid stale closures
- An `isMounted` ref prevents state updates after component unmount
- `AbortController` cleanup runs on unmount

**Safe localStorage**
All localStorage access is wrapped in try/catch. Private browsing, quota exceeded, and sandboxed iframes all fail silently — the app continues to function without persistence rather than crashing.

---

## Assumptions

- Currency conversion is not implemented — INR and USD are labels only; amounts are stored as entered.
- The Luhn check runs client-side. The server validates digit count but not the checksum — a real gateway performs its own validation.
- Transaction history is capped at 50 entries. Clearing browser storage resets it.
- The 3-attempt retry limit is per logical transaction. Starting a new payment resets the counter.
- If the user refreshes during processing, the in-flight request is cancelled by the browser, the store resets to idle, and no transaction is recorded. This is intentional — persisting `processing` status would leave users permanently stuck. In a real implementation, the client would poll against the txId on reload to recover the payment state.

---

## What I would improve given more time

**Testing**
Unit tests for the Luhn algorithm, card detection, and expiry validation. Integration tests for the retry logic using MSW to mock the gateway. E2E tests with Playwright covering the full payment flow including timeout.

**Animations**
A digit-by-digit number ticker on the card preview as the user types the card number. A more sophisticated holographic effect using WebGL rather than CSS gradients.

**Accessibility**
A `aria-live` region announcing payment status changes to screen readers beyond the current focus management (this was added for status transitions but could be more comprehensive). Full keyboard navigation testing with NVDA and VoiceOver.

**History UX**
Pagination or infinite scroll for long transaction lists. Filtering by status. Searching by transaction ID.

**Real persistence**
Replace localStorage with a backend store so history survives across devices. The architecture supports this — swapping the Zustand persist storage adapter is the only change needed.

**Error boundaries**
React error boundaries around the payment form and status screens to handle unexpected render failures gracefully without a full page crash.

---

## Commit history

Each phase of development has its own commit, following conventional commits format. The git log tells the story of how the project was built — not just what it contains.

---

*Powered by Claude 🤍 & Coffee ☕ — Crafted by Dhruva Singh Chauhan*