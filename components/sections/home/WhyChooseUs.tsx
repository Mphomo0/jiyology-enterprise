'use client'

import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedSection } from '@/components/layout/AnimatedSection'
import { Users, Award, Clock } from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Expert Team',
    description: 'Certified professionals with years of industry experience',
  },
  {
    icon: Award,
    title: 'Quality Guaranteed',
    description: 'We stand behind our work with satisfaction guarantees',
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Round-the-clock assistance for all your urgent needs',
  },
]

export default function WhyChooseUs() {
  return (
    <section className='py-24 bg-muted/50'>
      <div className='container mx-auto px-4'>
        <div className='grid lg:grid-cols-2 gap-16 items-center'>
          <AnimatedSection direction='left'>
            <span className='inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4'>
              Why Choose Us
            </span>

            <h2 className='text-3xl md:text-5xl font-display font-bold text-foreground mb-6'>
              Your Trusted Partner for Excellence
            </h2>

            <p className='text-lg text-muted-foreground mb-8'>
              With over 15 years of experience, we've built a reputation for
              delivering exceptional service quality and customer satisfaction
              across all our offerings.
            </p>

            <div className='space-y-4'>
              {[
                'Licensed and insured professionals',
                'Competitive and transparent pricing',
                'Flexible scheduling options',
                '100% satisfaction guarantee',
                'Eco-friendly practices',
              ].map((item, index) => (
                <div key={index} className='flex items-center gap-3'>
                  <CheckCircle2
                    className='text-primary flex-shrink-0'
                    size={22}
                  />
                  <span className='text-foreground'>{item}</span>
                </div>
              ))}
            </div>

            <Button
              asChild
              size='lg'
              className='mt-8 gradient-bg text-primary-foreground hover:opacity-90 px-4 py-6'
            >
              <Link href='/about'>Learn More About Us</Link>
            </Button>
          </AnimatedSection>

          <div className='grid grid-cols-1 gap-6'>
            {features.map((feature, index) => (
              <AnimatedSection
                key={index}
                delay={index * 0.1}
                direction='right'
              >
                <div className='flex gap-5 p-6 rounded-2xl bg-card border border-border shadow-sm hover:border-primary hover:shadow-md transition-shadow'>
                  <div className='w-14 h-14 rounded-xl bg-primary flex items-center justify-center shrink-0'>
                    <feature.icon
                      className='text-primary-foreground'
                      size={26}
                    />
                  </div>

                  <div>
                    <h3 className='font-semibold text-lg text-foreground mb-2'>
                      {feature.title}
                    </h3>
                    <p className='text-muted-foreground text-sm'>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
