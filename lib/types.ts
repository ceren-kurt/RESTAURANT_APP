// Backend'den gelen snake_case isimlendirmeye uyumlu tipler

export interface Category {
  category_id: number
  name: string
  description: string | null
  image_url?: string | null
  is_active: boolean
}

export interface Product {
  product_id: number
  name: string
  description?: string | null
  price: number
  image_url?: string | null
  is_available: boolean
  category_id: number
  category_name?: string
}

export interface Employee {
  employee_id: number
  first_name: string
  last_name: string
  role: string
  phone: string
}

export interface Courier {
  courier_id: number
  first_name: string
  last_name: string
  vehicle_plate: string
  courier_status: string
}

export interface Table {
  table_id: number
  table_number: string
  capacity: number
  status: string
}

export type EntityType = 'categories' | 'products' | 'employees' | 'couriers' | 'tables'

// Form veri tipleri (POST/PUT istekleri için)
export interface CategoryCreate {
  name: string
  description?: string | null
  image_url?: string | null
  is_active: boolean
}

export interface ProductCreate {
  name: string
  description?: string | null
  price: number
  image_url?: string | null
  is_available: boolean
  category_id: number
}

export interface EmployeeCreate {
  first_name: string
  last_name: string
  role: string
  phone: string
}

export interface CourierCreate {
  first_name: string
  last_name: string
  vehicle_plate: string
  courier_status: string
}

export interface TableCreate {
  table_number: string
  capacity: number
  status: string
}
