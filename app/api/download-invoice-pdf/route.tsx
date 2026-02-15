import { NextRequest, NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { InvoicePDF } from '@/components/pdf/InvoicePDF'

export const runtime = 'nodejs'

interface InvoiceItem {
  description: string
  quantity: number
  price: number
}

interface InvoiceRequest {
  invoiceNumber: string
  clientName: string
  clientEmail?: string
  clientAddress?: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  issuedAt: string
  dueDate: string
  status: string
  paidAt?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: InvoiceRequest = await request.json()
    const { invoiceNumber, clientName, clientEmail, clientAddress, items, subtotal, tax, total, issuedAt, dueDate, status, paidAt } = body

    const stream = await renderToStream(
      <InvoicePDF
        invoiceNumber={invoiceNumber}
        clientName={clientName}
        clientEmail={clientEmail}
        clientAddress={clientAddress}
        items={items}
        subtotal={subtotal}
        tax={tax}
        total={total}
        issuedAt={issuedAt}
        dueDate={dueDate}
        status={status}
        paidAt={paidAt}
      />
    )

    // Convert stream to buffer
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk))
    }
    const pdfBuffer = Buffer.concat(chunks)

    const blob = new Blob([pdfBuffer], { type: 'application/pdf' })
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${invoiceNumber}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('SERVER ERROR generating PDF:', error)
    return NextResponse.json(
      { success: false, message: `Failed to generate PDF: ${error.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}
