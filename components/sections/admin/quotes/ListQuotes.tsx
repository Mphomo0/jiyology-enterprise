'use client'

import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { DataTable } from '@/components/layout/data-table'
import { columns as baseColumns } from '@/components/tables/quotes-columns'
import { useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface QuoteWithClient {
  _id: string
  clientId: string
  status: string
}

export default function ListQuotes() {
  const router = useRouter()
  const quotes = useQuery(api.quotes.getQuotes) ?? []
  const clients = useQuery(api.clients.getClients) ?? []
  const deleteQuote = useMutation(api.quotes.remove)

  const getClientForQuote = useCallback((clientId: string) => {
    return clients.find(c => c._id === clientId)
  }, [clients])

  const columns = useMemo(() => {
    return baseColumns.map((col) => {
      if (col.id === 'actions') {
        return {
          ...col,
          cell: ({ row }: { row: { original: QuoteWithClient } }) => {
            const handleEdit = (id: string) => {
              router.push(`/admin/quotes/${id}`)
            }
            const handleDelete = async (id: string) => {
              if (confirm('Are you sure you want to delete this quote?')) {
                await deleteQuote({ id } as any)
              }
            }
            const client = getClientForQuote(row.original.clientId)
            const { ActionsCell } = require('@/components/tables/ActionsCell')
            return (
              <ActionsCell
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
  }, [deleteQuote, router, getClientForQuote])

  return (
    <div className='space-y-4'>
      <div className='flex justify-end'>
        <Link href='/admin/quotes/add'>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            Add Quote
          </Button>
        </Link>
      </div>
      <DataTable columns={columns} data={quotes} searchPlaceholder='Search quotes...' />
    </div>
  )
}
