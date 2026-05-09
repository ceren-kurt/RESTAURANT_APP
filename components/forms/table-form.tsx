'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Field, FieldGroup } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableCreate } from '@/lib/types'

interface TableFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  table?: Table | null
  onSubmit: (data: TableCreate) => Promise<void>
}

export function TableForm({ open, onOpenChange, table, onSubmit }: TableFormProps) {
  const [formData, setFormData] = useState<TableCreate>({
    table_number: '',
    capacity: 2,
    status: 'Available',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (table) {
      setFormData({
        table_number: table.table_number,
        capacity: table.capacity,
        status: table.status,
      })
    } else {
      setFormData({
        table_number: '',
        capacity: 2,
        status: 'Available',
      })
    }
    setError('')
  }, [table, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    try {
      await onSubmit(formData)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{table ? 'Edit Table' : 'New Table'}</DialogTitle>
          <DialogDescription>
            {table ? 'Update table details.' : 'Add a new table.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <Label htmlFor="table_number">Table Number</Label>
              <Input
                id="table_number"
                value={formData.table_number}
                onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                placeholder="E.g: M-01"
                required
              />
            </Field>
            
            <Field>
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                placeholder="Seat count"
                required
              />
            </Field>
            
            <Field>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Occupied">Occupied</SelectItem>
                  <SelectItem value="Reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          
          {error && (
            <p className="text-destructive text-sm mt-2">{error}</p>
          )}
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner className="mr-2" />}
              {table ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
