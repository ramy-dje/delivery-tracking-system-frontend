'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/data-table'
import { FormDialog } from '@/components/dashboard/form-dialog'
import { DeleteDialog } from '@/components/dashboard/delete-dialog'
import { FreelancerForm } from '@/components/dashboard/freelancer/freelancer-form'
import { Freelancer, Company } from '@/lib/schemas'
import { Plus, Star } from 'lucide-react'
import {
  getMyFreelancers,
  createFreelancer,
  updateFreelancer,
  toggleBlockFreelancer,
} from '@/lib/api/crud/freelancer'
import { getMyBranches } from '@/lib/api/crud/branch'
import { getMyCompany } from '@/lib/api/crud/company'
import { toast } from 'sonner'

export default function FreelancerPage() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [branchId, setBranchId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const editingFreelancer = editingId
    ? freelancers.find((f) => f.id === editingId)
    : null
  const deletingFreelancer = deletingId
    ? freelancers.find((f) => f.id === deletingId)
    : null

  const companyMap = useMemo(
    () => new Map(companies.map((c) => [c.id, c.name])),
    [companies]
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
          const bId = branchRes.data[0]._id
          setBranchId(bId)

          const freelancerRes = await getMyFreelancers(bId)
          if (freelancerRes.success) {
            setFreelancers(
              freelancerRes.data.map((f: any) => ({
                id: f._id,
                userId: f.userId?._id || f.userId,
                companyId: f.companyId?._id || f.companyId,
                email: f.userId?.email || '',
                firstName: f.userId?.firstName || '',
                lastName: f.userId?.lastName || '',
                phone: f.userId?.phone || '',
                businessName: f.businessName,
                businessType: f.businessType || 'individual',
                status: f.status === 'active' ? 'active' : f.status === 'suspended' ? 'suspended' : 'pending',
                statistics: f.statistics,
                preferredDeliveryType: f.preferredDeliveryType,
              }))
            )
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch freelancers:', error)
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

  const handleEdit = (freelancer: Freelancer) => {
    setEditingId(freelancer.id || null)
    setIsFormOpen(true)
  }

  const handleDelete = (freelancer: Freelancer) => {
    setDeletingId(freelancer.id || null)
    setIsDeleteOpen(true)
  }

  const handleSubmit: any = async (data: Freelancer) => {
    if (!branchId) {
      toast.error('No branch found')
      return
    }
    setIsLoading(true)
    try {
      if (editingId) {
        await updateFreelancer(branchId, editingId, {
          email: data.email,
          phone: data.phone,
          firstName: data.firstName,
          lastName: data.lastName,
          businessName: data.businessName,
          businessType: data.businessType as any,
          preferredDeliveryType: data.preferredDeliveryType as any,
        })
        toast.success('Freelancer updated successfully')
      } else {
        await createFreelancer(branchId, {
          email: data.email,
          phone: data.phone,
          username: data.email.split('@')[0],
          password: 'TempPass123!',
          firstName: data.firstName,
          lastName: data.lastName,
          businessName: data.businessName,
          businessType: data.businessType as any,
          preferredDeliveryType: data.preferredDeliveryType as any,
        })
        toast.success('Freelancer created successfully')
      }
      setIsFormOpen(false)
      setEditingId(null)
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save freelancer')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!branchId || !deletingId) return
    setIsLoading(true)
    try {
      await toggleBlockFreelancer(branchId, deletingId)
      toast.success('Freelancer status toggled successfully')
      setIsDeleteOpen(false)
      setDeletingId(null)
      fetchData()
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to toggle freelancer status'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Freelancer Management</h1>
          <p className="mt-2 text-muted-foreground">
            Manage independent contractors and their performance
          </p>
        </div>
        <Button
          onClick={handleOpen}
          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" />
          Add Freelancer
        </Button>
      </div>

      <DataTable<Freelancer>
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
            key: 'businessType',
            label: 'Business Type',
            render: (value) => (
              <span className="capitalize">{String(value).replace(/_/g, ' ')}</span>
            ),
          },
          {
            key: 'statistics',
            label: 'Rating & Deliveries',
            render: (value) => {
              const stats = value as any
              return (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span>{stats?.rating?.toFixed(1) || 'N/A'}</span>
                  <span className="text-xs text-muted-foreground">
                    ({stats?.totalDeliveries || 0})
                  </span>
                </div>
              )
            },
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
        data={freelancers}
        idKey="id"
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage={isFetching ? 'Loading...' : 'No freelancers found. Create one to get started.'}
      />

      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editingId ? 'Edit Freelancer' : 'Add New Freelancer'}
        description={
          editingId
            ? 'Update the freelancer information'
            : 'Register a new independent contractor'
        }
        onSubmit={handleSubmit}
        isLoading={isLoading}
      >
        <FreelancerForm
          initialData={editingFreelancer || undefined}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          companies={companies}
        />
      </FormDialog>

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName={
          deletingFreelancer
            ? `${deletingFreelancer.firstName} ${deletingFreelancer.lastName}`
            : 'this freelancer'
        }
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </div>
  )
}
