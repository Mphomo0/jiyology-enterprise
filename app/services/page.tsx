'use client'

import PageWrapper from '@/components/layout/PageWrapper'
import ServicesGrid from '@/components/sections/services/ServicesGrid'
import ServicesCta from '@/components/sections/services/ServicesCta'

export default function ServicesPage() {
  return (
    <>
      <PageWrapper
        title='Our Services'
        heading='Comprehensive Professional Services'
        description='Discover our full range of services designed to meet all your residential and commercial needs with excellence.'
      />

      <ServicesGrid />
      <ServicesCta />
    </>
  )
}
