'use client'

import { useState, useCallback } from 'react'
import type { RefObject } from 'react'
import type { Transaction } from '@/types/payment'

interface UseDownloadReceiptReturn {
  downloadReceipt: (transaction: Transaction, ref: RefObject<HTMLDivElement | null>) => Promise<void>
  isDownloading: boolean
}

export function useDownloadReceipt(): UseDownloadReceiptReturn {
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadReceipt = useCallback(
    async (transaction: Transaction, ref: RefObject<HTMLDivElement | null>) => {
      if (!ref.current || isDownloading) return

      setIsDownloading(true)

      try {
        // Dynamic imports — only load these heavy libraries when needed
        const [html2canvas, { jsPDF }] = await Promise.all([
          import('html2canvas').then((m) => m.default),
          import('jspdf'),
        ])

        // Render the off-screen receipt to canvas
        const canvas = await html2canvas(ref.current, {
          scale: 2, // 2x for retina quality
          useCORS: true,
          backgroundColor: '#FAF8F4',
          logging: false,
          // Ensure full element is captured
          width: 600,
          height: ref.current.scrollHeight,
          windowWidth: 600,
        })

        const imgData = canvas.toDataURL('image/png')

        // PDF dimensions — A4 width, height proportional to content
        const pdfWidth = 210 // A4 width in mm
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width

        const pdf = new jsPDF({
          orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
          unit: 'mm',
          format: [pdfWidth, pdfHeight],
        })

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

        // Direct download — no dialog
        const shortTxId = transaction.id.slice(0, 8)
        pdf.save(`solulab-receipt-${shortTxId}.pdf`)
      } catch (error) {
        // Silent fail — don't expose error to user
        console.error('Receipt download failed:', error)
      } finally {
        setIsDownloading(false)
      }
    },
    [isDownloading]
  )

  return { downloadReceipt, isDownloading }
}
