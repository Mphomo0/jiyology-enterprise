import { AppSidebar } from '@/components/sections/admin/app-sidebar'
import { EditJobForm } from '@/components/sections/admin/jobs/EditJobForm'
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

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
  const job = await convex.query(api.jobs.getJobById, { id: id as Id<'jobs'> })

  if (!job) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
            <div className='mx-auto w-full max-w-lg'>
              <Link
                href='/admin/jobs'
                className='inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4'
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to Jobs
              </Link>
              <div className='bg-card rounded-lg border p-6 shadow-sm'>
                <h1 className='text-2xl font-bold mb-6'>Job not found</h1>
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
                  <BreadcrumbLink href='/admin/jobs'>Jobs</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className='hidden md:block' />
                <BreadcrumbItem>
                  <BreadcrumbPage>Edit Job</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
          <div className='mx-auto w-full max-w-lg'>
            <Link
              href='/admin/jobs'
              className='inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4'
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Jobs
            </Link>
            <EditJobForm job={job} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
