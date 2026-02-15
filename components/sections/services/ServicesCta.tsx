'use client'

import { AnimatedSection } from '@/components/layout/AnimatedSection'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function ServicesCta() {
  return (
    <section className='py-24 bg-muted/50'>
      <div className='container mx-auto px-4'>
        <AnimatedSection className='text-center max-w-3xl mx-auto'>
          <h2 className='text-3xl md:text-4xl font-display font-bold mb-6'>
            Need Multiple Services?
          </h2>

          <p className='text-lg text-muted-foreground mb-8'>
            We offer bundled packages for businesses and homeowners who need
            multiple services. Contact us for a customized solution.
          </p>

          <Button
            asChild
            size='lg'
            className='bg-primary text-primary-foreground hover:opacity-90'
          >
            <Link href='/contact'>
              Get Custom Quote
              <ArrowRight className='ml-2' size={20} />
            </Link>
          </Button>
        </AnimatedSection>
      </div>
    </section>
  )
}
