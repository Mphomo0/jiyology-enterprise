'use client'

import { AnimatedSection } from '@/components/layout/AnimatedSection'
import { Button } from '@/components/ui/button'
import { Phone } from 'lucide-react'

export default function MapAndEmergency() {
  return (
    <AnimatedSection direction='right'>
      <div className='flex flex-col h-full'>
        <div className='flex-1 rounded-3xl overflow-hidden border shadow-card'>
          <iframe
            title='Office Location'
            className='w-full h-full min-h-[400px]'
            loading='lazy'
            src='https://www.google.com/maps?q=New+York+NY&output=embed'
          />
        </div>

        <div className='mt-8 p-8 rounded-3xl bg-card border shadow-card'>
          <h3 className='font-semibold text-lg mb-4'>
            Emergency Services Available
          </h3>
          <p className='text-muted-foreground mb-4'>
            Need urgent help? Our emergency team is available 24/7 for plumbing,
            electrical, and security emergencies.
          </p>
          <Button variant='outline' className='gap-2'>
            <Phone size={18} />
            Call Emergency Line
          </Button>
        </div>
      </div>
    </AnimatedSection>
  )
}
