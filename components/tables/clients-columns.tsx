'use client'

import { ColumnDef } from '@tanstack/react-table'

export type Client = {
  _id: string
  name: string
  email?: string
  phone?: string
  address?: string
  createdAt: number
}

export const columns: ColumnDef<Client>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'address',
    header: 'Address',
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
