'use client'

import { motion } from 'motion/react'

interface PageWrapperProps {
  title: string
  heading: string
  description: string
}

export default function PageWrapper({
  title,
  heading,
  description,
}: PageWrapperProps) {
  return (
    <section className='pt-32 pb-20 bg-primary relative overflow-hidden'>
      <motion.div
        className='absolute bottom-0 left-20 w-72 h-72 rounded-full bg-primary-foreground/10 blur-3xl'
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className='container mx-auto px-4 relative z-10'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='text-center max-w-3xl mx-auto'
        >
          <span className='inline-block px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground text-sm font-medium mb-6'>
            {title}
          </span>

          <h1 className='text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6'>
            {heading}
          </h1>

          <p className='text-xl text-primary-foreground/80'>{description}</p>
        </motion.div>
      </div>
    </section>
  )
}
