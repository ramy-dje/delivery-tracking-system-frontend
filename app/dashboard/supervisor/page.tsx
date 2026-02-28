'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/data-table'
import { FormDialog } from '@/components/dashboard/form-dialog'
import { DeleteDialog } from '@/components/dashboard/delete-dialog'
import { SupervisorForm } from '@/components/dashboard/supervisor/supervisor-form'
import { useData } from '@/hooks/use-data'
import type { Supervisor } from '@/lib/schemas'

const mockCompanies = [
  { id: '1', name: 'FastDeliver Co.' },
  { id: '2', name: 'Express Logistics' },
]

const mockBranches = [
  { id: '1', name: 'Main Branch' },
  { id: '2', name: 'Downtown Hub' },
]

export default function SupervisorPage() {
  const { data: supervisors, addItem, updateItem, deleteItem } = useData<Supervisor>('supervisors')
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | undefined>()

  const handleAdd = (data: Supervisor) => {
    addItem(data)
    setFormOpen(false)
  }

  const handleUpdate = (data: Supervisor) => {
    if (selectedSupervisor?.id) {
      updateItem(selectedSupervisor.id, data)
      setFormOpen(false)
    }
  }

  const handleDelete = () => {
    if (selectedSupervisor?.id) {
      deleteItem(selectedSupervisor.id)
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
      header: 'Phone',
      accessorKey: 'phone',
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
    {
      header: 'Permissions',
      accessorKey: 'permissions',
      cell: ({ row }: any) => (
        <span className="text-sm">
          {row.original.permissions?.length || 0} permission(s)
        </span>
      ),
    },
  ]

  return (
    <main className="flex-1 space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Supervisors</h1>
          <p className="text-muted-foreground">Manage branch supervisors and their permissions</p>
        </div>
        <Button
          onClick={() => {
            setSelectedSupervisor(undefined)
            setFormOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Supervisor
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={supervisors}
        onEdit={(supervisor) => {
          setSelectedSupervisor(supervisor)
          setFormOpen(true)
        }}
        onDelete={(supervisor) => {
          setSelectedSupervisor(supervisor)
          setDeleteOpen(true)
        }}
      />

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={selectedSupervisor ? 'Edit Supervisor' : 'Add Supervisor'}
      >
        <SupervisorForm
          supervisor={selectedSupervisor}
          companies={mockCompanies}
          branches={mockBranches}
          onSubmit={selectedSupervisor ? handleUpdate : handleAdd}
        />
      </FormDialog>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Delete Supervisor"
        description={`Are you sure you want to delete ${selectedSupervisor?.firstName} ${selectedSupervisor?.lastName}?`}
      />
    </main>
  )
}
