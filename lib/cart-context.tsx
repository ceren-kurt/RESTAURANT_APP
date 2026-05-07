'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { CartItem, Product } from './order-types'

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback((product: Product) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.product_id === product.product_id)
      if (existing) {
        return prev.map(item =>
          item.product.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((productId: number) => {
    setItems(prev => prev.filter(item => item.product.product_id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(item => item.product.product_id !== productId))
      return
    }
    setItems(prev =>
      prev.map(item =>
        item.product.product_id === productId
          ? { ...item, quantity }
          : item
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const getTotalItems = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }, [items])

  const getTotalPrice = useCallback(() => {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }, [items])

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
