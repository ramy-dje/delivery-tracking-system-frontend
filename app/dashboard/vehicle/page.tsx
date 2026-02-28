'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/data-table'
import { FormDialog } from '@/components/dashboard/form-dialog'
import { DeleteDialog } from '@/components/dashboard/delete-dialog'
import { VehicleForm } from '@/components/dashboard/vehicle/vehicle-form'
import { useData } from '@/hooks/use-data'
import type { VehicleDetailed } from '@/lib/schemas'

const mockCompanies = [
  { id: '1', name: 'FastDeliver Co.' },
  { id: '2', name: 'Express Logistics' },
]

const mockBranches = [
  { id: '1', name: 'Main Branch' },
  { id: '2', name: 'Downtown Hub' },
]

export default function VehiclePage() {
  const { data: vehicles, addItem, updateItem, deleteItem } = useData<VehicleDetailed>('vehicles')
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleDetailed | undefined>()

  const handleAdd = (data: VehicleDetailed) => {
    addItem(data)
    setFormOpen(false)
  }

  const handleUpdate = (data: VehicleDetailed) => {
    if (selectedVehicle?.id) {
      updateItem(selectedVehicle.id, data)
      setFormOpen(false)
    }
  }

  const handleDelete = () => {
    if (selectedVehicle?.id) {
      deleteItem(selectedVehicle.id)
      setDeleteOpen(false)
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
        <span className="inline-block rounded bg-muted px-2 py-1 text-xs capitalize">
          {row.original.status.replace(/_/g, ' ')}
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
      />

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={selectedVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
      >
        <VehicleForm
          vehicle={selectedVehicle}
          companies={mockCompanies}
          branches={mockBranches}
          onSubmit={selectedVehicle ? handleUpdate : handleAdd}
        />
      </FormDialog>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Delete Vehicle"
        description={`Are you sure you want to delete vehicle ${selectedVehicle?.registrationNumber}?`}
      />
    </main>
  )
}
