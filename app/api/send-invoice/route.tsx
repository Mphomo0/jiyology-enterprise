import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { renderToStream } from '@react-pdf/renderer'
import { InvoicePDF } from '@/components/pdf/InvoicePDF'

export const runtime = 'nodejs'

interface InvoiceItem {
  description: string
  quantity: number
  price: number
}

interface SendInvoiceRequest {
  invoiceId: string
  invoiceNumber: string
  clientName: string
  clientEmail: string
  clientAddress?: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  issuedAt: string
  dueDate: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SendInvoiceRequest = await request.json()
    const { invoiceNumber, clientName, clientEmail, clientAddress, items, subtotal, tax, total, issuedAt, dueDate } = body

    console.log('Generating PDF stream for email...')
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
      subject: `Invoice #${invoiceNumber} from Jiyology Enterprise`,
      text: `Dear ${clientName},\n\nPlease find attached your invoice (#${invoiceNumber}) for R${total.toFixed(2)}.\n\nIssued: ${issuedAt}\nDue Date: ${dueDate}\n\nThank you for your business.\n\nBest regards,\nJiyology Enterprise`,
      html: `
        <h2>Invoice #${invoiceNumber}</h2>
        <p>Dear ${clientName},</p>
        <p>Please find attached your invoice for <strong>R${total.toFixed(2)}</strong>.</p>
        <p><strong>Issued:</strong> ${issuedAt}<br/><strong>Due Date:</strong> ${dueDate}</p>
        <p>Thank you for your business.</p>
        <p>Best regards,<br/>Jiyology Enterprise</p>
      `,
      attachments: [
        {
          filename: `Invoice-${invoiceNumber}.pdf`,
          content: pdfBuffer.toString('base64'),
        },
      ],
    })
    console.log('Email sent successfully')

    return NextResponse.json({ success: true, message: 'Invoice sent successfully' })
  } catch (error: any) {
    console.error('SERVER ERROR sending invoice:', error)
    return NextResponse.json(
      { success: false, message: `Failed to send invoice: ${error.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}
