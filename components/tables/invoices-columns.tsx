'use client'

import { ColumnDef } from '@tanstack/react-table'
import { formatCurrency } from '@/lib/currency'
import { Badge } from '@/components/ui/badge'

export type Invoice = {
  _id: string
  clientId: string
  quoteId?: string
  jobId?: string
  invoiceNumber: string
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled'
  subtotal: number
  taxRate: number
  taxAmount: number
  discountType?: 'percentage' | 'fixed'
  discountValue?: number
  discountAmount?: number
  total: number
  amountPaid: number
  amountDue: number
  paymentTerms: string
  issuedAt: number
  dueDate: number
  paidAt?: number
  notes?: string
  createdAt: number
  updatedAt?: number
  client?: {
    name: string
    email?: string
  } | null
}

const statusStyles: Record<Invoice['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  draft: { variant: 'secondary', className: 'bg-gray-100 text-gray-700 hover:bg-gray-100' },
  sent: { variant: 'default', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  viewed: { variant: 'default', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  paid: { variant: 'default', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  partially_paid: { variant: 'default', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
  overdue: { variant: 'destructive', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
  cancelled: { variant: 'secondary', className: 'bg-gray-100 text-gray-500 hover:bg-gray-100' },
}

export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: 'invoiceNumber',
    header: 'Invoice #',
    cell: ({ getValue }) => {
      const invoiceNumber = getValue<string>()
      return <span className="font-mono font-medium">{invoiceNumber}</span>
    },
  },
  {
    accessorKey: 'client',
    header: 'Client',
    cell: ({ row }) => {
      const client = row.original.client
      return <span>{client?.name || 'Unknown'}</span>
    },
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ getValue }) => {
      const total = getValue<number>()
      return <span className="font-medium">{formatCurrency(total)}</span>
    },
  },
  {
    accessorKey: 'amountDue',
    header: 'Due',
    cell: ({ getValue, row }) => {
      const amountDue = getValue<number>()
      const status = row.original.status
      if (status === 'paid') {
        return <span className="text-green-600">Paid</span>
      }
      return <span className={amountDue > 0 ? 'text-orange-600 font-medium' : ''}>{formatCurrency(amountDue)}</span>
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue<Invoice['status']>()
      const style = statusStyles[status]
      return (
        <Badge variant={style.variant} className={style.className}>
          {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
    cell: ({ getValue }) => {
      const timestamp = getValue<number>()
      const date = new Date(timestamp)
      const isOverdue = timestamp < Date.now()
      return (
        <span className={isOverdue ? 'text-red-600' : ''}>
          {date.toLocaleDateString()}
        </span>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: () => null,
  },
]
