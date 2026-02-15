'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const stats = [
  { value: '15+', label: 'Years Experience' },
  { value: '5000+', label: 'Projects Completed' },
  { value: '98%', label: 'Client Satisfaction' },
  { value: '50+', label: 'Expert Team Members' },
]

export default function HeroSection() {
  return (
    <section className='relative min-h-screen flex items-center justify-center overflow-hidden'>
      {/* Background Gradient */}
      <div className='absolute inset-0 bg-primary opacity-90' />
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent' />

      {/* Animated shapes */}
      <motion.div
        className='absolute top-20 right-20 w-72 h-72 rounded-full bg-primary-foreground/10 blur-3xl'
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className='absolute bottom-40 left-20 w-96 h-96 rounded-full bg-primary-foreground/10 blur-3xl'
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className='container mx-auto px-4 relative z-10 pt-20'>
        <div className='max-w-4xl mx-auto text-center'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className='inline-block px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground text-sm font-medium mb-6 backdrop-blur-sm'>
              Trusted by 5,000+ businesses
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className='text-4xl md:text-6xl lg:text-7xl font-display font-bold text-primary-foreground mb-6 leading-tight'
          >
            All Your Professional Services,{' '}
            <span className='text-primary-foreground/80'>One Partner</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto'
          >
            From cleaning and maintenance to construction and beyond. We deliver
            exceptional quality across every service we offer.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className='flex flex-col sm:flex-row gap-4 justify-center'
          >
            <Button
              asChild
              size='lg'
              className='bg-white text-primary hover:text-white hover:border-white text-lg px-8 h-14'
            >
              <Link href='/services'>
                Explore Services
                <ArrowRight className='ml-2' size={20} />
              </Link>
            </Button>

            <Button
              asChild
              size='lg'
              className='border-white text-white opacity-90 hover:text-primary hover:bg-white text-lg px-8 h-14'
            >
              <Link href='/contact'>Get Free Quote</Link>
            </Button>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className='mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto'
        >
          {stats.map((stat, index) => (
            <div key={index} className='text-center'>
              <div className='text-3xl md:text-4xl font-bold text-primary-foreground mb-1'>
                {stat.value}
              </div>
              <div className='text-sm text-primary-foreground/70'>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className='absolute bottom-8 left-1/2 -translate-x-1/2'
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className='w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2'
        >
          <div className='w-1.5 h-1.5 rounded-full bg-primary-foreground/50' />
        </motion.div>
      </motion.div>
    </section>
  )
}
