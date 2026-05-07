'use client'

import { Plus, Package } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty'
import type { Product } from '@/lib/order-types'

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const { addItem } = useCart()

  if (products.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Package />
          </EmptyMedia>
          <EmptyTitle>Urun bulunamadi</EmptyTitle>
          <EmptyDescription>
            Bu kategoride henuz urun bulunmuyor veya aramanizla eslesen urun yok.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <Card key={product.product_id} className="group overflow-hidden hover:shadow-lg transition-shadow py-0 gap-0">
          <div className="aspect-[4/3] bg-gradient-to-br from-secondary to-muted flex items-center justify-center relative overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="object-cover size-full group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <Package className="size-16 text-muted-foreground/50" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base line-clamp-1">{product.name}</CardTitle>
              <span className="text-primary font-bold whitespace-nowrap">
                {product.price.toFixed(2)} TL
              </span>
            </div>
            <CardDescription className="line-clamp-2 min-h-[2.5rem]">
              {product.description || 'Lezzetli bir secim'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-0 pb-4">
            <Button
              className="w-full gap-2"
              size="sm"
              onClick={() => addItem(product)}
            >
              <Plus className="size-4" />
              Sepete Ekle
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
