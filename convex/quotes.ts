import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

// Create Quote with Items
export const create = mutation({
  args: {
    clientId: v.id('clients'),
    jobId: v.optional(v.id('jobs')),
    items: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        price: v.number(),
      }),
    ),
    status: v.optional(v.union(v.literal('draft'), v.literal('sent'))),
  },
  handler: async (ctx, args) => {
    const quoteStatus = args.status || 'draft'
    const total = args.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    )
    const quoteId = await ctx.db.insert('quotes', {
      clientId: args.clientId,
      jobId: args.jobId,
      total,
      status: quoteStatus,
      createdAt: Date.now(),
    })

    await Promise.all(
      args.items.map((item) =>
        ctx.db.insert('quoteItems', { quoteId, ...item }),
      ),
    )

    return quoteId
  },
})

// Update Quote (re-syncs items and recalculates total)
export const update = mutation({
  args: {
    id: v.id('quotes'),
    items: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        price: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // 1. Delete existing items
    const existing = await ctx.db
      .query('quoteItems')
      .withIndex('by_quote', (q) => q.eq('quoteId', args.id))
      .collect()

    await Promise.all(existing.map((item) => ctx.db.delete(item._id)))

    // 2. Insert new items and calc total
    const total = args.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    )

    await Promise.all(
      args.items.map((item) =>
        ctx.db.insert('quoteItems', { quoteId: args.id, ...item }),
      ),
    )

    // 3. Update the Quote total
    await ctx.db.patch(args.id, { total, updatedAt: Date.now() })
  },
})

// Delete Quote and its items
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

// Fetch a quote and its items simultaneously
export const getById = query({
  args: { id: v.id('quotes') },
  handler: async (ctx, args) => {
    const quote = await ctx.db.get(args.id)
    if (!quote) return null

    const items = await ctx.db
      .query('quoteItems')
      .withIndex('by_quote', (q) => q.eq('quoteId', args.id))
      .collect()

    return { ...quote, items }
  },
})

// Get all quotes
export const getQuotes = query({
  handler: async (ctx) => {
    return await ctx.db
      .query('quotes')
      .order('desc')
      .collect()
  },
})

// Get quote with client details for email/PDF
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

// Update quote status
export const updateStatus = mutation({
  args: {
    id: v.id('quotes'),
    status: v.union(
      v.literal('draft'),
      v.literal('sent'),
      v.literal('accepted'),
      v.literal('rejected'),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    })
  },
})
