'use client'

import {
  AudioWaveform,
  Receipt,
  Briefcase,
  Command,
  GalleryVerticalEnd,
  CreditCard,
  Contact,
} from 'lucide-react'

import { NavMain } from '@/components/sections/admin/nav-main'
import { NavUser } from '@/components/sections/admin/nav-user'
import { TeamDisplay } from '@/components/sections/admin/team-display'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free',
    },
  ],
  navMain: [
    {
      title: 'Clients',
      url: '/admin/clients',
      icon: Contact,
    },
    {
      title: 'Jobs',
      url: '/admin/jobs',
      icon: Briefcase,
    },
    {
      title: 'Quotes',
      url: '/admin/quotes',
      icon: Receipt,
    },
    {
      title: 'Invoices',
      url: '/admin/invoices',
      icon: CreditCard,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <TeamDisplay
          fullLogo='/images/logo.png'
          collapsedLogo='/images/logo-icon.png'
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
