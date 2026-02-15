'use client'

import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { DataTable } from '@/components/layout/data-table'
import { columns as baseColumns } from '@/components/tables/invoices-columns'
import { useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface InvoiceWithClient {
  _id: string
  clientId: string
  status: string
}

export default function ListInvoices() {
  const router = useRouter()
  const invoices = useQuery(api.invoices.getInvoices) ?? []
  const clients = useQuery(api.clients.getClients) ?? []
  const deleteInvoice = useMutation(api.invoices.remove)

  const getClientForInvoice = useCallback((clientId: string) => {
    return clients.find(c => c._id === clientId)
  }, [clients])

  const columns = useMemo(() => {
    return baseColumns.map((col) => {
      if (col.id === 'actions') {
        return {
          ...col,
          cell: ({ row }: { row: { original: InvoiceWithClient } }) => {
            const handleEdit = (id: string) => {
              router.push(`/admin/invoices/${id}`)
            }
            const handleDelete = async (id: string) => {
              if (confirm('Are you sure you want to delete this invoice?')) {
                await deleteInvoice({ id } as any)
              }
            }
            const client = getClientForInvoice(row.original.clientId)
            const { InvoiceActionsCell } = require('@/components/tables/InvoiceActionsCell')
            return (
              <InvoiceActionsCell
                id={row.original._id}
                onEdit={handleEdit}
                onDelete={handleDelete}
                clientName={client?.name}
                clientEmail={client?.email}
                clientAddress={client?.address}
              />
            )
          },
        }
      }
      return col
    })
  }, [deleteInvoice, router, getClientForInvoice])

  return (
    <div className='space-y-4'>
      <div className='flex justify-end'>
        <Link href='/admin/invoices/add'>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            Add Invoice
          </Button>
        </Link>
      </div>
      <DataTable columns={columns} data={invoices} searchPlaceholder='Search invoices...' />
    </div>
  )
}
