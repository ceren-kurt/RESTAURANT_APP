'use client'

import { useState } from 'react'
import { CategorySidebar } from './category-sidebar'
import { ProductGrid } from './product-grid'
import { CartSheet } from './cart-sheet'
import { CheckoutDialog } from './checkout-dialog'
import { OrderHeader } from './order-header'
import type { Category, Product, RestaurantTable } from '@/lib/order-types'

interface OrderPageClientProps {
  initialCategories: Category[]
  initialProducts: Product[]
  initialTables: RestaurantTable[]
}

export function OrderPageClient({
  initialCategories,
  initialProducts,
  initialTables,
}: OrderPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = initialProducts.filter(product => {
    const matchesCategory = selectedCategory === null || product.category_id === selectedCategory
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    return matchesCategory && matchesSearch
  })

  const selectedCategoryName = selectedCategory
    ? initialCategories.find(c => c.category_id === selectedCategory)?.name
    : 'Tum Urunler'

  return (
    <div className="min-h-screen bg-background">
      <OrderHeader
        onCartClick={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex">
        {/* Categories Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 border-r min-h-[calc(100vh-4rem)] sticky top-16">
          <CategorySidebar
            categories={initialCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {/* Mobile Categories */}
          <div className="lg:hidden mb-6">
            <CategorySidebar
              categories={initialCategories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              variant="horizontal"
            />
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">{selectedCategoryName}</h2>
            <p className="text-muted-foreground mt-1">
              {filteredProducts.length} urun bulundu
            </p>
          </div>

          <ProductGrid products={filteredProducts} />
        </main>
      </div>

      {/* Cart Sheet */}
      <CartSheet
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
        onCheckout={() => {
          setIsCartOpen(false)
          setIsCheckoutOpen(true)
        }}
      />

      {/* Checkout Dialog */}
      <CheckoutDialog
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        tables={initialTables}
      />
    </div>
  )
}
