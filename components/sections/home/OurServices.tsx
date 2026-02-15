'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedSection } from '@/components/layout/AnimatedSection'
import { services } from '@/lib/services'
import ServiceCard from './ServiceCard'

export default function OurServices() {
  return (
    <section className='py-24 bg-background'>
      <div className='container mx-auto px-4'>
        <AnimatedSection className='text-center max-w-3xl mx-auto mb-16'>
          <span className='inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4'>
            Our Services
          </span>

          <h2 className='text-3xl md:text-5xl font-display font-bold text-foreground mb-6'>
            Comprehensive Solutions for Every Need
          </h2>

          <p className='text-lg text-muted-foreground'>
            We offer a wide range of professional services to meet all your
            residential and commercial requirements under one roof.
          </p>
        </AnimatedSection>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {services.slice(0, 6).map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        <AnimatedSection className='text-center mt-12'>
          <Button asChild size='lg' variant='outline' className='gap-2'>
            <Link href='/services'>
              View All Services
              <ArrowRight size={18} />
            </Link>
          </Button>
        </AnimatedSection>
      </div>
    </section>
  )
}
