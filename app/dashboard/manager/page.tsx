'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/data-table'
import { FormDialog } from '@/components/dashboard/form-dialog'
import { DeleteDialog } from '@/components/dashboard/delete-dialog'
import { ManagerForm } from '@/components/dashboard/manager/manager-form'
import { Manager, Company } from '@/lib/schemas'
import { Plus } from 'lucide-react'
import { getMyCompany } from '@/lib/api/crud/company'
import { toast } from 'sonner'

export default function ManagerPage() {
  const [managers, setManagers] = useState<Manager[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const editingManager = editingId ? managers.find((m) => m.id === editingId) : null
  const deletingManager = deletingId ? managers.find((m) => m.id === deletingId) : null

  const companyMap = useMemo(
    () => new Map(companies.map((c) => [c.id, c.name])),
    [companies]
  )

  const fetchData = useCallback(async () => {
    try {
      setIsFetching(true)
      const companyRes = await getMyCompany()
      if (companyRes.success && companyRes.data) {
        const c = companyRes.data.company
        const managerProfile = companyRes.data.managerProfile
        const user = companyRes.data.user

        setCompanies([
          {
            id: c._id,
            name: c.name,
            businessType: c.businessType,
            status: c.status,
          },
        ])

        // The /my-company endpoint returns only the current manager's profile
        // Map it into the Manager format for display
        if (user) {
          setManagers([
            {
              id: user._id,
              userId: user._id,
              companyId: c._id,
              email: user.email || '',
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              phone: user.phone || '',
              status: managerProfile?.isActive ? 'active' : 'suspended',
            },
          ])
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch manager data:', error)
      toast.error('Failed to load manager data')
    } finally {
      setIsFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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

  const handleSubmit: any = async (data: Manager) => {
    // TODO: No backend manager CRUD endpoints exist yet
    // This will work once manager create/update endpoints are added
    toast.info('Manager CRUD backend endpoints are not available yet')
    setIsFormOpen(false)
    setEditingId(null)
  }

  const handleConfirmDelete = async () => {
    // TODO: No backend manager delete/toggle endpoint exists yet
    toast.info('Manager CRUD backend endpoints are not available yet')
    setIsDeleteOpen(false)
    setDeletingId(null)
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
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${value === 'active'
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
        emptyMessage={isFetching ? 'Loading...' : 'No managers found. Create one to get started.'}
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
