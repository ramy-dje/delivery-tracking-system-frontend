'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Company, companySchema } from '@/lib/schemas'
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

interface CompanyFormProps {
  initialData?: Company
  onSubmit: (data: Company) => void
  isLoading?: boolean
}

export function CompanyForm({ initialData, onSubmit, isLoading = false }: CompanyFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Company>({
    resolver: zodResolver(companySchema),
    defaultValues: initialData,
  })

  const businessType = watch('businessType')
  const status = watch('status')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-sm font-medium text-foreground">
          Company Name
        </Label>
        <Input
          id="name"
          placeholder="Acme Delivery Co."
          {...register('name')}
          className="mt-1 bg-input text-foreground placeholder:text-muted-foreground"
        />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
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
            <SelectItem value="solo">Solo</SelectItem>
            <SelectItem value="small_business">Small Business</SelectItem>
            <SelectItem value="ecommerce">E-commerce</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
        {errors.businessType && (
          <p className="mt-1 text-xs text-destructive">{errors.businessType.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="contact@acme.com"
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
        <Label htmlFor="address" className="text-sm font-medium text-foreground">
          Address
        </Label>
        <Input
          id="address"
          placeholder="123 Main Street"
          {...register('address')}
          className="mt-1 bg-input text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city" className="text-sm font-medium text-foreground">
            City
          </Label>
          <Input
            id="city"
            placeholder="Riyadh"
            {...register('city')}
            className="mt-1 bg-input text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <Label htmlFor="state" className="text-sm font-medium text-foreground">
            State
          </Label>
          <Input
            id="state"
            placeholder="Riyadh"
            {...register('state')}
            className="mt-1 bg-input text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <Label htmlFor="zipCode" className="text-sm font-medium text-foreground">
            Zip Code
          </Label>
          <Input
            id="zipCode"
            placeholder="11111"
            {...register('zipCode')}
            className="mt-1 bg-input text-foreground placeholder:text-muted-foreground"
          />
        </div>
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
          'Save Company'
        )}
      </Button>
    </form>
  )
}
