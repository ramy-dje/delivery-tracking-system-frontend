'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Deliverer, delivererSchema } from '@/lib/schemas'
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

interface DelivererFormProps {
  initialData?: Deliverer
  onSubmit: (data: Deliverer) => void
  isLoading?: boolean
  companies: Array<{ id: string; name: string }>
  branches: Array<{ id: string; name: string; companyId: string }>
}

export function DelivererForm({
  initialData,
  onSubmit,
  isLoading = false,
  companies,
  branches,
}: DelivererFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Deliverer>({
    resolver: zodResolver(delivererSchema),
    defaultValues: initialData,
  })

  const companyId = watch('companyId')
  const status = watch('status')
  const filteredBranches = companyId
    ? branches.filter((b) => b.companyId === companyId)
    : []

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

      <div>
        <Label htmlFor="branchId" className="text-sm font-medium text-foreground">
          Branch
        </Label>
        <Select
          value={watch('branchId')}
          onValueChange={(value) => setValue('branchId', value)}
          disabled={!companyId}
        >
          <SelectTrigger className="mt-1 bg-input text-foreground" id="branchId">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card">
            {filteredBranches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
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
            placeholder="Mohammed"
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
            placeholder="Saleh"
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
          placeholder="mohammed@example.com"
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

      <div className="space-y-2 border-t border-border pt-4">
        <Label className="text-sm font-semibold text-foreground">Vehicle Information</Label>
        <div>
          <Label htmlFor="vehicleType" className="text-xs font-medium text-foreground">
            Vehicle Type
          </Label>
          <Input
            id="vehicleType"
            placeholder="Bike / Car / Van"
            {...register('vehicle.type')}
            className="mt-1 h-8 bg-input text-foreground text-sm placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <Label htmlFor="registrationNumber" className="text-xs font-medium text-foreground">
            Registration Number
          </Label>
          <Input
            id="registrationNumber"
            placeholder="ABC-1234"
            {...register('vehicle.registrationNumber')}
            className="mt-1 h-8 bg-input text-foreground text-sm placeholder:text-muted-foreground"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="capacity" className="text-xs font-medium text-foreground">
              Capacity (kg)
            </Label>
            <Input
              id="capacity"
              type="number"
              placeholder="50"
              {...register('vehicle.capacity', { valueAsNumber: true })}
              className="mt-1 h-8 bg-input text-foreground text-sm placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <Label htmlFor="licenseNumber" className="text-xs font-medium text-foreground">
              License Number
            </Label>
            <Input
              id="licenseNumber"
              placeholder="DL-12345"
              {...register('licenseNumber')}
              className="mt-1 h-8 bg-input text-foreground text-sm placeholder:text-muted-foreground"
            />
          </div>
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
            <SelectItem value="on_leave">On Leave</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
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
          'Save Deliverer'
        )}
      </Button>
    </form>
  )
}
