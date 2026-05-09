'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { 
  Category, Product, Employee, Courier, Table,
  CategoryCreate, ProductCreate, EmployeeCreate, CourierCreate, TableCreate 
} from './types'
import { supabase } from './supabase'

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

function throwSupabaseError(error: { message: string } | null, fallbackMessage: string) {
  if (error) {
    throw new Error(error.message || fallbackMessage)
  }
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
    const { data, error } = await supabase.from('category').select('*')
    throwSupabaseError(error, 'Categories could not be loaded')
    setCategories((data ?? []) as Category[])
  }

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('product').select('*')
    throwSupabaseError(error, 'Products could not be loaded')
    setProducts((data ?? []) as Product[])
  }

  const fetchEmployees = async () => {
    const { data, error } = await supabase.from('employee').select('*')
    throwSupabaseError(error, 'Employees could not be loaded')
    setEmployees((data ?? []) as Employee[])
  }

  const fetchCouriers = async () => {
    const { data, error } = await supabase.from('courier').select('*')
    throwSupabaseError(error, 'Couriers could not be loaded')
    setCouriers((data ?? []) as Courier[])
  }

  const fetchTables = async () => {
    const { data, error } = await supabase.from('tables').select('*')
    throwSupabaseError(error, 'Tables could not be loaded')
    setTables((data ?? []) as Table[])
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
      setError(err instanceof Error ? err.message : 'An error occurred while loading data')
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
      const { error } = await supabase.from('category').insert(category)
      throwSupabaseError(error, 'Category could not be added')
      await fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Category could not be added')
      throw err
    }
  }

  const updateCategory = async (id: number, category: CategoryCreate) => {
    try {
      const { error } = await supabase
        .from('category')
        .update(category)
        .eq('category_id', id)
      throwSupabaseError(error, 'Category could not be updated')
      await fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Category could not be updated')
      throw err
    }
  }

  const deleteCategory = async (id: number) => {
    try {
      const { error } = await supabase.from('category').delete().eq('category_id', id)
      throwSupabaseError(error, 'Category could not be deleted')
      await fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Category could not be deleted')
      throw err
    }
  }

  // Product CRUD
  const addProduct = async (product: ProductCreate) => {
    try {
      const { error } = await supabase.from('product').insert(product)
      throwSupabaseError(error, 'Product could not be added')
      await fetchProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Product could not be added')
      throw err
    }
  }

  const updateProduct = async (id: number, product: ProductCreate) => {
    try {
      const { error } = await supabase
        .from('product')
        .update(product)
        .eq('product_id', id)
      throwSupabaseError(error, 'Product could not be updated')
      await fetchProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Product could not be updated')
      throw err
    }
  }

  const deleteProduct = async (id: number) => {
    try {
      const { error } = await supabase.from('product').delete().eq('product_id', id)
      throwSupabaseError(error, 'Product could not be deleted')
      await fetchProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Product could not be deleted')
      throw err
    }
  }

  // Employee CRUD
  const addEmployee = async (employee: EmployeeCreate) => {
    try {
      const { error } = await supabase.from('employee').insert(employee)
      throwSupabaseError(error, 'Employee could not be added')
      await fetchEmployees()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Employee could not be added')
      throw err
    }
  }

  const updateEmployee = async (id: number, employee: EmployeeCreate) => {
    try {
      const { error } = await supabase
        .from('employee')
        .update(employee)
        .eq('employee_id', id)
      throwSupabaseError(error, 'Employee could not be updated')
      await fetchEmployees()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Employee could not be updated')
      throw err
    }
  }

  const deleteEmployee = async (id: number) => {
    try {
      const { error } = await supabase.from('employee').delete().eq('employee_id', id)
      throwSupabaseError(error, 'Employee could not be deleted')
      await fetchEmployees()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Employee could not be deleted')
      throw err
    }
  }

  // Courier CRUD
  const addCourier = async (courier: CourierCreate) => {
    try {
      const { error } = await supabase.from('courier').insert(courier)
      throwSupabaseError(error, 'Courier could not be added')
      await fetchCouriers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Courier could not be added')
      throw err
    }
  }

  const updateCourier = async (id: number, courier: CourierCreate) => {
    try {
      const { error } = await supabase
        .from('courier')
        .update(courier)
        .eq('courier_id', id)
      throwSupabaseError(error, 'Courier could not be updated')
      await fetchCouriers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Courier could not be updated')
      throw err
    }
  }

  const deleteCourier = async (id: number) => {
    try {
      const { error } = await supabase.from('courier').delete().eq('courier_id', id)
      throwSupabaseError(error, 'Courier could not be deleted')
      await fetchCouriers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Courier could not be deleted')
      throw err
    }
  }

  // Table CRUD
  const addTable = async (table: TableCreate) => {
    try {
      const { error } = await supabase.from('tables').insert(table)
      throwSupabaseError(error, 'Table could not be added')
      await fetchTables()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Table could not be added')
      throw err
    }
  }

  const updateTable = async (id: number, table: TableCreate) => {
    try {
      const { error } = await supabase
        .from('tables')
        .update(table)
        .eq('table_id', id)
      throwSupabaseError(error, 'Table could not be updated')
      await fetchTables()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Table could not be updated')
      throw err
    }
  }

  const deleteTable = async (id: number) => {
    try {
      const { error } = await supabase.from('tables').delete().eq('table_id', id)
      throwSupabaseError(error, 'Table could not be deleted')
      await fetchTables()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Table could not be deleted')
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
