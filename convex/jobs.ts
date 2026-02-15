import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

// Create a Job
export const create = mutation({
  args: {
    clientId: v.id('clients'),
    title: v.string(),
    description: v.string(),
    scheduledDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('jobs', {
      ...args,
      status: 'pending',
      createdAt: Date.now(),
    })
  },
})

// Update Job Details
export const update = mutation({
  args: {
    id: v.id('jobs'),
    clientId: v.optional(v.id('clients')),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('in_progress'),
        v.literal('completed'),
      ),
    ),
    scheduledDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([_, v]) => v !== undefined),
    )
    await ctx.db.patch(id, updates)
  },
})

// Delete Job
export const remove = mutation({
  args: { id: v.id('jobs') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})

// Get all jobs (Listing)
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query('jobs').order('desc').collect()
  },
})

// Get job by ID
export const getJobById = query({
  args: { id: v.id('jobs') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})
