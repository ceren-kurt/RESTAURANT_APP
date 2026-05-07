'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Field, FieldGroup } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogin: () => void
}

export function LoginDialog({ open, onOpenChange, onLogin }: LoginDialogProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      const { data, error: adminError } = await supabase
        .from('ADMIN_USER')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single()

      if (adminError) {
        console.error('Admin login query error:', {
          message: adminError.message,
          details: adminError.details,
          hint: adminError.hint,
          code: adminError.code,
          fullError: adminError,
        })
        throw new Error(
          `Giriş sorgusu başarısız: ${adminError.message}${adminError.code ? ` (code: ${adminError.code})` : ''}`
        )
      }

      if (adminError || !data) {
        throw new Error('Geçersiz kullanıcı adı veya şifre')
      }
      
      localStorage.setItem('admin_id', data.username)
      
      onLogin()
    } catch (err) {
      console.error('Admin login failed:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Geçersiz kullanıcı adı veya şifre')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
            <ShieldCheck className="size-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">Yönetici Girişi</DialogTitle>
          <DialogDescription>
            Yönetim paneline erişmek için giriş yapın
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="mt-4">
          <FieldGroup>
            <Field>
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input
                id="username"
                type="text"
                placeholder="Kullanıcı adınızı girin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Field>
            
            <Field>
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="Şifrenizi girin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
          </FieldGroup>
          
          {error && (
            <p className="text-destructive text-sm mt-2">{error}</p>
          )}
          
          <div className="flex flex-col gap-3 mt-6">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Spinner className="mr-2" />}
              Giriş Yap
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              İptal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
