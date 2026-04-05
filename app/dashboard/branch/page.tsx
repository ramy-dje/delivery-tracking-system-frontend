'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/data-table'
import { FormDialog } from '@/components/dashboard/form-dialog'
import { DeleteDialog } from '@/components/dashboard/delete-dialog'
import { BranchForm } from '@/components/dashboard/branch/branch-form'
import { Branch, Company } from '@/lib/schemas'
import { Plus } from 'lucide-react'
import {
  getMyBranches,
  createBranch,
  updateBranch,
  toggleBlockBranch,
} from '@/lib/api/crud/branch'
import { getMyCompany } from '@/lib/api/crud/company'
import { toast } from 'sonner'

export default function BranchPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const editingBranch = editingId
    ? branches.find((b) => b.id === editingId)
    : null
  const deletingBranch = deletingId
    ? branches.find((b) => b.id === deletingId)
    : null

  const companyMap = new Map(companies.map((c) => [c.id, c.name]))

  const fetchData = useCallback(async () => {
    try {
      setIsFetching(true)
      const companyRes = await getMyCompany()
      if (companyRes.success && companyRes.data?.company) {
        const c = companyRes.data.company
        const cId = c._id
        setCompanyId(cId)
        setCompanies([
          {
            id: cId,
            name: c.name,
            businessType: c.businessType,
            status: c.status,
          },
        ])

        const branchRes = await getMyBranches(cId)
        if (branchRes.success) {
          setBranches(
            branchRes.data.map((b: any) => ({
              id: b._id,
              companyId: b.companyId,
              name: b.name,
              address: b.address?.street || '',
              city: b.address?.city || '',
              state: b.address?.state || '',
              zipCode: b.address?.postalCode || '',
              phone: b.phone,
              maxCapacity: b.capacityLimit,
              status: b.status,
            }))
          )
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch branches:', error)
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

  const handleEdit = (branch: Branch) => {
    setEditingId(branch.id || null)
    setIsFormOpen(true)
  }

  const handleDelete = (branch: Branch) => {
    setDeletingId(branch.id || null)
    setIsDeleteOpen(true)
  }

  const handleSubmit: any = async (data: Branch) => {
    if (!companyId) {
      toast.error('No company found')
      return
    }
    setIsLoading(true)
    try {
      if (editingId) {
        await updateBranch(companyId, editingId, {
          name: data.name,
          address: {
            street: data.address,
            city: data.city,
            state: data.state,
          },
          phone: data.phone,
          email: data.email,
          capacityLimit: data.maxCapacity,
        })
        toast.success('Branch updated successfully')
      } else {
        await createBranch(companyId, {
          name: data.name,
          code: data.name.toUpperCase().replace(/\s+/g, '-').slice(0, 10),
          address: {
            street: data.address,
            city: data.city,
            state: data.state,
          },
          location: {
            type: 'Point',
            coordinates: [data.longitude || 0, data.latitude || 0],
          },
          phone: data.phone || '',
          email: data.email || '',
          capacityLimit: data.maxCapacity,
        })
        toast.success('Branch created successfully')
      }
      setIsFormOpen(false)
      setEditingId(null)
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save branch')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!companyId || !deletingId) return
    setIsLoading(true)
    try {
      await toggleBlockBranch(companyId, deletingId)
      toast.success('Branch status toggled successfully')
      setIsDeleteOpen(false)
      setDeletingId(null)
      fetchData()
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to toggle branch status'
      )
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
        data={branches}
        idKey="id"
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage={isFetching ? 'Loading...' : 'No branches found. Create one to get started.'}
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
