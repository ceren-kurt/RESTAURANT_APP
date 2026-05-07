'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Armchair, Bike, CreditCard, Banknote, CheckCircle2, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/cart-context'
import { createClient } from '@/lib/supabase/client'
import type { RestaurantTable, OrderType, PaymentMethod } from '@/lib/order-types'
import { cn } from '@/lib/utils'

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tables: RestaurantTable[]
}

type CheckoutStep = 'order-type' | 'customer-info' | 'payment' | 'success'

export function CheckoutDialog({ open, onOpenChange, tables }: CheckoutDialogProps) {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCart()
  const totalPrice = getTotalPrice()

  const [step, setStep] = useState<CheckoutStep>('order-type')
  const [orderType, setOrderType] = useState<OrderType>('takeaway')
  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<number | null>(null)
  
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  })

  const [addressInfo, setAddressInfo] = useState({
    title: '',
    fullAddress: '',
  })

  const resetForm = () => {
    setStep('order-type')
    setOrderType('takeaway')
    setSelectedTable(null)
    setPaymentMethod('cash')
    setCustomerInfo({ firstName: '', lastName: '', phone: '', email: '' })
    setAddressInfo({ title: '', fullAddress: '' })
    setOrderId(null)
  }

  const handleClose = () => {
    if (step === 'success') {
      clearCart()
      resetForm()
    }
    onOpenChange(false)
  }

  const handleSubmitOrder = async () => {
    setIsSubmitting(true)
    
    try {
      const supabase = createClient()

      // 1. Create customer
      const { data: customer, error: customerError } = await supabase
        .from('customer')
        .insert({
          first_name: customerInfo.firstName,
          last_name: customerInfo.lastName,
          phone: customerInfo.phone || null,
          email: customerInfo.email || null,
        })
        .select()
        .single()

      if (customerError) throw customerError

      // 2. Create address for takeaway
      let addressId = null
      if (orderType === 'takeaway' && addressInfo.fullAddress) {
        const { data: address, error: addressError } = await supabase
          .from('address')
          .insert({
            title: addressInfo.title || 'Teslimat Adresi',
            full_address: addressInfo.fullAddress,
            customer_id: customer.customer_id,
          })
          .select()
          .single()

        if (addressError) throw addressError
        addressId = address.address_id
      }

      // 3. Create order
      const { data: order, error: orderError } = await supabase
        .from('restaurant_order')
        .insert({
          total_amount: totalPrice,
          status: 'pending',
          order_type: orderType,
          table_id: orderType === 'dine-in' ? selectedTable : null,
          customer_id: customer.customer_id,
          address_id: addressId,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // 4. Create order details
      const orderDetails = items.map((item) => ({
        order_id: order.order_id,
        product_id: item.product.product_id,
        quantity: item.quantity,
        unit_price: item.product.price,
      }))

      const { error: detailsError } = await supabase
        .from('order_detail')
        .insert(orderDetails)

      if (detailsError) throw detailsError

      // 5. Create payment
      const { error: paymentError } = await supabase
        .from('payment')
        .insert({
          payment_method: paymentMethod,
          amount: totalPrice,
          order_id: order.order_id,
        })

      if (paymentError) throw paymentError

      setOrderId(order.order_id)
      setStep('success')
    } catch (error) {
      console.error('Order submission error:', error)
      alert('Siparis olusturulurken bir hata olustu. Lutfen tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceedFromOrderType = orderType === 'takeaway' || (orderType === 'dine-in' && selectedTable !== null)
  const canProceedFromCustomerInfo = customerInfo.firstName.trim() && customerInfo.lastName.trim() && 
    (orderType === 'dine-in' || addressInfo.fullAddress.trim())

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {step === 'order-type' && (
          <>
            <DialogHeader>
              <DialogTitle>Siparis Tipi Secin</DialogTitle>
              <DialogDescription>
                Siparisinisin masada mi yoksa paket mi olacagini secin
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <button
                onClick={() => setOrderType('dine-in')}
                className={cn(
                  'flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all',
                  orderType === 'dine-in'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <Armchair className={cn(
                  'size-10',
                  orderType === 'dine-in' ? 'text-primary' : 'text-muted-foreground'
                )} />
                <span className="font-medium">Masada Yemek</span>
              </button>

              <button
                onClick={() => {
                  setOrderType('takeaway')
                  setSelectedTable(null)
                }}
                className={cn(
                  'flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all',
                  orderType === 'takeaway'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <Bike className={cn(
                  'size-10',
                  orderType === 'takeaway' ? 'text-primary' : 'text-muted-foreground'
                )} />
                <span className="font-medium">Paket Siparis</span>
              </button>
            </div>

            {orderType === 'dine-in' && tables.length > 0 && (
              <div className="space-y-3">
                <Label>Masa Secin</Label>
                <div className="grid grid-cols-4 gap-2">
                  {tables.map((table) => (
                    <button
                      key={table.table_id}
                      onClick={() => setSelectedTable(table.table_id)}
                      className={cn(
                        'p-3 rounded-lg border text-center transition-all',
                        selectedTable === table.table_id
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <span className="font-medium">{table.table_number}</span>
                      <span className="text-xs block opacity-70">{table.capacity} kisi</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {orderType === 'dine-in' && tables.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Su an musait masa bulunmuyor
              </p>
            )}

            <Separator className="my-4" />

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Toplam</p>
                <p className="text-xl font-bold text-primary">{totalPrice.toFixed(2)} TL</p>
              </div>
              <Button
                onClick={() => setStep('customer-info')}
                disabled={!canProceedFromOrderType}
              >
                Devam Et
              </Button>
            </div>
          </>
        )}

        {step === 'customer-info' && (
          <>
            <DialogHeader>
              <DialogTitle>Musteri Bilgileri</DialogTitle>
              <DialogDescription>
                Siparisiniz icin iletisim bilgilerinizi girin
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Ad *</Label>
                  <Input
                    id="firstName"
                    value={customerInfo.firstName}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Adiniz"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Soyad *</Label>
                  <Input
                    id="lastName"
                    value={customerInfo.lastName}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Soyadiniz"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="0555 555 55 55"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="ornek@email.com"
                />
              </div>

              {orderType === 'takeaway' && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="addressTitle">Adres Basligi</Label>
                    <Input
                      id="addressTitle"
                      value={addressInfo.title}
                      onChange={(e) => setAddressInfo(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ev, Is, vb."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullAddress">Adres *</Label>
                    <Input
                      id="fullAddress"
                      value={addressInfo.fullAddress}
                      onChange={(e) => setAddressInfo(prev => ({ ...prev, fullAddress: e.target.value }))}
                      placeholder="Tam adresinizi girin"
                    />
                  </div>
                </>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('order-type')}>
                Geri
              </Button>
              <Button
                onClick={() => setStep('payment')}
                disabled={!canProceedFromCustomerInfo}
              >
                Devam Et
              </Button>
            </div>
          </>
        )}

        {step === 'payment' && (
          <>
            <DialogHeader>
              <DialogTitle>Odeme Yontemi</DialogTitle>
              <DialogDescription>
                Odeme yontemini secin ve siparisi tamamlayin
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                className="space-y-3"
              >
                <label
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all',
                    paymentMethod === 'cash'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <RadioGroupItem value="cash" />
                  <Banknote className="size-6 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Nakit</p>
                    <p className="text-sm text-muted-foreground">Teslimatta nakit odeme</p>
                  </div>
                </label>

                <label
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all',
                    paymentMethod === 'credit_card'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <RadioGroupItem value="credit_card" />
                  <CreditCard className="size-6 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Kredi Karti</p>
                    <p className="text-sm text-muted-foreground">Kart ile odeme</p>
                  </div>
                </label>
              </RadioGroup>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Siparis Tipi</span>
                <span>{orderType === 'dine-in' ? 'Masada Yemek' : 'Paket Siparis'}</span>
              </div>
              {orderType === 'dine-in' && selectedTable && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Masa</span>
                  <span>{tables.find(t => t.table_id === selectedTable)?.table_number}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Musteri</span>
                <span>{customerInfo.firstName} {customerInfo.lastName}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Toplam</span>
                <span className="text-primary">{totalPrice.toFixed(2)} TL</span>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('customer-info')}>
                Geri
              </Button>
              <Button onClick={handleSubmitOrder} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Islem Yapiliyor...
                  </>
                ) : (
                  'Siparisi Onayla'
                )}
              </Button>
            </div>
          </>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="size-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="size-10 text-green-500" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle className="text-2xl">Siparisiniz Alindi!</DialogTitle>
              <DialogDescription className="text-base">
                Siparis numaraniz: <span className="font-bold text-foreground">#{orderId}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="bg-secondary/50 rounded-lg p-4 mt-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Siparis Tipi</span>
                <span>{orderType === 'dine-in' ? 'Masada Yemek' : 'Paket Siparis'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Toplam Tutar</span>
                <span className="font-semibold text-primary">{totalPrice.toFixed(2)} TL</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Odeme</span>
                <span>{paymentMethod === 'cash' ? 'Nakit' : 'Kredi Karti'}</span>
              </div>
            </div>

            <Button className="w-full mt-6" onClick={handleClose}>
              Tamam
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
