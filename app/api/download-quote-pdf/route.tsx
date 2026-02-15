import { NextRequest, NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { QuotePDF } from '@/components/pdf/QuotePDF'


interface QuoteItem {
  description: string
  quantity: number
  price: number
}

interface QuoteRequest {
  quoteNumber: string
  clientName: string
  clientEmail?: string
  clientAddress?: string
  items: QuoteItem[]
  total: number
  createdAt: string
  status: string
}

export async function POST(request: NextRequest) {
  try {
    const body: QuoteRequest = await request.json()
    const { quoteNumber, clientName, clientEmail, clientAddress, items, total, createdAt, status } = body

    const stream = await renderToStream(
      <QuotePDF
        quoteNumber={quoteNumber}
        clientName={clientName}
        clientEmail={clientEmail}
        clientAddress={clientAddress}
        items={items}
        total={total}
        createdAt={createdAt}
        status={status}
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
        'Content-Disposition': `attachment; filename="Quote-${quoteNumber}.pdf"`,
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
