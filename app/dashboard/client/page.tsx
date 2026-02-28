'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/data-table'
import { FormDialog } from '@/components/dashboard/form-dialog'
import { DeleteDialog } from '@/components/dashboard/delete-dialog'
import { ClientForm } from '@/components/dashboard/client/client-form'
import { useData } from '@/hooks/use-data'
import { Client } from '@/lib/schemas'
import { Plus } from 'lucide-react'

const defaultClients: Client[] = [
  {
    id: '1',
    email: 'sarah@example.com',
    firstName: 'Sarah',
    lastName: 'Ahmed',
    phone: '+966501234567',
    addresses: [
      {
        label: 'Home',
        street: '123 Elm Street',
        city: 'Riyadh',
        state: 'Riyadh',
        zipCode: '11111',
        isDefault: true,
      },
    ],
    status: 'active',
  },
  {
    id: '2',
    email: 'mohammed@example.com',
    firstName: 'Mohammed',
    lastName: 'Hassan',
    phone: '+966502345678',
    addresses: [
      {
        label: 'Office',
        street: '456 Business Ave',
        city: 'Jeddah',
        state: 'Makkah',
        zipCode: '22222',
        isDefault: true,
      },
    ],
    status: 'active',
  },
]

export default function ClientPage() {
  const { data: clients, add, update, remove } = useData<Client>('clients', defaultClients)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const editingClient = editingId ? clients.find((c) => c.id === editingId) : null
  const deletingClient = deletingId ? clients.find((c) => c.id === deletingId) : null

  const handleOpen = () => {
    setEditingId(null)
    setIsFormOpen(true)
  }

  const handleEdit = (client: Client) => {
    setEditingId(client.id || null)
    setIsFormOpen(true)
  }

  const handleDelete = (client: Client) => {
    setDeletingId(client.id || null)
    setIsDeleteOpen(true)
  }

  const handleSubmit = async (data: Client) => {
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
          <h1 className="text-3xl font-bold text-foreground">Client Management</h1>
          <p className="mt-2 text-muted-foreground">
            Manage delivery customers and their addresses
          </p>
        </div>
        <Button
          onClick={handleOpen}
          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      <DataTable<Client>
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
            key: 'addresses',
            label: 'Addresses',
            render: (value) => (value as any[])?.length || 0,
          },
          {
            key: 'status',
            label: 'Status',
            render: (value) => (
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  value === 'active'
                    ? 'bg-green-500/20 text-green-500'
                    : 'bg-red-500/20 text-red-500'
                }`}
              >
                {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
              </span>
            ),
          },
        ]}
        data={clients}
        idKey="id"
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No clients found. Create one to get started."
      />

      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editingId ? 'Edit Client' : 'Add New Client'}
        description={
          editingId
            ? 'Update the client information'
            : 'Register a new customer'
        }
        onSubmit={handleSubmit}
        isLoading={isLoading}
      >
        <ClientForm
          initialData={editingClient || undefined}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </FormDialog>

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName={
          deletingClient
            ? `${deletingClient.firstName} ${deletingClient.lastName}`
            : 'this client'
        }
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </div>
  )
}
