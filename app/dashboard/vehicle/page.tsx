'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/data-table'
import { FormDialog } from '@/components/dashboard/form-dialog'
import { DeleteDialog } from '@/components/dashboard/delete-dialog'
import { VehicleForm } from '@/components/dashboard/vehicle/vehicle-form'
import type { VehicleDetailed } from '@/lib/schemas'
import {
  getMyVehicles,
  createVehicle,
  updateVehicle,
  toggleBlockVehicle,
} from '@/lib/api/crud/vehicle'
import { getMyCompany } from '@/lib/api/crud/company'
import { getMyBranches } from '@/lib/api/crud/branch'
import { toast } from 'sonner'

export default function VehiclePage() {
  const [vehicles, setVehicles] = useState<VehicleDetailed[]>([])
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([])
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([])
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleDetailed | undefined>()

  const fetchData = useCallback(async () => {
    try {
      setIsFetching(true)
      const companyRes = await getMyCompany()
      if (companyRes.success && companyRes.data?.company) {
        const c = companyRes.data.company
        const cId = c._id
        setCompanyId(cId)
        setCompanies([
          {
            id: cId,
            name: c.name,
          },
        ])

        // Fetch branches for the form select
        const branchRes = await getMyBranches(cId)
        if (branchRes.success) {
          setBranches(
            branchRes.data.map((b: any) => ({
              id: b._id,
              name: b.name,
            }))
          )
        }

        // Fetch vehicles
        try {
          const vehicleRes = await getMyVehicles(cId)
          if (vehicleRes.success) {
            setVehicles(
              vehicleRes.data.map((v: any) => ({
                id: v._id,
                companyId: v.companyId || cId,
                type: v.type || 'car',
                registrationNumber: v.registrationNumber || '',
                brand: v.brand || '',
                modelName: v.modelName || v.model || '',
                year: v.year,
                color: v.color,
                maxWeight: v.maxWeight || 0,
                maxVolume: v.maxVolume || 0,
                supportsFragile: v.supportsFragile || false,
                currentBranchId: v.currentBranchId?._id || v.currentBranchId,
                assignedUserId: v.assignedUserId?._id || v.assignedUserId,
                status: v.status || 'available',
                isAvailable: v.isAvailable ?? true,
                notes: v.notes,
              }))
            )
          }
        } catch {
          // Vehicle API endpoint may not exist yet — gracefully handle
          console.warn('Vehicle API not available yet')
          setVehicles([])
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch vehicles:', error)
      toast.error('Failed to load data')
    } finally {
      setIsFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAdd = async (data: VehicleDetailed) => {
    if (!companyId) {
      toast.error('No company found')
      return
    }
    setIsLoading(true)
    try {
      await createVehicle(companyId, {
        companyId,
        type: data.type,
        registrationNumber: data.registrationNumber,
        brand: data.brand,
        modelName: data.modelName,
        year: data.year,
        color: data.color,
        maxWeight: data.maxWeight,
        maxVolume: data.maxVolume,
        supportsFragile: data.supportsFragile,
        currentBranchId: data.currentBranchId,
        notes: data.notes,
      })
      toast.success('Vehicle created successfully')
      setFormOpen(false)
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create vehicle')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (data: VehicleDetailed) => {
    if (!companyId || !selectedVehicle?.id) return
    setIsLoading(true)
    try {
      await updateVehicle(companyId, selectedVehicle.id, {
        type: data.type,
        registrationNumber: data.registrationNumber,
        brand: data.brand,
        modelName: data.modelName,
        year: data.year,
        color: data.color,
        maxWeight: data.maxWeight,
        maxVolume: data.maxVolume,
        supportsFragile: data.supportsFragile,
        currentBranchId: data.currentBranchId,
        status: data.status,
        isAvailable: data.isAvailable,
        notes: data.notes,
      })
      toast.success('Vehicle updated successfully')
      setFormOpen(false)
      setSelectedVehicle(undefined)
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update vehicle')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!companyId || !selectedVehicle?.id) return
    setIsLoading(true)
    try {
      await toggleBlockVehicle(companyId, selectedVehicle.id)
      toast.success('Vehicle status toggled successfully')
      setDeleteOpen(false)
      setSelectedVehicle(undefined)
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to toggle vehicle status')
    } finally {
      setIsLoading(false)
    }
  }

  const columns = [
    {
      header: 'Registration',
      accessorKey: 'registrationNumber',
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: ({ row }: any) => (
        <span className="capitalize">{row.original.type}</span>
      ),
    },
    {
      header: 'Brand / Model',
      accessorKey: 'brand',
      cell: ({ row }: any) => (
        <span>
          {row.original.brand} {row.original.modelName}
        </span>
      ),
    },
    {
      header: 'Year',
      accessorKey: 'year',
    },
    {
      header: 'Capacity',
      accessorKey: 'maxWeight',
      cell: ({ row }: any) => (
        <span>
          {row.original.maxWeight} kg
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }: any) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${
            row.original.status === 'available'
              ? 'bg-green-500/20 text-green-500'
              : row.original.status === 'maintenance'
                ? 'bg-yellow-500/20 text-yellow-500'
                : 'bg-red-500/20 text-red-500'
          }`}
        >
          {(row.original.status || '').replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      header: 'Available',
      accessorKey: 'isAvailable',
      cell: ({ row }: any) => (
        <span className={row.original.isAvailable ? 'text-green-600' : 'text-red-600'}>
          {row.original.isAvailable ? 'Yes' : 'No'}
        </span>
      ),
    },
  ]

  return (
    <main className="flex-1 space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vehicles</h1>
          <p className="text-muted-foreground">Manage company fleet and vehicle details</p>
        </div>
        <Button
          onClick={() => {
            setSelectedVehicle(undefined)
            setFormOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={vehicles}
        onEdit={(vehicle) => {
          setSelectedVehicle(vehicle)
          setFormOpen(true)
        }}
        onDelete={(vehicle) => {
          setSelectedVehicle(vehicle)
          setDeleteOpen(true)
        }}
        emptyMessage={isFetching ? 'Loading...' : 'No vehicles found. Create one to get started.'}
      />

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={selectedVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
      >
        <VehicleForm
          vehicle={selectedVehicle}
          companies={companies}
          branches={branches}
          onSubmit={selectedVehicle ? handleUpdate : handleAdd}
          isLoading={isLoading}
        />
      </FormDialog>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Toggle Vehicle Status"
        description={`Are you sure you want to toggle the status of vehicle ${selectedVehicle?.registrationNumber}?`}
      />
    </main>
  )
}
