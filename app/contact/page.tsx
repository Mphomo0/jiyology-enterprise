import ContactInfoGrid from '@/components/sections/contact/ContactInfoGrid'
import ContactFormSection from '@/components/sections/contact/ContactFormSection'
import FaqPreview from '@/components/sections/contact/FaqPreview'
import PageWrapper from '@/components/layout/PageWrapper'

export default function ContactPage() {
  return (
    <>
      <PageWrapper
        title='Contact Us'
        heading='Get in touch'
        description="Have a question or need a quote? We'd love to hear from you. Our team is ready to help with all your service needs."
      />
      <ContactInfoGrid />
      <ContactFormSection />
      <FaqPreview />
    </>
  )
}
