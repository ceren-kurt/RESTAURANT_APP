'use client'

import { useState, useEffect } from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin-sidebar'
import { DataTable, ActiveBadge, AvailableBadge, StatusBadge } from '@/components/data-table'
import { CategoryForm } from '@/components/forms/category-form'
import { ProductForm } from '@/components/forms/product-form'
import { EmployeeForm } from '@/components/forms/employee-form'
import { CourierForm } from '@/components/forms/courier-form'
import { TableForm } from '@/components/forms/table-form'
import { useApp } from '@/lib/app-context'
import { EntityType, Category, Product, Employee, Courier, Table, Order, OrderDetail } from '@/lib/types'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

interface AdminDashboardProps {
  onLogout: () => void
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<EntityType>('categories')
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingItem, setEditingItem] = useState<Category | Product | Employee | Courier | Table | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([])
  const [orderProducts, setOrderProducts] = useState<Record<number, Product>>({})
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)
  
  const {
    categories,
    products,
    employees,
    couriers,
    tables,
    loading,
    error,
    clearError,
    refreshData,
    addCategory,
    updateCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addCourier,
    updateCourier,
    deleteCourier,
    addTable,
    updateTable,
    deleteTable,
  } = useApp()

  // Fetch data on mount
  useEffect(() => {
    refreshData()
  }, [refreshData])

  const fetchOrders = async () => {
    setOrdersLoading(true)
    try {
      const { data: orderRows, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .order('order_date', { ascending: false })

      if (orderError) throw new Error(orderError.message)

      const normalizedOrders = (orderRows ?? []) as Order[]
      setOrders(normalizedOrders)

      const orderIds = normalizedOrders.map((order) => order.order_id)
      if (orderIds.length === 0) {
        setOrderDetails([])
        setOrderProducts({})
        return
      }

      const { data: detailRows, error: detailError } = await supabase
        .from('order_detail')
        .select('*')
        .in('order_id', orderIds)

      if (detailError) throw new Error(detailError.message)

      const normalizedDetails = (detailRows ?? []) as OrderDetail[]
      setOrderDetails(normalizedDetails)

      const productIds = [...new Set(normalizedDetails.map((detail) => detail.product_id))]
      if (productIds.length === 0) {
        setOrderProducts({})
        return
      }

      const { data: productRows, error: productError } = await supabase
        .from('product')
        .select('*')
        .in('product_id', productIds)

      if (productError) throw new Error(productError.message)

      const productMap = ((productRows ?? []) as Product[]).reduce<Record<number, Product>>((acc, product) => {
        acc[product.product_id] = product
        return acc
      }, {})

      setOrderProducts(productMap)
    } catch (err) {
      console.error('Siparişler yüklenemedi:', err)
    } finally {
      setOrdersLoading(false)
    }
  }

  useEffect(() => {
    if (activeSection === 'orders') {
      fetchOrders()
    }
  }, [activeSection])

  const handleAdd = () => {
    setEditingItem(null)
    setFormOpen(true)
  }

  const handleEdit = (item: Category | Product | Employee | Courier | Table) => {
    setEditingItem(item)
    setFormOpen(true)
  }

  const handleDeleteClick = (id: number) => {
    setItemToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (itemToDelete === null) return
    
    setIsDeleting(true)
    try {
      switch (activeSection) {
        case 'categories':
          await deleteCategory(itemToDelete)
          break
        case 'products':
          await deleteProduct(itemToDelete)
          break
        case 'employees':
          await deleteEmployee(itemToDelete)
          break
        case 'couriers':
          await deleteCourier(itemToDelete)
          break
        case 'tables':
          await deleteTable(itemToDelete)
          break
        case 'orders':
          break
      }
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    } catch {
      // Error is handled by context
    } finally {
      setIsDeleting(false)
    }
  }

  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.category_id === categoryId)?.name || 'Bilinmiyor'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'Available': 'Müsait',
      'Busy': 'Meşgul',
      'Inactive': 'Pasif',
      'Occupied': 'Dolu',
      'Reserved': 'Rezerve',
    }
    return labels[status] || status
  }

  const getOrderStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Beklemede',
      preparing: 'Hazırlanıyor',
      delivered: 'Tamamlandı',
    }
    return labels[status] || status
  }

  const updateOrderStatus = async (orderId: number, status: 'pending' | 'preparing' | 'delivered') => {
    setUpdatingOrderId(orderId)
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status })
        .eq('order_id', orderId)

      if (updateError) {
        console.error('Order status update error:', {
          orderId,
          status,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code,
          fullError: updateError,
        })
        return
      }

      setOrders((prev) =>
        prev.map((order) => (order.order_id === orderId ? { ...order, status } : order))
      )
    } catch (err) {
      console.error('Sipariş durumu güncellenemedi:', err)
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Spinner className="size-8" />
          <span className="ml-2 text-muted-foreground">Yükleniyor...</span>
        </div>
      )
    }

    switch (activeSection) {
      case 'categories':
        return (
          <>
            <DataTable
              title="Kategoriler"
              data={categories}
              columns={[
                { key: 'name', header: 'Kategori Adı' },
                { key: 'description', header: 'Açıklama' },
                { key: 'is_active', header: 'Durum', render: (item) => <ActiveBadge isActive={item.is_active} /> },
                { key: 'actions', header: 'İşlemler' },
              ]}
              idKey="category_id"
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
            <CategoryForm
              open={formOpen}
              onOpenChange={setFormOpen}
              category={editingItem as Category | null}
              onSubmit={async (data) => {
                if (editingItem) {
                  await updateCategory((editingItem as Category).category_id, data)
                } else {
                  await addCategory(data)
                }
              }}
            />
          </>
        )
      
      case 'products':
        return (
          <>
            <DataTable
              title="Ürünler"
              data={products}
              columns={[
                { key: 'name', header: 'Ürün Adı' },
                { key: 'price', header: 'Fiyat', render: (item) => `₺${item.price.toFixed(2)}` },
                { key: 'category_id', header: 'Kategori', render: (item) => item.category_name || getCategoryName(item.category_id) },
                { key: 'is_available', header: 'Durum', render: (item) => <AvailableBadge isAvailable={item.is_available} /> },
                { key: 'actions', header: 'İşlemler' },
              ]}
              idKey="product_id"
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
            <ProductForm
              open={formOpen}
              onOpenChange={setFormOpen}
              product={editingItem as Product | null}
              categories={categories}
              onSubmit={async (data) => {
                if (editingItem) {
                  await updateProduct((editingItem as Product).product_id, data)
                } else {
                  await addProduct(data)
                }
              }}
            />
          </>
        )
      
      case 'employees':
        return (
          <>
            <DataTable
              title="Çalışanlar"
              data={employees}
              columns={[
                { key: 'first_name', header: 'Ad' },
                { key: 'last_name', header: 'Soyad' },
                { key: 'role', header: 'Rol' },
                { key: 'phone', header: 'Telefon' },
                { key: 'actions', header: 'İşlemler' },
              ]}
              idKey="employee_id"
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
            <EmployeeForm
              open={formOpen}
              onOpenChange={setFormOpen}
              employee={editingItem as Employee | null}
              onSubmit={async (data) => {
                if (editingItem) {
                  await updateEmployee((editingItem as Employee).employee_id, data)
                } else {
                  await addEmployee(data)
                }
              }}
            />
          </>
        )
      
      case 'couriers':
        return (
          <>
            <DataTable
              title="Kuryeler"
              data={couriers}
              columns={[
                { key: 'first_name', header: 'Ad' },
                { key: 'last_name', header: 'Soyad' },
                { key: 'vehicle_plate', header: 'Araç Plakası' },
                { key: 'courier_status', header: 'Durum', render: (item) => <StatusBadge status={item.courier_status} label={getStatusLabel(item.courier_status)} /> },
                { key: 'actions', header: 'İşlemler' },
              ]}
              idKey="courier_id"
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
            <CourierForm
              open={formOpen}
              onOpenChange={setFormOpen}
              courier={editingItem as Courier | null}
              onSubmit={async (data) => {
                if (editingItem) {
                  await updateCourier((editingItem as Courier).courier_id, data)
                } else {
                  await addCourier(data)
                }
              }}
            />
          </>
        )
      
      case 'tables':
        return (
          <>
            <DataTable
              title="Masalar"
              data={tables}
              columns={[
                { key: 'table_number', header: 'Masa No' },
                { key: 'capacity', header: 'Kapasite', render: (item) => `${item.capacity} kişi` },
                { key: 'status', header: 'Durum', render: (item) => <StatusBadge status={item.status} label={getStatusLabel(item.status)} /> },
                { key: 'actions', header: 'İşlemler' },
              ]}
              idKey="table_id"
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
            <TableForm
              open={formOpen}
              onOpenChange={setFormOpen}
              table={editingItem as Table | null}
              onSubmit={async (data) => {
                if (editingItem) {
                  await updateTable((editingItem as Table).table_id, data)
                } else {
                  await addTable(data)
                }
              }}
            />
          </>
        )

      case 'orders':
        if (ordersLoading) {
          return (
            <div className="flex items-center justify-center h-64">
              <Spinner className="size-8" />
              <span className="ml-2 text-muted-foreground">Siparişler yükleniyor...</span>
            </div>
          )
        }

        if (orders.length === 0) {
          return (
            <div className="text-sm text-muted-foreground">
              Henüz sipariş bulunmuyor.
            </div>
          )
        }

        return (
          <div className="space-y-4">
            {orders.map((order) => {
              const details = orderDetails.filter((detail) => detail.order_id === order.order_id)
              return (
                <Card key={order.order_id}>
                  <CardHeader>
                    <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
                      <span>Sipariş #{order.order_id}</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {new Date(order.order_date).toLocaleString('tr-TR')}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="rounded-md bg-muted px-2 py-1">
                        {order.order_type === 'dine-in'
                          ? `Masa ${order.table_id ?? '-'}`
                          : `Paket (Müşteri: ${order.customer_id ?? '-'})`}
                      </span>
                      <span className="rounded-md bg-muted px-2 py-1">Durum: {getOrderStatusLabel(order.status)}</span>
                      <span className="rounded-md bg-muted px-2 py-1">
                        Toplam: ₺{Number(order.total_amount).toFixed(2)}
                      </span>
                    </div>

                    <div className="space-y-2 rounded-md border p-3">
                      {details.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Sipariş detayı bulunamadı.</p>
                      ) : (
                        details.map((detail) => (
                          <div key={detail.detail_id} className="flex items-center justify-between text-sm">
                            <span>
                              {orderProducts[detail.product_id]?.name ?? `Ürün #${detail.product_id}`} x {detail.quantity}
                            </span>
                            <span>₺{(Number(detail.unit_price) * detail.quantity).toFixed(2)}</span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={order.status === 'pending' ? 'default' : 'outline'}
                        disabled={updatingOrderId === order.order_id}
                        onClick={() => updateOrderStatus(order.order_id, 'pending')}
                      >
                        Beklemede
                      </Button>
                      <Button
                        size="sm"
                        variant={order.status === 'preparing' ? 'default' : 'outline'}
                        disabled={updatingOrderId === order.order_id}
                        onClick={() => updateOrderStatus(order.order_id, 'preparing')}
                      >
                        Hazırlanıyor
                      </Button>
                      <Button
                        size="sm"
                        variant={order.status === 'delivered' ? 'default' : 'outline'}
                        disabled={updatingOrderId === order.order_id}
                        onClick={() => updateOrderStatus(order.order_id, 'delivered')}
                      >
                        Tamamlandı
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )
    }
  }

  return (
    <SidebarProvider>
      <AdminSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        onLogout={onLogout}
      />
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-lg font-semibold">Yönetim Paneli</h1>
        </header>
        <main className="flex-1 p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Hata</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button variant="ghost" size="sm" onClick={clearError}>
                  <X className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          )}
          {renderContent()}
        </main>
      </SidebarInset>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Silmek istediğinizden emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Bu öğe kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting && <Spinner className="mr-2" />}
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}
