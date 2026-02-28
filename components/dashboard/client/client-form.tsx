'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Client, clientSchema } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, X } from 'lucide-react'
import { useState } from 'react'

interface ClientFormProps {
  initialData?: Client
  onSubmit: (data: Client) => void
  isLoading?: boolean
}

export function ClientForm({ initialData, onSubmit, isLoading = false }: ClientFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Client>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData,
  })

  const status = watch('status')
  const addresses = watch('addresses') || []

  const addAddress = () => {
    setValue('addresses', [
      ...(addresses || []),
      { street: '', city: '', state: '', zipCode: '' },
    ])
  }

  const removeAddress = (index: number) => {
    setValue(
      'addresses',
      addresses.filter((_, i) => i !== index)
    )
  }

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
          placeholder="+966 50 123 4567"
          {...register('phone')}
          className="mt-1 bg-input text-foreground placeholder:text-muted-foreground"
        />
        {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">Delivery Addresses</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAddress}
            className="text-xs"
          >
            + Add Address
          </Button>
        </div>
        <div className="space-y-3">
          {addresses?.map((address, index) => (
            <div key={index} className="rounded-lg border border-border bg-muted p-3 space-y-2">
              <div className="flex items-end justify-between gap-2">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Label</Label>
                  <Input
                    placeholder="Home/Work"
                    value={address.label || ''}
                    onChange={(e) => {
                      const newAddresses = [...(addresses || [])]
                      newAddresses[index].label = e.target.value
                      setValue('addresses', newAddresses)
                    }}
                    className="h-8 mt-1 bg-input text-foreground text-sm placeholder:text-muted-foreground"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeAddress(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Input
                placeholder="Street"
                value={address.street}
                onChange={(e) => {
                  const newAddresses = [...(addresses || [])]
                  newAddresses[index].street = e.target.value
                  setValue('addresses', newAddresses)
                }}
                className="h-8 bg-input text-foreground text-sm placeholder:text-muted-foreground"
              />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="City"
                  value={address.city}
                  onChange={(e) => {
                    const newAddresses = [...(addresses || [])]
                    newAddresses[index].city = e.target.value
                    setValue('addresses', newAddresses)
                  }}
                  className="h-8 bg-input text-foreground text-sm placeholder:text-muted-foreground"
                />
                <Input
                  placeholder="State"
                  value={address.state}
                  onChange={(e) => {
                    const newAddresses = [...(addresses || [])]
                    newAddresses[index].state = e.target.value
                    setValue('addresses', newAddresses)
                  }}
                  className="h-8 bg-input text-foreground text-sm placeholder:text-muted-foreground"
                />
                <Input
                  placeholder="Zip"
                  value={address.zipCode}
                  onChange={(e) => {
                    const newAddresses = [...(addresses || [])]
                    newAddresses[index].zipCode = e.target.value
                    setValue('addresses', newAddresses)
                  }}
                  className="h-8 bg-input text-foreground text-sm placeholder:text-muted-foreground"
                />
              </div>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={address.isDefault ?? false}
                  onCheckedChange={(checked) => {
                    const newAddresses = [...(addresses || [])]
                    newAddresses[index].isDefault = !!checked
                    setValue('addresses', newAddresses)
                  }}
                />
                <span className="text-xs text-muted-foreground">Set as default</span>
              </label>
            </div>
          ))}
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
          'Save Client'
        )}
      </Button>
    </form>
  )
}
