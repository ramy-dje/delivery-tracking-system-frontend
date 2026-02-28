'use client'

import { useState } from 'react'
import { Package as PackageType, packageSchema } from '@/lib/schemas'
import { useData } from '@/hooks/use-data'
import { DataTable } from '@/components/dashboard/data-table'
import { PackageForm } from '@/components/dashboard/package/package-form'
import { FormDialog } from '@/components/dashboard/form-dialog'
import { DeleteDialog } from '@/components/dashboard/delete-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'

export default function PackagePage() {
  const { data: packages, addItem, updateItem, deleteItem } = useData<PackageType>('packages', [])
  const { data: branches } = useData('branches', [])
  const { data: companies } = useData('companies', [])
  const { data: clients } = useData('clients', [])

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<PackageType | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleCreate = (data: PackageType) => {
    addItem({ ...data, id: Date.now().toString() })
    setIsFormOpen(false)
  }

  const handleUpdate = (data: PackageType) => {
    if (selectedPackage?.id) {
      updateItem(selectedPackage.id, data)
      setSelectedPackage(undefined)
      setIsFormOpen(false)
    }
  }

  const handleDelete = (id: string) => {
    deleteItem(id)
    setDeleteId(null)
  }

  const handleEditClick = (pkg: PackageType) => {
    setSelectedPackage(pkg)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setSelectedPackage(undefined)
  }

  const columns = [
    {
      header: 'Tracking #',
      accessorKey: 'trackingNumber',
      cell: (value: any) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      header: 'Recipient',
      accessorKey: 'destination.name',
      cell: (value: any) => value || '-',
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: (value: any) => (
        <span className="capitalize px-2 py-1 rounded-md bg-muted text-sm">
          {value?.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (value: any) => {
        const statusColors: Record<string, string> = {
          pending: 'bg-yellow-500/20 text-yellow-700',
          picked_up: 'bg-blue-500/20 text-blue-700',
          in_transit: 'bg-blue-500/20 text-blue-700',
          at_branch: 'bg-purple-500/20 text-purple-700',
          out_for_delivery: 'bg-orange-500/20 text-orange-700',
          delivered: 'bg-green-500/20 text-green-700',
          failed_delivery: 'bg-red-500/20 text-red-700',
          returned: 'bg-gray-500/20 text-gray-700',
          cancelled: 'bg-red-500/20 text-red-700',
        }
        return (
          <span className={`capitalize px-2 py-1 rounded-md text-sm ${statusColors[value] || 'bg-gray-500/20'}`}>
            {value?.replace('_', ' ')}
          </span>
        )
      },
    },
    {
      header: 'Weight',
      accessorKey: 'weight',
      cell: (value: any) => `${value} kg` || '-',
    },
    {
      header: 'Price',
      accessorKey: 'totalPrice',
      cell: (value: any) => `$${value?.toFixed(2)}` || '-',
    },
    {
      header: 'Payment',
      accessorKey: 'paymentStatus',
      cell: (value: any) => (
        <span className="capitalize px-2 py-1 rounded-md bg-muted text-sm">
          {value?.replace('_', ' ')}
        </span>
      ),
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Packages</h1>
          <p className="mt-2 text-muted-foreground">Manage delivery packages and track shipments</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="h-4 w-4" />
          New Package
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Packages</CardTitle>
          <CardDescription>
            {packages?.length || 0} packages in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={packages || []}
            idKey="id"
            onEdit={handleEditClick}
            onDelete={(id) => setDeleteId(id)}
            emptyMessage="No packages found. Create one to get started."
          />
        </CardContent>
      </Card>

      <FormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) handleFormClose()
          setIsFormOpen(open)
        }}
        title={selectedPackage ? 'Edit Package' : 'Create New Package'}
      >
        <PackageForm
          package={selectedPackage}
          onSubmit={selectedPackage ? handleUpdate : handleCreate}
          onCancel={handleFormClose}
          branches={branches || []}
          companies={companies || []}
          clients={clients || []}
        />
      </FormDialog>

      {deleteId && (
        <DeleteDialog
          isOpen={true}
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
          title="Delete Package"
          description="Are you sure you want to delete this package? This action cannot be undone."
        />
      )}
    </div>
  )
}
