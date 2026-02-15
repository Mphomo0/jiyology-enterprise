'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { AnimatedSection } from '@/components/layout/AnimatedSection'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Send, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { services } from '@/lib/services'
import MapAndEmergency from './MapAndEmergency'

/* -------------------- Schema -------------------- */
const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  service: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
})

type ContactFormValues = z.infer<typeof contactSchema>

export default function ContactFormSection() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  })

  async function onSubmit(data: ContactFormValues) {
    setIsSubmitting(true)

    // fake API delay
    await new Promise((r) => setTimeout(r, 1500))

    setIsSubmitting(false)
    setIsSubmitted(true)
    reset()
    toast.success('Message sent successfully!')
  }

  return (
    <section className='py-24 bg-muted/50'>
      <div className='container mx-auto px-4'>
        <div className='grid lg:grid-cols-2 gap-12'>
          <AnimatedSection direction='left'>
            <div className='p-8 md:p-10 rounded-3xl bg-card border shadow-card'>
              <h2 className='text-3xl font-display font-bold mb-2'>
                Send Us a Message
              </h2>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className='text-center py-12'
                >
                  <div className='w-16 h-16 rounded-full gradient-bg flex items-center justify-center mx-auto mb-6'>
                    <CheckCircle2
                      className='text-primary-foreground'
                      size={32}
                    />
                  </div>
                  <p className='mb-6 text-muted-foreground'>
                    We’ll get back to you within 24 hours.
                  </p>
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    variant='outline'
                  >
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                  {/* Names */}
                  <div className='grid md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <Label htmlFor='firstName'>First Name *</Label>
                      <Input id='firstName' {...register('firstName')} />
                      {errors.firstName && (
                        <p className='text-sm text-destructive'>
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='lastName'>Last Name *</Label>
                      <Input id='lastName' {...register('lastName')} />
                      {errors.lastName && (
                        <p className='text-sm text-destructive'>
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className='space-y-2'>
                    <Label htmlFor='email'>Email *</Label>
                    <Input id='email' type='email' {...register('email')} />
                    {errors.email && (
                      <p className='text-sm text-destructive'>
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Service */}
                  <div className='space-y-2'>
                    <Label>Service Needed</Label>
                    <Select
                      onValueChange={(value) => setValue('service', value)}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select a service' />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.title}
                          </SelectItem>
                        ))}
                        <SelectItem value='other'>Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Message */}
                  <div className='space-y-2'>
                    <Label htmlFor='message'>Message *</Label>
                    <Textarea
                      id='message'
                      className='min-h-[150px]'
                      {...register('message')}
                    />
                    {errors.message && (
                      <p className='text-sm text-destructive'>
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type='submit'
                    disabled={isSubmitting}
                    className='w-full gradient-bg h-14'
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                    <Send className='ml-2' size={18} />
                  </Button>
                </form>
              )}
            </div>
          </AnimatedSection>

          <MapAndEmergency />
        </div>
      </div>
    </section>
  )
}
