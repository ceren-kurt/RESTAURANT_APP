'use client'

import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/cart-context'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty'

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCheckout: () => void
}

export function CartSheet({ open, onOpenChange, onCheckout }: CartSheetProps) {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart()
  const totalPrice = getTotalPrice()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="size-5" />
            Sepetiniz
          </SheetTitle>
          <SheetDescription>
            {items.length === 0
              ? 'Sepetiniz bos'
              : `${items.length} cesit, ${items.reduce((sum, item) => sum + item.quantity, 0)} urun`}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShoppingBag />
                </EmptyMedia>
                <EmptyTitle>Sepetiniz bos</EmptyTitle>
                <EmptyDescription>
                  Menumuze goz atin ve lezzetli urunlerimizi kesfetsin
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-4 px-4">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div
                    key={item.product.product_id}
                    className="flex gap-4 p-3 rounded-lg bg-secondary/30"
                  >
                    <div className="size-16 rounded-md bg-muted flex items-center justify-center shrink-0">
                      {item.product.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="object-cover size-full rounded-md"
                        />
                      ) : (
                        <ShoppingBag className="size-6 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.product.price.toFixed(2)} TL
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => updateQuantity(item.product.product_id, item.quantity - 1)}
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => updateQuantity(item.product.product_id, item.quantity + 1)}
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary">
                            {(item.product.price * item.quantity).toFixed(2)} TL
                          </span>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem(item.product.product_id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={clearCart}>
                  <Trash2 className="size-4 mr-2" />
                  Sepeti Temizle
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ara Toplam</span>
                  <span>{totalPrice.toFixed(2)} TL</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Toplam</span>
                  <span className="text-primary">{totalPrice.toFixed(2)} TL</span>
                </div>
              </div>
            </div>
          </>
        )}

        <SheetFooter>
          <Button
            className="w-full"
            size="lg"
            disabled={items.length === 0}
            onClick={onCheckout}
          >
            Siparisi Tamamla
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
