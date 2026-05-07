'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { 
  Category, Product, Employee, Courier, Table,
  CategoryCreate, ProductCreate, EmployeeCreate, CourierCreate, TableCreate 
} from './types'

const API_BASE = 'http://localhost:8000/api/v1/admin'

interface AppContextType {
  categories: Category[]
  products: Product[]
  employees: Employee[]
  couriers: Courier[]
  tables: Table[]
  loading: boolean
  error: string | null
  clearError: () => void
  refreshData: () => Promise<void>
  addCategory: (category: CategoryCreate) => Promise<void>
  updateCategory: (id: number, category: CategoryCreate) => Promise<void>
  deleteCategory: (id: number) => Promise<void>
  addProduct: (product: ProductCreate) => Promise<void>
  updateProduct: (id: number, product: ProductCreate) => Promise<void>
  deleteProduct: (id: number) => Promise<void>
  addEmployee: (employee: EmployeeCreate) => Promise<void>
  updateEmployee: (id: number, employee: EmployeeCreate) => Promise<void>
  deleteEmployee: (id: number) => Promise<void>
  addCourier: (courier: CourierCreate) => Promise<void>
  updateCourier: (id: number, courier: CourierCreate) => Promise<void>
  deleteCourier: (id: number) => Promise<void>
  addTable: (table: TableCreate) => Promise<void>
  updateTable: (id: number, table: TableCreate) => Promise<void>
  deleteTable: (id: number) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `Hata: ${response.status}`)
  }
  return response.json()
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [couriers, setCouriers] = useState<Courier[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = () => setError(null)

  // Fetch all data
  const fetchCategories = async () => {
    const data = await handleResponse(await fetch(`${API_BASE}/categories`))
    setCategories(data)
  }

  const fetchProducts = async () => {
    const data = await handleResponse(await fetch(`${API_BASE}/products`))
    setProducts(data)
  }

  const fetchEmployees = async () => {
    const data = await handleResponse(await fetch(`${API_BASE}/employees`))
    setEmployees(data)
  }

  const fetchCouriers = async () => {
    const data = await handleResponse(await fetch(`${API_BASE}/couriers`))
    setCouriers(data)
  }

  const fetchTables = async () => {
    const data = await handleResponse(await fetch(`${API_BASE}/tables`))
    setTables(data)
  }

  const refreshData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await Promise.all([
        fetchCategories(),
        fetchProducts(),
        fetchEmployees(),
        fetchCouriers(),
        fetchTables(),
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Only fetch if admin is logged in
    const adminId = localStorage.getItem('admin_id')
    if (adminId) {
      refreshData()
    }
  }, [refreshData])

  // Category CRUD
  const addCategory = async (category: CategoryCreate) => {
    try {
      await handleResponse(await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      }))
      await fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kategori eklenemedi')
      throw err
    }
  }

  const updateCategory = async (id: number, category: CategoryCreate) => {
    try {
      await handleResponse(await fetch(`${API_BASE}/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      }))
      await fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kategori güncellenemedi')
      throw err
    }
  }

  const deleteCategory = async (id: number) => {
    try {
      await handleResponse(await fetch(`${API_BASE}/categories/${id}`, {
        method: 'DELETE',
      }))
      await fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kategori silinemedi')
      throw err
    }
  }

  // Product CRUD
  const addProduct = async (product: ProductCreate) => {
    try {
      await handleResponse(await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      }))
      await fetchProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ürün eklenemedi')
      throw err
    }
  }

  const updateProduct = async (id: number, product: ProductCreate) => {
    try {
      await handleResponse(await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      }))
      await fetchProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ürün güncellenemedi')
      throw err
    }
  }

  const deleteProduct = async (id: number) => {
    try {
      await handleResponse(await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
      }))
      await fetchProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ürün silinemedi')
      throw err
    }
  }

  // Employee CRUD
  const addEmployee = async (employee: EmployeeCreate) => {
    try {
      await handleResponse(await fetch(`${API_BASE}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee),
      }))
      await fetchEmployees()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Çalışan eklenemedi')
      throw err
    }
  }

  const updateEmployee = async (id: number, employee: EmployeeCreate) => {
    try {
      await handleResponse(await fetch(`${API_BASE}/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee),
      }))
      await fetchEmployees()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Çalışan güncellenemedi')
      throw err
    }
  }

  const deleteEmployee = async (id: number) => {
    try {
      await handleResponse(await fetch(`${API_BASE}/employees/${id}`, {
        method: 'DELETE',
      }))
      await fetchEmployees()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Çalışan silinemedi')
      throw err
    }
  }

  // Courier CRUD
  const addCourier = async (courier: CourierCreate) => {
    try {
      await handleResponse(await fetch(`${API_BASE}/couriers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courier),
      }))
      await fetchCouriers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kurye eklenemedi')
      throw err
    }
  }

  const updateCourier = async (id: number, courier: CourierCreate) => {
    try {
      await handleResponse(await fetch(`${API_BASE}/couriers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courier),
      }))
      await fetchCouriers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kurye güncellenemedi')
      throw err
    }
  }

  const deleteCourier = async (id: number) => {
    try {
      await handleResponse(await fetch(`${API_BASE}/couriers/${id}`, {
        method: 'DELETE',
      }))
      await fetchCouriers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kurye silinemedi')
      throw err
    }
  }

  // Table CRUD
  const addTable = async (table: TableCreate) => {
    try {
      await handleResponse(await fetch(`${API_BASE}/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(table),
      }))
      await fetchTables()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Masa eklenemedi')
      throw err
    }
  }

  const updateTable = async (id: number, table: TableCreate) => {
    try {
      await handleResponse(await fetch(`${API_BASE}/tables/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(table),
      }))
      await fetchTables()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Masa güncellenemedi')
      throw err
    }
  }

  const deleteTable = async (id: number) => {
    try {
      await handleResponse(await fetch(`${API_BASE}/tables/${id}`, {
        method: 'DELETE',
      }))
      await fetchTables()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Masa silinemedi')
      throw err
    }
  }

  return (
    <AppContext.Provider value={{
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
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
