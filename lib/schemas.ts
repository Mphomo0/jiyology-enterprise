import { z } from 'zod'

export const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
})

export type ContactFormData = z.infer<typeof contactSchema>

export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export type ClientFormData = z.infer<typeof clientSchema>

export const jobSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  scheduledDate: z.number().optional(),
})

export type JobFormData = z.infer<typeof jobSchema>

export const quoteItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0, 'Price must be positive'),
})

export const quoteSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  jobId: z.string().optional(),
  items: z.array(quoteItemSchema).min(1, 'At least one item is required'),
})

export type QuoteFormData = z.infer<typeof quoteSchema>
export type QuoteItemFormData = z.infer<typeof quoteItemSchema>

export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0, 'Price must be positive'),
})

export const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  quoteId: z.string().min(1, 'Quote is required'),
  jobId: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  dueDate: z.number().min(1, 'Due date is required'),
})

export type InvoiceFormData = z.infer<typeof invoiceSchema>
export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>
