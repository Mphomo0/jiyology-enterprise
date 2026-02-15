'use client'

import { formatCurrency } from '@/lib/currency'

import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { quoteSchema, QuoteItemFormData } from '@/lib/schemas'
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

export function AddQuoteForm() {
  const router = useRouter()
  const clients = useQuery(api.clients.getClients) ?? []
  const jobs = useQuery(api.jobs.list) ?? []
  const createQuote = useMutation(api.quotes.create)
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
    jobId?: string
    items: QuoteItemFormData[]
  }>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      items: [{ description: '', quantity: 1, price: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const items = watch('items')
  const total = items.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 0),
    0,
  )

  const selectedClientId = watch('clientId')
  const selectedClient = clients.find(c => c._id === selectedClientId)

  const onSubmit = async (data: { clientId: string; jobId?: string; items: QuoteItemFormData[] }, status: 'draft' | 'sent') => {
    const isSendingQuote = status === 'sent'
    
    if (isSendingQuote) {
      setIsSending(true)
    } else {
      setIsSubmitting(true)
    }
    
    try {
      const quoteId = await createQuote({
        clientId: data.clientId as any,
        jobId: data.jobId ? (data.jobId as any) : undefined,
        items: data.items,
        status,
      })

      if (isSendingQuote && selectedClient?.email) {
        const quoteNumber = `Q-${Date.now()}`
        
        await fetch('/api/send-quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quoteId,
            quoteNumber,
            clientName: selectedClient.name,
            clientEmail: selectedClient.email,
            clientAddress: selectedClient.address,
            items: data.items,
            total,
            createdAt: new Date().toLocaleDateString(),
          }),
        })
      }

      router.push('/admin/quotes')
    } catch (error) {
      console.error('Failed to create quote:', error)
    } finally {
      setIsSubmitting(false)
      setIsSending(false)
    }
  }

  const handleSaveDraft = (data: { clientId: string; jobId?: string; items: QuoteItemFormData[] }) => {
    onSubmit(data, 'draft')
  }

  const handleSaveAndSend = (data: { clientId: string; jobId?: string; items: QuoteItemFormData[] }) => {
    onSubmit(data, 'sent')
  }

  return (
    <div className='bg-card rounded-lg border p-6 shadow-sm'>
      <h1 className='text-2xl font-bold mb-6'>Create New Quote</h1>
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
        </div>

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>Quote Items</h2>
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

          <div className='flex justify-end pt-4 border-t'>
            <div className='text-right'>
              <p className='text-sm text-muted-foreground'>Total Amount</p>
              <p className='text-3xl font-bold'>
                {formatCurrency(total)}
              </p>
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
            title={!selectedClient?.email ? 'Client email is required to send quote' : ''}
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
          <Link href='/admin/quotes'>
            <Button type='button' variant='outline'>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
