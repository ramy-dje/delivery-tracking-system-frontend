'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Manager, managerSchema } from '@/lib/schemas'
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

interface ManagerFormProps {
  initialData?: Manager
  onSubmit: (data: Manager) => void
  isLoading?: boolean
  companies: Array<{ id: string; name: string }>
}

export function ManagerForm({ initialData, onSubmit, isLoading = false, companies }: ManagerFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Manager>({
    resolver: zodResolver(managerSchema),
    defaultValues: initialData,
  })

  const companyId = watch('companyId')
  const status = watch('status')

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
            placeholder="Ali"
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
          placeholder="ahmed@company.com"
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
          'Save Manager'
        )}
      </Button>
    </form>
  )
}
