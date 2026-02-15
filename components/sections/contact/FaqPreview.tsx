'use client'

import { AnimatedSection } from '@/components/layout/AnimatedSection'

const faqs = [
  {
    q: 'How quickly can you provide a quote?',
    a: 'We typically respond within 24 hours for standard requests. Emergency services receive priority attention.',
  },
  {
    q: 'Do you offer service guarantees?',
    a: 'Yes! All our services come with a satisfaction guarantee. We&lsquo;re not happy until you are.',
  },
  {
    q: 'What areas do you serve?',
    a: 'We currently serve the greater Johannesburg metropolitan area, with plans to expand nationwide.',
  },
  {
    q: 'Can I bundle multiple services?',
    a: 'Absolutely! We offer discounted packages for clients who need multiple services.',
  },
]

export default function FaqPreview() {
  return (
    <section className='py-24 bg-background'>
      <div className='container mx-auto px-4'>
        <AnimatedSection className='text-center max-w-3xl mx-auto'>
          <h2 className='text-3xl md:text-4xl font-display font-bold mb-6'>
            Frequently Asked Questions
          </h2>

          <div className='grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto'>
            {faqs.map((f, i) => (
              <div key={i} className='p-6 rounded-2xl bg-muted/50 border'>
                <h4 className='font-semibold mb-2'>{f.q}</h4>
                <p className='text-sm text-muted-foreground'>{f.a}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
