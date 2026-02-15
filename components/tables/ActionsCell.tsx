'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, FileDown, Send } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useState } from 'react'

interface ActionsCellProps {
  id: string
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  clientName?: string
  clientEmail?: string
  clientAddress?: string
}

export function ActionsCell({ id, onEdit, onDelete, clientName, clientEmail, clientAddress }: ActionsCellProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const quoteWithItems = useQuery(api.quotes.getById, { id: id as any })

  const handleDownloadPdf = async () => {
    if (!quoteWithItems) {
      alert('Quote data is still loading. Please try again in a moment.')
      return
    }
    
    if (!quoteWithItems.items || quoteWithItems.items.length === 0) {
      alert('This quote has no items to include in the PDF.')
      return
    }
    
    setIsDownloading(true)
    try {
      const quoteNumber = `Q-${id.slice(-8).toUpperCase()}`
      
      const response = await fetch('/api/download-quote-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteNumber,
          clientName: clientName || 'Unknown Client',
          clientEmail: clientEmail,
          clientAddress: clientAddress,
          items: quoteWithItems.items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price,
          })),
          total: quoteWithItems.total,
          createdAt: new Date(quoteWithItems.createdAt).toLocaleDateString(),
          status: quoteWithItems.status,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Quote-${quoteNumber}.pdf`
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

  const handleSendQuote = async () => {
    if (!quoteWithItems) {
      alert('Quote data is still loading. Please try again in a moment.')
      return
    }
    
    if (!clientEmail) {
      alert('This client does not have an email address. Please add an email address to the client first.')
      return
    }
    
    if (!quoteWithItems.items || quoteWithItems.items.length === 0) {
      alert('This quote has no items to send.')
      return
    }
    
    setIsSending(true)
    try {
      const quoteNumber = `Q-${id.slice(-8).toUpperCase()}`
      
      const response = await fetch('/api/send-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: id,
          quoteNumber,
          clientName: clientName || 'Unknown Client',
          clientEmail: clientEmail,
          clientAddress: clientAddress,
          items: quoteWithItems.items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price,
          })),
          total: quoteWithItems.total,
          createdAt: new Date(quoteWithItems.createdAt).toLocaleDateString(),
        }),
      })
      
      const data = await response.json().catch(() => ({}))
      
      if (response.ok && data.success) {
        alert('Quote sent successfully!')
      } else {
        console.error('Failed to send quote:', data.message || response.statusText)
        alert(`Failed to send quote: ${data.message || 'Unknown server error'}`)
      }
    } catch (error: any) {
      console.error('Failed to send quote:', error)
      alert(`Failed to send quote: ${error.message || 'Network error'}`)
    } finally {
      setIsSending(false)
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
          <DropdownMenuItem onClick={handleSendQuote} disabled={isSending}>
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
