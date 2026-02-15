'use client'

import { formatCurrency } from '@/lib/currency'

import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { invoiceItemSchema, InvoiceItemFormData } from '@/lib/schemas'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

const editInvoiceSchema = z.object({
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  dueDate: z.number().optional(),
})

type EditInvoiceFormData = z.infer<typeof editInvoiceSchema>

type InvoiceWithItems = {
  _id: string
  clientId: string
  quoteId: string
  jobId?: string
  invoiceNumber: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  subtotal: number
  tax?: number
  total: number
  issuedAt: number
  dueDate: number
  paidAt?: number
  createdAt: number
  updatedAt?: number
  items: Array<{
    _id: string
    description: string
    quantity: number
    price: number
  }>
}

interface EditInvoiceFormProps {
  invoiceId: string
}

export function EditInvoiceForm({ invoiceId }: EditInvoiceFormProps) {
  const router = useRouter()
  const invoice = useQuery(api.invoices.getById, {
    id: invoiceId as any,
  }) as InvoiceWithItems | null
  const clients = useQuery(api.clients.getClients) ?? []
  const updateInvoice = useMutation(api.invoices.update)
  const updateStatus = useMutation(api.invoices.updateStatus)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EditInvoiceFormData>({
    resolver: zodResolver(editInvoiceSchema),
    defaultValues: {
      items: [{ description: '', quantity: 1, price: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const items = watch('items')
  const dueDate = watch('dueDate')
  const subtotal = items.reduce(
    (acc: number, item: InvoiceItemFormData) =>
      acc + (item.price || 0) * (item.quantity || 0),
    0,
  )
  const tax = subtotal * 0.15 // 15% VAT
  const total = subtotal + tax

  useEffect(() => {
    if (invoice) {
      reset({
        items: invoice.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          price: item.price,
        })),
        dueDate: invoice.dueDate,
      })
      setIsLoading(false)
    }
  }, [invoice, reset])

  const onSubmit = async (data: EditInvoiceFormData) => {
    setIsSubmitting(true)
    try {
      await updateInvoice({
        id: invoiceId as any,
        items: data.items,
        dueDate: data.dueDate,
      })
      router.push('/admin/invoices')
    } catch (error) {
      console.error('Failed to update invoice:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (
    newStatus: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled',
  ) => {
    try {
      await updateStatus({ id: invoiceId as any, status: newStatus })
      router.refresh()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  if (isLoading || !invoice) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Edit Invoice</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Select
            value={invoice.status}
            onValueChange={(value) =>
              handleStatusChange(
                value as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled',
              )
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Invoice #</p>
          <p className="font-medium">{invoice.invoiceNumber}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Client</p>
          <p className="font-medium">
            {clients.find((c) => c._id === invoice.clientId)?.name || 'Unknown'}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Issued</p>
          <p className="font-medium">
            {new Date(invoice.issuedAt).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Current Total</p>
          <p className="font-medium">{formatCurrency(invoice.total)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Due Date</label>
          <Input
            type="date"
            value={dueDate ? new Date(dueDate).toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const date = new Date(e.target.value)
              setValue('dueDate', date.getTime(), { shouldDirty: true })
            }}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Invoice Items</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ description: '', quantity: 1, price: 0 })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {errors.items?.message && (
            <p className="text-sm text-destructive">{errors.items.message}</p>
          )}

          <div className="space-y-4">
            {fields.map((field, index: number) => (
              <div
                key={field.id}
                className="p-4 border rounded-lg space-y-3 bg-card"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Item {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="text-muted-foreground hover:text-destructive h-8 px-2"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description *</label>
                  <Input
                    {...register(`items.${index}.description` as const)}
                    placeholder="e.g., Labor - 2 hours, Installation, Materials"
                  />
                  {errors.items?.[index]?.description && (
                    <p className="text-sm text-destructive">
                      {errors.items[index]?.description?.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quantity</label>
                    <Input
                      type="number"
                      min={1}
                      {...register(`items.${index}.quantity` as const, {
                        valueAsNumber: true,
                      })}
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Unit Price (R)
                    </label>
                    <Input
                      type="number"
                      step={0.01}
                      min={0}
                      {...register(`items.${index}.price` as const, {
                        valueAsNumber: true,
                      })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Subtotal
                    </span>
                    <span className="text-lg font-semibold">
                      {formatCurrency(
                        (items[index]?.price || 0) *
                          (items[index]?.quantity || 0),
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t space-y-2">
            <div className="text-right space-y-1">
              <div className="flex justify-end gap-8 text-sm text-muted-foreground">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-end gap-8 text-sm text-muted-foreground">
                <span>VAT (15%):</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-end gap-8 pt-2 border-t">
                <span className="text-sm font-medium">New Total</span>
                <span className="text-3xl font-bold">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
          <Link href="/admin/invoices">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
