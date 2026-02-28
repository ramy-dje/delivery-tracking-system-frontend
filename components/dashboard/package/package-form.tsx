'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Package as PackageType, packageSchema } from '@/lib/schemas'
import { useData } from '@/hooks/use-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Trash2 } from 'lucide-react'

interface PackageFormProps {
  package?: PackageType
  onSubmit: (data: PackageType) => void
  onCancel: () => void
  branches: any[]
  companies: any[]
  clients?: any[]
}

export function PackageForm({
  package: initialPackage,
  onSubmit,
  onCancel,
  branches,
  companies,
  clients = [],
}: PackageFormProps) {
  const { control, register, handleSubmit, formState: { errors }, watch, setValue } = useForm<PackageType>({
    resolver: zodResolver(packageSchema),
    defaultValues: initialPackage || {
      isFragile: false,
      deliveryProgress: 0,
      isDelivered: false,
      isInTransit: false,
      isAtBranch: false,
      needsAttention: false,
      isOverdue: false,
      canBeDelivered: true,
      attemptCount: 0,
      maxAttempts: 3,
      totalPrice: 0,
      weight: 0.5,
    },
  })

  const { fields: issueFields, append: appendIssue, remove: removeIssue } = useFieldArray({
    control,
    name: 'issues',
  })

  const { fields: historyFields } = useFieldArray({
    control,
    name: 'trackingHistory',
  })

  const selectedStatus = watch('status')
  const isFragile = watch('isFragile')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Package Information</CardTitle>
          <CardDescription>Basic details about the package</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="trackingNumber">Tracking Number *</Label>
              <Input
                id="trackingNumber"
                {...register('trackingNumber')}
                placeholder="PKG-001"
                className="mt-1"
              />
              {errors.trackingNumber && (
                <p className="text-sm text-destructive mt-1">{errors.trackingNumber.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="companyId">Company *</Label>
              <Select defaultValue={initialPackage?.companyId} onValueChange={(value) => setValue('companyId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Package Type *</Label>
              <Select defaultValue={initialPackage?.type} onValueChange={(value) => setValue('type', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="parcel">Parcel</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                  <SelectItem value="fragile">Fragile</SelectItem>
                  <SelectItem value="hazmat">Hazmat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="senderType">Sender Type *</Label>
              <Select defaultValue={initialPackage?.senderType} onValueChange={(value) => setValue('senderType', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sender type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="merchant">Merchant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Package contents description"
              className="mt-1"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Physical Properties */}
      <Card>
        <CardHeader>
          <CardTitle>Physical Properties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight">Weight (kg) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0.1"
                {...register('weight', { valueAsNumber: true })}
                className="mt-1"
              />
              {errors.weight && (
                <p className="text-sm text-destructive mt-1">{errors.weight.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="volume">Volume (m³)</Label>
              <Input
                id="volume"
                type="number"
                step="0.01"
                {...register('volume', { valueAsNumber: true })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="dimensions.length">Length (cm)</Label>
              <Input
                id="dimensions.length"
                type="number"
                {...register('dimensions.length', { valueAsNumber: true })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="dimensions.width">Width (cm)</Label>
              <Input
                id="dimensions.width"
                type="number"
                {...register('dimensions.width', { valueAsNumber: true })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="dimensions.height">Height (cm)</Label>
              <Input
                id="dimensions.height"
                type="number"
                {...register('dimensions.height', { valueAsNumber: true })}
                className="mt-1"
              />
            </div>

            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('isFragile')}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm font-medium">Fragile Item</span>
              </label>
            </div>
          </div>

          <div>
            <Label htmlFor="declaredValue">Declared Value (optional)</Label>
            <Input
              id="declaredValue"
              type="number"
              step="0.01"
              {...register('declaredValue', { valueAsNumber: true })}
              placeholder="0.00"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Details */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="originBranchId">Origin Branch *</Label>
              <Select defaultValue={initialPackage?.originBranchId} onValueChange={(value) => setValue('originBranchId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select origin branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currentBranchId">Current Branch</Label>
              <Select defaultValue={initialPackage?.currentBranchId} onValueChange={(value) => setValue('currentBranchId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select current branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="destinationBranchId">Destination Branch</Label>
              <Select defaultValue={initialPackage?.destinationBranchId} onValueChange={(value) => setValue('destinationBranchId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="deliveryType">Delivery Type *</Label>
              <Select defaultValue={initialPackage?.deliveryType} onValueChange={(value) => setValue('deliveryType', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home_delivery">Home Delivery</SelectItem>
                  <SelectItem value="branch_pickup">Branch Pickup</SelectItem>
                  <SelectItem value="office_delivery">Office Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="deliveryPriority">Priority *</Label>
              <Select defaultValue={initialPackage?.deliveryPriority} onValueChange={(value) => setValue('deliveryPriority', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="express">Express</SelectItem>
                  <SelectItem value="same_day">Same Day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select defaultValue={initialPackage?.status} onValueChange={(value) => setValue('status', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="picked_up">Picked Up</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="at_branch">At Branch</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed_delivery">Failed Delivery</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="destination.name">Recipient Name *</Label>
            <Input
              id="destination.name"
              {...register('destination.name')}
              placeholder="Full name"
              className="mt-1"
            />
            {errors.destination?.name && (
              <p className="text-sm text-destructive mt-1">{errors.destination.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="destination.phone">Recipient Phone *</Label>
            <Input
              id="destination.phone"
              {...register('destination.phone')}
              placeholder="+1234567890"
              className="mt-1"
            />
            {errors.destination?.phone && (
              <p className="text-sm text-destructive mt-1">{errors.destination.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="destination.address">Address *</Label>
            <Input
              id="destination.address"
              {...register('destination.address')}
              placeholder="Street address"
              className="mt-1"
            />
            {errors.destination?.address && (
              <p className="text-sm text-destructive mt-1">{errors.destination.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="destination.city">City *</Label>
              <Input
                id="destination.city"
                {...register('destination.city')}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="destination.state">State</Label>
              <Input
                id="destination.state"
                {...register('destination.state')}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="destination.zipCode">Zip Code</Label>
              <Input
                id="destination.zipCode"
                {...register('destination.zipCode')}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="totalPrice">Total Price *</Label>
              <Input
                id="totalPrice"
                type="number"
                step="0.01"
                min="0"
                {...register('totalPrice', { valueAsNumber: true })}
                className="mt-1"
              />
              {errors.totalPrice && (
                <p className="text-sm text-destructive mt-1">{errors.totalPrice.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="paymentStatus">Payment Status *</Label>
              <Select defaultValue={initialPackage?.paymentStatus} onValueChange={(value) => setValue('paymentStatus', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select defaultValue={initialPackage?.paymentMethod} onValueChange={(value) => setValue('paymentMethod', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Issues</CardTitle>
          <CardDescription>Add any issues related to this package</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {issueFields.map((field, index) => (
            <div key={field.id} className="p-4 border border-border rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`issues.${index}.type`}>Issue Type</Label>
                  <Input
                    id={`issues.${index}.type`}
                    {...register(`issues.${index}.type`)}
                    placeholder="e.g., Damage, Lost"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`issues.${index}.status`}>Status</Label>
                  <Select
                    defaultValue={field.status}
                    onValueChange={(value) => setValue(`issues.${index}.status` as any, value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor={`issues.${index}.description`}>Description</Label>
                <Textarea
                  id={`issues.${index}.description`}
                  {...register(`issues.${index}.description`)}
                  className="mt-1"
                  rows={2}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeIssue(index)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendIssue({ type: '', description: '', status: 'open' } as any)}
          >
            Add Issue
          </Button>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-3">
        <Button type="submit" className="bg-accent hover:bg-accent/90">
          {initialPackage ? 'Update Package' : 'Create Package'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
