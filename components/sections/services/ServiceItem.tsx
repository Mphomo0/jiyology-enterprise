'use client'

import { motion } from 'motion/react'
import { AnimatedSection } from '@/components/layout/AnimatedSection'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type Service = {
  id: string
  title: string
  description: string
  icon: React.ElementType
  features: string[]
}

interface Props {
  service: Service
  index: number
}

export default function ServiceItem({ service, index }: Props) {
  const isReversed = index % 2 === 1

  return (
    <AnimatedSection
      id={service.id}
      direction={isReversed ? 'right' : 'left'}
      className='scroll-mt-24'
    >
      <div className='grid lg:grid-cols-2 gap-12 items-center'>
        {/* Content */}
        <div className={isReversed ? 'lg:order-2' : ''}>
          <div className='w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-6'>
            <service.icon className='text-primary-foreground' size={32} />
          </div>

          <h2 className='text-3xl md:text-4xl font-display font-bold mb-4'>
            {service.title}
          </h2>

          <p className='text-lg text-muted-foreground mb-8'>
            {service.description}
          </p>

          <div className='grid sm:grid-cols-2 gap-4 mb-8'>
            {service.features.map((feature, i) => (
              <div key={i} className='flex items-center gap-3'>
                <CheckCircle2
                  className='text-primary flex-shrink-0'
                  size={20}
                />
                <span className='text-sm'>{feature}</span>
              </div>
            ))}
          </div>

          <Button
            asChild
            className='gradient-bg text-primary-foreground hover:opacity-90'
          >
            <Link href='/contact'>
              Request Quote
              <ArrowRight className='ml-2' size={18} />
            </Link>
          </Button>
        </div>

        {/* Visual */}
        <div className={isReversed ? 'lg:order-1' : ''}>
          <div className='aspect-[4/3] rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border flex items-center justify-center overflow-hidden'>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='w-32 h-32 rounded-3xl gradient-bg flex items-center justify-center shadow-elevated'
            >
              <service.icon className='text-primary-foreground' size={64} />
            </motion.div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}
