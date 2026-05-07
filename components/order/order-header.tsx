'use client'

import { Search, ShoppingCart, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/lib/cart-context'

interface OrderHeaderProps {
  onCartClick: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function OrderHeader({ onCartClick, searchQuery, onSearchChange }: OrderHeaderProps) {
  const { getTotalItems, getTotalPrice } = useCart()
  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-lg bg-primary text-primary-foreground">
            <UtensilsCrossed className="size-5" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg text-foreground">Restoran</h1>
            <p className="text-xs text-muted-foreground">Online Siparis</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Urun ara..."
              className="pl-10 bg-secondary/50 border-0"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Cart Button */}
        <Button
          variant="outline"
          className="relative gap-2"
          onClick={onCartClick}
        >
          <ShoppingCart className="size-4" />
          <span className="hidden sm:inline">Sepet</span>
          {totalItems > 0 && (
            <>
              <span className="hidden sm:inline text-primary font-semibold">
                {totalPrice.toFixed(2)} TL
              </span>
              <Badge className="absolute -top-2 -right-2 size-5 p-0 flex items-center justify-center text-xs">
                {totalItems}
              </Badge>
            </>
          )}
        </Button>
      </div>
    </header>
  )
}
