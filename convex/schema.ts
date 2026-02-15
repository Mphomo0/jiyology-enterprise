import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // Clients table
  clients: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_email', ['email'])
    .index('by_phone', ['phone']),

  // Jobs table
  jobs: defineTable({
    clientId: v.id('clients'),
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('in_progress'),
      v.literal('completed'),
    ),
    scheduledDate: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index('by_client', ['clientId'])
    .index('by_status', ['status']),

  // Quotes table
  quotes: defineTable({
    clientId: v.id('clients'),
    jobId: v.optional(v.id('jobs')),
    total: v.number(),
    status: v.union(
      v.literal('draft'),
      v.literal('sent'),
      v.literal('accepted'),
      v.literal('rejected'),
    ),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_client', ['clientId'])
    .index('by_job', ['jobId'])
    .index('by_status', ['status']),

  // Quote items table (one row per item)
  quoteItems: defineTable({
    quoteId: v.id('quotes'),
    description: v.string(),
    quantity: v.number(),
    price: v.number(),
  }).index('by_quote', ['quoteId']),

  // Invoices table
  invoices: defineTable({
    clientId: v.id('clients'),
    quoteId: v.id('quotes'),
    jobId: v.optional(v.id('jobs')),

    invoiceNumber: v.string(),
    status: v.union(
      v.literal('draft'),
      v.literal('sent'),
      v.literal('paid'),
      v.literal('overdue'),
      v.literal('cancelled'),
    ),

    subtotal: v.number(),
    tax: v.optional(v.number()),
    total: v.number(),

    issuedAt: v.number(),
    dueDate: v.number(),
    paidAt: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_client', ['clientId'])
    .index('by_quote', ['quoteId'])
    .index('by_job', ['jobId'])
    .index('by_status', ['status'])
    .index('by_invoiceNumber', ['invoiceNumber']),

  // Invoice items table (one row per item)
  invoiceItems: defineTable({
    invoiceId: v.id('invoices'),
    description: v.string(),
    quantity: v.number(),
    price: v.number(),
  }).index('by_invoice', ['invoiceId']),

  // Counter table for auto-generating invoice numbers
  counters: defineTable({
    name: v.string(), // e.g., 'invoice'
    value: v.number(),
  }).index('by_name', ['name']),
})
