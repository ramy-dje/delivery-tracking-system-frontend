'use client'

import { useState } from 'react'
import { PackageHistory, packageHistorySchema } from '@/lib/schemas'
import { useData } from '@/hooks/use-data'
import { DataTable } from '@/components/dashboard/data-table'
import { PackageHistoryForm } from '@/components/dashboard/package-history/package-history-form'
import { FormDialog } from '@/components/dashboard/form-dialog'
import { DeleteDialog } from '@/components/dashboard/delete-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Clock } from 'lucide-react'

export default function PackageHistoryPage() {
  const { data: history, addItem, updateItem, deleteItem } = useData<PackageHistory>('packageHistory', [])
  const { data: packages } = useData('packages', [])
  const { data: branches } = useData('branches', [])

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedHistory, setSelectedHistory] = useState<PackageHistory | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleCreate = (data: PackageHistory) => {
    addItem({ ...data, id: Date.now().toString() })
    setIsFormOpen(false)
  }

  const handleUpdate = (data: PackageHistory) => {
    if (selectedHistory?.id) {
      updateItem(selectedHistory.id, data)
      setSelectedHistory(undefined)
      setIsFormOpen(false)
    }
  }

  const handleDelete = (id: string) => {
    deleteItem(id)
    setDeleteId(null)
  }

  const handleEditClick = (item: PackageHistory) => {
    setSelectedHistory(item)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setSelectedHistory(undefined)
  }

  const columns = [
    {
      header: 'Package',
      accessorKey: 'packageId',
      cell: (value: any) => {
        const pkg = packages?.find((p: any) => p.id === value)
        return pkg?.trackingNumber || value
      },
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
      header: 'Location',
      accessorKey: 'formattedLocation',
      cell: (value: any) => value || '-',
    },
    {
      header: 'Handler',
      accessorKey: 'handlerName',
      cell: (value: any) => value || '-',
    },
    {
      header: 'Role',
      accessorKey: 'handlerRole',
      cell: (value: any) => (
        <span className="capitalize px-2 py-1 rounded-md bg-muted text-sm">
          {value?.replace('_', ' ') || '-'}
        </span>
      ),
    },
    {
      header: 'Timestamp',
      accessorKey: 'timestamp',
      cell: (value: any) => {
        if (!value) return '-'
        const date = new Date(value)
        return date.toLocaleString()
      },
    },
    {
      header: 'Notes',
      accessorKey: 'notes',
      cell: (value: any) => (
        <span className="truncate max-w-xs" title={value}>
          {value || '-'}
        </span>
      ),
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Clock className="w-8 h-8 text-accent" />
            Package History
          </h1>
          <p className="mt-2 text-muted-foreground">Track all package status changes and movements</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="h-4 w-4" />
          New Entry
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History Entries</CardTitle>
          <CardDescription>
            {history?.length || 0} total history entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={history || []}
            idKey="id"
            onEdit={handleEditClick}
            onDelete={(id) => setDeleteId(id)}
            emptyMessage="No history entries found. Create one to track package status changes."
          />
        </CardContent>
      </Card>

      <FormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) handleFormClose()
          setIsFormOpen(open)
        }}
        title={selectedHistory ? 'Edit History Entry' : 'Add New History Entry'}
      >
        <PackageHistoryForm
          history={selectedHistory}
          onSubmit={selectedHistory ? handleUpdate : handleCreate}
          onCancel={handleFormClose}
          packages={packages || []}
          branches={branches || []}
        />
      </FormDialog>

      {deleteId && (
        <DeleteDialog
          isOpen={true}
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
          title="Delete History Entry"
          description="Are you sure you want to delete this history entry? This action cannot be undone."
        />
      )}
    </div>
  )
}
