'use client'

import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { DataTable } from '@/components/layout/data-table'
import { columns as baseColumns } from '@/components/tables/clients-columns'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ListClients() {
  const router = useRouter()
  const clients = useQuery(api.clients.getClients) ?? []
  const deleteClient = useMutation(api.clients.deleteClient)

  const columns = useMemo(
    () =>
      baseColumns.map((col) => {
        if (col.id === 'actions') {
          return {
            ...col,
            cell: ({ row }: { row: { original: { _id: string } } }) => {
              const handleEdit = (id: string) => {
                router.push(`/admin/clients/${id}`)
              }
              const handleDelete = async (id: string) => {
                if (confirm('Are you sure you want to delete this client?')) {
                  await deleteClient({ id } as any)
                }
              }
              return (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original._id)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(row.original._id)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              )
            },
          }
        }
        return col
      }),
    [deleteClient, router],
  )

  return (
    <div className='space-y-4'>
      <div className='flex justify-end'>
        <Link href='/admin/clients/add'>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            Add Client
          </Button>
        </Link>
      </div>
      <DataTable columns={columns} data={clients} searchPlaceholder='Search clients...' />
    </div>
  )
}
