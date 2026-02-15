'use client'

import { ColumnDef } from '@tanstack/react-table'
import { formatCurrency } from '@/lib/currency'

export type Invoice = {
  _id: string
  clientId: string
  quoteId: string
  jobId?: string
  invoiceNumber: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  subtotal: number
  tax?: number
  total: number
  issuedAt: number
  dueDate: number
  paidAt?: number
  createdAt: number
  updatedAt?: number
}

export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: 'invoiceNumber',
    header: 'Invoice #',
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ getValue }) => {
      const total = getValue<number>()
      return formatCurrency(total)
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue<Invoice['status']>()
      const statusColors: Record<Invoice['status'], string> = {
        draft: 'bg-gray-500',
        sent: 'bg-blue-500',
        paid: 'bg-green-500',
        overdue: 'bg-red-500',
        cancelled: 'bg-gray-500',
      }
      return (
        <span
          className={`px-2 py-1 rounded-full text-white text-xs ${
            statusColors[status]
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )
    },
  },
  {
    accessorKey: 'issuedAt',
    header: 'Issued Date',
    cell: ({ getValue }) => {
      const timestamp = getValue<number>()
      const date = new Date(timestamp)
      return date.toLocaleDateString()
    },
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
    cell: ({ getValue }) => {
      const timestamp = getValue<number>()
      const date = new Date(timestamp)
      return date.toLocaleDateString()
    },
  },
  {
    accessorKey: 'paidAt',
    header: 'Paid Date',
    cell: ({ getValue }) => {
      const timestamp = getValue<number | undefined>()
      if (!timestamp) return '-'
      const date = new Date(timestamp)
      return date.toLocaleDateString()
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: () => null,
  },
]
