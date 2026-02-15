'use client'

import Link from 'next/link'
import { LazyMotion, domAnimation, m } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedSection } from '@/components/layout/AnimatedSection'

export default function CTA() {
  return (
    <section className='relative overflow-hidden py-24 bg-primary'>
      {/* Decorative glow (non-LCP, fixed size → no CLS) */}
      <LazyMotion features={domAnimation}>
        <m.div
          aria-hidden
          className='pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl will-change-transform'
          animate={{ scale: [1, 1.25, 1] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </LazyMotion>

      <div className='container relative z-10 mx-auto px-4'>
        {/* LCP-safe content (no animation here) */}
        <AnimatedSection className='mx-auto max-w-3xl text-center'>
          <h2 className='mb-6 text-3xl font-display font-bold text-primary-foreground md:text-5xl'>
            Ready to Get Started?
          </h2>

          <p className='mb-10 text-xl leading-relaxed text-primary-foreground/80'>
            Contact us today for a free consultation and quote. Let us show you
            why thousands of businesses trust ProServe for all their service
            needs.
          </p>

          <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <Button
              asChild
              size='lg'
              className='bg-white text-primary hover:text-white hover:border-white text-lg px-8 h-14'
            >
              <Link
                href='/contact'
                prefetch={false}
                className='inline-flex items-center'
              >
                Get Free Quote
                <ArrowRight className='ml-2' size={20} />
              </Link>
            </Button>

            <Button
              asChild
              size='lg'
              className='border-white text-white opacity-90 hover:text-primary hover:bg-white text-lg px-8 h-14'
            >
              <a href='tel:+15551234567'>Call Us Now</a>
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
