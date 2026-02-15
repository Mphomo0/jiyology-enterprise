'use client'

import { Target, Eye } from 'lucide-react'
import { AnimatedSection } from '@/components/layout/AnimatedSection'

export default function MissionVisionSection() {
  return (
    <section className='py-24 bg-background'>
      <div className='container mx-auto px-4'>
        <div className='grid lg:grid-cols-2 gap-12'>
          <AnimatedSection direction='left'>
            <div className='p-8 md:p-12 rounded-3xl bg-card border border-border shadow-card h-full hover:shadow-2xl shadow-primary/40 transition-all duration-300 ease-in-out'>
              <div className='w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-6'>
                <Target className='text-primary-foreground' size={28} />
              </div>
              <h2 className='text-3xl font-display font-bold mb-4'>
                Our Mission
              </h2>
              <p className='text-muted-foreground leading-relaxed'>
                To provide comprehensive, high-quality professional services
                that exceed client expectations while maintaining the highest
                standards of integrity, safety, and environmental
                responsibility.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection direction='right'>
            <div className='p-8 md:p-12 rounded-3xl bg-card border border-border shadow-card h-full hover:shadow-2xl shadow-primary/40 transition-all duration-300 ease-in-out'>
              <div className='w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-6'>
                <Eye className='text-primary-foreground' size={28} />
              </div>
              <h2 className='text-3xl font-display font-bold mb-4'>
                Our Vision
              </h2>
              <p className='text-muted-foreground leading-relaxed'>
                To become the leading multi-service provider recognized for
                innovation, reliability, and exceptional customer care.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
