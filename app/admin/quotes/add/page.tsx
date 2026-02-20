'use client'

import { formatCurrency } from '@/lib/currency'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
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
import {
  Loader2,
  Plus,
  Trash2,
  Send,
  Save,
  Calculator,
  Calendar,
  Percent,
  User,
  FileText,
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
  clientId: z.string().min(1, 'Client is required'),
  jobId: z.string().optional(),
  items: z.array(quoteItemSchema).min(1, 'At least one item is required'),
  taxRate: z.number().min(0).max(100),
  discountType: z.enum(['percentage', 'fixed']).optional(),
  discountValue: z.number().min(0).optional(),
  paymentTerms: z.string(),
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

export default function AddQuotePage() {
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
    getValues,
    trigger,
    formState: { errors },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      clientId: '',
      items: [{ description: '', quantity: 1, unit: 'ea', price: 0 }],
      taxRate: 15,
      paymentTerms: 'net_30',
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
  const selectedClientId = watch('clientId')
  const paymentTerms = watch('paymentTerms')
  const validUntil = watch('validUntil')

  const selectedClient = clients.find(c => c._id === selectedClientId)

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

  useEffect(() => {
    const terms = PAYMENT_TERMS_OPTIONS.find(t => t.value === paymentTerms)
    if (terms) {
      const newValidUntil = Date.now() + terms.days * 24 * 60 * 60 * 1000
      setValue('validUntil', newValidUntil)
    }
  }, [paymentTerms, setValue])

  const onSubmit = async (data: QuoteFormData, status: 'draft' | 'sent') => {
    console.log('Submitting quote with status:', status, 'data:', data)
    
    const isSendingQuote = status === 'sent'
    
    if (isSendingQuote) {
      setIsSending(true)
    } else {
      setIsSubmitting(true)
    }
    
    try {
      const result = await createQuote({
        clientId: data.clientId as any,
        jobId: data.jobId ? (data.jobId as any) : undefined,
        items: data.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
        })),
        taxRate: data.taxRate / 100,
        discountType: data.discountType,
        discountValue: data.discountValue,
        paymentTerms: data.paymentTerms,
        validUntil: data.validUntil,
        notes: data.notes,
        internalNotes: data.internalNotes,
        status,
      })

      if (isSendingQuote && selectedClient?.email) {
        await fetch('/api/send-quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quoteId: result.quoteId,
            quoteNumber: result.quoteNumber,
            clientName: selectedClient.name,
            clientEmail: selectedClient.email,
            clientAddress: selectedClient.address,
            items: data.items,
            subtotal,
            taxAmount,
            total,
            createdAt: new Date().toLocaleDateString(),
            validUntil: new Date(data.validUntil).toLocaleDateString(),
          }),
        })
      }

      router.push('/admin/quotes')
    } catch (error) {
      console.error('Failed to create quote:', error)
      alert('Failed to create quote. Please try again.')
    } finally {
      setIsSubmitting(false)
      setIsSending(false)
    }
  }

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
                <BreadcrumbPage>New Quote</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Create Quote</h1>
                <p className="text-muted-foreground">Create a new quote for your client</p>
              </div>
              <Link href="/admin/quotes">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>

            <form onSubmit={handleSubmit(() => {})} className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Client Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="clientId">Client *</Label>
                        <Controller
                          name="clientId"
                          control={control}
                          defaultValue=""
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a client" />
                              </SelectTrigger>
                              <SelectContent>
                                {clients.map((client) => (
                                  <SelectItem key={client._id} value={client._id}>
                                    {client.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.clientId && (
                          <p className="text-sm text-destructive">{errors.clientId.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jobId">Related Job (Optional)</Label>
                        <Select onValueChange={(value) => setValue('jobId', value === 'none' ? undefined : value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a job" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No related job</SelectItem>
                            {jobs.map((job) => (
                              <SelectItem key={job._id} value={job._id}>
                                {job.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {selectedClient && (
                      <div className="p-4 bg-muted/50 rounded-lg space-y-1">
                        <p className="font-medium">{selectedClient.name}</p>
                        {selectedClient.email && <p className="text-sm text-muted-foreground">{selectedClient.email}</p>}
                        {selectedClient.phone && <p className="text-sm text-muted-foreground">{selectedClient.phone}</p>}
                        {selectedClient.address && <p className="text-sm text-muted-foreground">{selectedClient.address}</p>}
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
                      <Label>Payment Terms</Label>
                      <Select 
                        value={paymentTerms} 
                        onValueChange={(value) => setValue('paymentTerms', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_TERMS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Line Items
                  </CardTitle>
                  <CardDescription>Add the items or services you're quoting</CardDescription>
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
                              {errors.items?.[index]?.description && (
                                <p className="text-xs text-destructive mt-1">
                                  {errors.items[index]?.description?.message}
                                </p>
                              )}
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
                  onClick={() => {
                    const data = getValues()
                    console.log('Submitting draft with data:', data)
                    onSubmit(data, 'draft')
                  }}
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
                      Save Draft
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    const data = getValues()
                    console.log('Submitting sent with data:', data)
                    onSubmit(data, 'sent')
                  }}
                  disabled={isSending || !selectedClient?.email}
                  className="w-full sm:w-auto"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Save & Send
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
