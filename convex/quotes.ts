import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

const DEFAULT_TAX_RATE = 0.15
const DEFAULT_PAYMENT_TERMS = 'net_30'
const VALIDITY_DAYS = 30

const PAYMENT_TERMS_OPTIONS = {
  due_on_receipt: 0,
  net_7: 7,
  net_15: 15,
  net_30: 30,
  net_45: 45,
  net_60: 60,
  net_90: 90,
}

async function generateQuoteNumber(ctx: any): Promise<string> {
  const counter = await ctx.db
    .query('counters')
    .withIndex('by_name', (q: any) => q.eq('name', 'quote'))
    .unique()

  let nextVal: number

  if (!counter) {
    nextVal = 1001
    await ctx.db.insert('counters', {
      name: 'quote',
      value: nextVal,
    })
  } else {
    nextVal = counter.value + 1
    await ctx.db.patch(counter._id, { value: nextVal })
  }

  const year = new Date().getFullYear()
  return `QT-${year}-${String(nextVal).padStart(4, '0')}`
}

export const create = mutation({
  args: {
    clientId: v.id('clients'),
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
    validUntil: v.optional(v.number()),
    notes: v.optional(v.string()),
    internalNotes: v.optional(v.string()),
    status: v.optional(v.union(v.literal('draft'), v.literal('sent'))),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const quoteStatus = args.status || 'draft'
    const taxRate = args.taxRate ?? DEFAULT_TAX_RATE
    const paymentTerms = args.paymentTerms || DEFAULT_PAYMENT_TERMS
    const validUntil = args.validUntil || now + VALIDITY_DAYS * 24 * 60 * 60 * 1000

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

    const quoteNumber = await generateQuoteNumber(ctx)

    const quoteId = await ctx.db.insert('quotes', {
      clientId: args.clientId,
      jobId: args.jobId,
      quoteNumber,
      status: quoteStatus,
      subtotal,
      taxRate,
      taxAmount,
      discountType: args.discountType,
      discountValue: args.discountValue,
      discountAmount,
      total,
      validUntil,
      paymentTerms,
      notes: args.notes,
      internalNotes: args.internalNotes,
      createdAt: now,
      sentAt: quoteStatus === 'sent' ? now : undefined,
    })

    await Promise.all(
      args.items.map((item) => {
        const itemTotal = item.price * item.quantity
        return ctx.db.insert('quoteItems', {
          quoteId,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          total: itemTotal,
        })
      }),
    )

    return { quoteId, quoteNumber }
  },
})

export const update = mutation({
  args: {
    id: v.id('quotes'),
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
    validUntil: v.optional(v.number()),
    notes: v.optional(v.string()),
    internalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const quote = await ctx.db.get(args.id)
    if (!quote) throw new Error('Quote not found')

    let subtotal = quote.subtotal
    let taxAmount = quote.taxAmount
    let total = quote.total

    if (args.items) {
      const existing = await ctx.db
        .query('quoteItems')
        .withIndex('by_quote', (q) => q.eq('quoteId', args.id))
        .collect()

      await Promise.all(existing.map((item) => ctx.db.delete(item._id)))

      subtotal = args.items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      )

      await Promise.all(
        args.items.map((item) => {
          const itemTotal = item.price * item.quantity
          return ctx.db.insert('quoteItems', {
            quoteId: args.id,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            price: item.price,
            total: itemTotal,
          })
        }),
      )
    }

    const taxRate = args.taxRate ?? quote.taxRate
    const discountType = args.discountType ?? quote.discountType
    const discountValue = args.discountValue ?? quote.discountValue

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

    await ctx.db.patch(args.id, {
      subtotal,
      taxRate,
      taxAmount,
      discountType,
      discountValue,
      discountAmount,
      total,
      validUntil: args.validUntil,
      notes: args.notes,
      internalNotes: args.internalNotes,
      updatedAt: Date.now(),
    })
  },
})

export const remove = mutation({
  args: { id: v.id('quotes') },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query('quoteItems')
      .withIndex('by_quote', (q) => q.eq('quoteId', args.id))
      .collect()

    await Promise.all(items.map((item) => ctx.db.delete(item._id)))
    await ctx.db.delete(args.id)
  },
})

export const getById = query({
  args: { id: v.id('quotes') },
  handler: async (ctx, args) => {
    const quote = await ctx.db.get(args.id)
    if (!quote) return null

    const items = await ctx.db
      .query('quoteItems')
      .withIndex('by_quote', (q) => q.eq('quoteId', args.id))
      .collect()

    const client = await ctx.db.get(quote.clientId)

    return { ...quote, items, client }
  },
})

export const getQuotes = query({
  handler: async (ctx) => {
    return await ctx.db
      .query('quotes')
      .order('desc')
      .collect()
  },
})

export const getQuotesWithClients = query({
  handler: async (ctx) => {
    const quotes = await ctx.db
      .query('quotes')
      .order('desc')
      .collect()

    const quotesWithClients = await Promise.all(
      quotes.map(async (quote) => {
        const client = await ctx.db.get(quote.clientId)
        return { ...quote, client }
      }),
    )

    return quotesWithClients
  },
})

export const getQuotesWithItemsAndClients = query({
  handler: async (ctx) => {
    const quotes = await ctx.db
      .query('quotes')
      .order('desc')
      .collect()

    const quotesWithData = await Promise.all(
      quotes.map(async (quote) => {
        const client = await ctx.db.get(quote.clientId)
        const items = await ctx.db
          .query('quoteItems')
          .withIndex('by_quote', (q) => q.eq('quoteId', quote._id))
          .collect()
        return { ...quote, client, items }
      }),
    )

    return quotesWithData
  },
})

export const getQuoteWithClient = query({
  args: { id: v.id('quotes') },
  handler: async (ctx, args) => {
    const quote = await ctx.db.get(args.id)
    if (!quote) return null

    const items = await ctx.db
      .query('quoteItems')
      .withIndex('by_quote', (q) => q.eq('quoteId', args.id))
      .collect()

    const client = await ctx.db.get(quote.clientId)

    return {
      ...quote,
      items,
      client,
    }
  },
})

export const updateStatus = mutation({
  args: {
    id: v.id('quotes'),
    status: v.union(
      v.literal('draft'),
      v.literal('sent'),
      v.literal('viewed'),
      v.literal('accepted'),
      v.literal('rejected'),
      v.literal('expired'),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const updateData: any = {
      status: args.status,
      updatedAt: now,
    }

    if (args.status === 'sent') {
      updateData.sentAt = now
    } else if (args.status === 'viewed') {
      updateData.viewedAt = now
    }

    await ctx.db.patch(args.id, updateData)
  },
})

export const getQuotesByClient = query({
  args: { clientId: v.id('clients') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('quotes')
      .withIndex('by_client', (q) => q.eq('clientId', args.clientId))
      .order('desc')
      .collect()
  },
})

export const convertToInvoice = mutation({
  args: {
    quoteId: v.id('quotes'),
    dueDate: v.number(),
  },
  handler: async (ctx, args) => {
    const quote = await ctx.db.get(args.quoteId)
    if (!quote) throw new Error('Quote not found')

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
    const invoiceNumber = `INV-${year}-${String(nextVal).padStart(4, '0')}`
    const now = Date.now()

    const invoiceId = await ctx.db.insert('invoices', {
      clientId: quote.clientId,
      quoteId: quote._id,
      jobId: quote.jobId,
      invoiceNumber,
      status: 'draft',
      subtotal: quote.subtotal,
      taxRate: quote.taxRate,
      taxAmount: quote.taxAmount,
      discountType: quote.discountType,
      discountValue: quote.discountValue,
      discountAmount: quote.discountAmount,
      total: quote.total,
      amountPaid: 0,
      amountDue: quote.total,
      paymentTerms: quote.paymentTerms,
      issuedAt: now,
      dueDate: args.dueDate,
      notes: quote.notes,
      internalNotes: quote.internalNotes,
      createdAt: now,
      updatedAt: now,
    })

    const quoteItems = await ctx.db
      .query('quoteItems')
      .withIndex('by_quote', (q) => q.eq('quoteId', quote._id))
      .collect()

    await Promise.all(
      quoteItems.map((item) =>
        ctx.db.insert('invoiceItems', {
          invoiceId,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          total: item.total,
        }),
      ),
    )

    await ctx.db.patch(quote._id, {
      status: 'accepted',
      updatedAt: now,
    })

    return { invoiceId, invoiceNumber }
  },
})

export const getStats = query({
  handler: async (ctx) => {
    const quotes = await ctx.db.query('quotes').collect()
    const now = Date.now()

    const totalQuotes = quotes.length
    const draftQuotes = quotes.filter(q => q.status === 'draft').length
    const sentQuotes = quotes.filter(q => q.status === 'sent').length
    const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length
    const rejectedQuotes = quotes.filter(q => q.status === 'rejected').length
    const pendingQuotes = quotes.filter(q => q.status === 'sent' || q.status === 'viewed').length
    const expiredQuotes = quotes.filter(q => q.validUntil < now && q.status !== 'accepted' && q.status !== 'rejected').length

    const totalValue = quotes.reduce((acc, q) => acc + q.total, 0)
    const acceptedValue = quotes
      .filter(q => q.status === 'accepted')
      .reduce((acc, q) => acc + q.total, 0)
    const pendingValue = quotes
      .filter(q => q.status === 'sent' || q.status === 'viewed')
      .reduce((acc, q) => acc + q.total, 0)

    return {
      totalQuotes,
      draftQuotes,
      sentQuotes,
      acceptedQuotes,
      rejectedQuotes,
      pendingQuotes,
      expiredQuotes,
      totalValue,
      acceptedValue,
      pendingValue,
    }
  },
})
