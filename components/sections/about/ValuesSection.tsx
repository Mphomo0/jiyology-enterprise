'use client'

import { Shield, Award, Users, Leaf } from 'lucide-react'
import { AnimatedSection } from '@/components/layout/AnimatedSection'

const values = [
  {
    icon: Shield,
    title: 'Integrity',
    description: 'Honesty and transparency.',
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'Highest quality standards.',
  },
  {
    icon: Users,
    title: 'Customer First',
    description: 'Your satisfaction matters.',
  },
  {
    icon: Leaf,
    title: 'Sustainability',
    description: 'Eco-friendly practices.',
  },
]

export default function ValuesSection() {
  return (
    <section className='py-24 bg-background'>
      <div className='container mx-auto px-4'>
        <AnimatedSection className='text-center max-w-3xl mx-auto mb-16'>
          <span className='inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4'>
            Core Values
          </span>
          <h2 className='text-3xl md:text-5xl font-display font-bold mb-6'>
            What Drives Us
          </h2>
        </AnimatedSection>

        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {values.map((v, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <div className='text-center p-8 rounded-2xl bg-card border shadow-card'>
                <div className='w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-6'>
                  <v.icon className='text-primary-foreground' size={32} />
                </div>
                <h3 className='font-semibold text-xl mb-3'>{v.title}</h3>
                <p className='text-sm text-muted-foreground'>{v.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
