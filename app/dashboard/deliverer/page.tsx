'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/data-table'
import { FormDialog } from '@/components/dashboard/form-dialog'
import { DeleteDialog } from '@/components/dashboard/delete-dialog'
import { DelivererForm } from '@/components/dashboard/deliverer/deliverer-form'
import { Deliverer, Company, Branch } from '@/lib/schemas'
import { Plus } from 'lucide-react'
import {
  getMyDeliverers,
  createDeliverer,
  updateDeliverer,
  toggleBlockDeliverer,
} from '@/lib/api/crud/deliverer'
import { getMyBranches } from '@/lib/api/crud/branch'
import { getMyCompany } from '@/lib/api/crud/company'
import { toast } from 'sonner'

export default function DelivererPage() {
  const [deliverers, setDeliverers] = useState<Deliverer[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [branchId, setBranchId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const editingDeliverer = editingId
    ? deliverers.find((d) => d.id === editingId)
    : null
  const deletingDeliverer = deletingId
    ? deliverers.find((d) => d.id === deletingId)
    : null

  const companyMap = useMemo(
    () => new Map(companies.map((c) => [c.id, c.name])),
    [companies]
  )

  const branchMap = useMemo(
    () => new Map(branches.map((b) => [b.id, b.name])),
    [branches]
  )

  const fetchData = useCallback(async () => {
    try {
      setIsFetching(true)
      const companyRes = await getMyCompany()
      if (companyRes.success && companyRes.data?.company) {
        const c = companyRes.data.company
        const cId = c._id
        setCompanies([
          {
            id: cId,
            name: c.name,
            businessType: c.businessType,
            status: c.status,
          },
        ])

        const branchRes = await getMyBranches(cId)
        if (branchRes.success && branchRes.data.length > 0) {
          const mappedBranches = branchRes.data.map((b: any) => ({
            id: b._id,
            companyId: b.companyId,
            name: b.name,
            address: b.address?.street || '',
            city: b.address?.city || '',
            state: b.address?.state || '',
            zipCode: '',
            status: b.status,
          }))
          setBranches(mappedBranches)

          // Use first branch by default for supervisor view
          const bId = mappedBranches[0].id
          setBranchId(bId)

          const delivererRes = await getMyDeliverers(bId)
          if (delivererRes.success) {
            setDeliverers(
              delivererRes.data.map((d: any) => ({
                id: d._id,
                userId: d.userId?._id || d.userId,
                companyId: d.companyId?._id || d.companyId,
                branchId: d.branchId?._id || d.branchId,
                email: d.userId?.email || '',
                firstName: d.userId?.firstName || '',
                lastName: d.userId?.lastName || '',
                phone: d.userId?.phone || '',
                status: d.isActive ? 'active' : 'inactive',
              }))
            )
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch deliverers:', error)
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

  const handleEdit = (deliverer: Deliverer) => {
    setEditingId(deliverer.id || null)
    setIsFormOpen(true)
  }

  const handleDelete = (deliverer: Deliverer) => {
    setDeletingId(deliverer.id || null)
    setIsDeleteOpen(true)
  }

  const handleSubmit: any = async (data: Deliverer) => {
    if (!branchId) {
      toast.error('No branch found')
      return
    }
    setIsLoading(true)
    try {
      if (editingId) {
        await updateDeliverer(branchId, editingId, {
          email: data.email,
          phone: data.phone,
          firstName: data.firstName,
          lastName: data.lastName,
        })
        toast.success('Deliverer updated successfully')
      } else {
        await createDeliverer(branchId, {
          email: data.email,
          phone: data.phone,
          username: data.email.split('@')[0],
          password: 'TempPass123!',
          firstName: data.firstName,
          lastName: data.lastName,
        })
        toast.success('Deliverer created successfully')
      }
      setIsFormOpen(false)
      setEditingId(null)
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save deliverer')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!branchId || !deletingId) return
    setIsLoading(true)
    try {
      await toggleBlockDeliverer(branchId, deletingId)
      toast.success('Deliverer status toggled successfully')
      setIsDeleteOpen(false)
      setDeletingId(null)
      fetchData()
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to toggle deliverer status'
      )
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
        emptyMessage={isFetching ? 'Loading...' : 'No deliverers found. Create one to get started.'}
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
