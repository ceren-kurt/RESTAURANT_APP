'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { LayoutGrid } from 'lucide-react'
import type { Category } from '@/lib/order-types'

interface CategorySidebarProps {
  categories: Category[]
  selectedCategory: number | null
  onSelectCategory: (categoryId: number | null) => void
  variant?: 'vertical' | 'horizontal'
}

export function CategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  variant = 'vertical',
}: CategorySidebarProps) {
  if (variant === 'horizontal') {
    return (
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-3">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelectCategory(null)}
            className="shrink-0"
          >
            <LayoutGrid className="size-4 mr-2" />
            Tumu
          </Button>
          {categories.map((category) => (
            <Button
              key={category.category_id}
              variant={selectedCategory === category.category_id ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSelectCategory(category.category_id)}
              className="shrink-0"
            >
              {category.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    )
  }

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">
          Kategoriler
        </h3>
        
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors',
            selectedCategory === null
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-secondary text-foreground'
          )}
        >
          <LayoutGrid className="size-5 shrink-0" />
          <div>
            <span className="font-medium">Tum Urunler</span>
          </div>
        </button>

        {categories.map((category) => (
          <button
            key={category.category_id}
            onClick={() => onSelectCategory(category.category_id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors',
              selectedCategory === category.category_id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-secondary text-foreground'
            )}
          >
            <div className="size-5 rounded bg-muted flex items-center justify-center text-xs font-bold shrink-0">
              {category.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <span className="font-medium block truncate">{category.name}</span>
              {category.description && (
                <span className={cn(
                  'text-xs truncate block',
                  selectedCategory === category.category_id
                    ? 'text-primary-foreground/70'
                    : 'text-muted-foreground'
                )}>
                  {category.description}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  )
}
