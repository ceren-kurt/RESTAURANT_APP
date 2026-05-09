'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Field, FieldGroup } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Employee, EmployeeCreate } from '@/lib/types'

interface EmployeeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: Employee | null
  onSubmit: (data: EmployeeCreate) => Promise<void>
}

export function EmployeeForm({ open, onOpenChange, employee, onSubmit }: EmployeeFormProps) {
  const [formData, setFormData] = useState<EmployeeCreate>({
    first_name: '',
    last_name: '',
    role: '',
    phone: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (employee) {
      setFormData({
        first_name: employee.first_name,
        last_name: employee.last_name,
        role: employee.role,
        phone: employee.phone,
      })
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        role: '',
        phone: '',
      })
    }
    setError('')
  }, [employee, open])

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
          <DialogTitle>{employee ? 'Edit Employee' : 'New Employee'}</DialogTitle>
          <DialogDescription>
            {employee ? 'Update employee details.' : 'Add a new employee.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Employee first name"
                required
              />
            </Field>
            
            <Field>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Employee last name"
                required
              />
            </Field>
            
            <Field>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="E.g: Chef, Waiter, Cashier"
                required
              />
            </Field>
            
            <Field>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0532 123 4567"
                required
              />
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
              {employee ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
