'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, FileDown, Send, CheckCircle } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useState } from 'react'

interface InvoiceActionsCellProps {
  id: string
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  clientName?: string
  clientEmail?: string
  clientAddress?: string
}

export function InvoiceActionsCell({ id, onEdit, onDelete, clientName, clientEmail, clientAddress }: InvoiceActionsCellProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isMarkingPaid, setIsMarkingPaid] = useState(false)
  const invoiceWithItems = useQuery(api.invoices.getById, { id: id as any })

  const handleDownloadPdf = async () => {
    if (!invoiceWithItems) {
      alert('Invoice data is still loading. Please try again in a moment.')
      return
    }
    
    if (!invoiceWithItems.items || invoiceWithItems.items.length === 0) {
      alert('This invoice has no items to include in the PDF.')
      return
    }
    
    setIsDownloading(true)
    try {
      const response = await fetch('/api/download-invoice-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: invoiceWithItems.invoiceNumber,
          clientName: clientName || 'Unknown Client',
          clientEmail: clientEmail,
          clientAddress: clientAddress,
          items: invoiceWithItems.items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal: invoiceWithItems.subtotal,
          tax: invoiceWithItems.tax || 0,
          total: invoiceWithItems.total,
          issuedAt: new Date(invoiceWithItems.issuedAt).toLocaleDateString(),
          dueDate: new Date(invoiceWithItems.dueDate).toLocaleDateString(),
          status: invoiceWithItems.status,
          paidAt: invoiceWithItems.paidAt ? new Date(invoiceWithItems.paidAt).toLocaleDateString() : undefined,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Invoice-${invoiceWithItems.invoiceNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to download PDF:', errorData.message || response.statusText)
        alert(`Failed to download PDF: ${errorData.message || 'Unknown server error'}`)
      }
    } catch (error) {
      console.error('Failed to download PDF:', error)
      alert('Failed to download PDF. Please check your connection and try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSendInvoice = async () => {
    if (!invoiceWithItems) {
      alert('Invoice data is still loading. Please try again in a moment.')
      return
    }
    
    if (!clientEmail) {
      alert('This client does not have an email address. Please add an email address to the client first.')
      return
    }
    
    if (!invoiceWithItems.items || invoiceWithItems.items.length === 0) {
      alert('This invoice has no items to send.')
      return
    }
    
    setIsSending(true)
    try {
      const response = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: id,
          invoiceNumber: invoiceWithItems.invoiceNumber,
          clientName: clientName || 'Unknown Client',
          clientEmail: clientEmail,
          clientAddress: clientAddress,
          items: invoiceWithItems.items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal: invoiceWithItems.subtotal,
          tax: invoiceWithItems.tax || 0,
          total: invoiceWithItems.total,
          issuedAt: new Date(invoiceWithItems.issuedAt).toLocaleDateString(),
          dueDate: new Date(invoiceWithItems.dueDate).toLocaleDateString(),
        }),
      })
      
      const data = await response.json().catch(() => ({}))
      
      if (response.ok && data.success) {
        alert('Invoice sent successfully!')
      } else {
        console.error('Failed to send invoice:', data.message || response.statusText)
        alert(`Failed to send invoice: ${data.message || 'Unknown server error'}`)
      }
    } catch (error: any) {
      console.error('Failed to send invoice:', error)
      alert(`Failed to send invoice: ${error.message || 'Network error'}`)
    } finally {
      setIsSending(false)
    }
  }

  const handleMarkAsPaid = async () => {
    if (!confirm('Are you sure you want to mark this invoice as paid?')) {
      return
    }
    
    setIsMarkingPaid(true)
    try {
      const updateStatus = (await import('@/convex/_generated/api')).api.invoices.updateStatus
      // We need to use a mutation hook for this, but since we're in a cell component,
      // we'll need to handle this differently or pass it as a prop
      alert('Mark as paid functionality will be implemented in the edit page')
    } catch (error: any) {
      console.error('Failed to mark as paid:', error)
      alert(`Failed to mark as paid: ${error.message || 'Unknown error'}`)
    } finally {
      setIsMarkingPaid(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => onEdit(id)}>
          <Pencil className='mr-2 h-4 w-4' />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadPdf} disabled={isDownloading}>
          <FileDown className='mr-2 h-4 w-4' />
          {isDownloading ? 'Generating...' : 'Download PDF'}
        </DropdownMenuItem>
        {clientEmail && (
          <DropdownMenuItem onClick={handleSendInvoice} disabled={isSending}>
            <Send className='mr-2 h-4 w-4' />
            {isSending ? 'Sending...' : 'Send to Client'}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(id)}
          className='text-red-600 focus:text-red-600'
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
