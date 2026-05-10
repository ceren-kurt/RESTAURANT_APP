'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Field, FieldGroup } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Product, ProductCreate, Category } from '@/lib/types'
import { PRODUCT_REQUIRES_ACTIVE_CATEGORY_MESSAGE } from '@/lib/app-context'
import { AlertTriangle } from 'lucide-react'

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  categories: Category[]
  onSubmit: (data: ProductCreate) => Promise<void>
}

interface ProductFormState {
  name: string
  description?: string | null
  price: number
  image_url?: string | null
  is_available: boolean
  category_id: number
}

export function ProductForm({ open, onOpenChange, product, categories, onSubmit }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormState>({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    is_available: true,
    category_id: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [availabilityWarning, setAvailabilityWarning] = useState('')

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        image_url: product.image_url || '',
        is_available: Boolean(product.is_available),
        category_id: product.category_id,
      })
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        image_url: '',
        is_available: true,
        category_id: categories[0]?.category_id || 0,
      })
    }
    setError('')
    setAvailabilityWarning('')
  }, [product, categories, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setAvailabilityWarning('')
    
    try {
      await onSubmit({
        ...formData,
        is_available: formData.is_available ? 1 : 0,
      })
      onOpenChange(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred'
      if (msg === PRODUCT_REQUIRES_ACTIVE_CATEGORY_MESSAGE) {
        setAvailabilityWarning(msg)
        setError('')
      } else {
        setError(msg)
        setAvailabilityWarning('')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'New Product'}</DialogTitle>
          <DialogDescription>
            {product ? 'Update product details.' : 'Add a new product.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
                required
              />
            </Field>
            
            <Field>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description"
                rows={3}
              />
            </Field>
            
            <Field>
              <Label htmlFor="price">Price (₺)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                required
              />
            </Field>
            
            <Field>
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url || ''}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </Field>
            
            <Field>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category_id.toString()}
                onValueChange={(value) => setFormData({ ...formData, category_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.category_id} value={category.category_id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            
            <Field className="rounded-lg border bg-muted/30 px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <Label htmlFor="is_available" className="text-sm font-medium">Available?</Label>
                  <p className="text-xs text-muted-foreground">Determines whether the product is on sale.</p>
                </div>
                <Switch
                  id="is_available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                />
              </div>
            </Field>
          </FieldGroup>
          
          {availabilityWarning && (
            <Alert
              variant="default"
              className="mt-2 border-amber-500/40 bg-amber-500/10 text-amber-950 dark:border-amber-500/35 dark:bg-amber-950/35 dark:text-amber-50 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400"
            >
              <AlertTriangle aria-hidden />
              <AlertDescription className="text-amber-900 dark:text-amber-50">
                {availabilityWarning}
              </AlertDescription>
            </Alert>
          )}
          {error && (
            <p className="text-destructive text-sm mt-2">{error}</p>
          )}
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner className="mr-2" />}
              {product ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
