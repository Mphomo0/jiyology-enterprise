'use client'

import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { jobSchema, JobFormData } from '@/lib/schemas'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

interface JobWithClient {
  _id: string
  clientId: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  scheduledDate?: number
  createdAt: number
}

interface EditJobFormProps {
  job: JobWithClient
}

export function EditJobForm({ job }: EditJobFormProps) {
  const router = useRouter()
  const clients = useQuery(api.clients.getClients) ?? []
  const updateJob = useMutation(api.jobs.update)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scheduledDate, setScheduledDate] = useState(
    job.scheduledDate ? new Date(job.scheduledDate).toISOString().split('T')[0] : ''
  )
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed'>(job.status)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      clientId: job.clientId,
      title: job.title,
      description: job.description,
    },
  })

  const onSubmit = async (data: JobFormData) => {
    setIsSubmitting(true)
    try {
      const scheduledTimestamp = scheduledDate
        ? new Date(scheduledDate + 'T00:00:00').getTime()
        : undefined
      await updateJob({
        id: job._id as any,
        clientId: data.clientId as any,
        title: data.title,
        description: data.description,
        scheduledDate: scheduledTimestamp,
        status: status,
      })
      router.push('/admin/jobs')
    } catch (error) {
      console.error('Failed to update job:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='bg-card rounded-lg border p-6 shadow-sm'>
      <h1 className='text-2xl font-bold mb-6'>Edit Job</h1>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <div className='space-y-2'>
          <label htmlFor='clientId' className='text-sm font-medium'>
            Client *
          </label>
          <Select
            onValueChange={(value) => setValue('clientId', value)}
            defaultValue={job.clientId}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select a client' />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client._id} value={client._id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            type='hidden'
            {...register('clientId')}
          />
          {errors.clientId && (
            <p className='text-sm text-destructive'>
              {errors.clientId.message}
            </p>
          )}
        </div>
        <div className='space-y-2'>
          <label htmlFor='title' className='text-sm font-medium'>
            Title *
          </label>
          <Input
            id='title'
            {...register('title')}
            placeholder='Enter job title'
          />
          {errors.title && (
            <p className='text-sm text-destructive'>
              {errors.title.message}
            </p>
          )}
        </div>
        <div className='space-y-2'>
          <label htmlFor='description' className='text-sm font-medium'>
            Description *
          </label>
          <Textarea
            id='description'
            {...register('description')}
            placeholder='Enter job description'
            rows={4}
          />
          {errors.description && (
            <p className='text-sm text-destructive'>
              {errors.description.message}
            </p>
          )}
        </div>
        <div className='space-y-2'>
          <label htmlFor='scheduledDate' className='text-sm font-medium'>
            Scheduled Date
          </label>
          <Input
            id='scheduledDate'
            type='date'
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
          />
        </div>
        <div className='space-y-2'>
          <label htmlFor='status' className='text-sm font-medium'>
            Status
          </label>
          <Select
            onValueChange={(value) => setStatus(value as 'pending' | 'in_progress' | 'completed')}
            defaultValue={job.status}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='pending'>Pending</SelectItem>
              <SelectItem value='in_progress'>In Progress</SelectItem>
              <SelectItem value='completed'>Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='flex gap-4 pt-4'>
          <Button type='submit' disabled={isSubmitting} className='flex-1'>
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
          <Link href='/admin/jobs'>
            <Button type='button' variant='outline'>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
