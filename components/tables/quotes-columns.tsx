'use client'

import { ColumnDef } from '@tanstack/react-table'
import { formatCurrency } from '@/lib/currency'

export type Quote = {
  _id: string
  clientId: string
  jobId?: string
  total: number
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
  createdAt: number
  updatedAt?: number
}

export const columns: ColumnDef<Quote>[] = [
  {
    accessorKey: '_id',
    header: 'Quote ID',
    cell: ({ getValue }) => {
      const id = getValue<string>()
      return id.slice(0, 8).toUpperCase()
    },
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
      const status = getValue<Quote['status']>()
      const statusColors: Record<Quote['status'], string> = {
        draft: 'bg-gray-500',
        sent: 'bg-blue-500',
        accepted: 'bg-green-500',
        rejected: 'bg-red-500',
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
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ getValue }) => {
      const timestamp = getValue<number>()
      const date = new Date(timestamp)
      return date.toLocaleDateString()
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated At',
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
