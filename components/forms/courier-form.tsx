'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Field, FieldGroup } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Courier, CourierCreate } from '@/lib/types'

interface CourierFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courier?: Courier | null
  onSubmit: (data: CourierCreate) => Promise<void>
}

export function CourierForm({ open, onOpenChange, courier, onSubmit }: CourierFormProps) {
  const [formData, setFormData] = useState<CourierCreate>({
    first_name: '',
    last_name: '',
    vehicle_plate: '',
    courier_status: 'Available',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (courier) {
      setFormData({
        first_name: courier.first_name,
        last_name: courier.last_name,
        vehicle_plate: courier.vehicle_plate,
        courier_status: courier.courier_status,
      })
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        vehicle_plate: '',
        courier_status: 'Available',
      })
    }
    setError('')
  }, [courier, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    try {
      await onSubmit(formData)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{courier ? 'Kurye Düzenle' : 'Yeni Kurye'}</DialogTitle>
          <DialogDescription>
            {courier ? 'Kurye bilgilerini güncelleyin.' : 'Yeni bir kurye ekleyin.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <Label htmlFor="first_name">Ad</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Kurye adı"
                required
              />
            </Field>
            
            <Field>
              <Label htmlFor="last_name">Soyad</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Kurye soyadı"
                required
              />
            </Field>
            
            <Field>
              <Label htmlFor="vehicle_plate">Araç Plakası</Label>
              <Input
                id="vehicle_plate"
                value={formData.vehicle_plate}
                onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value })}
                placeholder="34 ABC 123"
                required
              />
            </Field>
            
            <Field>
              <Label htmlFor="courier_status">Durum</Label>
              <Select
                value={formData.courier_status}
                onValueChange={(value) => setFormData({ ...formData, courier_status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Müsait</SelectItem>
                  <SelectItem value="Busy">Meşgul</SelectItem>
                  <SelectItem value="Inactive">Pasif</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          
          {error && (
            <p className="text-destructive text-sm mt-2">{error}</p>
          )}
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner className="mr-2" />}
              {courier ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
