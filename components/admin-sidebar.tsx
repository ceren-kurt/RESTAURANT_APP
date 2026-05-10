'use client'

import { useEffect, useState } from 'react'
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from '@/components/ui/sidebar'
import { LayoutGrid, Package, Users, Truck, TableIcon, LogOut, UtensilsCrossed, ClipboardList } from 'lucide-react'
import { EntityType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Spinner } from '@/components/ui/spinner'

interface AdminSidebarProps {
  activeSection: EntityType
  onSectionChange: (section: EntityType) => void
  onLogout: () => void
}

const menuItems: { id: EntityType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'categories', label: 'Kategoriler', icon: LayoutGrid },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'couriers', label: 'Kuryeler', icon: Truck },
  { id: 'tables', label: 'Masalar', icon: TableIcon },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
]

export function AdminSidebar({ activeSection, onSectionChange, onLogout }: AdminSidebarProps) {
  const [dailyRevenue, setDailyRevenue] = useState(0)
  const [isRevenueLoading, setIsRevenueLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchDailyRevenue = async () => {
      try {
        if (isMounted) {
          setIsRevenueLoading(true)
        }

        const now = new Date()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

        // Sum only completed orders: status must be 'delivered' (pending, preparing, ready are excluded)
        const { data, error } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('status', 'delivered')
          .gte('order_date', startOfDay.toISOString())
          .lt('order_date', endOfDay.toISOString())

        if (error) {
          console.error('Daily revenue query error:', error)
          return
        }

        const total = (data ?? []).reduce((sum, row) => sum + Number(row.total_amount || 0), 0)
        if (isMounted) {
          setDailyRevenue(total)
        }
      } finally {
        if (isMounted) {
          setIsRevenueLoading(false)
        }
      }
    }

    fetchDailyRevenue()
    const intervalId = setInterval(fetchDailyRevenue, 5 * 60 * 1000)

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [])

  const formattedRevenue = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(dailyRevenue)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <UtensilsCrossed className="size-4" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-sm">Restoran</span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    isActive={activeSection === item.id}
                    onClick={() => onSectionChange(item.id)}
                    tooltip={item.label}
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mx-2 mt-2 rounded-xl border border-sidebar-border/80 bg-sidebar-accent/40 p-3 group-data-[collapsible=icon]:hidden">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Daily Total Revenue</p>
          {isRevenueLoading ? (
            <div className="mt-2 flex items-center gap-2">
              <Spinner className="size-4" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <p className="mt-2 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              Daily Revenue: {formattedRevenue}
            </p>
          )}
        </div>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onLogout} tooltip="Sign Out">
              <LogOut className="size-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
