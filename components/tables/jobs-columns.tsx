'use client'

import { ColumnDef } from '@tanstack/react-table'

export type Job = {
  _id: string
  clientId: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  scheduledDate?: number
  createdAt: number
}

export const columns: ColumnDef<Job>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue<Job['status']>()
      const statusColors = {
        pending: 'bg-yellow-500',
        in_progress: 'bg-blue-500',
        completed: 'bg-green-500',
        cancelled: 'bg-gray-500',
      }
      return (
        <span
          className={`px-2 py-1 rounded-full text-white text-xs ${
            statusColors[status]
          }`}
        >
          {status.replace('_', ' ')}
        </span>
      )
    },
  },
  {
    accessorKey: 'scheduledDate',
    header: 'Scheduled Date',
    cell: ({ getValue }) => {
      const timestamp = getValue<number | undefined>()
      if (!timestamp) return '-'
      const date = new Date(timestamp)
      return date.toLocaleDateString()
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
    id: 'actions',
    header: 'Actions',
    cell: () => null,
  },
]
