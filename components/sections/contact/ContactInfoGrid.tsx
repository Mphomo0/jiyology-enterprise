'use client'

import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { AnimatedSection } from '@/components/layout/AnimatedSection'

const contactInfo = [
  {
    icon: Phone,
    title: 'Phone',
    value: '+1 (555) 123-4567',
    description: 'Mon–Fri 8am–6pm EST',
  },
  {
    icon: Mail,
    title: 'Email',
    value: 'info@proserve.com',
    description: 'We reply within 24 hours',
  },
  {
    icon: MapPin,
    title: 'Office',
    value: '123 Business Ave, Suite 100',
    description: 'New York, NY 10001',
  },
  {
    icon: Clock,
    title: 'Hours',
    value: 'Mon–Fri: 8am–6pm',
    description: 'Sat: 9am–3pm',
  },
]

export default function ContactInfoGrid() {
  return (
    <section className='py-16 bg-background'>
      <div className='container mx-auto px-4'>
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-20 relative z-20'>
          {contactInfo.map((info, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <div className='p-6 rounded-2xl bg-card border shadow-card text-center'>
                <div className='w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4'>
                  <info.icon className='text-primary-foreground' size={24} />
                </div>
                <h3 className='font-semibold mb-1'>{info.title}</h3>
                <p className='font-medium mb-1'>{info.value}</p>
                <p className='text-sm text-muted-foreground'>
                  {info.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
