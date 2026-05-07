'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty'
import { Inbox } from 'lucide-react'

interface Column<T> {
  key: keyof T | 'actions'
  header: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  title: string
  data: T[]
  columns: Column<T>[]
  idKey: keyof T
  onAdd: () => void
  onEdit: (item: T) => void
  onDelete: (id: number) => void
}

export function DataTable<T>({
  title,
  data,
  columns,
  idKey,
  onAdd,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Button onClick={onAdd}>
          <Plus className="size-4 mr-2" />
          Ekle
        </Button>
      </div>
      
      {data.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox />
            </EmptyMedia>
            <EmptyTitle>Veri bulunamadı</EmptyTitle>
            <EmptyDescription>
              Yeni bir kayıt eklemek için &apos;Ekle&apos; butonunu kullanın.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {columns.map((column) => (
                  <TableHead key={String(column.key)} className="font-semibold">
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={String(item[idKey])}>
                  {columns.map((column) => (
                    <TableCell key={String(column.key)}>
                      {column.key === 'actions' ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(item)}
                            className="size-8"
                          >
                            <Pencil className="size-4" />
                            <span className="sr-only">Düzenle</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(item[idKey] as number)}
                            className="size-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                            <span className="sr-only">Sil</span>
                          </Button>
                        </div>
                      ) : column.render ? (
                        column.render(item)
                      ) : (
                        String(item[column.key as keyof T] ?? '')
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

// Badge helpers
export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const lowerStatus = status.toLowerCase()
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    available: 'default',
    busy: 'secondary',
    inactive: 'destructive',
    occupied: 'secondary',
    reserved: 'outline',
  }
  
  return (
    <Badge variant={variants[lowerStatus] || 'default'}>
      {label || status}
    </Badge>
  )
}

export function ActiveBadge({ isActive }: { isActive: boolean | number }) {
  const active = Boolean(isActive)
  return (
    <Badge variant={active ? 'default' : 'destructive'}>
      {active ? 'Aktif' : 'Pasif'}
    </Badge>
  )
}

export function AvailableBadge({ isAvailable }: { isAvailable: boolean | number }) {
  const available = Boolean(isAvailable)
  return (
    <Badge variant={available ? 'default' : 'secondary'}>
      {available ? 'Müsait' : 'Mevcut Değil'}
    </Badge>
  )
}
