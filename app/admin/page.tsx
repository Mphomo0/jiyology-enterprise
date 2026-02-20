'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { formatCurrency } from '@/lib/currency'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  FileText,
  CreditCard,
  TrendingUp,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  Send,
  Plus,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { AppSidebar } from '@/components/sections/admin/app-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  trend?: { value: number; label: string }
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red'
}

function StatCard({ title, value, description, icon, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RecentQuotesCard() {
  const quotes = useQuery(api.quotes.getQuotesWithClients) ?? []

  const recentQuotes = quotes.slice(0, 5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Recent Quotes</CardTitle>
          <CardDescription>Latest quote activity</CardDescription>
        </div>
        <Link href="/admin/quotes/add">
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            New Quote
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {recentQuotes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No quotes yet</p>
            <Link href="/admin/quotes/add">
              <Button variant="link" className="mt-2">
                Create your first quote
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentQuotes.map((quote) => (
              <div
                key={quote._id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{quote.quoteNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {quote.client?.name || 'Unknown Client'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(quote.total)}</p>
                  <p className={`text-xs ${
                    quote.status === 'accepted' ? 'text-green-600' :
                    quote.status === 'rejected' ? 'text-red-600' :
                    quote.status === 'sent' ? 'text-blue-600' :
                    'text-muted-foreground'
                  }`}>
                    {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                  </p>
                </div>
              </div>
            ))}
            <Link href="/admin/quotes">
              <Button variant="ghost" className="w-full mt-2">
                View all quotes
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RecentInvoicesCard() {
  const invoices = useQuery(api.invoices.getInvoicesWithClients) ?? []

  const recentInvoices = invoices.slice(0, 5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Recent Invoices</CardTitle>
          <CardDescription>Latest invoice activity</CardDescription>
        </div>
        <Link href="/admin/invoices/add">
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            New Invoice
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {recentInvoices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No invoices yet</p>
            <Link href="/admin/invoices/add">
              <Button variant="link" className="mt-2">
                Create your first invoice
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentInvoices.map((invoice) => (
              <div
                key={invoice._id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.client?.name || 'Unknown Client'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(invoice.total)}</p>
                  <p className={`text-xs ${
                    invoice.status === 'paid' ? 'text-green-600' :
                    invoice.status === 'overdue' ? 'text-red-600' :
                    invoice.status === 'sent' ? 'text-blue-600' :
                    'text-muted-foreground'
                  }`}>
                    {invoice.status === 'partially_paid' ? 'Partial' : 
                     invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </p>
                </div>
              </div>
            ))}
            <Link href="/admin/invoices">
              <Button variant="ghost" className="w-full mt-2">
                View all invoices
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const quoteStats = useQuery(api.quotes.getStats)
  const invoiceStats = useQuery(api.invoices.getStats)
  const clients = useQuery(api.clients.getClients) ?? []

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back! Here's an overview of your business.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/quotes/add">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Quote
                </Button>
              </Link>
              <Link href="/admin/invoices/add">
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  New Invoice
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Clients"
              value={clients.length}
              icon={<Users className="h-5 w-5" />}
              color="purple"
            />
            <StatCard
              title="Pending Quotes"
              value={quoteStats?.pendingQuotes ?? 0}
              description={quoteStats ? formatCurrency(quoteStats.pendingValue) : '-'}
              icon={<FileText className="h-5 w-5" />}
              color="blue"
            />
            <StatCard
              title="Outstanding"
              value={invoiceStats ? formatCurrency(invoiceStats.outstandingValue) : '-'}
              description={`${invoiceStats?.overdueInvoices ?? 0} overdue`}
              icon={<Clock className="h-5 w-5" />}
              color="orange"
            />
            <StatCard
              title="Revenue (Paid)"
              value={invoiceStats ? formatCurrency(invoiceStats.paidValue) : '-'}
              description={`From ${invoiceStats?.paidInvoices ?? 0} invoices`}
              icon={<TrendingUp className="h-5 w-5" />}
              color="green"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-gray-100">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Draft Quotes</p>
                    <p className="text-xl font-bold">{quoteStats?.draftQuotes ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-blue-100">
                    <Send className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sent Quotes</p>
                    <p className="text-xl font-bold">{quoteStats?.sentQuotes ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-100">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Accepted Quotes</p>
                    <p className="text-xl font-bold">{quoteStats?.acceptedQuotes ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-red-100">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Overdue Invoices</p>
                    <p className="text-xl font-bold">{invoiceStats?.overdueInvoices ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <RecentQuotesCard />
            <RecentInvoicesCard />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
