'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/data-table'
import { FormDialog } from '@/components/dashboard/form-dialog'
import { DeleteDialog } from '@/components/dashboard/delete-dialog'
import { AdminForm } from '@/components/dashboard/admin/admin-form'
import { useData } from '@/hooks/use-data'
import { Admin } from '@/lib/schemas'
import { Plus } from 'lucide-react'

const defaultAdmins: Admin[] = [
  {
    id: '1',
    email: 'admin@matidelivery.com',
    firstName: 'Ahmed',
    lastName: 'Ali',
    phone: '+966501234567',
    role: 'super_admin',
    status: 'active',
  },
  {
    id: '2',
    email: 'manager@matidelivery.com',
    firstName: 'Fatima',
    lastName: 'Hassan',
    phone: '+966502345678',
    role: 'admin',
    status: 'active',
  },
  {
    id: '3',
    email: 'staff@matidelivery.com',
    firstName: 'Mohammed',
    lastName: 'Ibrahim',
    phone: '+966503456789',
    role: 'staff',
    status: 'pending',
  },
]

export default function AdminPage() {
  const { data: admins, add, update, remove } = useData<Admin>('admins', defaultAdmins)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const editingAdmin = editingId ? admins.find((a) => a.id === editingId) : null
  const deletingAdmin = deletingId ? admins.find((a) => a.id === deletingId) : null

  const handleOpen = () => {
    setEditingId(null)
    setIsFormOpen(true)
  }

  const handleEdit = (admin: Admin) => {
    setEditingId(admin.id || null)
    setIsFormOpen(true)
  }

  const handleDelete = (admin: Admin) => {
    setDeletingId(admin.id || null)
    setIsDeleteOpen(true)
  }

  const handleSubmit = async (data: Admin) => {
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
          <h1 className="text-3xl font-bold text-foreground">Admin Management</h1>
          <p className="mt-2 text-muted-foreground">
            Manage system administrators and their permissions
          </p>
        </div>
        <Button
          onClick={handleOpen}
          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" />
          Add Admin
        </Button>
      </div>

      <DataTable<Admin>
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
            key: 'role',
            label: 'Role',
            render: (value) => (
              <span className="capitalize">{String(value).replace(/_/g, ' ')}</span>
            ),
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
        data={admins}
        idKey="id"
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No admins found. Create one to get started."
      />

      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editingId ? 'Edit Admin' : 'Add New Admin'}
        description={
          editingId
            ? 'Update the admin information'
            : 'Create a new system administrator account'
        }
        onSubmit={handleSubmit}
        isLoading={isLoading}
      >
        <AdminForm
          initialData={editingAdmin || undefined}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </FormDialog>

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName={
          deletingAdmin
            ? `${deletingAdmin.firstName} ${deletingAdmin.lastName}`
            : 'this admin'
        }
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </div>
  )
}
