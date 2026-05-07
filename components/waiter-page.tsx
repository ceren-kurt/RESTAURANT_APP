'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Plus, Minus, Receipt, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { supabase } from '@/lib/supabase'
import type { Order, OrderDetail, Product, Table } from '@/lib/types'

interface WaiterPageProps {
  onBack: () => void
}

type CartItem = { productId: number; quantity: number }

export function WaiterPage({ onBack }: WaiterPageProps) {
  const [tables, setTables] = useState<Table[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [isPayingOrderId, setIsPayingOrderId] = useState<number | null>(null)

  const fetchInitialData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [{ data: tableRows, error: tableError }, { data: productRows, error: productError }] = await Promise.all([
        supabase.from('tables').select('*').order('table_number', { ascending: true }),
        supabase.from('product').select('*').eq('is_available', 1),
      ])

      if (tableError) throw new Error(tableError.message)
      if (productError) throw new Error(productError.message)

      setTables((tableRows ?? []) as Table[])
      setProducts((productRows ?? []) as Product[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const fetchTableOrders = async (tableId: number) => {
    try {
      const { data: orderRows, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('table_id', tableId)
        .in('status', ['pending', 'preparing'])
        .order('order_date', { ascending: false })

      if (orderError) throw new Error(orderError.message)
      const normalizedOrders = (orderRows ?? []) as Order[]
      setOrders(normalizedOrders)

      if (normalizedOrders.length === 0) {
        setOrderDetails([])
        return
      }

      const orderIds = normalizedOrders.map((order) => order.order_id)
      const { data: detailRows, error: detailError } = await supabase
        .from('order_detail')
        .select('*')
        .in('order_id', orderIds)

      if (detailError) throw new Error(detailError.message)
      setOrderDetails((detailRows ?? []) as OrderDetail[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Masa siparişleri yüklenemedi')
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedTable) {
      fetchTableOrders(selectedTable.table_id)
      setCart([])
    }
  }, [selectedTable])

  const addToCart = (productId: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId)
      if (existing) {
        return prev.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { productId, quantity: 1 }]
    })
  }

  const decreaseCartItem = (productId: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    )
  }

  const cartTotal = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const product = products.find((p) => p.product_id === item.productId)
        return sum + (product?.price || 0) * item.quantity
      }, 0),
    [cart, products]
  )

  const tableTotal = useMemo(() => orders.reduce((sum, order) => sum + Number(order.total_amount), 0), [orders])

  const submitOrder = async () => {
    if (!selectedTable || cart.length === 0) return

    setIsSubmittingOrder(true)
    setError(null)
    try {
      const employeeId = Number(localStorage.getItem('employee_id'))
      if (!Number.isFinite(employeeId)) {
        throw new Error('employee_id bulunamadı, tekrar giriş yapın')
      }

      const { data: orderRow, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_date: new Date().toISOString(),
          total_amount: cartTotal,
          status: 'pending',
          order_type: 'dine_in',
          table_id: selectedTable.table_id,
          employee_id: employeeId,
        })
        .select('order_id')
        .single()

      if (orderError || !orderRow) throw new Error(orderError?.message || 'Sipariş kaydedilemedi')

      const detailRows = cart.map((item) => {
        const product = products.find((p) => p.product_id === item.productId)
        return {
          order_id: orderRow.order_id,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: product?.price ?? 0,
        }
      })

      const { error: detailError } = await supabase.from('order_detail').insert(detailRows)
      if (detailError) throw new Error(detailError.message || 'Sipariş detayları kaydedilemedi')

      setCart([])
      await fetchTableOrders(selectedTable.table_id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sipariş oluşturulamadı')
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  const markOrderAsPaid = async (order: Order) => {
    setIsPayingOrderId(order.order_id)
    setError(null)
    try {
      const { error: paymentError } = await supabase.from('payment').insert({
        payment_method: 'cash',
        amount: order.total_amount,
        order_id: order.order_id,
      })

      if (paymentError) throw new Error(paymentError.message || 'Ödeme kaydı oluşturulamadı')

      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'delivered' })
        .eq('order_id', order.order_id)

      if (updateError) throw new Error(updateError.message || 'Sipariş durumu güncellenemedi')

      if (selectedTable) {
        await fetchTableOrders(selectedTable.table_id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ödeme işlemi başarısız')
    } finally {
      setIsPayingOrderId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="size-8" />
        <span className="ml-2 text-muted-foreground">Garson ekranı yükleniyor...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Garson Paneli</h1>
            <p className="text-xs text-muted-foreground">Masa ve sipariş yönetimi</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto grid gap-4 px-4 py-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Masalar</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {tables.map((table) => (
              <Button
                key={table.table_id}
                variant={selectedTable?.table_id === table.table_id ? 'default' : 'outline'}
                className="h-auto py-3"
                onClick={() => setSelectedTable(table)}
              >
                Masa {table.table_number}
              </Button>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          {!selectedTable ? (
            <Card>
              <CardContent className="py-8 text-sm text-muted-foreground">Detay görmek için bir masa seçin.</CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Masa {selectedTable.table_number} Siparişleri</span>
                    <Badge>Toplam: ₺{tableTotal.toFixed(2)}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {orders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Bu masa için aktif sipariş yok.</p>
                  ) : (
                    orders.map((order) => (
                      <div key={order.order_id} className="rounded-lg border p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-medium">Sipariş #{order.order_id}</span>
                          <Badge variant="secondary">₺{Number(order.total_amount).toFixed(2)}</Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          {orderDetails
                            .filter((detail) => detail.order_id === order.order_id)
                            .map((detail) => (
                              <div key={detail.detail_id} className="flex justify-between">
                                <span>
                                  {products.find((p) => p.product_id === detail.product_id)?.name ?? `Ürün #${detail.product_id}`} x{' '}
                                  {detail.quantity}
                                </span>
                                <span>₺{(Number(detail.unit_price) * detail.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                        </div>
                        <Button
                          className="mt-3 w-full"
                          variant="outline"
                          disabled={isPayingOrderId === order.order_id}
                          onClick={() => markOrderAsPaid(order)}
                        >
                          <CreditCard className="mr-2 size-4" />
                          Ödendi
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Yeni Sipariş Ekle</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {products.map((product) => {
                      const quantity = cart.find((item) => item.productId === product.product_id)?.quantity ?? 0
                      return (
                        <div key={product.product_id} className="rounded-lg border p-2">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium">{product.name}</p>
                            <span className="text-xs text-muted-foreground">₺{Number(product.price).toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <Button size="icon" variant="outline" className="size-8" onClick={() => decreaseCartItem(product.product_id)}>
                              <Minus className="size-4" />
                            </Button>
                            <span className="text-sm font-semibold">{quantity}</span>
                            <Button size="icon" variant="outline" className="size-8" onClick={() => addToCart(product.product_id)}>
                              <Plus className="size-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <span className="font-medium">Yeni sipariş toplamı</span>
                    <span className="font-bold">₺{cartTotal.toFixed(2)}</span>
                  </div>

                  <Button className="w-full" disabled={cart.length === 0 || isSubmittingOrder} onClick={submitOrder}>
                    {isSubmittingOrder ? (
                      <>
                        <Spinner className="mr-2" />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Receipt className="mr-2 size-4" />
                        Siparişi Ekle
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </main>
    </div>
  )
}
