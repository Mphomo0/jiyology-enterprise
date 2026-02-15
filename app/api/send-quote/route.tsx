import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { renderToStream } from '@react-pdf/renderer'
import { QuotePDF } from '@/components/pdf/QuotePDF'

export const runtime = 'nodejs'

interface QuoteItem {
  description: string
  quantity: number
  price: number
}

interface SendQuoteRequest {
  quoteId: string
  quoteNumber: string
  clientName: string
  clientEmail: string
  clientAddress?: string
  items: QuoteItem[]
  total: number
  createdAt: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SendQuoteRequest = await request.json()
    const { quoteNumber, clientName, clientEmail, clientAddress, items, total, createdAt } = body

    console.log('Generating PDF stream for email...')
    const stream = await renderToStream(
      <QuotePDF
        quoteNumber={quoteNumber}
        clientName={clientName}
        clientEmail={clientEmail}
        clientAddress={clientAddress}
        items={items}
        total={total}
        createdAt={createdAt}
        status="SENT"
      />
    )

    // Convert stream to buffer
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk))
    }
    const pdfBuffer = Buffer.concat(chunks)
    console.log('PDF buffer generated for email, size:', pdfBuffer.length)

    // Check if email environment variables are configured
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email environment variables are not configured')
      return NextResponse.json(
        { success: false, message: 'Email service is not configured. Please check your environment variables.' },
        { status: 500 }
      )
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    console.log('Sending email to:', clientEmail)
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: clientEmail,
      cc: process.env.EMAIL_USER,
      subject: `Quote #${quoteNumber} from Jiyology Enterprise`,
      text: `Dear ${clientName},\n\nPlease find attached your quote (#${quoteNumber}) for R${total.toFixed(2)}.\n\nThis quote is valid for 30 days.\n\nBest regards,\nJiyology Enterprise`,
      html: `
        <h2>Quote #${quoteNumber}</h2>
        <p>Dear ${clientName},</p>
        <p>Please find attached your quote for <strong>R${total.toFixed(2)}</strong>.</p>
        <p>This quote is valid for 30 days.</p>
        <p>Best regards,<br/>Jiyology Enterprise</p>
      `,
      attachments: [
        {
          filename: `Quote-${quoteNumber}.pdf`,
          content: pdfBuffer.toString('base64'),
        },
      ],
    })
    console.log('Email sent successfully')

    return NextResponse.json({ success: true, message: 'Quote sent successfully' })
  } catch (error: any) {
    console.error('SERVER ERROR sending quote:', error)
    return NextResponse.json(
      { success: false, message: `Failed to send quote: ${error.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}
