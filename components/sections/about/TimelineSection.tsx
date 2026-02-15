'use client'

import { AnimatedSection } from '@/components/layout/AnimatedSection'

const milestones = [
  {
    year: '2008',
    title: 'Founded',
    description: 'Started with a small cleaning service',
  },
  {
    year: '2012',
    title: 'Expansion',
    description: 'Added plumbing and electrical services',
  },
  {
    year: '2016',
    title: 'Growth',
    description: 'Launched construction division',
  },
  {
    year: '2020',
    title: 'Innovation',
    description: 'Introduced digital booking platform',
  },
  {
    year: '2024',
    title: 'Today',
    description: 'Serving 5000+ businesses nationwide',
  },
]

export default function TimelineSection() {
  return (
    <section className='py-24 bg-muted/50'>
      <div className='container mx-auto px-4'>
        <AnimatedSection className='text-center max-w-3xl mx-auto mb-16'>
          <span className='inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4'>
            Our Journey
          </span>
          <h2 className='text-3xl md:text-5xl font-display font-bold mb-6'>
            15+ Years of Excellence
          </h2>
          <p className='text-lg text-muted-foreground'>
            From humble beginnings to a nationwide presence.
          </p>
        </AnimatedSection>

        <div className='relative max-w-4xl mx-auto'>
          <div className='absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 hidden md:block' />

          <div className='space-y-12'>
            {milestones.map((m, i) => (
              <AnimatedSection
                key={m.year}
                delay={i * 0.1}
                className={`flex items-center gap-8 ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : ''}`}>
                  <div className='p-6 rounded-2xl bg-card border shadow-card inline-block'>
                    <div className='text-primary font-bold text-2xl mb-2'>
                      {m.year}
                    </div>
                    <h3 className='font-semibold text-lg mb-1'>{m.title}</h3>
                    <p className='text-sm text-muted-foreground'>
                      {m.description}
                    </p>
                  </div>
                </div>
                <div className='hidden md:flex w-4 h-4 rounded-full bg-primary z-10' />
                <div className='flex-1 hidden md:block' />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
