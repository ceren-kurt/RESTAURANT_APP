'use client'

import { useState } from 'react'
import { ArrowLeft, UserCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

interface WaiterLoginProps {
  onBack: () => void
  onSuccess: () => void
}

export function WaiterLogin({ onBack, onSuccess }: WaiterLoginProps) {
  const [employeeId, setEmployeeId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const parsedEmployeeId = Number(employeeId)
      if (!Number.isFinite(parsedEmployeeId)) {
        throw new Error('Geçerli bir employee_id girin')
      }

      const { data, error: queryError } = await supabase
        .from('employee')
        .select('employee_id')
        .eq('employee_id', parsedEmployeeId)
        .maybeSingle()

      if (queryError) {
        throw new Error(queryError.message || 'Giriş sırasında bir hata oluştu')
      }

      if (!data?.employee_id) {
        throw new Error('Garson bulunamadı')
      }

      localStorage.setItem('employee_id', data.employee_id.toString())
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş başarısız')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/images/cafe-bg.jpg)' }} />
      <div className="absolute inset-0 bg-black/60" />

      <button onClick={onBack} className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/70 hover:text-white transition-colors">
        <ArrowLeft className="size-5" />
        <span className="font-medium">Geri</span>
      </button>

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-700/50 bg-zinc-900/80 p-6 backdrop-blur-md shadow-2xl">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/20">
            <UserCheck className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">Garson Girişi</h1>
          <p className="mt-1 text-sm text-white/60">employee_id ile giriş yapın</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee_id" className="text-white">Employee ID</Label>
            <Input
              id="employee_id"
              type="number"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="Örn: 12"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Spinner className="mr-2" />}
            Giriş Yap
          </Button>
        </form>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  )
}
