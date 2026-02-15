'use client'

import { AnimatedSection } from '@/components/layout/AnimatedSection'
import { Star } from 'lucide-react'
import Marquee from 'react-fast-marquee'

const testimonials = [
  {
    name: 'Alice Johnson',
    role: 'CEO, Example Co.',
    content: 'ProServe exceeded our expectations!',
    rating: 5,
  },
  {
    name: 'Bob Smith',
    role: 'CTO, Tech Corp.',
    content: 'Exceptional service and support!',
    rating: 4,
  },
  {
    name: 'Carol Lee',
    role: 'Founder, Startup Inc.',
    content: 'Highly recommend ProServe for anyone.',
    rating: 5,
  },
  {
    name: 'David Brown',
    role: 'Marketing Head, BrandCo',
    content: 'Their team is extremely professional and helpful.',
    rating: 5,
  },
  {
    name: 'Eva Green',
    role: 'Product Manager, InnovateX',
    content: 'Amazing results delivered on time every time!',
    rating: 4,
  },
]

export default function TestimonialsSection() {
  return (
    <section className='relative py-28 bg-background overflow-hidden'>
      <div className='pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent' />

      <div className='container mx-auto px-4 relative'>
        <AnimatedSection className='text-center max-w-3xl mx-auto mb-20'>
          <span className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6'>
            ⭐ Testimonials
          </span>

          <h2 className='text-4xl md:text-5xl font-display font-bold text-foreground mb-6 tracking-tight'>
            Loved by teams worldwide
          </h2>

          <p className='text-lg text-muted-foreground leading-relaxed'>
            Real feedback from clients who trust ProServe to deliver exceptional
            results.
          </p>
        </AnimatedSection>

        <Marquee pauseOnHover gradientWidth={90} speed={35} className='py-6'>
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className='
                group relative flex flex-col gap-5
                min-w-[300px] md:min-w-[340px]
                p-7 md:p-8
                rounded-3xl
                bg-card/70 backdrop-blur
                border border-border/60
                shadow-sm
                transition-all duration-300 ease-out
                hover:-translate-y-1 hover:shadow-xl hover:border-primary/30
                gap-6 md:gap-8
                mr-6
              '
            >
              <div className='flex gap-1'>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className='text-amber-400 fill-amber-400'
                  />
                ))}
              </div>

              <p className='text-foreground leading-relaxed text-[15px]'>
                "{testimonial.content}"
              </p>

              <div className='flex items-center gap-4 pt-2'>
                <div
                  className='
                  w-11 h-11 rounded-full
                  bg-gradient-to-br from-primary to-primary/60
                  flex items-center justify-center
                  text-primary-foreground font-semibold
                  ring-2 ring-primary/20
                '
                >
                  {testimonial.name.charAt(0)}
                </div>

                <div>
                  <div className='font-semibold text-foreground leading-tight'>
                    {testimonial.name}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    {testimonial.role}
                  </div>
                </div>
              </div>

              <div className='absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition pointer-events-none bg-gradient-to-br from-primary/5 to-transparent' />
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  )
}
