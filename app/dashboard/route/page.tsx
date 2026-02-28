'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/data-table'
import { FormDialog } from '@/components/dashboard/form-dialog'
import { DeleteDialog } from '@/components/dashboard/delete-dialog'
import { RouteForm } from '@/components/dashboard/route/route-form'
import { useData } from '@/hooks/use-data'
import type { Route } from '@/lib/schemas'

const mockCompanies = [
  { id: '1', name: 'FastDeliver Co.' },
  { id: '2', name: 'Express Logistics' },
]

const mockBranches = [
  { id: '1', name: 'Main Branch' },
  { id: '2', name: 'Downtown Hub' },
]

export default function RoutePage() {
  const { data: routes, addItem, updateItem, deleteItem } = useData<Route>('routes')
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<Route | undefined>()

  const handleAdd = (data: Route) => {
    addItem(data)
    setFormOpen(false)
  }

  const handleUpdate = (data: Route) => {
    if (selectedRoute?.id) {
      updateItem(selectedRoute.id, data)
      setFormOpen(false)
    }
  }

  const handleDelete = () => {
    if (selectedRoute?.id) {
      deleteItem(selectedRoute.id)
      setDeleteOpen(false)
    }
  }

  const columns = [
    {
      header: 'Route Number',
      accessorKey: 'routeNumber',
    },
    {
      header: 'Name',
      accessorKey: 'name',
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: ({ row }: any) => (
        <span className="capitalize">{row.original.type.replace(/_/g, ' ')}</span>
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
      header: 'Distance',
      accessorKey: 'distance',
      cell: ({ row }: any) => <span>{row.original.distance} km</span>,
    },
    {
      header: 'Stops',
      accessorKey: 'stops',
      cell: ({ row }: any) => <span>{row.original.stops?.length || 0}</span>,
    },
    {
      header: 'Packages',
      accessorKey: 'totalPackages',
      cell: ({ row }: any) => (
        <span>
          {row.original.completedPackages} / {row.original.totalPackages}
        </span>
      ),
    },
    {
      header: 'Progress',
      accessorKey: 'onTimePerformance',
      cell: ({ row }: any) => (
        <span>{row.original.onTimePerformance.toFixed(0)}%</span>
      ),
    },
  ]

  return (
    <main className="flex-1 space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Routes</h1>
          <p className="text-muted-foreground">Manage delivery routes and stops</p>
        </div>
        <Button
          onClick={() => {
            setSelectedRoute(undefined)
            setFormOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Route
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={routes}
        onEdit={(route) => {
          setSelectedRoute(route)
          setFormOpen(true)
        }}
        onDelete={(route) => {
          setSelectedRoute(route)
          setDeleteOpen(true)
        }}
      />

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={selectedRoute ? 'Edit Route' : 'Add Route'}
        maxWidth="2xl"
      >
        <RouteForm
          route={selectedRoute}
          companies={mockCompanies}
          branches={mockBranches}
          onSubmit={selectedRoute ? handleUpdate : handleAdd}
        />
      </FormDialog>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Delete Route"
        description={`Are you sure you want to delete route ${selectedRoute?.routeNumber}?`}
      />
    </main>
  )
}
