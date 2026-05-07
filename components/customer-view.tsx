'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useApp } from '@/lib/app-context'
import { ArrowLeft, ShoppingCart, Package, Armchair, Bike, Plus, Minus, Trash2 } from 'lucide-react'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import type { Table } from '@/lib/types'
import { supabase } from '@/lib/supabase'

interface CustomerViewProps {
  onBack: () => void
  selectedTable?: Table | null
  orderType?: 'dine-in' | 'online'
}

export function CustomerView({ onBack, selectedTable, orderType = 'online' }: CustomerViewProps) {
  const { categories, products, loading, refreshData } = useApp()
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [cart, setCart] = useState<{ productId: number; quantity: number }[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)

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

  const increaseQuantity = (productId: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    )
  }

  const decreaseQuantity = (productId: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId))
  }

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0)

  const getCartItems = () => {
    return cart
      .map((item) => {
        const product = products.find((p) => p.product_id === item.productId)
        if (!product) return null
        return { ...item, product }
      })
      .filter((item): item is { productId: number; quantity: number; product: (typeof products)[number] } => item !== null)
  }
  
  const getTotalPrice = () => {
    return cart.reduce((sum, item) => {
      const product = products.find(p => p.product_id === item.productId)
      return sum + (product?.price || 0) * item.quantity
    }, 0)
  }

  const completeOrder = async () => {
    if (cart.length === 0) return

    setOrderError(null)
    setIsSubmittingOrder(true)

    try {
      const parsedCustomerId = Number(localStorage.getItem('customer_id'))
      const customerId = Number.isFinite(parsedCustomerId) ? parsedCustomerId : null

      if (orderType === 'online' && !customerId) {
        throw new Error('Online sipariş için customer_id bulunamadı')
      }

      const totalAmount = getTotalPrice()
      const orderTypeValue = orderType === 'online' ? 'takeaway' : orderType
      const orderPayload = {
        order_date: new Date().toISOString(),
        total_amount: totalAmount,
        status: 'pending',
        order_type: orderTypeValue,
        table_id: orderType === 'dine-in' ? selectedTable?.table_id ?? null : null,
        customer_id: orderType === 'online' ? customerId : null,
      }

      const { data: orderData, error: orderErrorResponse } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select('order_id')
        .single()

      if (orderErrorResponse || !orderData) {
        throw new Error(orderErrorResponse?.message || 'Sipariş kaydedilemedi')
      }

      const cartItems = getCartItems()
      const detailRows = cartItems.map((item) => ({
        product_id: item.product.product_id,
        quantity: item.quantity,
        unit_price: item.product.price,
        order_id: orderData.order_id,
      }))

      const { error: detailError } = await supabase.from('order_detail').insert(detailRows)

      if (detailError) {
        throw new Error(detailError.message || 'Sipariş detayları kaydedilemedi')
      }

      setCart([])
      setIsCartOpen(false)
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : 'Sipariş tamamlanamadı')
    } finally {
      setIsSubmittingOrder(false)
    }
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
                    Gel-Al
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <Button variant="outline" className="relative" onClick={() => setIsCartOpen(true)}>
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

      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Sepet</SheetTitle>
            <SheetDescription>Eklediğiniz ürünleri buradan kontrol edebilirsiniz.</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {orderError && (
              <p className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {orderError}
              </p>
            )}
            {getCartItems().length === 0 ? (
              <p className="text-sm text-muted-foreground">Sepetiniz şu anda boş.</p>
            ) : (
              <div className="space-y-3">
                {getCartItems().map((item) => (
                  <div key={item.productId} className="rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">Birim: ₺{item.product.price.toFixed(2)}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          onClick={() => decreaseQuantity(item.productId)}
                        >
                          <Minus className="size-4" />
                        </Button>
                        <span className="min-w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          onClick={() => increaseQuantity(item.productId)}
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <p className="font-semibold">₺{(item.product.price * item.quantity).toFixed(2)}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <SheetFooter className="border-t">
            <div className="w-full">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Toplam</span>
                <span className="text-lg font-bold">₺{getTotalPrice().toFixed(2)}</span>
              </div>
              <Button
                className="w-full"
                disabled={getTotalItems() === 0 || isSubmittingOrder}
                onClick={completeOrder}
              >
                {isSubmittingOrder ? 'Kaydediliyor...' : 'Siparişi Tamamla'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

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

      </main>
    </div>
  )
}
