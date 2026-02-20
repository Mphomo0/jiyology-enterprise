import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  clients: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    country: v.optional(v.string()),
    companyRegNumber: v.optional(v.string()),
    vatNumber: v.optional(v.string()),
    contactPerson: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_email', ['email'])
    .index('by_phone', ['phone']),

  jobs: defineTable({
    clientId: v.id('clients'),
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('cancelled'),
    ),
    scheduledDate: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index('by_client', ['clientId'])
    .index('by_status', ['status']),

  quotes: defineTable({
    clientId: v.id('clients'),
    jobId: v.optional(v.id('jobs')),
    quoteNumber: v.string(),
    status: v.union(
      v.literal('draft'),
      v.literal('sent'),
      v.literal('viewed'),
      v.literal('accepted'),
      v.literal('rejected'),
      v.literal('expired'),
    ),
    subtotal: v.number(),
    taxRate: v.number(),
    taxAmount: v.number(),
    discountType: v.optional(v.union(v.literal('percentage'), v.literal('fixed'))),
    discountValue: v.optional(v.number()),
    discountAmount: v.optional(v.number()),
    total: v.number(),
    validUntil: v.number(),
    paymentTerms: v.string(),
    notes: v.optional(v.string()),
    internalNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    viewedAt: v.optional(v.number()),
  })
    .index('by_client', ['clientId'])
    .index('by_job', ['jobId'])
    .index('by_status', ['status'])
    .index('by_quoteNumber', ['quoteNumber']),

  quoteItems: defineTable({
    quoteId: v.id('quotes'),
    description: v.string(),
    quantity: v.number(),
    unit: v.optional(v.string()),
    price: v.number(),
    total: v.number(),
  }).index('by_quote', ['quoteId']),

  invoices: defineTable({
    clientId: v.id('clients'),
    quoteId: v.optional(v.id('quotes')),
    jobId: v.optional(v.id('jobs')),
    invoiceNumber: v.string(),
    status: v.union(
      v.literal('draft'),
      v.literal('sent'),
      v.literal('viewed'),
      v.literal('paid'),
      v.literal('partially_paid'),
      v.literal('overdue'),
      v.literal('cancelled'),
    ),
    subtotal: v.number(),
    taxRate: v.number(),
    taxAmount: v.number(),
    discountType: v.optional(v.union(v.literal('percentage'), v.literal('fixed'))),
    discountValue: v.optional(v.number()),
    discountAmount: v.optional(v.number()),
    total: v.number(),
    amountPaid: v.number(),
    amountDue: v.number(),
    paymentTerms: v.string(),
    issuedAt: v.number(),
    dueDate: v.number(),
    paidAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    internalNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    viewedAt: v.optional(v.number()),
  })
    .index('by_client', ['clientId'])
    .index('by_quote', ['quoteId'])
    .index('by_job', ['jobId'])
    .index('by_status', ['status'])
    .index('by_invoiceNumber', ['invoiceNumber'])
    .index('by_dueDate', ['dueDate']),

  invoiceItems: defineTable({
    invoiceId: v.id('invoices'),
    description: v.string(),
    quantity: v.number(),
    unit: v.optional(v.string()),
    price: v.number(),
    total: v.number(),
  }).index('by_invoice', ['invoiceId']),

  payments: defineTable({
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
    paidAt: v.number(),
    createdAt: v.number(),
  }).index('by_invoice', ['invoiceId']),

  companySettings: defineTable({
    companyName: v.string(),
    companyEmail: v.optional(v.string()),
    companyPhone: v.optional(v.string()),
    companyAddress: v.optional(v.string()),
    companyCity: v.optional(v.string()),
    companyPostalCode: v.optional(v.string()),
    companyCountry: v.optional(v.string()),
    companyRegNumber: v.optional(v.string()),
    companyVatNumber: v.optional(v.string()),
    companyBankName: v.optional(v.string()),
    companyBankAccount: v.optional(v.string()),
    companyBankBranch: v.optional(v.string()),
    defaultTaxRate: v.number(),
    defaultPaymentTerms: v.string(),
    logoUrl: v.optional(v.string()),
  }),

  counters: defineTable({
    name: v.string(),
    value: v.number(),
    prefix: v.optional(v.string()),
    format: v.optional(v.string()),
  }).index('by_name', ['name']),
})
