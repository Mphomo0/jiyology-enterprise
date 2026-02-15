import CTA from '@/components/sections/home/CTA'
import Hero from '@/components/sections/home/Hero'
import OurServices from '@/components/sections/home/OurServices'
import TestimonialsSection from '@/components/sections/home/TestimonialsSection'
import WhyChooseUs from '@/components/sections/home/WhyChooseUs'

export default function HomePage() {
  return (
    <>
      <Hero />
      <OurServices />
      <WhyChooseUs />
      <TestimonialsSection />
      <CTA />
    </>
  )
}
