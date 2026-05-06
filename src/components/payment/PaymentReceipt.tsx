'use client'

import type { Transaction } from '@/types/payment'
import { formatCurrency, formatTimestamp } from '@/utils/formatting'
import { MAX_ATTEMPTS } from '@/types/payment'

interface PaymentReceiptProps {
  transaction: Transaction
  receiptRef: React.RefObject<HTMLDivElement | null>
}

export function PaymentReceipt({ transaction, receiptRef }: PaymentReceiptProps) {
  const isSuccess = transaction.status === 'success'
  const isFailed = transaction.status === 'failed'
  const isTimeout = transaction.status === 'timeout'

  const statusLabel = isSuccess ? 'CONFIRMED' : isFailed ? 'DECLINED' : 'TIMED OUT'
  const statusColor = isSuccess ? '#3F5D3A' : isFailed ? '#A8432B' : '#B8862E'

  const formattedAmount = formatCurrency(transaction.amount, transaction.currency)
  const formattedDate = formatTimestamp(transaction.createdAt)
  const cardLabel = `${transaction.cardType.charAt(0).toUpperCase() + transaction.cardType.slice(1)} ending in ${transaction.cardLast4}`

  return (
    <div
      ref={receiptRef}
      style={{
        position: 'fixed',
        top: '-9999px',
        left: '-9999px',
        width: '600px',
        backgroundColor: '#FAF8F4',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '0',
        zIndex: -1,
      }}
    >
      {/* Receipt container */}
      <div
        style={{
          width: '600px',
          backgroundColor: '#FAF8F4',
          padding: '56px 48px',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '48px',
            paddingBottom: '32px',
            borderBottom: '1px solid #E8E2D8',
          }}
        >
          {/* Brand */}
          <div>
            <div className='flex flex-row items-center gap-3 mb-1'>
              <img
                src="/logo.svg"
                alt="SoluLab"
                style={{ height: '24px', width: 'auto', display: 'block' }}
                crossOrigin="anonymous"
              />
              <span
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 600,
                  fontSize: '13px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#1C1A17',
                }}
              >
                SoluLab
              </span>
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '10px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#6B6359',
                marginTop: '4px',
              }}
            >
              Payment Receipt
            </div>
          </div>

          {/* Status badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px 14px',
              border: `1px solid ${statusColor}`,
              backgroundColor: `${statusColor}10`,
            }}
          >
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: statusColor,
              }}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Amount — the hero */}
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '10px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#6B6359',
              marginBottom: '12px',
            }}
          >
            Amount
          </div>
          <div
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontWeight: 300,
              fontSize: '56px',
              letterSpacing: '-0.025em',
              color: '#1C1A17',
              lineHeight: 1,
            }}
          >
            {formattedAmount}
          </div>
        </div>

        {/* Divider — receipt perforation style */}
        <div
          style={{
            borderTop: '1px dashed #D6CDBE',
            marginBottom: '40px',
            position: 'relative',
          }}
        >
          {/* Left circle */}
          <div
            style={{
              position: 'absolute',
              left: '-48px',
              top: '-10px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#F0ECE4',
              border: '1px solid #E8E2D8',
            }}
          />
          {/* Right circle */}
          <div
            style={{
              position: 'absolute',
              right: '-48px',
              top: '-10px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#F0ECE4',
              border: '1px solid #E8E2D8',
            }}
          />
        </div>

        {/* Detail rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            { label: 'Transaction ID', value: transaction.id },
            { label: 'Date & Time', value: formattedDate },
            { label: 'Cardholder', value: transaction.cardholderName },
            { label: 'Card', value: cardLabel },
            { label: 'Currency', value: transaction.currency },
            { label: 'Attempts', value: `${transaction.attempts} of ${MAX_ATTEMPTS}` },
            ...(transaction.reason ? [{ label: 'Decline Reason', value: transaction.reason }] : []),
          ].map((row, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                padding: '14px 0',
                borderBottom: '1px solid #E8E2D8',
              }}
            >
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '10px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#6B6359',
                }}
              >
                {row.label}
              </span>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: '#1C1A17',
                  maxWidth: '320px',
                  textAlign: 'right',
                  wordBreak: 'break-all',
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '48px',
            paddingTop: '32px',
            borderTop: '1px solid #E8E2D8',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '9px',
              letterSpacing: '0.12em',
              color: '#A39B8E',
              maxWidth: '280px',
              lineHeight: 1.6,
            }}
          >
            This is a simulated receipt generated for demonstration purposes only.
            No actual payment has been processed.
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '9px',
              letterSpacing: '0.12em',
              color: '#A39B8E',
              textAlign: 'right',
            }}
          >
            © 2026 SoluLab Pay
            <br />
          </div>
        </div>
      </div>
    </div>
  )
}
