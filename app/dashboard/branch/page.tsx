'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/data-table'
import { FormDialog } from '@/components/dashboard/form-dialog'
import { DeleteDialog } from '@/components/dashboard/delete-dialog'
import { BranchForm } from '@/components/dashboard/branch/branch-form'
import { useData } from '@/hooks/use-data'
import { Branch, Company } from '@/lib/schemas'
import { Plus } from 'lucide-react'

const defaultBranches: Branch[] = [
  {
    id: '1',
    companyId: '1',
    name: 'Downtown Branch',
    address: '123 Main Street',
    city: 'Riyadh',
    state: 'Riyadh',
    zipCode: '11111',
    phone: '+966501234567',
    maxCapacity: 100,
    status: 'active',
  },
  {
    id: '2',
    companyId: '1',
    name: 'Airport Branch',
    address: '456 Aviation Rd',
    city: 'Riyadh',
    state: 'Riyadh',
    zipCode: '11222',
    phone: '+966502345678',
    maxCapacity: 150,
    status: 'active',
  },
  {
    id: '3',
    companyId: '2',
    name: 'Port Branch',
    address: '789 Harbor St',
    city: 'Jeddah',
    state: 'Makkah',
    zipCode: '22222',
    phone: '+966503456789',
    maxCapacity: 200,
    status: 'pending',
  },
]

export default function BranchPage() {
  const { data: branches, add, update, remove } = useData<Branch>('branches', defaultBranches)
  const { data: companies } = useData<Company>('companies', [])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const editingBranch = editingId ? branches.find((b) => b.id === editingId) : null
  const deletingBranch = deletingId ? branches.find((b) => b.id === deletingId) : null

  const companyMap = useMemo(
    () => new Map(companies.map((c) => [c.id, c.name])),
    [companies]
  )

  const handleOpen = () => {
    setEditingId(null)
    setIsFormOpen(true)
  }

  const handleEdit = (branch: Branch) => {
    setEditingId(branch.id || null)
    setIsFormOpen(true)
  }

  const handleDelete = (branch: Branch) => {
    setDeletingId(branch.id || null)
    setIsDeleteOpen(true)
  }

  const handleSubmit = async (data: Branch) => {
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
          <h1 className="text-3xl font-bold text-foreground">Branch Management</h1>
          <p className="mt-2 text-muted-foreground">
            Manage company branches and their details
          </p>
        </div>
        <Button
          onClick={handleOpen}
          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" />
          Add Branch
        </Button>
      </div>

      <DataTable<Branch>
        columns={[
          {
            key: 'name',
            label: 'Branch Name',
          },
          {
            key: 'companyId',
            label: 'Company',
            render: (value) => companyMap.get(value as string) || '-',
          },
          {
            key: 'address',
            label: 'Address',
          },
          {
            key: 'city',
            label: 'City',
          },
          {
            key: 'phone',
            label: 'Phone',
          },
          {
            key: 'maxCapacity',
            label: 'Capacity',
          },
          {
            key: 'status',
            label: 'Status',
            render: (value) => (
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  value === 'active'
                    ? 'bg-green-500/20 text-green-500'
                    : value === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-500'
                      : 'bg-red-500/20 text-red-500'
                }`}
              >
                {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
              </span>
            ),
          },
        ]}
        data={branches}
        idKey="id"
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No branches found. Create one to get started."
      />

      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editingId ? 'Edit Branch' : 'Add New Branch'}
        description={
          editingId
            ? 'Update the branch information'
            : 'Create a new company branch'
        }
        onSubmit={handleSubmit}
        isLoading={isLoading}
      >
        <BranchForm
          initialData={editingBranch || undefined}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          companies={companies}
        />
      </FormDialog>

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName={deletingBranch?.name || 'this branch'}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </div>
  )
}
