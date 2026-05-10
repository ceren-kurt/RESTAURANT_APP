'use client'

import { useState, useEffect } from 'react'
import { AppProvider, useApp } from '@/lib/app-context'
import { LandingPage } from '@/components/landing-page'
import { LoginDialog } from '@/components/login-dialog'
import { AdminDashboard } from '@/components/admin-dashboard'
import { CustomerAuth } from '@/components/customer-auth'
import { CustomerView } from '@/components/customer-view'
import { WaiterLogin } from '@/components/waiter-login'
import { WaiterPage } from '@/components/waiter-page'

type AppState =
  | 'landing'
  | 'admin'
  | 'waiter-login'
  | 'waiter'
  | 'customer-auth'
  | 'customer-online'

function AppContent() {
  const [appState, setAppState] = useState<AppState>('landing')
  const [showLogin, setShowLogin] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
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
      setAppState('customer-auth')
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
  }

  const handleBackToCustomerAuth = () => {
    setAppState('customer-auth')
  }

  const handleCustomerAuthSuccess = () => {
    setAppState('customer-online')
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

  if (appState === 'customer-auth') {
    return <CustomerAuth onBack={handleBackToLanding} onSuccess={handleCustomerAuthSuccess} />
  }

  if (appState === 'customer-online') {
    return <CustomerView onBack={handleBackToCustomerAuth} />
  }

  return (
    <>
      <LandingPage onSelectRole={handleSelectRole} />
      <LoginDialog open={showLogin} onOpenChange={setShowLogin} onLogin={handleLogin} />
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
