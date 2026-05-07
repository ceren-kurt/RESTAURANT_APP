'use client'

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
import { LayoutGrid, Package, Users, Truck, TableIcon, LogOut, UtensilsCrossed } from 'lucide-react'
import { EntityType } from '@/lib/types'
import { Button } from '@/components/ui/button'

interface AdminSidebarProps {
  activeSection: EntityType
  onSectionChange: (section: EntityType) => void
  onLogout: () => void
}

const menuItems: { id: EntityType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'categories', label: 'Kategoriler', icon: LayoutGrid },
  { id: 'products', label: 'Ürünler', icon: Package },
  { id: 'employees', label: 'Çalışanlar', icon: Users },
  { id: 'couriers', label: 'Kuryeler', icon: Truck },
  { id: 'tables', label: 'Masalar', icon: TableIcon },
]

export function AdminSidebar({ activeSection, onSectionChange, onLogout }: AdminSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <UtensilsCrossed className="size-4" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-sm">Restoran</span>
            <span className="text-xs text-muted-foreground">Yönetim Paneli</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Yönetim</SidebarGroupLabel>
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
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onLogout} tooltip="Çıkış Yap">
              <LogOut className="size-4" />
              <span>Çıkış Yap</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
