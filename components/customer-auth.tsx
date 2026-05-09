'use client'

import { useState } from 'react'
import { ArrowLeft, UserRound } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

interface CustomerAuthProps {
  onBack: () => void
  onSuccess: () => void
}

export function CustomerAuth({ onBack, onSuccess }: CustomerAuthProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPhone, setLoginPhone] = useState('')
  const [registerFirstName, setRegisterFirstName] = useState('')
  const [registerLastName, setRegisterLastName] = useState('')
  const [registerPhone, setRegisterPhone] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { data, error: queryError } = await supabase
        .from('customer')
        .select('customer_id')
        .eq('email', loginEmail)
        .eq('phone', loginPhone)
        .maybeSingle()

      if (queryError) {
        throw new Error(queryError.message || 'An error occurred during login')
      }

      if (!data?.customer_id) {
        throw new Error('Email or phone does not match')
      }

      localStorage.setItem('customer_id', data.customer_id.toString())
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const [phoneCheck, emailCheck] = await Promise.all([
        supabase
          .from('customer')
          .select('customer_id')
          .eq('phone', registerPhone)
          .limit(1),
        supabase
          .from('customer')
          .select('customer_id')
          .eq('email', registerEmail)
          .limit(1),
      ])

      if (phoneCheck.error) {
        throw new Error(phoneCheck.error.message || 'An error occurred during registration')
      }

      if (emailCheck.error) {
        throw new Error(emailCheck.error.message || 'An error occurred during registration')
      }

      const existingCustomerId =
        phoneCheck.data?.[0]?.customer_id ?? emailCheck.data?.[0]?.customer_id ?? null

      if (existingCustomerId) {
        setError('An account with this email or phone already exists. Please sign in.')
        setActiveTab('login')
        setLoginEmail(registerEmail)
        setLoginPhone(registerPhone)
        return
      }

      const { data, error: insertError } = await supabase
        .from('customer')
        .insert({
          first_name: registerFirstName,
          last_name: registerLastName,
          phone: registerPhone,
          email: registerEmail,
        })
        .select('customer_id')
        .single()

      if (insertError) {
        throw new Error(insertError.message || 'An error occurred during registration')
      }

      if (!data?.customer_id) {
        throw new Error('Customer record could not be created')
      }

      localStorage.setItem('customer_id', data.customer_id.toString())
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/cafe-bg.jpg)' }}
      />
      <div className="absolute inset-0 bg-black/60" />

      <button
        onClick={onBack}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
      >
        <ArrowLeft className="size-5" />
        <span className="font-medium">Back</span>
      </button>

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-700/50 bg-zinc-900/80 p-6 backdrop-blur-md shadow-2xl">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/20">
            <UserRound className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">Customer Login</h1>
          <p className="mt-1 text-sm text-white/60">Sign in or register for online ordering</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')} className="gap-4">
          <TabsList className="w-full">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-white">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="example@mail.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-phone" className="text-white">Phone</Label>
                <Input
                  id="login-phone"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="05xx xxx xx xx"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Spinner className="mr-2" />}
                Sign In
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="register-first-name" className="text-white">First Name</Label>
                  <Input
                    id="register-first-name"
                    value={registerFirstName}
                    onChange={(e) => setRegisterFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-last-name" className="text-white">Last Name</Label>
                  <Input
                    id="register-last-name"
                    value={registerLastName}
                    onChange={(e) => setRegisterLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-phone" className="text-white">Phone</Label>
                <Input
                  id="register-phone"
                  value={registerPhone}
                  onChange={(e) => setRegisterPhone(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-white">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Spinner className="mr-2" />}
                Register
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  )
}
