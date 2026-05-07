import { createClient } from '@/lib/supabase/server'
import { OrderPageClient } from '@/components/order/order-page-client'
import type { Category, Product, RestaurantTable } from '@/lib/order-types'

export const metadata = {
  title: 'Siparis Ver | Restoran',
  description: 'Online siparis verin veya masanizdan siparis olusturun',
}

// Sample data for demo purposes (used when database tables don't exist yet)
const sampleCategories: Category[] = [
  { category_id: 1, name: 'Ana Yemekler', description: 'Lezzetli ana yemekler', image_url: null, is_active: true },
  { category_id: 2, name: 'Baslangiclar', description: 'Iştah açıcı başlangıçlar', image_url: null, is_active: true },
  { category_id: 3, name: 'Salatalar', description: 'Taze salatalar', image_url: null, is_active: true },
  { category_id: 4, name: 'Icecekler', description: 'Soguk ve sicak icecekler', image_url: null, is_active: true },
  { category_id: 5, name: 'Tatlilar', description: 'Ev yapimi tatlilar', image_url: null, is_active: true },
]

const sampleProducts: Product[] = [
  { product_id: 1, name: 'Izgara Kofte', description: 'El yapimi kofte, pilav ve salata ile', price: 180, image_url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400', is_available: true, category_id: 1 },
  { product_id: 2, name: 'Tavuk Sote', description: 'Sebzeli tavuk sote, pilav ile', price: 160, image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400', is_available: true, category_id: 1 },
  { product_id: 3, name: 'Kuzu Tandir', description: 'Firinda kuzu tandir, patates puresi ile', price: 220, image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', is_available: true, category_id: 1 },
  { product_id: 4, name: 'Balik Izgara', description: 'Mevsim baligi, limonlu sos ile', price: 200, image_url: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400', is_available: true, category_id: 1 },
  { product_id: 5, name: 'Mercimek Corbasi', description: 'Geleneksel mercimek corbasi', price: 45, image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', is_available: true, category_id: 2 },
  { product_id: 6, name: 'Humus', description: 'Nohut puresi, zeytinyagi ile', price: 55, image_url: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400', is_available: true, category_id: 2 },
  { product_id: 7, name: 'Sigara Boregi', description: '4 adet peynirli sigara boregi', price: 65, image_url: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400', is_available: true, category_id: 2 },
  { product_id: 8, name: 'Coban Salata', description: 'Domates, salatalik, biber, sogan', price: 50, image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', is_available: true, category_id: 3 },
  { product_id: 9, name: 'Sezar Salata', description: 'Marul, kruton, parmesan, tavuk', price: 85, image_url: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400', is_available: true, category_id: 3 },
  { product_id: 10, name: 'Ayran', description: 'Ev yapimi ayran', price: 20, image_url: 'https://images.unsplash.com/photo-1571757767119-68b8dbed8c97?w=400', is_available: true, category_id: 4 },
  { product_id: 11, name: 'Kola', description: 'Soguk icecek', price: 25, image_url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400', is_available: true, category_id: 4 },
  { product_id: 12, name: 'Turk Kahvesi', description: 'Geleneksel Turk kahvesi', price: 35, image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400', is_available: true, category_id: 4 },
  { product_id: 13, name: 'Sutlac', description: 'Firinda sutlac', price: 55, image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', is_available: true, category_id: 5 },
  { product_id: 14, name: 'Baklava', description: '4 dilim fistikli baklava', price: 75, image_url: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=400', is_available: true, category_id: 5 },
  { product_id: 15, name: 'Kunefe', description: 'Sicak servis kunefe, dondurma ile', price: 85, image_url: 'https://images.unsplash.com/photo-1576020799627-aeac74d58064?w=400', is_available: true, category_id: 5 },
]

const sampleTables: RestaurantTable[] = [
  { table_id: 1, table_number: '1', capacity: 4, status: 'available' },
  { table_id: 2, table_number: '2', capacity: 4, status: 'available' },
  { table_id: 3, table_number: '3', capacity: 6, status: 'available' },
  { table_id: 4, table_number: '4', capacity: 2, status: 'available' },
  { table_id: 5, table_number: '5', capacity: 8, status: 'available' },
  { table_id: 6, table_number: 'Bahce 1', capacity: 4, status: 'available' },
  { table_id: 7, table_number: 'Bahce 2', capacity: 6, status: 'available' },
  { table_id: 8, table_number: 'VIP', capacity: 10, status: 'available' },
]

async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('category')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching categories:', error)
      return sampleCategories
    }
    return data && data.length > 0 ? data : sampleCategories
  } catch {
    return sampleCategories
  }
}

async function getProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('product')
      .select('*')
      .eq('is_available', true)
      .order('name')

    if (error) {
      console.error('Error fetching products:', error)
      return sampleProducts
    }
    return data && data.length > 0 ? data : sampleProducts
  } catch {
    return sampleProducts
  }
}

async function getTables(): Promise<RestaurantTable[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('restaurant_table')
      .select('*')
      .eq('status', 'available')
      .order('table_number')

    if (error) {
      console.error('Error fetching tables:', error)
      return sampleTables
    }
    return data && data.length > 0 ? data : sampleTables
  } catch {
    return sampleTables
  }
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
