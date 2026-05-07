import { createClient } from '@/lib/supabase/server'
import { OrderPageClient } from '@/components/order/order-page-client'
import type { Category, Product, RestaurantTable } from '@/lib/order-types'

export const metadata = {
  title: 'Siparis Ver | Restoran',
  description: 'Online siparis verin veya masanizdan siparis olusturun',
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('category')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }
  return data || []
}

async function getProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('product')
    .select('*')
    .eq('is_available', true)
    .order('name')

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  return data || []
}

async function getTables(): Promise<RestaurantTable[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('restaurant_table')
    .select('*')
    .eq('status', 'available')
    .order('table_number')

  if (error) {
    console.error('Error fetching tables:', error)
    return []
  }
  return data || []
}

export default async function OrderPage() {
  const [categories, products, tables] = await Promise.all([
    getCategories(),
    getProducts(),
    getTables(),
  ])

  return (
    <OrderPageClient
      initialCategories={categories}
      initialProducts={products}
      initialTables={tables}
    />
  )
}
