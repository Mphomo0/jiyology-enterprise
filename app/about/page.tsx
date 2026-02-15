import PageWrapper from '@/components/layout/PageWrapper'
import CtaSection from '@/components/sections/about/CtaSection'
import MissionVisionSection from '@/components/sections/about/MissionVisionSection'
import TeamSection from '@/components/sections/about/TeamSection'
import TimelineSection from '@/components/sections/about/TimelineSection'
import ValuesSection from '@/components/sections/about/ValuesSection'

export default function AboutPage() {
  return (
    <>
      <PageWrapper
        title='About Us'
        heading='Building Trust Since 2008'
        description='We&lsquo;re on a mission to deliver exceptional professional services that make life easier for businesses and homeowners alike.'
      />
      <MissionVisionSection />
      <TimelineSection />
      <ValuesSection />
      <TeamSection />
      <CtaSection />
    </>
  )
}
