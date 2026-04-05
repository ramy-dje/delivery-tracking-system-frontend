'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/data-table'
import { FormDialog } from '@/components/dashboard/form-dialog'
import { DeleteDialog } from '@/components/dashboard/delete-dialog'
import { ClientForm } from '@/components/dashboard/client/client-form'
import { Client } from '@/lib/schemas'
import { Plus } from 'lucide-react'
import {
  getClients,
  createClient,
  updateClient,
  toggleBlockClient,
} from '@/lib/api/crud/client'
import { toast } from 'sonner'

export default function ClientPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const editingClient = editingId
    ? clients.find((c) => c.id === editingId)
    : null
  const deletingClient = deletingId
    ? clients.find((c) => c.id === deletingId)
    : null

  const fetchClients = useCallback(async () => {
    try {
      setIsFetching(true)
      const res = await getClients()
      if (res.success) {
        setClients(
          res.data.map((c: any) => ({
            id: c._id,
            email: c.email || '',
            firstName: c.firstName || '',
            lastName: c.lastName || '',
            phone: c.phone || '',
            addresses: c.deliveryAddresses || [],
            status: c.status || 'active',
          }))
        )
      }
    } catch (error: any) {
      // If the endpoint doesn't exist yet, gracefully handle it
      console.error('Failed to fetch clients:', error)
      setClients([])
    } finally {
      setIsFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

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

  const handleSubmit: any = async (data: Client) => {
    setIsLoading(true)
    try {
      if (editingId) {
        await updateClient(editingId, {
          email: data.email,
          phone: data.phone,
          firstName: data.firstName,
          lastName: data.lastName,
        })
        toast.success('Client updated successfully')
      } else {
        await createClient({
          email: data.email,
          phone: data.phone,
          firstName: data.firstName,
          lastName: data.lastName,
        })
        toast.success('Client created successfully')
      }
      setIsFormOpen(false)
      setEditingId(null)
      fetchClients()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save client')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingId) return
    setIsLoading(true)
    try {
      await toggleBlockClient(deletingId)
      toast.success('Client status toggled successfully')
      setIsDeleteOpen(false)
      setDeletingId(null)
      fetchClients()
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to toggle client status'
      )
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
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${value === 'active'
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
        emptyMessage={isFetching ? 'Loading...' : 'No clients found. Create one to get started.'}
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
