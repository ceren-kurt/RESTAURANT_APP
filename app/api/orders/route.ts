import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      customerInfo,
      addressInfo,
      orderType,
      tableId,
      paymentMethod,
      items,
      totalAmount,
    } = body

    const supabase = await createClient()

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

    if (customerError) {
      console.error('Customer creation error:', customerError)
      return NextResponse.json(
        { error: 'Musteri olusturulamadi' },
        { status: 500 }
      )
    }

    // 2. Create address for takeaway
    let addressId = null
    if (orderType === 'takeaway' && addressInfo?.fullAddress) {
      const { data: address, error: addressError } = await supabase
        .from('address')
        .insert({
          title: addressInfo.title || 'Teslimat Adresi',
          full_address: addressInfo.fullAddress,
          customer_id: customer.customer_id,
        })
        .select()
        .single()

      if (addressError) {
        console.error('Address creation error:', addressError)
        return NextResponse.json(
          { error: 'Adres olusturulamadi' },
          { status: 500 }
        )
      }
      addressId = address.address_id
    }

    // 3. Create order
    const { data: order, error: orderError } = await supabase
      .from('restaurant_order')
      .insert({
        total_amount: totalAmount,
        status: 'pending',
        order_type: orderType,
        table_id: orderType === 'dine-in' ? tableId : null,
        customer_id: customer.customer_id,
        address_id: addressId,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json(
        { error: 'Siparis olusturulamadi' },
        { status: 500 }
      )
    }

    // 4. Create order details
    const orderDetails = items.map((item: { productId: number; quantity: number; unitPrice: number }) => ({
      order_id: order.order_id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }))

    const { error: detailsError } = await supabase
      .from('order_detail')
      .insert(orderDetails)

    if (detailsError) {
      console.error('Order details creation error:', detailsError)
      return NextResponse.json(
        { error: 'Siparis detaylari olusturulamadi' },
        { status: 500 }
      )
    }

    // 5. Create payment
    const { error: paymentError } = await supabase
      .from('payment')
      .insert({
        payment_method: paymentMethod,
        amount: totalAmount,
        order_id: order.order_id,
      })

    if (paymentError) {
      console.error('Payment creation error:', paymentError)
      return NextResponse.json(
        { error: 'Odeme kaydedilemedi' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      orderId: order.order_id,
      message: 'Siparis basariyla olusturuldu',
    })
  } catch (error) {
    console.error('Order API error:', error)
    return NextResponse.json(
      { error: 'Bir hata olustu' },
      { status: 500 }
    )
  }
}
