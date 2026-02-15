'use client'

import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { clientSchema, ClientFormData } from '@/lib/schemas'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export function AddClientForm() {
  const router = useRouter()
  const createClient = useMutation(api.clients.createClient)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  })

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true)
    try {
      await createClient({
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
      })
      router.push('/admin/clients')
    } catch (error) {
      console.error('Failed to create client:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='bg-card rounded-lg border p-6 shadow-sm'>
      <h1 className='text-2xl font-bold mb-6'>Add New Client</h1>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <div className='space-y-2'>
          <label htmlFor='name' className='text-sm font-medium'>
            Name *
          </label>
          <Input
            id='name'
            {...register('name')}
            placeholder='Enter client name'
          />
          {errors.name && (
            <p className='text-sm text-destructive'>
              {errors.name.message}
            </p>
          )}
        </div>
        <div className='space-y-2'>
          <label htmlFor='email' className='text-sm font-medium'>
            Email
          </label>
          <Input
            id='email'
            type='email'
            {...register('email')}
            placeholder='Enter email address'
          />
          {errors.email && (
            <p className='text-sm text-destructive'>
              {errors.email.message}
            </p>
          )}
        </div>
        <div className='space-y-2'>
          <label htmlFor='phone' className='text-sm font-medium'>
            Phone
          </label>
          <Input
            id='phone'
            {...register('phone')}
            placeholder='Enter phone number'
          />
          {errors.phone && (
            <p className='text-sm text-destructive'>
              {errors.phone.message}
            </p>
          )}
        </div>
        <div className='space-y-2'>
          <label htmlFor='address' className='text-sm font-medium'>
            Address
          </label>
          <Input
            id='address'
            {...register('address')}
            placeholder='Enter address'
          />
          {errors.address && (
            <p className='text-sm text-destructive'>
              {errors.address.message}
            </p>
          )}
        </div>
        <div className='flex gap-4 pt-4'>
          <Button type='submit' disabled={isSubmitting} className='flex-1'>
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Creating...
              </>
            ) : (
              'Create Client'
            )}
          </Button>
          <Link href='/admin/clients'>
            <Button type='button' variant='outline'>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
