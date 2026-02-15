'use client'

import { formatCurrency } from '@/lib/currency'

import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { invoiceSchema, InvoiceItemFormData } from '@/lib/schemas'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus, Trash2, Send } from 'lucide-react'
import Link from 'next/link'

export function AddInvoiceForm() {
  const router = useRouter()
  const clients = useQuery(api.clients.getClients) ?? []
  const quotes = useQuery(api.quotes.getQuotes) ?? []
  const jobs = useQuery(api.jobs.list) ?? []
  const createInvoice = useMutation(api.invoices.create)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<{
    clientId: string
    quoteId: string
    jobId?: string
    items: InvoiceItemFormData[]
    dueDate: number
  }>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      items: [{ description: '', quantity: 1, price: 0 }],
      dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const items = watch('items')
  const subtotal = items.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 0),
    0,
  )
  const tax = subtotal * 0.15 // 15% VAT
  const total = subtotal + tax

  const selectedClientId = watch('clientId')
  const selectedQuoteId = watch('quoteId')
  const selectedClient = clients.find(c => c._id === selectedClientId)
  const selectedQuote = quotes.find(q => q._id === selectedQuoteId)

  // Filter quotes by selected client
  const filteredQuotes = selectedClientId
    ? quotes.filter(q => q.clientId === selectedClientId)
    : quotes

  const onSubmit = async (data: { clientId: string; quoteId: string; jobId?: string; items: InvoiceItemFormData[]; dueDate: number }, status: 'draft' | 'sent') => {
    const isSendingInvoice = status === 'sent'
    
    if (isSendingInvoice) {
      setIsSending(true)
    } else {
      setIsSubmitting(true)
    }
    
    try {
      const invoiceId = await createInvoice({
        clientId: data.clientId as any,
        quoteId: data.quoteId as any,
        jobId: data.jobId ? (data.jobId as any) : undefined,
        items: data.items,
        dueDate: data.dueDate,
        status,
      })

      if (isSendingInvoice && selectedClient?.email) {
        await fetch('/api/send-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoiceId,
            invoiceNumber: selectedQuote ? `INV-${Date.now()}` : `INV-${Date.now()}`,
            clientName: selectedClient.name,
            clientEmail: selectedClient.email,
            clientAddress: selectedClient.address,
            items: data.items,
            subtotal,
            tax,
            total,
            issuedAt: new Date().toLocaleDateString(),
            dueDate: new Date(data.dueDate).toLocaleDateString(),
          }),
        })
      }

      router.push('/admin/invoices')
    } catch (error) {
      console.error('Failed to create invoice:', error)
    } finally {
      setIsSubmitting(false)
      setIsSending(false)
    }
  }

  const handleSaveDraft = (data: { clientId: string; quoteId: string; jobId?: string; items: InvoiceItemFormData[]; dueDate: number }) => {
    onSubmit(data, 'draft')
  }

  const handleSaveAndSend = (data: { clientId: string; quoteId: string; jobId?: string; items: InvoiceItemFormData[]; dueDate: number }) => {
    onSubmit(data, 'sent')
  }

  // Handle quote selection - auto-fill items from quote
  const handleQuoteChange = (quoteId: string) => {
    setValue('quoteId', quoteId)
    
    if (quoteId && quoteId !== 'none') {
      const quote = quotes.find(q => q._id === quoteId)
      if (quote) {
        // Set client automatically
        setValue('clientId', quote.clientId)
        
        // Fetch quote items and populate form
        // Note: In a real implementation, you'd want to fetch the quote items
        // For now, we'll let the user manually add items
      }
    }
  }

  return (
    <div className='bg-card rounded-lg border p-6 shadow-sm'>
      <h1 className='text-2xl font-bold mb-6'>Create New Invoice</h1>
      <form className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <label htmlFor='clientId' className='text-sm font-medium'>
              Client *
            </label>
            <Select onValueChange={(value) => setValue('clientId', value)}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select a client' />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client._id} value={client._id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type='hidden' {...register('clientId')} />
            {errors.clientId && (
              <p className='text-sm text-destructive'>{errors.clientId.message}</p>
            )}
          </div>
          <div className='space-y-2'>
            <label htmlFor='quoteId' className='text-sm font-medium'>
              Related Quote *
            </label>
            <Select onValueChange={handleQuoteChange}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select a quote' />
              </SelectTrigger>
              <SelectContent>
                {filteredQuotes.map((quote) => (
                  <SelectItem key={quote._id} value={quote._id}>
                    {quote._id.slice(0, 8).toUpperCase()} - {formatCurrency(quote.total)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type='hidden' {...register('quoteId')} />
            {errors.quoteId && (
              <p className='text-sm text-destructive'>{errors.quoteId.message}</p>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <label htmlFor='jobId' className='text-sm font-medium'>
              Related Job (Optional)
            </label>
            <Select onValueChange={(value) => setValue('jobId', value)}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select a job' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='none'>No related job</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job._id} value={job._id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type='hidden' {...register('jobId')} />
          </div>
          <div className='space-y-2'>
            <label htmlFor='dueDate' className='text-sm font-medium'>
              Due Date *
            </label>
            <Input
              type='date'
              onChange={(e) => {
                const date = new Date(e.target.value)
                setValue('dueDate', date.getTime())
              }}
              defaultValue={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            />
            <input type='hidden' {...register('dueDate', { valueAsNumber: true })} />
            {errors.dueDate && (
              <p className='text-sm text-destructive'>{errors.dueDate.message}</p>
            )}
          </div>
        </div>

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>Invoice Items</h2>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => append({ description: '', quantity: 1, price: 0 })}
            >
              <Plus className='h-4 w-4 mr-2' />
              Add Item
            </Button>
          </div>

          {errors.items?.message && (
            <p className='text-sm text-destructive'>{errors.items.message}</p>
          )}

          <div className='space-y-4'>
            {fields.map((field, index) => (
              <div key={field.id} className='p-4 border rounded-lg space-y-3 bg-card'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-muted-foreground'>
                    Item {index + 1}
                  </span>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className='text-muted-foreground hover:text-destructive h-8 px-2'
                  >
                    <Trash2 className='h-4 w-4 mr-1' />
                    Remove
                  </Button>
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-medium'>
                    Description *
                  </label>
                  <Input
                    {...register(`items.${index}.description` as const)}
                    placeholder='e.g., Labor - 2 hours, Installation, Materials'
                  />
                  {errors.items?.[index]?.description && (
                    <p className='text-sm text-destructive'>
                      {errors.items[index]?.description?.message}
                    </p>
                  )}
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>
                      Quantity
                    </label>
                    <Input
                      type='number'
                      min={1}
                      {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                      placeholder='1'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>
                      Unit Price (R)
                    </label>
                    <Input
                      type='number'
                      step={0.01}
                      min={0}
                      {...register(`items.${index}.price` as const, { valueAsNumber: true })}
                      placeholder='0.00'
                    />
                  </div>
                </div>

                <div className='pt-2 border-t'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-muted-foreground'>Subtotal</span>
                    <span className='text-lg font-semibold'>
                      {formatCurrency((items[index]?.price || 0) * (items[index]?.quantity || 0))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className='flex justify-end pt-4 border-t space-y-2'>
            <div className='text-right space-y-1'>
              <div className='flex justify-end gap-8 text-sm text-muted-foreground'>
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className='flex justify-end gap-8 text-sm text-muted-foreground'>
                <span>VAT (15%):</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className='flex justify-end gap-8 pt-2 border-t'>
                <span className='text-sm font-medium'>Total Amount</span>
                <span className='text-3xl font-bold'>
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='flex gap-4 pt-4'>
          <Button
            type='button'
            variant='outline'
            onClick={handleSubmit(handleSaveDraft)}
            disabled={isSubmitting}
            className='flex-1'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Saving...
              </>
            ) : (
              'Save as Draft'
            )}
          </Button>
          <Button
            type='button'
            onClick={handleSubmit(handleSaveAndSend)}
            disabled={isSending || !selectedClient?.email}
            className='flex-1'
            title={!selectedClient?.email ? 'Client email is required to send invoice' : ''}
          >
            {isSending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Sending...
              </>
            ) : (
              <>
                <Send className='mr-2 h-4 w-4' />
                Save & Send
              </>
            )}
          </Button>
          <Link href='/admin/invoices'>
            <Button type='button' variant='outline'>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
