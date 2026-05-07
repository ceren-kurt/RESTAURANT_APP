'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/lib/app-context'
import { ArrowLeft, ShoppingCart, Package, Armchair, Bike } from 'lucide-react'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import type { Table } from '@/lib/types'

interface CustomerViewProps {
  onBack: () => void
  selectedTable?: Table | null
  orderType?: 'dine-in' | 'online'
}

export function CustomerView({ onBack, selectedTable, orderType = 'online' }: CustomerViewProps) {
  const { categories, products, loading, refreshData } = useApp()
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [cart, setCart] = useState<{ productId: number; quantity: number }[]>([])

  // Fetch data on mount for customer view
  useEffect(() => {
    refreshData()
  }, [refreshData])

  const activeCategories = categories.filter(c => c.is_active)
  const filteredProducts = selectedCategory 
    ? products.filter(p => p.category_id === selectedCategory && p.is_available)
    : products.filter(p => p.is_available)

  const addToCart = (productId: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId)
      if (existing) {
        return prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { productId, quantity: 1 }]
    })
  }

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0)
  
  const getTotalPrice = () => {
    return cart.reduce((sum, item) => {
      const product = products.find(p => p.product_id === item.productId)
      return sum + (product?.price || 0) * item.quantity
    }, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="size-8" />
        <span className="ml-2 text-muted-foreground">Menü yükleniyor...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Menü</h1>
              {/* Order Type Badge */}
              <div className="flex items-center gap-2 mt-0.5">
                {orderType === 'dine-in' && selectedTable ? (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <Armchair className="size-3" />
                    Masa {selectedTable.table_number}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <Bike className="size-3" />
                    Online Sipariş
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <Button variant="outline" className="relative">
            <ShoppingCart className="size-5 mr-2" />
            Sepet
            {getTotalItems() > 0 && (
              <Badge className="absolute -top-2 -right-2 size-5 p-0 flex items-center justify-center">
                {getTotalItems()}
              </Badge>
            )}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Kategoriler</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(null)}
              size="sm"
            >
              Tümü
            </Button>
            {activeCategories.map((category) => (
              <Button
                key={category.category_id}
                variant={selectedCategory === category.category_id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.category_id)}
                size="sm"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Products */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {selectedCategory 
              ? categories.find(c => c.category_id === selectedCategory)?.name 
              : 'Tüm Ürünler'
            }
          </h2>
          
          {filteredProducts.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Package />
                </EmptyMedia>
                <EmptyTitle>Ürün bulunamadı</EmptyTitle>
                <EmptyDescription>
                  Bu kategoride henüz ürün bulunmuyor.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <Card key={product.product_id} className="overflow-hidden">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <Package className="size-12 text-muted-foreground" />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{product.name}</CardTitle>
                      <span className="text-primary font-bold">₺{product.price.toFixed(2)}</span>
                    </div>
                    <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => addToCart(product.product_id)}
                    >
                      Sepete Ekle
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
            <div className="container mx-auto flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{getTotalItems()} ürün</p>
                <p className="text-lg font-bold">₺{getTotalPrice().toFixed(2)}</p>
              </div>
              <Button>Siparişi Tamamla</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
