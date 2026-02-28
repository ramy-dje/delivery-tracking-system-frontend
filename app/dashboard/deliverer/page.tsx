'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/data-table'
import { FormDialog } from '@/components/dashboard/form-dialog'
import { DeleteDialog } from '@/components/dashboard/delete-dialog'
import { DelivererForm } from '@/components/dashboard/deliverer/deliverer-form'
import { useData } from '@/hooks/use-data'
import { Deliverer, Company, Branch } from '@/lib/schemas'
import { Plus } from 'lucide-react'

const defaultDeliverers: Deliverer[] = [
  {
    id: '1',
    userId: 'user_1',
    companyId: '1',
    branchId: '1',
    email: 'driver1@fastdeliver.sa',
    firstName: 'Abdullah',
    lastName: 'Khan',
    phone: '+966501234567',
    vehicle: {
      type: 'Bike',
      registrationNumber: 'ABC-1234',
      capacity: 20,
    },
    licenseNumber: 'DL-12345',
    status: 'active',
    performance: {
      totalDeliveries: 500,
      successfulDeliveries: 498,
      rating: 4.9,
    },
  },
  {
    id: '2',
    userId: 'user_2',
    companyId: '1',
    branchId: '2',
    email: 'driver2@fastdeliver.sa',
    firstName: 'Hassan',
    lastName: 'Ahmed',
    phone: '+966502345678',
    vehicle: {
      type: 'Van',
      registrationNumber: 'XYZ-5678',
      capacity: 100,
    },
    licenseNumber: 'DL-67890',
    status: 'active',
    performance: {
      totalDeliveries: 380,
      successfulDeliveries: 375,
      rating: 4.7,
    },
  },
]

export default function DelivererPage() {
  const { data: deliverers, add, update, remove } = useData<Deliverer>(
    'deliverers',
    defaultDeliverers
  )
  const { data: companies } = useData<Company>('companies', [])
  const { data: branches } = useData<Branch>('branches', [])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const editingDeliverer = editingId ? deliverers.find((d) => d.id === editingId) : null
  const deletingDeliverer = deletingId ? deliverers.find((d) => d.id === deletingId) : null

  const companyMap = useMemo(
    () => new Map(companies.map((c) => [c.id, c.name])),
    [companies]
  )

  const branchMap = useMemo(
    () => new Map(branches.map((b) => [b.id, b.name])),
    [branches]
  )

  const handleOpen = () => {
    setEditingId(null)
    setIsFormOpen(true)
  }

  const handleEdit = (deliverer: Deliverer) => {
    setEditingId(deliverer.id || null)
    setIsFormOpen(true)
  }

  const handleDelete = (deliverer: Deliverer) => {
    setDeletingId(deliverer.id || null)
    setIsDeleteOpen(true)
  }

  const handleSubmit = async (data: Deliverer) => {
    setIsLoading(true)
    try {
      if (editingId) {
        update(editingId, data)
      } else {
        add(data)
      }
      setIsFormOpen(false)
      setEditingId(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    setIsLoading(true)
    try {
      if (deletingId) {
        remove(deletingId)
      }
      setIsDeleteOpen(false)
      setDeletingId(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Deliverer Management</h1>
          <p className="mt-2 text-muted-foreground">
            Manage delivery staff and their performance metrics
          </p>
        </div>
        <Button
          onClick={handleOpen}
          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" />
          Add Deliverer
        </Button>
      </div>

      <DataTable<Deliverer>
        columns={[
          {
            key: 'firstName',
            label: 'First Name',
          },
          {
            key: 'lastName',
            label: 'Last Name',
          },
          {
            key: 'email',
            label: 'Email',
          },
          {
            key: 'companyId',
            label: 'Company',
            render: (value) => companyMap.get(value as string) || '-',
          },
          {
            key: 'branchId',
            label: 'Branch',
            render: (value) => branchMap.get(value as string) || '-',
          },
          {
            key: 'vehicle',
            label: 'Vehicle',
            render: (value) => (value as any)?.type || '-',
          },
          {
            key: 'performance',
            label: 'Rating',
            render: (value) => {
              const perf = value as any
              return perf?.rating ? `${perf.rating.toFixed(1)}/5` : 'N/A'
            },
          },
          {
            key: 'status',
            label: 'Status',
            render: (value) => (
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  value === 'active'
                    ? 'bg-green-500/20 text-green-500'
                    : value === 'on_leave'
                      ? 'bg-blue-500/20 text-blue-500'
                      : value === 'suspended'
                        ? 'bg-red-500/20 text-red-500'
                        : 'bg-gray-500/20 text-gray-500'
                }`}
              >
                {String(value).charAt(0).toUpperCase() +
                  String(value).slice(1).replace(/_/g, ' ')}
              </span>
            ),
          },
        ]}
        data={deliverers}
        idKey="id"
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No deliverers found. Create one to get started."
      />

      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editingId ? 'Edit Deliverer' : 'Add New Deliverer'}
        description={
          editingId
            ? 'Update the deliverer information'
            : 'Register a new delivery staff member'
        }
        onSubmit={handleSubmit}
        isLoading={isLoading}
      >
        <DelivererForm
          initialData={editingDeliverer || undefined}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          companies={companies}
          branches={branches}
        />
      </FormDialog>

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName={
          deletingDeliverer
            ? `${deletingDeliverer.firstName} ${deletingDeliverer.lastName}`
            : 'this deliverer'
        }
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </div>
  )
}
