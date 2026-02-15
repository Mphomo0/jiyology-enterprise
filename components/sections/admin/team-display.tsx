'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

interface TeamDisplayProps {
  fullLogo: string
  collapsedLogo: string
}

export function TeamDisplay({ fullLogo, collapsedLogo }: TeamDisplayProps) {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size='lg' className='justify-center'>
          <motion.div
            layout
            transition={{
              layout: {
                duration: isCollapsed ? 0.6 : 0.35,
                ease: 'linear',
              },
            }}
            className='flex items-center justify-center overflow-hidden'
          >
            <AnimatePresence mode='wait'>
              <motion.div
                key={isCollapsed ? 'collapsed' : 'expanded'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: isCollapsed ? 0.4 : 0.2,
                  ease: 'linear',
                }}
                className={isCollapsed ? 'size-8' : 'h-12 w-auto mr-14'}
              >
                <Image
                  src={isCollapsed ? collapsedLogo : fullLogo}
                  alt='Team logo'
                  width={200}
                  height={60}
                  className='h-full w-auto object-contain'
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
