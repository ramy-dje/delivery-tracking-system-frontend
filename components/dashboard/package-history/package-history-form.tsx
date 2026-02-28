'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PackageHistory, packageHistorySchema } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PackageHistoryFormProps {
  history?: PackageHistory
  onSubmit: (data: PackageHistory) => void
  onCancel: () => void
  packages: any[]
  branches: any[]
}

export function PackageHistoryForm({
  history: initialHistory,
  onSubmit,
  onCancel,
  packages,
  branches,
}: PackageHistoryFormProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<PackageHistory>({
    resolver: zodResolver(packageHistorySchema),
    defaultValues: initialHistory || {
      status: 'pending',
      timestamp: new Date().toISOString(),
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Package History Entry</CardTitle>
          <CardDescription>Track package status changes and movements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="packageId">Package *</Label>
              <Select defaultValue={initialHistory?.packageId} onValueChange={(value) => setValue('packageId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select package" />
                </SelectTrigger>
                <SelectContent>
                  {packages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.trackingNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select defaultValue={initialHistory?.status} onValueChange={(value) => setValue('status', value as any)}>
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

            <div>
              <Label htmlFor="branchId">Branch</Label>
              <Select defaultValue={initialHistory?.branchId} onValueChange={(value) => setValue('branchId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
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
              <Label htmlFor="handlerRole">Handler Role</Label>
              <Select defaultValue={initialHistory?.handlerRole} onValueChange={(value) => setValue('handlerRole', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select handler role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="deliverer">Deliverer</SelectItem>
                  <SelectItem value="transporter">Transporter</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="handlerName">Handler Name</Label>
              <Input
                id="handlerName"
                {...register('handlerName')}
                placeholder="Name of person who handled it"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="timestamp">Timestamp *</Label>
              <Input
                id="timestamp"
                type="datetime-local"
                {...register('timestamp')}
                className="mt-1"
              />
              {errors.timestamp && (
                <p className="text-sm text-destructive mt-1">{errors.timestamp.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes about this status change"
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="formattedLocation">Location</Label>
            <Input
              id="formattedLocation"
              {...register('formattedLocation')}
              placeholder="e.g., Branch A, Hub 1, Client Address"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" className="bg-accent hover:bg-accent/90">
          {initialHistory ? 'Update History' : 'Add History'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
