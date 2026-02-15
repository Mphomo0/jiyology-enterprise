import { AppSidebar } from '@/components/sections/admin/app-sidebar'
import { EditClientForm } from '@/components/sections/admin/clients/EditClientForm'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { ConvexHttpClient } from 'convex/browser'

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
  const client = await convex.query(api.clients.getClientById, { id: id as Id<'clients'> })

  if (!client) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className='flex flex-1 flex-col gap-4 p-4 py-12'>
            <div className='mx-auto w-full max-w-lg'>
              <Link
                href='/admin/clients'
                className='bg-blue-800 px-4 py-2 rounded-lg inline-flex justify-start text-sm text-white hover:text-foreground mb-4'
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to Clients
              </Link>
              <div className='bg-card rounded-lg border p-6 shadow-sm'>
                <h1 className='text-2xl font-bold mb-6'>Client not found</h1>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
          <div className='flex items-center gap-2 px-4'>
            <SidebarTrigger className='-ml-1' />
            <Separator
              orientation='vertical'
              className='mr-2 data-[orientation=vertical]:h-4'
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className='hidden md:block'>
                  <BreadcrumbLink href='/admin'>Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className='hidden md:block' />
                <BreadcrumbItem>
                  <BreadcrumbLink href='/admin/clients'>Clients</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className='hidden md:block' />
                <BreadcrumbItem>
                  <BreadcrumbPage>Edit Client</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className='flex flex-1 flex-col gap-4 p-4 py-12'>
          <div className='mx-auto w-full max-w-lg'>
            <Link
              href='/admin/clients'
              className='bg-blue-800 px-4 py-2 rounded-lg inline-flex justify-start text-sm text-white hover:text-foreground mb-4'
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Clients
            </Link>
            <EditClientForm client={client} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
