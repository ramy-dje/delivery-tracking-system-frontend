'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Freelancer, freelancerSchema } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface FreelancerFormProps {
  initialData?: Freelancer
  onSubmit: (data: Freelancer) => void
  isLoading?: boolean
  companies: Array<any>
}

export function FreelancerForm({ initialData, onSubmit, isLoading = false, companies }: FreelancerFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Freelancer>({
    resolver: zodResolver(freelancerSchema),
    defaultValues: initialData,
  })

  const companyId = watch('companyId')
  const businessType = watch('businessType')
  const status = watch('status')
  const preferredDeliveryType = watch('preferredDeliveryType')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="companyId" className="text-sm font-medium text-foreground">
          Company
        </Label>
        <Select value={companyId} onValueChange={(value) => setValue('companyId', value)}>
          <SelectTrigger className="mt-1 bg-input text-foreground" id="companyId">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card">
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
            First Name
          </Label>
          <Input
            id="firstName"
            placeholder="Ahmed"
            {...register('firstName')}
            className="mt-1 bg-input text-foreground placeholder:text-muted-foreground"
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
            Last Name
          </Label>
          <Input
            id="lastName"
            placeholder="Hassan"
            {...register('lastName')}
            className="mt-1 bg-input text-foreground placeholder:text-muted-foreground"
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="ahmed@example.com"
          {...register('email')}
          className="mt-1 bg-input text-foreground placeholder:text-muted-foreground"
        />
        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="phone" className="text-sm font-medium text-foreground">
          Phone
        </Label>
        <Input
          id="phone"
          placeholder="+966 50 123 4567"
          {...register('phone')}
          className="mt-1 bg-input text-foreground placeholder:text-muted-foreground"
        />
        {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
      </div>

      <div>
        <Label htmlFor="businessName" className="text-sm font-medium text-foreground">
          Business Name (Optional)
        </Label>
        <Input
          id="businessName"
          placeholder="My Delivery Service"
          {...register('businessName')}
          className="mt-1 bg-input text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div>
        <Label htmlFor="businessType" className="text-sm font-medium text-foreground">
          Business Type
        </Label>
        <Select value={businessType} onValueChange={(value) => setValue('businessType', value as any)}>
          <SelectTrigger className="mt-1 bg-input text-foreground" id="businessType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card">
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="small_business">Small Business</SelectItem>
            <SelectItem value="ecommerce">E-commerce</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="preferredDeliveryType" className="text-sm font-medium text-foreground">
          Preferred Delivery Type
        </Label>
        <Select
          value={preferredDeliveryType || 'home'}
          onValueChange={(value) => setValue('preferredDeliveryType', value as any)}
        >
          <SelectTrigger className="mt-1 bg-input text-foreground" id="preferredDeliveryType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card">
            <SelectItem value="home">Home Delivery</SelectItem>
            <SelectItem value="branch_pickup">Branch Pickup</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="status" className="text-sm font-medium text-foreground">
          Status
        </Label>
        <Select value={status} onValueChange={(value) => setValue('status', value as any)}>
          <SelectTrigger className="mt-1 bg-input text-foreground" id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card">
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Freelancer'
        )}
      </Button>
    </form>
  )
}
