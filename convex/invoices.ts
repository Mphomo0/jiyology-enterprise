import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

const DEFAULT_TAX_RATE = 0.15
const DEFAULT_PAYMENT_TERMS = 'net_30'

async function generateInvoiceNumber(ctx: any): Promise<string> {
  const counter = await ctx.db
    .query('counters')
    .withIndex('by_name', (q: any) => q.eq('name', 'invoice'))
    .unique()

  let nextVal: number

  if (!counter) {
    nextVal = 1001
    await ctx.db.insert('counters', {
      name: 'invoice',
      value: nextVal,
    })
  } else {
    nextVal = counter.value + 1
    await ctx.db.patch(counter._id, { value: nextVal })
  }

  const year = new Date().getFullYear()
  return `INV-${year}-${String(nextVal).padStart(4, '0')}`
}

export const create = mutation({
  args: {
    clientId: v.id('clients'),
    quoteId: v.optional(v.id('quotes')),
    jobId: v.optional(v.id('jobs')),
    items: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        unit: v.optional(v.string()),
        price: v.number(),
      }),
    ),
    taxRate: v.optional(v.number()),
    discountType: v.optional(v.union(v.literal('percentage'), v.literal('fixed'))),
    discountValue: v.optional(v.number()),
    paymentTerms: v.optional(v.string()),
    dueDate: v.number(),
    notes: v.optional(v.string()),
    internalNotes: v.optional(v.string()),
    status: v.optional(v.union(v.literal('draft'), v.literal('sent'))),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const invoiceStatus = args.status || 'draft'
    const taxRate = args.taxRate ?? DEFAULT_TAX_RATE
    const paymentTerms = args.paymentTerms || DEFAULT_PAYMENT_TERMS

    const subtotal = args.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    )

    let discountAmount = 0
    if (args.discountType && args.discountValue) {
      if (args.discountType === 'percentage') {
        discountAmount = subtotal * (args.discountValue / 100)
      } else {
        discountAmount = args.discountValue
      }
    }

    const taxableAmount = subtotal - discountAmount
    const taxAmount = taxableAmount * taxRate
    const total = taxableAmount + taxAmount

    const invoiceNumber = await generateInvoiceNumber(ctx)

    const invoiceId = await ctx.db.insert('invoices', {
      clientId: args.clientId,
      quoteId: args.quoteId,
      jobId: args.jobId,
      invoiceNumber,
      status: invoiceStatus,
      subtotal,
      taxRate,
      taxAmount,
      discountType: args.discountType,
      discountValue: args.discountValue,
      discountAmount,
      total,
      amountPaid: 0,
      amountDue: total,
      paymentTerms,
      issuedAt: now,
      dueDate: args.dueDate,
      notes: args.notes,
      internalNotes: args.internalNotes,
      createdAt: now,
      updatedAt: now,
      sentAt: invoiceStatus === 'sent' ? now : undefined,
    })

    await Promise.all(
      args.items.map((item) => {
        const itemTotal = item.price * item.quantity
        return ctx.db.insert('invoiceItems', {
          invoiceId,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          total: itemTotal,
        })
      }),
    )

    return { invoiceId, invoiceNumber }
  },
})

export const update = mutation({
  args: {
    id: v.id('invoices'),
    items: v.optional(v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        unit: v.optional(v.string()),
        price: v.number(),
      }),
    )),
    taxRate: v.optional(v.number()),
    discountType: v.optional(v.union(v.literal('percentage'), v.literal('fixed'))),
    discountValue: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    internalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.id)
    if (!invoice) throw new Error('Invoice not found')

    let subtotal = invoice.subtotal
    let taxAmount = invoice.taxAmount
    let total = invoice.total
    let amountDue = invoice.amountDue

    if (args.items) {
      const existing = await ctx.db
        .query('invoiceItems')
        .withIndex('by_invoice', (q) => q.eq('invoiceId', args.id))
        .collect()

      await Promise.all(existing.map((item) => ctx.db.delete(item._id)))

      subtotal = args.items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      )

      await Promise.all(
        args.items.map((item) => {
          const itemTotal = item.price * item.quantity
          return ctx.db.insert('invoiceItems', {
            invoiceId: args.id,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            price: item.price,
            total: itemTotal,
          })
        }),
      )
    }

    const taxRate = args.taxRate ?? invoice.taxRate
    const discountType = args.discountType ?? invoice.discountType
    const discountValue = args.discountValue ?? invoice.discountValue

    let discountAmount = 0
    if (discountType && discountValue) {
      if (discountType === 'percentage') {
        discountAmount = subtotal * (discountValue / 100)
      } else {
        discountAmount = discountValue
      }
    }

    const taxableAmount = subtotal - discountAmount
    taxAmount = taxableAmount * taxRate
    total = taxableAmount + taxAmount
    amountDue = total - invoice.amountPaid

    await ctx.db.patch(args.id, {
      subtotal,
      taxRate,
      taxAmount,
      discountType,
      discountValue,
      discountAmount,
      total,
      amountDue,
      dueDate: args.dueDate,
      notes: args.notes,
      internalNotes: args.internalNotes,
      updatedAt: Date.now(),
    })
  },
})

export const updateStatus = mutation({
  args: {
    id: v.id('invoices'),
    status: v.union(
      v.literal('draft'),
      v.literal('sent'),
      v.literal('viewed'),
      v.literal('paid'),
      v.literal('partially_paid'),
      v.literal('cancelled'),
      v.literal('overdue'),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const invoice = await ctx.db.get(args.id)
    if (!invoice) throw new Error('Invoice not found')

    const patch: any = {
      status: args.status,
      updatedAt: now,
    }

    if (args.status === 'paid') {
      patch.paidAt = now
    }

    if (args.status === 'sent') {
      patch.sentAt = now
    }

    if (args.status === 'viewed') {
      patch.viewedAt = now
    }

    if (invoice.status === 'paid' && args.status !== 'paid') {
      patch.paidAt = undefined
    }

    await ctx.db.patch(args.id, patch)
  },
})

export const recordPayment = mutation({
  args: {
    invoiceId: v.id('invoices'),
    amount: v.number(),
    paymentMethod: v.union(
      v.literal('bank_transfer'),
      v.literal('cash'),
      v.literal('card'),
      v.literal('check'),
      v.literal('other'),
    ),
    reference: v.optional(v.string()),
    notes: v.optional(v.string()),
    paidAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const invoice = await ctx.db.get(args.invoiceId)
    if (!invoice) throw new Error('Invoice not found')

    await ctx.db.insert('payments', {
      invoiceId: args.invoiceId,
      amount: args.amount,
      paymentMethod: args.paymentMethod,
      reference: args.reference,
      notes: args.notes,
      paidAt: args.paidAt || now,
      createdAt: now,
    })

    const newAmountPaid = invoice.amountPaid + args.amount
    const newAmountDue = invoice.total - newAmountPaid
    const newStatus = newAmountDue <= 0 ? 'paid' : 'partially_paid'

    const patch: any = {
      amountPaid: newAmountPaid,
      amountDue: Math.max(0, newAmountDue),
      status: newStatus,
      updatedAt: now,
    }

    if (newStatus === 'paid') {
      patch.paidAt = now
    }

    await ctx.db.patch(args.invoiceId, patch)

    return { amountPaid: newAmountPaid, amountDue: newAmountDue, status: newStatus }
  },
})

export const remove = mutation({
  args: { id: v.id('invoices') },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query('invoiceItems')
      .withIndex('by_invoice', (q) => q.eq('invoiceId', args.id))
      .collect()

    const payments = await ctx.db
      .query('payments')
      .withIndex('by_invoice', (q) => q.eq('invoiceId', args.id))
      .collect()

    await Promise.all(items.map((item) => ctx.db.delete(item._id)))
    await Promise.all(payments.map((payment) => ctx.db.delete(payment._id)))
    await ctx.db.delete(args.id)
  },
})

export const getById = query({
  args: { id: v.id('invoices') },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.id)
    if (!invoice) return null

    const items = await ctx.db
      .query('invoiceItems')
      .withIndex('by_invoice', (q) => q.eq('invoiceId', args.id))
      .collect()

    const client = await ctx.db.get(invoice.clientId)
    const payments = await ctx.db
      .query('payments')
      .withIndex('by_invoice', (q) => q.eq('invoiceId', args.id))
      .order('desc')
      .collect()

    return { ...invoice, items, client, payments }
  },
})

export const getInvoices = query({
  handler: async (ctx) => {
    return await ctx.db
      .query('invoices')
      .order('desc')
      .collect()
  },
})

export const getInvoicesWithClients = query({
  handler: async (ctx) => {
    const invoices = await ctx.db
      .query('invoices')
      .order('desc')
      .collect()

    const invoicesWithClients = await Promise.all(
      invoices.map(async (invoice) => {
        const client = await ctx.db.get(invoice.clientId)
        return { ...invoice, client }
      }),
    )

    return invoicesWithClients
  },
})

export const getInvoiceWithClient = query({
  args: { id: v.id('invoices') },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.id)
    if (!invoice) return null

    const items = await ctx.db
      .query('invoiceItems')
      .withIndex('by_invoice', (q) => q.eq('invoiceId', args.id))
      .collect()

    const client = await ctx.db.get(invoice.clientId)
    const payments = await ctx.db
      .query('payments')
      .withIndex('by_invoice', (q) => q.eq('invoiceId', args.id))
      .collect()

    return {
      ...invoice,
      items,
      client,
      payments,
    }
  },
})

export const getByQuoteId = query({
  args: { quoteId: v.id('quotes') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('invoices')
      .withIndex('by_quote', (q) => q.eq('quoteId', args.quoteId))
      .collect()
  },
})

export const getByClientId = query({
  args: { clientId: v.id('clients') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('invoices')
      .withIndex('by_client', (q) => q.eq('clientId', args.clientId))
      .collect()
  },
})

export const getOverdueInvoices = query({
  handler: async (ctx) => {
    const now = Date.now()
    const invoices = await ctx.db
      .query('invoices')
      .withIndex('by_status', (q) => q.eq('status', 'sent'))
      .collect()

    return invoices.filter(inv => inv.dueDate < now)
  },
})

export const getStats = query({
  handler: async (ctx) => {
    const invoices = await ctx.db.query('invoices').collect()
    const now = Date.now()

    const totalInvoices = invoices.length
    const draftInvoices = invoices.filter(i => i.status === 'draft').length
    const sentInvoices = invoices.filter(i => i.status === 'sent').length
    const paidInvoices = invoices.filter(i => i.status === 'paid').length
    const partiallyPaidInvoices = invoices.filter(i => i.status === 'partially_paid').length
    const overdueInvoices = invoices.filter(i => i.status === 'overdue' || (i.status === 'sent' && i.dueDate < now)).length
    const cancelledInvoices = invoices.filter(i => i.status === 'cancelled').length

    const totalValue = invoices.reduce((acc, i) => acc + i.total, 0)
    const paidValue = invoices
      .filter(i => i.status === 'paid')
      .reduce((acc, i) => acc + i.total, 0)
    const outstandingValue = invoices
      .filter(i => i.status === 'sent' || i.status === 'partially_paid' || i.status === 'overdue')
      .reduce((acc, i) => acc + i.amountDue, 0)
    const overdueValue = invoices
      .filter(i => i.status === 'overdue' || (i.status === 'sent' && i.dueDate < now))
      .reduce((acc, i) => acc + i.amountDue, 0)

    return {
      totalInvoices,
      draftInvoices,
      sentInvoices,
      paidInvoices,
      partiallyPaidInvoices,
      overdueInvoices,
      cancelledInvoices,
      totalValue,
      paidValue,
      outstandingValue,
      overdueValue,
    }
  },
})

export const getPayments = query({
  args: { invoiceId: v.id('invoices') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('payments')
      .withIndex('by_invoice', (q) => q.eq('invoiceId', args.invoiceId))
      .order('desc')
      .collect()
  },
})
