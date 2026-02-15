'use client'

import { AnimatedSection } from '@/components/layout/AnimatedSection'

const team = [
  { name: 'David Mitchell', role: 'CEO & Founder', initial: 'DM' },
  { name: 'Sarah Thompson', role: 'Operations Director', initial: 'ST' },
  { name: 'Michael Ross', role: 'Head of Construction', initial: 'MR' },
  { name: 'Jennifer Lee', role: 'Customer Success Manager', initial: 'JL' },
]

export default function TeamSection() {
  return (
    <section id='team' className='py-24 bg-muted/50 scroll-mt-24'>
      <div className='container mx-auto px-4'>
        <AnimatedSection className='text-center max-w-3xl mx-auto mb-16'>
          <span className='inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4'>
            Our Team
          </span>
          <h2 className='text-3xl md:text-5xl font-display font-bold mb-6'>
            Meet the Leadership
          </h2>
        </AnimatedSection>

        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto'>
          {team.map((m, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <div className='text-center'>
                <div className='w-32 h-32 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 text-4xl font-bold text-primary-foreground'>
                  {m.initial}
                </div>
                <h3 className='font-semibold text-lg'>{m.name}</h3>
                <p className='text-sm text-muted-foreground'>{m.role}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
