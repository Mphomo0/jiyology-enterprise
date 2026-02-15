'use client'

import { services } from '@/lib/services'
import ServiceItem from './ServiceItem'

export default function ServicesGrid() {
  return (
    <section className='py-24 bg-background'>
      <div className='container mx-auto px-4'>
        <div className='space-y-24'>
          {services.map((service, index) => (
            <ServiceItem key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
