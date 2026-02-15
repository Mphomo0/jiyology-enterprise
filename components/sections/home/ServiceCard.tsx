'use client'

import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type Service = {
  id: string
  title: string
  description: string
  icon: React.ElementType
}

interface Props {
  service: Service
}

export default function ServiceCard({ service }: Props) {
  return (
    <div className='p-8 rounded-2xl bg-card border border-border shadow-card hover:shadow-elevated transition-shadow h-full flex flex-col'>
      <div className='w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-6'>
        <service.icon className='text-primary-foreground' size={28} />
      </div>

      <h3 className='text-xl font-semibold text-foreground mb-3'>
        {service.title}
      </h3>

      <p className='text-sm text-muted-foreground mb-6 flex-1'>
        {service.description}
      </p>

      <Button
        asChild
        variant='ghost'
        className='justify-start p-0 h-auto text-primary'
      >
        <Link href={`/services#${service.id}`}>
          Learn more
          <ArrowRight className='ml-2' size={16} />
        </Link>
      </Button>
    </div>
  )
}
