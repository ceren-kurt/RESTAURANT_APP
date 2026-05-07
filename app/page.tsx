'use client'

import { useState, useEffect } from 'react'
import { AppProvider, useApp } from '@/lib/app-context'
import { LandingPage } from '@/components/landing-page'
import { LoginDialog } from '@/components/login-dialog'
import { AdminDashboard } from '@/components/admin-dashboard'
import { CustomerSelection } from '@/components/customer-selection'
import { TableSelection } from '@/components/table-selection'
import { CustomerView } from '@/components/customer-view'
import type { Table } from '@/lib/types'

type AppState = 'landing' | 'admin' | 'customer-selection' | 'table-selection' | 'customer-dinein' | 'customer-online'

function AppContent() {
  const [appState, setAppState] = useState<AppState>('landing')
  const [showLogin, setShowLogin] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const { refreshData } = useApp()

  // Check for existing admin session on mount
  useEffect(() => {
    const adminId = localStorage.getItem('admin_id')
    if (adminId) {
      setAppState('admin')
    }
    setIsCheckingAuth(false)
  }, [])

  const handleSelectRole = (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      setShowLogin(true)
    } else {
      setAppState('customer-selection')
    }
  }

  const handleLogin = () => {
    setShowLogin(false)
    setAppState('admin')
    refreshData()
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_id')
    setAppState('landing')
  }

  const handleBackToLanding = () => {
    setAppState('landing')
    setSelectedTable(null)
  }

  const handleBackToCustomerSelection = () => {
    setAppState('customer-selection')
    setSelectedTable(null)
  }

  const handleSelectDineIn = () => {
    setAppState('table-selection')
  }

  const handleSelectOnline = () => {
    setAppState('customer-online')
  }

  const handleSelectTable = (table: Table) => {
    setSelectedTable(table)
    setAppState('customer-dinein')
  }

  // Show nothing while checking auth
  if (isCheckingAuth) {
    return null
  }

  if (appState === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />
  }

  if (appState === 'customer-selection') {
    return (
      <CustomerSelection
        onSelectDineIn={handleSelectDineIn}
        onSelectOnline={handleSelectOnline}
        onBack={handleBackToLanding}
      />
    )
  }

  if (appState === 'table-selection') {
    return (
      <TableSelection
        onSelectTable={handleSelectTable}
        onBack={handleBackToCustomerSelection}
      />
    )
  }

  if (appState === 'customer-dinein') {
    return (
      <CustomerView 
        onBack={handleBackToCustomerSelection} 
        selectedTable={selectedTable}
        orderType="dine-in"
      />
    )
  }

  if (appState === 'customer-online') {
    return (
      <CustomerView 
        onBack={handleBackToCustomerSelection}
        orderType="online"
      />
    )
  }

  return (
    <>
      <LandingPage onSelectRole={handleSelectRole} />
      <LoginDialog 
        open={showLogin} 
        onOpenChange={setShowLogin}
        onLogin={handleLogin}
      />
    </>
  )
}

export default function Page() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
