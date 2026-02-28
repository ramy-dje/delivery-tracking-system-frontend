'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/data-table'
import { FormDialog } from '@/components/dashboard/form-dialog'
import { DeleteDialog } from '@/components/dashboard/delete-dialog'
import { CompanyForm } from '@/components/dashboard/company/company-form'
import { useData } from '@/hooks/use-data'
import { Company } from '@/lib/schemas'
import { Plus } from 'lucide-react'

const defaultCompanies: Company[] = [
  {
    id: '1',
    name: 'FastDeliver',
    businessType: 'small_business',
    email: 'contact@fastdeliver.sa',
    phone: '+966501234567',
    address: '123 King Road',
    city: 'Riyadh',
    state: 'Riyadh',
    zipCode: '11111',
    status: 'active',
  },
  {
    id: '2',
    name: 'Express Logistics',
    businessType: 'enterprise',
    email: 'info@expresslogistics.sa',
    phone: '+966502345678',
    address: '456 Business Ave',
    city: 'Jeddah',
    state: 'Makkah',
    zipCode: '22222',
    status: 'active',
  },
  {
    id: '3',
    name: 'Quick Courier',
    businessType: 'small_business',
    email: 'hello@quickcourier.sa',
    phone: '+966503456789',
    address: '789 Commerce St',
    city: 'Dammam',
    state: 'Eastern',
    zipCode: '33333',
    status: 'pending',
  },
]

export default function CompanyPage() {
  const { data: companies, add, update, remove } = useData<Company>('companies', defaultCompanies)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const editingCompany = editingId ? companies.find((c) => c.id === editingId) : null
  const deletingCompany = deletingId ? companies.find((c) => c.id === deletingId) : null

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

  const handleSubmit = async (data: Company) => {
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
        data={companies}
        idKey="id"
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No companies found. Create one to get started."
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
