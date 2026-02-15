import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

// Helper to generate invoice number
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

  return `INV-${nextVal}`
}

/**
 * Create Invoice (manual creation)
 * - Creates invoice with custom items
 * - Generates invoice number
 * - Supports draft or sent status
 */
export const create = mutation({
  args: {
    clientId: v.id('clients'),
    quoteId: v.id('quotes'),
    jobId: v.optional(v.id('jobs')),
    items: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        price: v.number(),
      }),
    ),
    dueDate: v.number(),
    status: v.optional(v.union(v.literal('draft'), v.literal('sent'))),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const invoiceStatus = args.status || 'draft'
    
    // Calculate totals
    const subtotal = args.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    )
    const tax = subtotal * 0.15 // 15% VAT
    const total = subtotal + tax

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(ctx)

    // Create invoice
    const invoiceId = await ctx.db.insert('invoices', {
      clientId: args.clientId,
      quoteId: args.quoteId,
      jobId: args.jobId,
      invoiceNumber,
      status: invoiceStatus,
      subtotal,
      tax,
      total,
      issuedAt: now,
      dueDate: args.dueDate,
      createdAt: now,
      updatedAt: now,
    })

    // Create invoice items
    await Promise.all(
      args.items.map((item) =>
        ctx.db.insert('invoiceItems', {
          invoiceId,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
        }),
      ),
    )

    return invoiceId
  },
})

/**
 * Create Invoice From Quote
 * - Creates invoice as "draft"
 * - Generates invoice number
 * - Snapshots quote items
 * - Marks quote as accepted
 */
export const createFromQuote = mutation({
  args: {
    quoteId: v.id('quotes'),
    dueDate: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // 1️⃣ Get Quote
    const quote = await ctx.db.get(args.quoteId)
    if (!quote) throw new Error('Quote not found')

    // 2️⃣ Generate Invoice Number
    const invoiceNumber = await generateInvoiceNumber(ctx)

    // 3️⃣ Create Invoice (as draft)
    const invoiceId = await ctx.db.insert('invoices', {
      clientId: quote.clientId,
      quoteId: quote._id,
      jobId: quote.jobId,
      invoiceNumber,
      status: 'draft',
      subtotal: quote.total,
      total: quote.total,
      issuedAt: now,
      dueDate: args.dueDate,
      createdAt: now,
      updatedAt: now,
    })

    // 4️⃣ Snapshot Quote Items
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
          price: item.price,
        }),
      ),
    )

    // 5️⃣ Mark Quote as Accepted
    await ctx.db.patch(quote._id, {
      status: 'accepted',
      updatedAt: now,
    })

    return invoiceId
  },
})

/**
 * Update Invoice Status
 * - Keeps lifecycle consistent
 * - Sets paidAt when paid
 * - Clears paidAt if reverting from paid
 */
export const updateStatus = mutation({
  args: {
    id: v.id('invoices'),
    status: v.union(
      v.literal('draft'),
      v.literal('sent'),
      v.literal('paid'),
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

    // If marking as paid → set paidAt
    if (args.status === 'paid') {
      patch.paidAt = now
    }

    // If changing away from paid → clear paidAt
    if (invoice.status === 'paid' && args.status !== 'paid') {
      patch.paidAt = undefined
    }

    await ctx.db.patch(args.id, patch)
  },
})

/**
 * Delete Invoice + Its Items
 */
export const remove = mutation({
  args: { id: v.id('invoices') },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query('invoiceItems')
      .withIndex('by_invoice', (q) => q.eq('invoiceId', args.id))
      .collect()

    await Promise.all(items.map((item) => ctx.db.delete(item._id)))

    await ctx.db.delete(args.id)
  },
})

/**
 * Get Invoice with Items
 */
export const getById = query({
  args: { id: v.id('invoices') },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.id)
    if (!invoice) return null

    const items = await ctx.db
      .query('invoiceItems')
      .withIndex('by_invoice', (q) => q.eq('invoiceId', args.id))
      .collect()

    return { ...invoice, items }
  },
})

/**
 * Get all invoices
 */
export const getInvoices = query({
  handler: async (ctx) => {
    return await ctx.db
      .query('invoices')
      .order('desc')
      .collect()
  },
})

/**
 * Get invoice with client details for email/PDF
 */
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

    return {
      ...invoice,
      items,
      client,
    }
  },
})

/**
 * Update Invoice (re-syncs items and recalculates totals)
 */
export const update = mutation({
  args: {
    id: v.id('invoices'),
    items: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        price: v.number(),
      }),
    ),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Delete existing items
    const existing = await ctx.db
      .query('invoiceItems')
      .withIndex('by_invoice', (q) => q.eq('invoiceId', args.id))
      .collect()

    await Promise.all(existing.map((item) => ctx.db.delete(item._id)))

    // 2. Insert new items and calc totals
    const subtotal = args.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    )
    const tax = subtotal * 0.15 // 15% VAT
    const total = subtotal + tax

    await Promise.all(
      args.items.map((item) =>
        ctx.db.insert('invoiceItems', { invoiceId: args.id, ...item }),
      ),
    )

    // 3. Update the Invoice totals
    const updateData: any = {
      subtotal,
      tax,
      total,
      updatedAt: Date.now(),
    }

    if (args.dueDate) {
      updateData.dueDate = args.dueDate
    }

    await ctx.db.patch(args.id, updateData)
  },
})

/**
 * Get invoices by quote ID
 */
export const getByQuoteId = query({
  args: { quoteId: v.id('quotes') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('invoices')
      .withIndex('by_quote', (q) => q.eq('quoteId', args.quoteId))
      .collect()
  },
})

/**
 * Get invoices by client ID
 */
export const getByClientId = query({
  args: { clientId: v.id('clients') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('invoices')
      .withIndex('by_client', (q) => q.eq('clientId', args.clientId))
      .collect()
  },
})
