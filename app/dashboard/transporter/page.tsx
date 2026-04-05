'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/data-table'
import { FormDialog } from '@/components/dashboard/form-dialog'
import { DeleteDialog } from '@/components/dashboard/delete-dialog'
import { TransporterForm } from '@/components/dashboard/transporter/transporter-form'
import type { Transporter } from '@/lib/schemas'
import {
  getMyTransporters,
  createTransporter,
  updateTransporter,
  toggleBlockTransporter,
} from '@/lib/api/crud/transporter'
import { getMyCompany } from '@/lib/api/crud/company'
import { getMyBranches } from '@/lib/api/crud/branch'
import { toast } from 'sonner'

export default function TransporterPage() {
  const [transporters, setTransporters] = useState<Transporter[]>([])
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([])
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([])
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [selectedTransporter, setSelectedTransporter] = useState<Transporter | undefined>()

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
          },
        ])

        // Fetch branches for the form select
        const branchRes = await getMyBranches(cId)
        if (branchRes.success) {
          setBranches(
            branchRes.data.map((b: any) => ({
              id: b._id,
              name: b.name,
            }))
          )
        }

        // Fetch transporters
        const transporterRes = await getMyTransporters(cId)
        if (transporterRes.success) {
          setTransporters(
            transporterRes.data.map((t: any) => ({
              id: t._id,
              userId: t.userId?._id || '',
              companyId: t.companyId?._id || t.companyId || cId,
              firstName: t.userId?.firstName || '',
              lastName: t.userId?.lastName || '',
              email: t.userId?.email || '',
              phone: t.userId?.phone || '',
              currentBranchId: t.currentBranchId?._id || t.currentBranchId || undefined,
              currentVehicleId: t.currentVehicleId?._id || t.currentVehicleId || undefined,
              availabilityStatus: t.availabilityStatus || 'offline',
              verificationStatus: t.verificationStatus || 'unverified',
              statistics: t.statistics || undefined,
              status: t.isActive ? 'active' : 'suspended',
              isSuspended: !t.isActive,
            }))
          )
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch transporters:', error)
      toast.error('Failed to load transporters')
    } finally {
      setIsFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAdd = async (data: Transporter) => {
    if (!companyId) {
      toast.error('No company found')
      return
    }
    setIsLoading(true)
    try {
      await createTransporter(companyId, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        username: data.email.split('@')[0],
        password: 'defaultPass123!', // Transporter will need to change on first login
      })
      toast.success('Transporter created successfully')
      setFormOpen(false)
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create transporter')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (data: Transporter) => {
    if (!companyId || !selectedTransporter?.id) return
    setIsLoading(true)
    try {
      await updateTransporter(companyId, selectedTransporter.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        availabilityStatus: mapAvailabilityStatus(data.availabilityStatus),
        currentBranchId: data.currentBranchId,
      })
      toast.success('Transporter updated successfully')
      setFormOpen(false)
      setSelectedTransporter(undefined)
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update transporter')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!companyId || !selectedTransporter?.id) return
    setIsLoading(true)
    try {
      await toggleBlockTransporter(companyId, selectedTransporter.id)
      toast.success('Transporter status toggled successfully')
      setDeleteOpen(false)
      setSelectedTransporter(undefined)
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to toggle transporter status')
    } finally {
      setIsLoading(false)
    }
  }

  // Map frontend availability status values to backend values
  function mapAvailabilityStatus(
    status: string
  ): "available" | "on_route" | "off_duty" | "on_break" | "maintenance" | undefined {
    const map: Record<string, "available" | "on_route" | "off_duty" | "on_break" | "maintenance"> = {
      available: 'available',
      busy: 'on_route',
      on_break: 'on_break',
      offline: 'off_duty',
    }
    return map[status] || undefined
  }

  const columns = [
    {
      header: 'Name',
      accessorKey: 'firstName',
      cell: ({ row }: any) => `${row.original.firstName} ${row.original.lastName}`,
    },
    {
      header: 'Email',
      accessorKey: 'email',
    },
    {
      header: 'Availability',
      accessorKey: 'availabilityStatus',
      cell: ({ row }: any) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${
            row.original.availabilityStatus === 'available'
              ? 'bg-green-500/20 text-green-500'
              : 'bg-yellow-500/20 text-yellow-500'
          }`}
        >
          {(row.original.availabilityStatus || '').replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      header: 'Verification',
      accessorKey: 'verificationStatus',
      cell: ({ row }: any) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${
            row.original.verificationStatus === 'verified'
              ? 'bg-green-500/20 text-green-500'
              : row.original.verificationStatus === 'pending'
                ? 'bg-yellow-500/20 text-yellow-500'
                : 'bg-red-500/20 text-red-500'
          }`}
        >
          {row.original.verificationStatus}
        </span>
      ),
    },
    {
      header: 'Rating',
      accessorKey: 'statistics.rating',
      cell: ({ row }: any) => (
        <span>
          {row.original.statistics?.rating?.toFixed(1) || '0.0'} / 5
        </span>
      ),
    },
    {
      header: 'Trips',
      accessorKey: 'statistics.completedTrips',
      cell: ({ row }: any) => (
        <span>
          {row.original.statistics?.completedTrips || 0}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }: any) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
            row.original.status === 'active'
              ? 'bg-green-500/20 text-green-500'
              : 'bg-red-500/20 text-red-500'
          }`}
        >
          {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
        </span>
      ),
    },
  ]

  return (
    <main className="flex-1 space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transporters</h1>
          <p className="text-muted-foreground">Manage transporters and their verification status</p>
        </div>
        <Button
          onClick={() => {
            setSelectedTransporter(undefined)
            setFormOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Transporter
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={transporters}
        onEdit={(transporter) => {
          setSelectedTransporter(transporter)
          setFormOpen(true)
        }}
        onDelete={(transporter) => {
          setSelectedTransporter(transporter)
          setDeleteOpen(true)
        }}
        emptyMessage={isFetching ? 'Loading...' : 'No transporters found. Create one to get started.'}
      />

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={selectedTransporter ? 'Edit Transporter' : 'Add Transporter'}
      >
        <TransporterForm
          transporter={selectedTransporter}
          companies={companies}
          branches={branches}
          onSubmit={selectedTransporter ? handleUpdate : handleAdd}
          isLoading={isLoading}
        />
      </FormDialog>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Toggle Transporter Status"
        description={`Are you sure you want to toggle the status of ${selectedTransporter?.firstName} ${selectedTransporter?.lastName}?`}
      />
    </main>
  )
}
