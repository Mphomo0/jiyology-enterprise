import { AppSidebar } from '@/components/sections/admin/app-sidebar'
import { EditQuoteForm } from '@/components/sections/admin/quotes/EditQuoteForm'
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

interface EditQuotePageProps {
  params: Promise<{ id: string }>
}

export default async function EditQuotePage({ params }: EditQuotePageProps) {
  const { id } = await params

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
                  <BreadcrumbLink href='/admin/quotes'>Quotes</BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator className='hidden md:block' />

                <BreadcrumbItem>
                  <BreadcrumbPage>Edit Quote</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className='flex flex-1 flex-col gap-4 p-4 mb-12'>
          <div className='mx-auto w-full max-w-2xl py-8 space-y-6'>
            <Link
              href='/admin/quotes'
              className='inline-flex items-center bg-blue-800 hover:bg-blue-900 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200'
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Quotes
            </Link>

            <EditQuoteForm quoteId={id} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
