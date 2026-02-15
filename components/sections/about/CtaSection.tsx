'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AnimatedSection } from '@/components/layout/AnimatedSection'

export default function CtaSection() {
  return (
    <section className='py-24 bg-primary relative overflow-hidden'>
      <motion.div
        className='absolute bottom-0 right-0 w-96 h-96 rounded-full bg-primary-foreground/10 blur-3xl'
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className='container mx-auto py-12 px-4 relative z-10'>
        <AnimatedSection className='text-center max-w-3xl mx-auto'>
          <h2 className='text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-6'>
            Join Our Growing Team
          </h2>
          <p className='text-white text-lg mb-12'>
            We're always looking for talented professionals to join our team. If
            you're passionate about excellence, we'd love to hear from you.
          </p>
          <Button
            asChild
            size='lg'
            className='bg-primary-foreground text-primary p-8 hover:bg-primary-foreground/80 hover:text-primary-foreground/80'
          >
            <Link href='/contact'>View Open Positions</Link>
          </Button>
        </AnimatedSection>
      </div>
    </section>
  )
}
