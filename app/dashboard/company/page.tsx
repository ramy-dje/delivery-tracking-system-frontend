'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/data-table'
import { FormDialog } from '@/components/dashboard/form-dialog'
import { DeleteDialog } from '@/components/dashboard/delete-dialog'
import { CompanyForm } from '@/components/dashboard/company/company-form'
import { Company } from '@/lib/schemas'
import { Plus } from 'lucide-react'
import {
  getMyCompany,
  createCompany,
  updateCompany,
  toggleBlockCompany,
} from '@/lib/api/crud/company'
import { toast } from 'sonner'

export default function CompanyPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const editingCompany = editingId
    ? companies.find((c) => c.id === editingId)
    : null
  const deletingCompany = deletingId
    ? companies.find((c) => c.id === deletingId)
    : null

  const fetchCompanies = useCallback(async () => {
    try {
      setIsFetching(true)
      const res = await getMyCompany()
      if (res.success && res.data?.company) {
        const c = res.data.company
        setCompanies([
          {
            id: c._id,
            name: c.name,
            businessType: c.businessType,
            email: c.email,
            phone: c.phone,
            address: c.headquarters?.address,
            city: c.headquarters?.city,
            status: c.status,
          },
        ])
      }
    } catch (error: any) {
      console.error('Failed to fetch companies:', error)
    } finally {
      setIsFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const handleOpen = () => {
    setEditingId(null)
    setIsFormOpen(true)
  }

  const handleEdit = (company: Company) => {
    setEditingId(company.id || null)
    setIsFormOpen(true)
  }

  const handleDelete = (company: Company) => {
    setDeletingId(company.id || null)
    setIsDeleteOpen(true)
  }

  const handleSubmit: any = async (data: Company) => {
    setIsLoading(true)
    try {
      if (editingId) {
        await updateCompany(editingId, {
          name: data.name,
          businessType: data.businessType as 'solo' | 'company',
          email: data.email,
          phone: data.phone,
        })
        toast.success('Company updated successfully')
      } else {
        await createCompany({
          name: data.name,
          businessType: data.businessType as 'solo' | 'company',
          email: data.email,
          phone: data.phone,
        })
        toast.success('Company created successfully')
      }
      setIsFormOpen(false)
      setEditingId(null)
      fetchCompanies()
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to save company'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    setIsLoading(true)
    try {
      if (deletingId) {
        await toggleBlockCompany(deletingId)
        toast.success('Company status toggled successfully')
      }
      setIsDeleteOpen(false)
      setDeletingId(null)
      fetchCompanies()
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to toggle company status'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Company Management</h1>
          <p className="mt-2 text-muted-foreground">
            Manage delivery companies on the platform
          </p>
        </div>
        <Button
          onClick={handleOpen}
          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" />
          Add Company
        </Button>
      </div>

      <DataTable<Company>
        columns={[
          {
            key: 'name',
            label: 'Company Name',
          },
          {
            key: 'businessType',
            label: 'Business Type',
            render: (value) => (
              <span className="capitalize">{String(value).replace(/_/g, ' ')}</span>
            ),
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
            key: 'city',
            label: 'City',
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
        data={companies}
        idKey="id"
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage={isFetching ? 'Loading...' : 'No companies found. Create one to get started.'}
      />

      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editingId ? 'Edit Company' : 'Add New Company'}
        description={
          editingId
            ? 'Update the company information'
            : 'Register a new delivery company'
        }
        onSubmit={handleSubmit}
        isLoading={isLoading}
      >
        <CompanyForm
          initialData={editingCompany || undefined}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </FormDialog>

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName={deletingCompany?.name || 'this company'}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </div>
  )
}
