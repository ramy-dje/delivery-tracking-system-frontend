'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/data-table'
import { FormDialog } from '@/components/dashboard/form-dialog'
import { DeleteDialog } from '@/components/dashboard/delete-dialog'
import { TransporterForm } from '@/components/dashboard/transporter/transporter-form'
import { useData } from '@/hooks/use-data'
import type { Transporter } from '@/lib/schemas'

const mockCompanies = [
  { id: '1', name: 'FastDeliver Co.' },
  { id: '2', name: 'Express Logistics' },
]

const mockBranches = [
  { id: '1', name: 'Main Branch' },
  { id: '2', name: 'Downtown Hub' },
]

export default function TransporterPage() {
  const { data: transporters, addItem, updateItem, deleteItem } = useData<Transporter>('transporters')
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedTransporter, setSelectedTransporter] = useState<Transporter | undefined>()

  const handleAdd = (data: Transporter) => {
    addItem(data)
    setFormOpen(false)
  }

  const handleUpdate = (data: Transporter) => {
    if (selectedTransporter?.id) {
      updateItem(selectedTransporter.id, data)
      setFormOpen(false)
    }
  }

  const handleDelete = () => {
    if (selectedTransporter?.id) {
      deleteItem(selectedTransporter.id)
      setDeleteOpen(false)
    }
  }

  const columns = [
    {
      header: 'Name',
      accessorKey: 'firstName',
      cell: ({ row }: any) => `${row.original.firstName} ${row.original.lastName}`,
    },
    {
      header: 'Email',
      accessorKey: 'email',
    },
    {
      header: 'Availability',
      accessorKey: 'availabilityStatus',
      cell: ({ row }: any) => (
        <span className="inline-block rounded bg-muted px-2 py-1 text-xs capitalize">
          {row.original.availabilityStatus.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      header: 'Verification',
      accessorKey: 'verificationStatus',
      cell: ({ row }: any) => (
        <span className="inline-block rounded bg-muted px-2 py-1 text-xs capitalize">
          {row.original.verificationStatus}
        </span>
      ),
    },
    {
      header: 'Rating',
      accessorKey: 'statistics.rating',
      cell: ({ row }: any) => (
        <span>
          {row.original.statistics?.rating.toFixed(1) || '0.0'} / 5
        </span>
      ),
    },
    {
      header: 'Trips',
      accessorKey: 'statistics.completedTrips',
      cell: ({ row }: any) => (
        <span>
          {row.original.statistics?.completedTrips || 0}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }: any) => (
        <span className="inline-block rounded bg-muted px-2 py-1 text-xs capitalize">
          {row.original.status}
        </span>
      ),
    },
  ]

  return (
    <main className="flex-1 space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transporters</h1>
          <p className="text-muted-foreground">Manage transporters and their verification status</p>
        </div>
        <Button
          onClick={() => {
            setSelectedTransporter(undefined)
            setFormOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Transporter
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={transporters}
        onEdit={(transporter) => {
          setSelectedTransporter(transporter)
          setFormOpen(true)
        }}
        onDelete={(transporter) => {
          setSelectedTransporter(transporter)
          setDeleteOpen(true)
        }}
      />

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={selectedTransporter ? 'Edit Transporter' : 'Add Transporter'}
      >
        <TransporterForm
          transporter={selectedTransporter}
          companies={mockCompanies}
          branches={mockBranches}
          onSubmit={selectedTransporter ? handleUpdate : handleAdd}
        />
      </FormDialog>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Delete Transporter"
        description={`Are you sure you want to delete ${selectedTransporter?.firstName} ${selectedTransporter?.lastName}?`}
      />
    </main>
  )
}
