'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Branch, branchSchema } from '@/lib/schemas'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'

interface BranchFormProps {
  initialData?: Branch
  onSubmit: (data: Branch) => void
  isLoading?: boolean
  companies: Array<{ id: string; name: string }>
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function BranchForm({ initialData, onSubmit, isLoading = false, companies }: BranchFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Branch>({
    resolver: zodResolver(branchSchema),
    defaultValues: initialData || {
      operatingHours: days.map((day) => ({
        day: day as any,
        isOpen: true,
        openTime: '09:00',
        closeTime: '18:00',
      })),
    },
  })

  const companyId = watch('companyId')
  const status = watch('status')
  const operatingHours = watch('operatingHours')

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
        <Label htmlFor="name" className="text-sm font-medium text-foreground">
          Branch Name
        </Label>
        <Input
          id="name"
          placeholder="Downtown Branch"
          {...register('name')}
          className="mt-1 bg-input text-foreground placeholder:text-muted-foreground"
        />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
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
        {errors.address && (
          <p className="mt-1 text-xs text-destructive">{errors.address.message}</p>
        )}
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
          {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>}
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
          {errors.state && (
            <p className="mt-1 text-xs text-destructive">{errors.state.message}</p>
          )}
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
          {errors.zipCode && (
            <p className="mt-1 text-xs text-destructive">{errors.zipCode.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        </div>
        <div>
          <Label htmlFor="maxCapacity" className="text-sm font-medium text-foreground">
            Max Capacity
          </Label>
          <Input
            id="maxCapacity"
            type="number"
            placeholder="100"
            {...register('maxCapacity', { valueAsNumber: true })}
            className="mt-1 bg-input text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-foreground">Operating Hours</Label>
        <div className="mt-3 space-y-3">
          {days.map((day, index) => (
            <div key={day} className="flex items-end gap-2">
              <div className="flex-1">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={operatingHours?.[index]?.isOpen ?? true}
                    onCheckedChange={(checked) => {
                      const hours = [...(operatingHours || [])]
                      hours[index] = { ...hours[index], isOpen: !!checked }
                      setValue('operatingHours', hours)
                    }}
                  />
                  <span className="text-sm text-foreground">{day}</span>
                </label>
              </div>
              {operatingHours?.[index]?.isOpen && (
                <>
                  <Input
                    type="time"
                    value={operatingHours?.[index]?.openTime || '09:00'}
                    onChange={(e) => {
                      const hours = [...(operatingHours || [])]
                      hours[index] = { ...hours[index], openTime: e.target.value }
                      setValue('operatingHours', hours)
                    }}
                    className="h-10 w-24 bg-input text-foreground"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={operatingHours?.[index]?.closeTime || '18:00'}
                    onChange={(e) => {
                      const hours = [...(operatingHours || [])]
                      hours[index] = { ...hours[index], closeTime: e.target.value }
                      setValue('operatingHours', hours)
                    }}
                    className="h-10 w-24 bg-input text-foreground"
                  />
                </>
              )}
            </div>
          ))}
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
          'Save Branch'
        )}
      </Button>
    </form>
  )
}
