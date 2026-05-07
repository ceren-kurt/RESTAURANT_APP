'use client'

import { useState, useEffect } from 'react'
import { AppProvider, useApp } from '@/lib/app-context'
import { LandingPage } from '@/components/landing-page'
import { LoginDialog } from '@/components/login-dialog'
import { AdminDashboard } from '@/components/admin-dashboard'
import { CustomerSelection } from '@/components/customer-selection'
import { CustomerAuth } from '@/components/customer-auth'
import { TableSelection } from '@/components/table-selection'
import { CustomerView } from '@/components/customer-view'
import { WaiterLogin } from '@/components/waiter-login'
import { WaiterPage } from '@/components/waiter-page'
import type { Table } from '@/lib/types'

type AppState =
  | 'landing'
  | 'admin'
  | 'waiter-login'
  | 'waiter'
  | 'customer-selection'
  | 'customer-auth'
  | 'table-selection'
  | 'customer-dinein'
  | 'customer-online'

function AppContent() {
  const [appState, setAppState] = useState<AppState>('landing')
  const [showLogin, setShowLogin] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const { refreshData } = useApp()

  // Check for existing admin/waiter session on mount
  useEffect(() => {
    const adminId = localStorage.getItem('admin_id')
    const employeeId = localStorage.getItem('employee_id')
    if (adminId) {
      setAppState('admin')
    } else if (employeeId) {
      setAppState('waiter')
    }
    setIsCheckingAuth(false)
  }, [])

  const handleSelectRole = (role: 'admin' | 'customer' | 'waiter') => {
    if (role === 'admin') {
      setShowLogin(true)
    } else if (role === 'waiter') {
      setAppState('waiter-login')
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

  const handleWaiterLogin = () => {
    setAppState('waiter')
  }

  const handleWaiterLogout = () => {
    localStorage.removeItem('employee_id')
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
    setAppState('customer-auth')
  }

  const handleCustomerAuthSuccess = () => {
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

  if (appState === 'waiter-login') {
    return <WaiterLogin onBack={handleBackToLanding} onSuccess={handleWaiterLogin} />
  }

  if (appState === 'waiter') {
    return <WaiterPage onBack={handleWaiterLogout} />
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

  if (appState === 'customer-auth') {
    return (
      <CustomerAuth
        onBack={handleBackToCustomerSelection}
        onSuccess={handleCustomerAuthSuccess}
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
