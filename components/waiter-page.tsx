'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Plus, Minus, Receipt, CreditCard, PackagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import type { Order, OrderDetail, Product, Table } from '@/lib/types'

interface WaiterPageProps {
  onBack: () => void
}

type CartItem = { productId: number; quantity: number }

function canAddProductsToOrder(status: string) {
  return status === 'pending' || status === 'preparing'
}

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
  const [addonTargetOrder, setAddonTargetOrder] = useState<Order | null>(null)
  const [addonCart, setAddonCart] = useState<CartItem[]>([])
  const [isSubmittingAddon, setIsSubmittingAddon] = useState(false)

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
      setError(err instanceof Error ? err.message : 'Failed to load data')
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
        .in('status', ['pending', 'preparing', 'ready'])
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
      setError(err instanceof Error ? err.message : 'Table orders could not be loaded')
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

  const addonCartTotal = useMemo(
    () =>
      addonCart.reduce((sum, item) => {
        const product = products.find((p) => p.product_id === item.productId)
        return sum + (product?.price || 0) * item.quantity
      }, 0),
    [addonCart, products]
  )

  const addAddonCartItem = (productId: number) => {
    setAddonCart((prev) => {
      const existing = prev.find((item) => item.productId === productId)
      if (existing) {
        return prev.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { productId, quantity: 1 }]
    })
  }

  const decreaseAddonCartItem = (productId: number) => {
    setAddonCart((prev) =>
      prev
        .map((item) => (item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    )
  }

  const closeAddonDialog = () => {
    setAddonTargetOrder(null)
    setAddonCart([])
  }

  const submitAddonToOrder = async () => {
    if (!addonTargetOrder || !selectedTable || addonCart.length === 0) return

    setIsSubmittingAddon(true)
    setError(null)
    try {
      const orderId = addonTargetOrder.order_id

      const { data: orderRow, error: orderFetchError } = await supabase
        .from('orders')
        .select('status')
        .eq('order_id', orderId)
        .single()

      if (orderFetchError || !orderRow) {
        throw new Error(orderFetchError?.message || 'Order could not be loaded')
      }
      if (!canAddProductsToOrder(orderRow.status)) {
        throw new Error('Products can only be added while the order is pending or preparing.')
      }

      const detailRows = addonCart.map((item) => {
        const product = products.find((p) => p.product_id === item.productId)
        return {
          order_id: orderId,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: product?.price ?? 0,
        }
      })

      const { error: detailError } = await supabase.from('order_detail').insert(detailRows)
      if (detailError) throw new Error(detailError.message || 'Could not add order lines')

      const { data: allDetails, error: sumError } = await supabase
        .from('order_detail')
        .select('quantity, unit_price')
        .eq('order_id', orderId)

      if (sumError) throw new Error(sumError.message || 'Could not recalculate order total')

      const newTotal = (allDetails ?? []).reduce(
        (sum, row) => sum + Number(row.unit_price) * Number(row.quantity),
        0
      )

      const { error: updateError } = await supabase
        .from('orders')
        .update({ total_amount: newTotal })
        .eq('order_id', orderId)

      if (updateError) throw new Error(updateError.message || 'Could not update order total')

      closeAddonDialog()
      await fetchTableOrders(selectedTable.table_id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add products to order')
    } finally {
      setIsSubmittingAddon(false)
    }
  }

  const tableTotal = useMemo(() => orders.reduce((sum, order) => sum + Number(order.total_amount), 0), [orders])

  const submitOrder = async () => {
    if (!selectedTable || cart.length === 0) return

    setIsSubmittingOrder(true)
    setError(null)
    try {
      const employeeId = Number(localStorage.getItem('employee_id'))
      if (!Number.isFinite(employeeId)) {
        throw new Error('employee_id not found, please sign in again')
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

      if (orderError || !orderRow) throw new Error(orderError?.message || 'Order could not be saved')

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
      if (detailError) throw new Error(detailError.message || 'Order details could not be saved')

      setCart([])
      await fetchTableOrders(selectedTable.table_id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order could not be created')
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  const markOrderAsPaid = async (order: Order) => {
    setIsPayingOrderId(order.order_id)
    setError(null)
    try {
      // 1) Record payment first; 2) then set order to delivered (any prior status: pending / preparing / ready)
      const paidAt = new Date().toISOString()
      const { error: paymentError } = await supabase.from('payment').insert({
        payment_method: 'cash',
        amount: order.total_amount,
        order_id: order.order_id,
        payment_date: paidAt,
      })

      if (paymentError) throw new Error(paymentError.message || 'Payment record could not be created')

      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'delivered' })
        .eq('order_id', order.order_id)

      if (updateError) throw new Error(updateError.message || 'Order status could not be updated')

      if (selectedTable) {
        await fetchTableOrders(selectedTable.table_id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setIsPayingOrderId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="size-8" />
        <span className="ml-2 text-muted-foreground">Loading waiter dashboard...</span>
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
            <h1 className="text-xl font-bold">Waiter Panel</h1>
            <p className="text-xs text-muted-foreground">Table and order management</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto grid gap-4 px-4 py-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Tables</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {tables.map((table) => (
              <Button
                key={table.table_id}
                variant={selectedTable?.table_id === table.table_id ? 'default' : 'outline'}
                className="h-auto py-3"
                onClick={() => setSelectedTable(table)}
              >
                Table {table.table_number}
              </Button>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          {!selectedTable ? (
            <Card>
              <CardContent className="py-8 text-sm text-muted-foreground">Select a table to view details.</CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Table {selectedTable.table_number} Orders</span>
                    <Badge>Total: ₺{tableTotal.toFixed(2)}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {orders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No active orders for this table.</p>
                  ) : (
                    orders.map((order) => (
                      <div key={order.order_id} className="rounded-lg border p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-medium">Order #{order.order_id}</span>
                          <Badge variant="secondary">₺{Number(order.total_amount).toFixed(2)}</Badge>
                        </div>
                        <div className="mb-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {order.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          {orderDetails
                            .filter((detail) => detail.order_id === order.order_id)
                            .map((detail) => (
                              <div key={detail.detail_id} className="flex justify-between">
                                <span>
                                  {products.find((p) => p.product_id === detail.product_id)?.name ?? `Product #${detail.product_id}`} x{' '}
                                  {detail.quantity}
                                </span>
                                <span>₺{(Number(detail.unit_price) * detail.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                        </div>
                        {canAddProductsToOrder(order.status) && (
                          <Button
                            className="mt-3 w-full"
                            variant="secondary"
                            disabled={isPayingOrderId === order.order_id || isSubmittingAddon}
                            onClick={() => {
                              setAddonTargetOrder(order)
                              setAddonCart([])
                            }}
                          >
                            <PackagePlus className="mr-2 size-4" />
                            Add Product
                          </Button>
                        )}
                        <Button
                          className="mt-3 w-full"
                          variant="outline"
                          disabled={isPayingOrderId === order.order_id}
                          onClick={() => markOrderAsPaid(order)}
                        >
                          <CreditCard className="mr-2 size-4" />
                          Paid
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add New Order</CardTitle>
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
                    <span className="font-medium">New order total</span>
                    <span className="font-bold">₺{cartTotal.toFixed(2)}</span>
                  </div>

                  <Button className="w-full" disabled={cart.length === 0 || isSubmittingOrder} onClick={submitOrder}>
                    {isSubmittingOrder ? (
                      <>
                        <Spinner className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Receipt className="mr-2 size-4" />
                        Add Order
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

      <Dialog
        open={addonTargetOrder !== null}
        onOpenChange={(open) => {
          if (!open) closeAddonDialog()
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add products to order #{addonTargetOrder?.order_id}</DialogTitle>
            <DialogDescription>
              Choose items and quantities. Only orders in pending or preparing status can be edited.
            </DialogDescription>
          </DialogHeader>

          <div className="grid max-h-[50vh] gap-2 overflow-y-auto sm:grid-cols-2">
            {products.map((product) => {
              const quantity = addonCart.find((item) => item.productId === product.product_id)?.quantity ?? 0
              return (
                <div key={product.product_id} className="rounded-lg border p-2">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium leading-tight">{product.name}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">₺{Number(product.price).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      size="icon"
                      variant="outline"
                      className="size-8"
                      onClick={() => decreaseAddonCartItem(product.product_id)}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="text-sm font-semibold">{quantity}</span>
                    <Button size="icon" variant="outline" className="size-8" onClick={() => addAddonCartItem(product.product_id)}>
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="font-medium">Lines total</span>
            <span className="font-bold">₺{addonCartTotal.toFixed(2)}</span>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={closeAddonDialog} disabled={isSubmittingAddon}>
              Cancel
            </Button>
            <Button type="button" disabled={addonCart.length === 0 || isSubmittingAddon} onClick={() => submitAddonToOrder()}>
              {isSubmittingAddon ? (
                <>
                  <Spinner className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <PackagePlus className="mr-2 size-4" />
                  Add to order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
