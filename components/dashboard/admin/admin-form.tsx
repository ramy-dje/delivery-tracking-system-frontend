'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Admin, adminSchema } from '@/lib/schemas'
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

interface AdminFormProps {
  initialData?: Admin
  onSubmit: (data: Admin) => void
  isLoading?: boolean
}

export function AdminForm({ initialData, onSubmit, isLoading = false }: AdminFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Admin>({
    resolver: zodResolver(adminSchema),
    defaultValues: initialData,
  })

  const role = watch('role')
  const status = watch('status')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
            First Name
          </Label>
          <Input
            id="firstName"
            placeholder="John"
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
            placeholder="Doe"
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
          placeholder="john@example.com"
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
          placeholder="+1 (555) 000-0000"
          {...register('phone')}
          className="mt-1 bg-input text-foreground placeholder:text-muted-foreground"
        />
        {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="role" className="text-sm font-medium text-foreground">
            Role
          </Label>
          <Select value={role} onValueChange={(value) => setValue('role', value as any)}>
            <SelectTrigger className="mt-1 bg-input text-foreground" id="role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card">
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && <p className="mt-1 text-xs text-destructive">{errors.role.message}</p>}
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
          {errors.status && (
            <p className="mt-1 text-xs text-destructive">{errors.status.message}</p>
          )}
        </div>
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
          'Save Admin'
        )}
      </Button>
    </form>
  )
}
