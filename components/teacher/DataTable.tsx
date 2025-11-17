/**
 * Reusable Data Table Component
 * For displaying tabular data with sorting and pagination
 */

import React, { ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (row: T) => void
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (column: string) => void
  loading?: boolean
  emptyMessage?: string
  rowClassName?: (row: T) => string
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  sortBy,
  sortOrder,
  onSort,
  loading = false,
  emptyMessage = 'No hay datos para mostrar',
  rowClassName
}: DataTableProps<T>) {
  const handleSort = (column: Column<T>) => {
    if (column.sortable && onSort) {
      onSort(column.key)
    }
  }

  if (loading) {
    return (
      <div className="w-full rounded-lg border">
        <div className="animate-pulse p-8 text-center">
          <div className="mx-auto h-8 w-8 rounded-full bg-muted" />
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="w-full rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground
                    ${column.sortable ? 'cursor-pointer select-none hover:bg-muted/50' : ''}
                    ${column.className || ''}
                  `}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortBy === column.key && (
                      <>
                        {sortOrder === 'asc' ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`
                  transition-colors
                  ${onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                  ${rowClassName ? rowClassName(row) : ''}
                `}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 text-sm text-foreground ${column.className || ''}`}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
