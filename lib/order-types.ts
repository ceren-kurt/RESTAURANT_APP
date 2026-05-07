// Customer Order Types for Supabase

export interface Category {
  category_id: number
  name: string
  description: string | null
  image_url: string | null
  is_active: boolean
}

export interface Product {
  product_id: number
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  category_id: number | null
}

export interface RestaurantTable {
  table_id: number
  table_number: string
  capacity: number
  status: string
}

export interface Customer {
  customer_id: number
  first_name: string
  last_name: string
  phone: string | null
  email: string | null
}

export interface Address {
  address_id: number
  title: string | null
  full_address: string
  customer_id: number | null
}

export interface RestaurantOrder {
  order_id: number
  order_date: string
  total_amount: number
  status: string
  order_type: 'dine-in' | 'takeaway'
  table_id: number | null
  customer_id: number | null
  address_id: number | null
}

export interface OrderDetail {
  detail_id: number
  quantity: number
  unit_price: number
  order_id: number | null
  product_id: number | null
}

export interface Payment {
  payment_id: number
  payment_method: 'cash' | 'credit_card'
  amount: number
  payment_date: string
  order_id: number | null
}

// Cart types
export interface CartItem {
  product: Product
  quantity: number
}

// Checkout form types
export interface CustomerInfo {
  firstName: string
  lastName: string
  phone: string
  email: string
}

export interface AddressInfo {
  title: string
  fullAddress: string
}

export type OrderType = 'dine-in' | 'takeaway'
export type PaymentMethod = 'cash' | 'credit_card'

export interface CheckoutData {
  orderType: OrderType
  customerInfo: CustomerInfo
  addressInfo?: AddressInfo
  tableId?: number
  paymentMethod: PaymentMethod
}
