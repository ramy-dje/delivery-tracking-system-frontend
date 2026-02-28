'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2 } from 'lucide-react'

interface DataTableProps<T> {
  columns: {
    key: keyof T
    label: string
    render?: (value: any, item: T) => React.ReactNode
  }[]
  data: T[]
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  idKey: keyof T
  emptyMessage?: string
}

export function DataTable<T>({
  columns,
  data = [],
  onEdit,
  onDelete,
  idKey,
  emptyMessage = 'No records found',
}: DataTableProps<T>) {
  const safeData = Array.isArray(data) ? data : []

  if (safeData.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/50">
            {columns.map((column) => (
              <TableHead key={String(column.key)} className="text-foreground">
                {column.label}
              </TableHead>
            ))}
            {(onEdit || onDelete) && <TableHead className="text-foreground">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeData.map((item) => (
            <TableRow key={String(item[idKey])} className="border-border hover:bg-muted/50">
              {columns.map((column) => (
                <TableCell key={String(column.key)} className="text-foreground">
                  {column.render
                    ? column.render(item[column.key], item)
                    : String(item[column.key] ?? '-')}
                </TableCell>
              ))}
              {(onEdit || onDelete) && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(item)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => onDelete(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
