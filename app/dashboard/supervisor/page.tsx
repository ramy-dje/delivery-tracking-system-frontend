'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/data-table'
import { FormDialog } from '@/components/dashboard/form-dialog'
import { DeleteDialog } from '@/components/dashboard/delete-dialog'
import { SupervisorForm } from '@/components/dashboard/supervisor/supervisor-form'
import type { Supervisor } from '@/lib/schemas'
import {
  getMySupervisors,
  createSupervisor,
  updateSupervisor,
  toggleBlockSupervisor,
} from '@/lib/api/crud/superisor'
import { getMyCompany } from '@/lib/api/crud/company'
import { getMyBranches } from '@/lib/api/crud/branch'
import { toast } from 'sonner'

export default function SupervisorPage() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([])
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([])
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | undefined>()

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

        // Fetch supervisors
        const supervisorRes = await getMySupervisors(cId)
        if (supervisorRes.success) {
          setSupervisors(
            supervisorRes.data.map((s: any) => ({
              id: s._id,
              userId: s.userId?._id || '',
              companyId: s.companyId || cId,
              branchId: s.branchId?._id || s.branchId || '',
              firstName: s.userId?.firstName || '',
              lastName: s.userId?.lastName || '',
              email: s.userId?.email || '',
              phone: s.userId?.phone || '',
              permissions: s.permissions || [],
              status: s.isActive ? 'active' : 'suspended',
              isActive: s.isActive,
            }))
          )
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch supervisors:', error)
      toast.error('Failed to load supervisors')
    } finally {
      setIsFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAdd = async (data: Supervisor) => {
    if (!companyId) {
      toast.error('No company found')
      return
    }
    setIsLoading(true)
    try {
      await createSupervisor(companyId, {
        branchId: data.branchId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: 'defaultPass123!', // Supervisor will need to change on first login
        permissions: data.permissions as string[] || [],
      })
      toast.success('Supervisor created successfully')
      setFormOpen(false)
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create supervisor')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (data: Supervisor) => {
    if (!selectedSupervisor?.id) return
    setIsLoading(true)
    try {
      await updateSupervisor(selectedSupervisor.id, {
        permissions: data.permissions as string[] || [],
        isActive: data.isActive,
        userData: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        },
      })
      toast.success('Supervisor updated successfully')
      setFormOpen(false)
      setSelectedSupervisor(undefined)
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update supervisor')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!companyId || !selectedSupervisor?.id) return
    setIsLoading(true)
    try {
      await toggleBlockSupervisor(companyId, selectedSupervisor.id)
      toast.success('Supervisor status toggled successfully')
      setDeleteOpen(false)
      setSelectedSupervisor(undefined)
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to toggle supervisor status')
    } finally {
      setIsLoading(false)
    }
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
      header: 'Phone',
      accessorKey: 'phone',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }: any) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
            row.original.status === 'active'
              ? 'bg-green-500/20 text-green-500'
              : row.original.status === 'pending'
                ? 'bg-yellow-500/20 text-yellow-500'
                : 'bg-red-500/20 text-red-500'
          }`}
        >
          {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
        </span>
      ),
    },
    {
      header: 'Permissions',
      accessorKey: 'permissions',
      cell: ({ row }: any) => (
        <span className="text-sm">
          {row.original.permissions?.length || 0} permission(s)
        </span>
      ),
    },
  ]

  return (
    <main className="flex-1 space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Supervisors</h1>
          <p className="text-muted-foreground">Manage branch supervisors and their permissions</p>
        </div>
        <Button
          onClick={() => {
            setSelectedSupervisor(undefined)
            setFormOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Supervisor
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={supervisors}
        onEdit={(supervisor) => {
          setSelectedSupervisor(supervisor)
          setFormOpen(true)
        }}
        onDelete={(supervisor) => {
          setSelectedSupervisor(supervisor)
          setDeleteOpen(true)
        }}
        emptyMessage={isFetching ? 'Loading...' : 'No supervisors found. Create one to get started.'}
      />

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={selectedSupervisor ? 'Edit Supervisor' : 'Add Supervisor'}
      >
        <SupervisorForm
          supervisor={selectedSupervisor}
          companies={companies}
          branches={branches}
          onSubmit={selectedSupervisor ? handleUpdate : handleAdd}
          isLoading={isLoading}
        />
      </FormDialog>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Toggle Supervisor Status"
        description={`Are you sure you want to toggle the status of ${selectedSupervisor?.firstName} ${selectedSupervisor?.lastName}?`}
      />
    </main>
  )
}
