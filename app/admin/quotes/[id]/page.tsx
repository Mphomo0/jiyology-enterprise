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
  FileText,
  Copy,
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

const quoteItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unit: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
})

const quoteSchema = z.object({
  items: z.array(quoteItemSchema).min(1, 'At least one item is required'),
  taxRate: z.number().min(0).max(100),
  discountType: z.enum(['percentage', 'fixed']).optional(),
  discountValue: z.number().min(0).optional(),
  validUntil: z.number(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
})

type QuoteFormData = z.infer<typeof quoteSchema>

const PAYMENT_TERMS_OPTIONS = [
  { value: 'due_on_receipt', label: 'Due on Receipt', days: 0 },
  { value: 'net_7', label: 'Net 7', days: 7 },
  { value: 'net_15', label: 'Net 15', days: 15 },
  { value: 'net_30', label: 'Net 30', days: 30 },
  { value: 'net_45', label: 'Net 45', days: 45 },
  { value: 'net_60', label: 'Net 60', days: 60 },
  { value: 'net_90', label: 'Net 90', days: 90 },
]

const statusStyles: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  draft: { variant: 'secondary', className: 'bg-gray-100 text-gray-700 hover:bg-gray-100' },
  sent: { variant: 'default', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  viewed: { variant: 'default', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  accepted: { variant: 'default', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  rejected: { variant: 'destructive', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
  expired: { variant: 'secondary', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' },
}

interface EditQuotePageProps {
  params: Promise<{ id: string }>
}

export default function EditQuotePage({ params }: EditQuotePageProps) {
  const router = useRouter()
  const [quoteId, setQuoteId] = useState<string | null>(null)
  
  useEffect(() => {
    params.then(p => setQuoteId(p.id))
  }, [params])

  const quote = useQuery(
    api.quotes.getById,
    quoteId ? { id: quoteId as any } : 'skip'
  )
  const updateQuote = useMutation(api.quotes.update)
  const updateStatus = useMutation(api.quotes.updateStatus)
  const convertToInvoice = useMutation(api.quotes.convertToInvoice)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
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
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      items: [{ description: '', quantity: 1, unit: 'ea', price: 0 }],
      taxRate: 15,
      validUntil: Date.now() + 30 * 24 * 60 * 60 * 1000,
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
  const validUntil = watch('validUntil')

  useEffect(() => {
    if (quote) {
      reset({
        items: quote.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit || 'ea',
          price: item.price,
        })),
        taxRate: (quote.taxRate || 0) * 100,
        discountType: quote.discountType,
        discountValue: quote.discountValue || 0,
        validUntil: quote.validUntil,
        notes: quote.notes,
        internalNotes: quote.internalNotes,
      })
    }
  }, [quote, reset])

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

  const onSubmit = async (data: QuoteFormData) => {
    if (!quoteId) return
    setIsSubmitting(true)
    try {
      console.log('Saving quote with data:', data)
      await updateQuote({
        id: quoteId as any,
        items: data.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
        })),
        taxRate: data.taxRate / 100,
        discountType: data.discountType,
        discountValue: data.discountValue,
        validUntil: data.validUntil,
        notes: data.notes,
        internalNotes: data.internalNotes,
      })
      
      router.push('/admin/quotes')
    } catch (error) {
      console.error('Failed to update quote:', error)
      alert('Failed to update quote. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSaveAsDraft = async () => {
    const data = watch()
    console.log('Save as draft, form data:', data)
    if (!quoteId) return
    
    if (!data.items || data.items.length === 0 || !data.items[0]?.description) {
      alert('Please add at least one line item with a description.')
      return
    }
    
    setIsSubmitting(true)
    try {
      await updateQuote({
        id: quoteId as any,
        items: data.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
        })),
        taxRate: data.taxRate / 100,
        discountType: data.discountType,
        discountValue: data.discountValue,
        validUntil: data.validUntil,
        notes: data.notes,
        internalNotes: data.internalNotes,
      })
      
      if (quote?.status !== 'draft') {
        await updateStatus({ id: quoteId as any, status: 'draft' })
      }
      
      router.push('/admin/quotes')
    } catch (error) {
      console.error('Failed to save as draft:', error)
      alert('Failed to save as draft. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (newStatus: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired') => {
    if (!quoteId) return
    try {
      await updateStatus({ id: quoteId as any, status: newStatus })
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleConvertToInvoice = async () => {
    if (!quoteId || !quote) return
    setIsConverting(true)
    try {
      const dueDate = Date.now() + 30 * 24 * 60 * 60 * 1000
      await convertToInvoice({ quoteId: quoteId as any, dueDate })
      router.push('/admin/invoices')
    } catch (error) {
      console.error('Failed to convert to invoice:', error)
    } finally {
      setIsConverting(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!quote || !quote.items || quote.items.length === 0) {
      alert('This quote has no items to include in the PDF.')
      return
    }
    
    setIsDownloading(true)
    try {
      const response = await fetch('/api/download-quote-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteNumber: quote.quoteNumber,
          clientName: quote.client?.name || 'Unknown Client',
          clientEmail: quote.client?.email,
          clientAddress: quote.client?.address,
          items: quote.items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price,
          })),
          total: quote.total,
          createdAt: new Date(quote.createdAt).toLocaleDateString(),
          status: quote.status,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Quote-${quote.quoteNumber}.pdf`
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

  const handleSendQuote = async () => {
    if (!quoteId || !quote) return
    
    if (!quote.client?.email) {
      alert('This client does not have an email address. Please add an email address to the client first.')
      return
    }
    
    if (!quote.items || quote.items.length === 0) {
      alert('This quote has no items to send.')
      return
    }
    
    if (!confirm('Send this quote to the client? This will also update the status to "Sent".')) {
      return
    }
    
    setIsSending(true)
    try {
      const response = await fetch('/api/send-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: quoteId,
          quoteNumber: quote.quoteNumber,
          clientName: quote.client.name || 'Unknown Client',
          clientEmail: quote.client.email,
          clientAddress: quote.client?.address,
          items: quote.items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price,
          })),
          total: quote.total,
          createdAt: new Date(quote.createdAt).toLocaleDateString(),
        }),
      })
      
      const data = await response.json().catch(() => ({}))
      
      if (response.ok && data.success) {
        if (quote.status === 'draft') {
          await updateStatus({ id: quoteId as any, status: 'sent' })
        }
        alert('Quote sent successfully!')
        router.push('/admin/quotes')
      } else {
        alert(`Failed to send quote: ${data.message || 'Unknown server error'}`)
      }
    } catch (error: any) {
      console.error('Failed to send quote:', error)
      alert(`Failed to send quote: ${error.message || 'Network error'}`)
    } finally {
      setIsSending(false)
    }
  }

  if (!quote) {
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

  const style = statusStyles[quote.status] || statusStyles.draft

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
                <BreadcrumbLink href="/admin/quotes">Quotes</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{quote.quoteNumber}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight">{quote.quoteNumber}</h1>
                  <Badge variant={style.variant} className={style.className}>
                    {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {quote.client?.name || 'Unknown Client'}
                </p>
              </div>
              <div className="flex gap-2">
                <Select value={quote.status} onValueChange={(value) => handleStatusChange(value as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                {(quote.status === 'accepted' || quote.status === 'sent') && (
                  <Button onClick={handleConvertToInvoice} disabled={isConverting}>
                    {isConverting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    Convert to Invoice
                  </Button>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Client Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {quote.client && (
                      <div className="p-4 bg-muted/50 rounded-lg space-y-1">
                        <p className="font-medium">{quote.client.name}</p>
                        {quote.client.email && <p className="text-sm text-muted-foreground">{quote.client.email}</p>}
                        {quote.client.phone && <p className="text-sm text-muted-foreground">{quote.client.phone}</p>}
                        {quote.client.address && <p className="text-sm text-muted-foreground">{quote.client.address}</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Quote Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Valid Until</Label>
                      <Input
                        type="date"
                        value={validUntil ? new Date(validUntil).toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          const date = new Date(e.target.value)
                          setValue('validUntil', date.getTime())
                        }}
                      />
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">Created: {new Date(quote.createdAt).toLocaleDateString()}</p>
                      {quote.updatedAt && (
                        <p className="text-muted-foreground">Updated: {new Date(quote.updatedAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
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
                      <span className="font-semibold">Total</span>
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
                      placeholder="Add any notes that will appear on the quote..."
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
                <Link href="/admin/quotes">
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
                {quote.client?.email && (
                  <Button
                    type="button"
                    onClick={handleSendQuote}
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
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
