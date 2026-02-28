'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/data-table'
import { FormDialog } from '@/components/dashboard/form-dialog'
import { DeleteDialog } from '@/components/dashboard/delete-dialog'
import { FreelancerForm } from '@/components/dashboard/freelancer/freelancer-form'
import { useData } from '@/hooks/use-data'
import { Freelancer, Company } from '@/lib/schemas'
import { Plus, Star } from 'lucide-react'

const defaultFreelancers: Freelancer[] = [
  {
    id: '1',
    userId: 'user_1',
    companyId: '1',
    email: 'courier1@example.com',
    firstName: 'Ali',
    lastName: 'Mohammed',
    phone: '+966501234567',
    businessName: 'Swift Courier',
    businessType: 'individual',
    status: 'active',
    statistics: {
      totalDeliveries: 250,
      successfulDeliveries: 248,
      rating: 4.8,
      avgDeliveryTime: 45,
    },
    preferredDeliveryType: 'home',
  },
  {
    id: '2',
    userId: 'user_2',
    companyId: '1',
    email: 'courier2@example.com',
    firstName: 'Fatima',
    lastName: 'Ahmed',
    phone: '+966502345678',
    businessName: 'Express Delivery Service',
    businessType: 'small_business',
    status: 'active',
    statistics: {
      totalDeliveries: 180,
      successfulDeliveries: 175,
      rating: 4.6,
      avgDeliveryTime: 50,
    },
    preferredDeliveryType: 'branch_pickup',
  },
]

export default function FreelancerPage() {
  const { data: freelancers, add, update, remove } = useData<Freelancer>(
    'freelancers',
    defaultFreelancers
  )
  const { data: companies } = useData<Company>('companies', [])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const editingFreelancer = editingId ? freelancers.find((f) => f.id === editingId) : null
  const deletingFreelancer = deletingId ? freelancers.find((f) => f.id === deletingId) : null

  const companyMap = useMemo(
    () => new Map(companies.map((c) => [c.id, c.name])),
    [companies]
  )

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

  const handleSubmit = async (data: Freelancer) => {
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
        data={freelancers}
        idKey="id"
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No freelancers found. Create one to get started."
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
