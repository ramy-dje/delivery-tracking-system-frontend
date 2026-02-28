'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/data-table'
import { FormDialog } from '@/components/dashboard/form-dialog'
import { DeleteDialog } from '@/components/dashboard/delete-dialog'
import { ManagerForm } from '@/components/dashboard/manager/manager-form'
import { useData } from '@/hooks/use-data'
import { Manager, Company } from '@/lib/schemas'
import { Plus } from 'lucide-react'

const defaultManagers: Manager[] = [
  {
    id: '1',
    userId: 'user_1',
    companyId: '1',
    email: 'owner1@fastdeliver.sa',
    firstName: 'Khalid',
    lastName: 'Saudi',
    phone: '+966501234567',
    status: 'active',
  },
  {
    id: '2',
    userId: 'user_2',
    companyId: '2',
    email: 'owner2@expresslogistics.sa',
    firstName: 'Fatima',
    lastName: 'Saleh',
    phone: '+966502345678',
    status: 'active',
  },
]

export default function ManagerPage() {
  const { data: managers, add, update, remove } = useData<Manager>('managers', defaultManagers)
  const { data: companies } = useData<Company>('companies', [])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const editingManager = editingId ? managers.find((m) => m.id === editingId) : null
  const deletingManager = deletingId ? managers.find((m) => m.id === deletingId) : null

  const companyMap = useMemo(
    () => new Map(companies.map((c) => [c.id, c.name])),
    [companies]
  )

  const handleOpen = () => {
    setEditingId(null)
    setIsFormOpen(true)
  }

  const handleEdit = (manager: Manager) => {
    setEditingId(manager.id || null)
    setIsFormOpen(true)
  }

  const handleDelete = (manager: Manager) => {
    setDeletingId(manager.id || null)
    setIsDeleteOpen(true)
  }

  const handleSubmit = async (data: Manager) => {
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
          <h1 className="text-3xl font-bold text-foreground">Manager Management</h1>
          <p className="mt-2 text-muted-foreground">
            Manage company owners and their permissions
          </p>
        </div>
        <Button
          onClick={handleOpen}
          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" />
          Add Manager
        </Button>
      </div>

      <DataTable<Manager>
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
            key: 'phone',
            label: 'Phone',
          },
          {
            key: 'companyId',
            label: 'Company',
            render: (value) => companyMap.get(value as string) || '-',
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
        data={managers}
        idKey="id"
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No managers found. Create one to get started."
      />

      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editingId ? 'Edit Manager' : 'Add New Manager'}
        description={
          editingId
            ? 'Update the manager information'
            : 'Register a new company owner'
        }
        onSubmit={handleSubmit}
        isLoading={isLoading}
      >
        <ManagerForm
          initialData={editingManager || undefined}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          companies={companies}
        />
      </FormDialog>

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName={
          deletingManager
            ? `${deletingManager.firstName} ${deletingManager.lastName}`
            : 'this manager'
        }
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </div>
  )
}
