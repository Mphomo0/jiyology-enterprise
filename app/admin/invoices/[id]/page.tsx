'use client'

import { formatCurrency } from '@/lib/currency'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  Plus,
  Trash2,
  Save,
  Calculator,
  Calendar,
  Percent,
  User,
  CreditCard,
  DollarSign,
  FileDown,
  Send,
} from 'lucide-react'
import Link from 'next/link'
import { AppSidebar } from '@/components/sections/admin/app-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unit: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
})

const invoiceSchema = z.object({
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  taxRate: z.number().min(0).max(100),
  discountType: z.enum(['percentage', 'fixed']).optional(),
  discountValue: z.number().min(0).optional(),
  dueDate: z.number(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
})

const paymentSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentMethod: z.enum(['bank_transfer', 'cash', 'card', 'check', 'other']),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>
type PaymentFormData = z.infer<typeof paymentSchema>

const statusStyles: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  draft: { variant: 'secondary', className: 'bg-gray-100 text-gray-700 hover:bg-gray-100' },
  sent: { variant: 'default', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  viewed: { variant: 'default', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  paid: { variant: 'default', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  partially_paid: { variant: 'default', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
  overdue: { variant: 'destructive', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
  cancelled: { variant: 'secondary', className: 'bg-gray-100 text-gray-500 hover:bg-gray-100' },
}

interface EditInvoicePageProps {
  params: Promise<{ id: string }>
}

export default function EditInvoicePage({ params }: EditInvoicePageProps) {
  const router = useRouter()
  const [invoiceId, setInvoiceId] = useState<string | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  
  useEffect(() => {
    params.then(p => setInvoiceId(p.id))
  }, [params])

  const invoice = useQuery(
    api.invoices.getById,
    invoiceId ? { id: invoiceId as any } : 'skip'
  )
  const updateInvoice = useMutation(api.invoices.update)
  const updateStatus = useMutation(api.invoices.updateStatus)
  const recordPayment = useMutation(api.invoices.recordPayment)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRecordingPayment, setIsRecordingPayment] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      items: [{ description: '', quantity: 1, unit: 'ea', price: 0 }],
      taxRate: 15,
      dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
    },
  })

  const {
    register: registerPayment,
    handleSubmit: handleSubmitPayment,
    reset: resetPayment,
    formState: { errors: paymentErrors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: 'bank_transfer',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const items = watch('items')
  const taxRate = watch('taxRate')
  const discountType = watch('discountType')
  const discountValue = watch('discountValue') || 0
  const dueDate = watch('dueDate')

  useEffect(() => {
    if (invoice) {
      reset({
        items: invoice.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit || 'ea',
          price: item.price,
        })),
        taxRate: (invoice.taxRate || 0) * 100,
        discountType: invoice.discountType,
        discountValue: invoice.discountValue || 0,
        dueDate: invoice.dueDate,
        notes: invoice.notes,
        internalNotes: invoice.internalNotes,
      })
    }
  }, [invoice, reset])

  const subtotal = items.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 0),
    0,
  )

  let discountAmount = 0
  if (discountType && discountValue > 0) {
    if (discountType === 'percentage') {
      discountAmount = subtotal * (discountValue / 100)
    } else {
      discountAmount = discountValue
    }
  }

  const taxableAmount = subtotal - discountAmount
  const taxAmount = taxableAmount * ((taxRate || 0) / 100)
  const total = taxableAmount + taxAmount

  const onSubmit = async (data: InvoiceFormData) => {
    if (!invoiceId) return
    setIsSubmitting(true)
    try {
      console.log('Saving invoice with data:', data)
      await updateInvoice({
        id: invoiceId as any,
        items: data.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
        })),
        taxRate: data.taxRate / 100,
        discountType: data.discountType,
        discountValue: data.discountValue,
        dueDate: data.dueDate,
        notes: data.notes,
        internalNotes: data.internalNotes,
      })
      router.push('/admin/invoices')
    } catch (error) {
      console.error('Failed to update invoice:', error)
      alert('Failed to update invoice. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSaveAsDraft = async () => {
    const data = watch()
    console.log('Save as draft, form data:', data)
    if (!invoiceId) return
    
    if (!data.items || data.items.length === 0 || !data.items[0]?.description) {
      alert('Please add at least one line item with a description.')
      return
    }
    
    setIsSubmitting(true)
    try {
      await updateInvoice({
        id: invoiceId as any,
        items: data.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
        })),
        taxRate: data.taxRate / 100,
        discountType: data.discountType,
        discountValue: data.discountValue,
        dueDate: data.dueDate,
        notes: data.notes,
        internalNotes: data.internalNotes,
      })
      
      if (invoice?.status !== 'draft') {
        await updateStatus({ id: invoiceId as any, status: 'draft' })
      }
      
      router.push('/admin/invoices')
    } catch (error) {
      console.error('Failed to save as draft:', error)
      alert('Failed to save as draft. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (newStatus: 'draft' | 'sent' | 'viewed' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled') => {
    if (!invoiceId) return
    try {
      await updateStatus({ id: invoiceId as any, status: newStatus })
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const onRecordPayment = async (data: PaymentFormData) => {
    if (!invoiceId) return
    setIsRecordingPayment(true)
    try {
      await recordPayment({
        invoiceId: invoiceId as any,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        notes: data.notes,
      })
      setShowPaymentDialog(false)
      resetPayment()
    } catch (error) {
      console.error('Failed to record payment:', error)
    } finally {
      setIsRecordingPayment(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!invoice || !invoice.items || invoice.items.length === 0) {
      alert('This invoice has no items to include in the PDF.')
      return
    }
    
    setIsDownloading(true)
    try {
      const response = await fetch('/api/download-invoice-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: invoice.invoiceNumber,
          clientName: invoice.client?.name || 'Unknown Client',
          clientEmail: invoice.client?.email,
          clientAddress: invoice.client?.address,
          items: invoice.items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal: invoice.subtotal,
          tax: invoice.taxAmount || 0,
          total: invoice.total,
          issuedAt: new Date(invoice.issuedAt).toLocaleDateString(),
          dueDate: new Date(invoice.dueDate).toLocaleDateString(),
          status: invoice.status,
          paidAt: invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : undefined,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Invoice-${invoice.invoiceNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const errorData = await response.json().catch(() => ({}))
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
    if (!invoiceId || !invoice) return
    
    if (!invoice.client?.email) {
      alert('This client does not have an email address. Please add an email address to the client first.')
      return
    }
    
    if (!invoice.items || invoice.items.length === 0) {
      alert('This invoice has no items to send.')
      return
    }
    
    if (!confirm('Send this invoice to the client? This will also update the status to "Sent".')) {
      return
    }
    
    setIsSending(true)
    try {
      const response = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoiceId,
          invoiceNumber: invoice.invoiceNumber,
          clientName: invoice.client.name || 'Unknown Client',
          clientEmail: invoice.client.email,
          clientAddress: invoice.client?.address,
          items: invoice.items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal: invoice.subtotal,
          tax: invoice.taxAmount || 0,
          total: invoice.total,
          issuedAt: new Date(invoice.issuedAt).toLocaleDateString(),
          dueDate: new Date(invoice.dueDate).toLocaleDateString(),
        }),
      })
      
      const data = await response.json().catch(() => ({}))
      
      if (response.ok && data.success) {
        if (invoice.status === 'draft') {
          await updateStatus({ id: invoiceId as any, status: 'sent' })
        }
        alert('Invoice sent successfully!')
        router.push('/admin/invoices')
      } else {
        alert(`Failed to send invoice: ${data.message || 'Unknown server error'}`)
      }
    } catch (error: any) {
      console.error('Failed to send invoice:', error)
      alert(`Failed to send invoice: ${error.message || 'Network error'}`)
    } finally {
      setIsSending(false)
    }
  }

  if (!invoice) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  const style = statusStyles[invoice.status] || statusStyles.draft
  const isOverdue = invoice.dueDate < Date.now() && invoice.status !== 'paid' && invoice.status !== 'cancelled'

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin/invoices">Invoices</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{invoice.invoiceNumber}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight">{invoice.invoiceNumber}</h1>
                  <Badge variant={style.variant} className={style.className}>
                    {invoice.status === 'partially_paid' ? 'Partial' : invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Badge>
                  {isOverdue && (
                    <Badge variant="destructive">Overdue</Badge>
                  )}
                </div>
                <p className="text-muted-foreground">
                  {invoice.client?.name || 'Unknown Client'}
                </p>
              </div>
              <div className="flex gap-2">
                <Select value={invoice.status} onValueChange={(value) => handleStatusChange(value as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                  <Button onClick={() => setShowPaymentDialog(true)}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                  <div className="text-2xl font-bold">{formatCurrency(invoice.total)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Amount Paid</div>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(invoice.amountPaid)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Amount Due</div>
                  <div className="text-2xl font-bold text-orange-600">{formatCurrency(invoice.amountDue)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Due Date</div>
                  <div className={`text-2xl font-bold ${isOverdue ? 'text-red-600' : ''}`}>
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {invoice.payments && invoice.payments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invoice.payments.map((payment: any) => (
                      <div key={payment._id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{formatCurrency(payment.amount)}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.paymentMethod.replace('_', ' ')} - {new Date(payment.paidAt).toLocaleDateString()}
                          </p>
                        </div>
                        {payment.reference && (
                          <p className="text-sm text-muted-foreground">Ref: {payment.reference}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Line Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[40%]">Description</TableHead>
                          <TableHead className="w-[12%]">Qty</TableHead>
                          <TableHead className="w-[12%]">Unit</TableHead>
                          <TableHead className="w-[15%]">Unit Price</TableHead>
                          <TableHead className="w-[15%]">Total</TableHead>
                          <TableHead className="w-[6%]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fields.map((field, index) => (
                          <TableRow key={field.id}>
                            <TableCell>
                              <Input
                                {...register(`items.${index}.description` as const)}
                                placeholder="Description"
                                className="border-0 bg-transparent focus-visible:ring-0"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                                className="border-0 bg-transparent focus-visible:ring-0"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                {...register(`items.${index}.unit` as const)}
                                placeholder="ea"
                                className="border-0 bg-transparent focus-visible:ring-0"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">R</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...register(`items.${index}.price` as const, { valueAsNumber: true })}
                                  className="border-0 bg-transparent pl-6 focus-visible:ring-0"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency((items[index]?.price || 0) * (items[index]?.quantity || 0))}
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => remove(index)}
                                disabled={fields.length === 1}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ description: '', quantity: 1, unit: 'ea', price: 0 })}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Line Item
                  </Button>
                </CardContent>
              </Card>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Pricing & Taxes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input
                          type="date"
                          value={dueDate ? new Date(dueDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const date = new Date(e.target.value)
                            setValue('dueDate', date.getTime())
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="taxRate">VAT Rate (%)</Label>
                        <div className="relative">
                          <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            {...register('taxRate', { valueAsNumber: true })}
                            className="pl-9"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Discount</Label>
                      <div className="flex gap-2">
                        <Select 
                          value={discountType || 'none'} 
                          onValueChange={(value) => {
                            if (value === 'none') {
                              setValue('discountType', undefined)
                              setValue('discountValue', 0)
                            } else {
                              setValue('discountType', value as 'percentage' | 'fixed')
                            }
                          }}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="percentage">%</SelectItem>
                            <SelectItem value="fixed">R</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={!discountType}
                          {...register('discountValue', { valueAsNumber: true })}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">VAT ({taxRate}%)</span>
                      <span>{formatCurrency(taxAmount)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-semibold">Total Due</span>
                      <span className="text-2xl font-bold">{formatCurrency(total)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Notes for Client</Label>
                    <Textarea
                      {...register('notes')}
                      placeholder="Add any notes that will appear on the invoice..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Internal Notes (Private)</Label>
                    <Textarea
                      {...register('internalNotes')}
                      placeholder="Private notes that won't be shown to the client..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-3 justify-end pb-6">
                <Link href="/admin/invoices">
                  <Button type="button" variant="outline" className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSaveAsDraft}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className="w-full sm:w-auto"
                >
                  {isDownloading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="mr-2 h-4 w-4" />
                  )}
                  {isDownloading ? 'Generating...' : 'Download PDF'}
                </Button>
                {invoice.client?.email && (
                  <Button
                    type="button"
                    onClick={handleSendInvoice}
                    disabled={isSending}
                    className="w-full sm:w-auto"
                  >
                    {isSending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    {isSending ? 'Sending...' : 'Send to Client'}
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>

            {showPaymentDialog && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle>Record Payment</CardTitle>
                    <CardDescription>
                      Amount due: {formatCurrency(invoice.amountDue)}
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSubmitPayment(onRecordPayment)}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max={invoice.amountDue}
                          {...registerPayment('amount', { valueAsNumber: true })}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Payment Method</Label>
                        <Select 
                          defaultValue="bank_transfer"
                          onValueChange={(value) => registerPayment('paymentMethod').onChange({ target: { value } } as any)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="check">Check</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Reference (Optional)</Label>
                        <Input {...registerPayment('reference')} placeholder="Payment reference" />
                      </div>
                      <div className="space-y-2">
                        <Label>Notes (Optional)</Label>
                        <Textarea {...registerPayment('notes')} placeholder="Payment notes" rows={2} />
                      </div>
                    </CardContent>
                    <div className="flex justify-end gap-2 p-6 pt-0">
                      <Button type="button" variant="outline" onClick={() => setShowPaymentDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isRecordingPayment}>
                        {isRecordingPayment ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <DollarSign className="h-4 w-4 mr-2" />
                        )}
                        Record Payment
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
