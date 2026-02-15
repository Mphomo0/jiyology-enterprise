import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

// Create a new client
export const createClient = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('clients', {
      ...args,
      createdAt: Date.now(),
    })
  },
})

// Update a client
export const updateClient = mutation({
  args: {
    id: v.id('clients'),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    return await ctx.db.patch(id, updates)
  },
})

// Delete a client
export const deleteClient = mutation({
  args: {
    id: v.id('clients'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id)
  },
})

// Get all clients
export const getClients = query({
  handler: async (ctx) => {
    return await ctx.db
      .query('clients')
      .order('desc') // newest first
      .collect()
  },
})

// Get client by ID
export const getClientById = query({
  args: { id: v.id('clients') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})
