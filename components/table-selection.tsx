'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Users, Loader2 } from 'lucide-react'
import type { Table } from '@/lib/types'

const API_BASE = 'http://localhost:8000/api/v1'

interface TableSelectionProps {
  onSelectTable: (table: Table) => void
  onBack: () => void
}

export function TableSelection({ onSelectTable, onBack }: TableSelectionProps) {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch(`${API_BASE}/admin/tables`)
        if (!response.ok) {
          throw new Error('Masalar yüklenemedi')
        }
        const data = await response.json()
        setTables(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }
    fetchTables()
  }, [])

  const availableTables = tables.filter(t => t.status === 'available')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'border-green-500/50 bg-green-500/10'
      case 'occupied':
        return 'border-red-500/50 bg-red-500/10 opacity-60'
      case 'reserved':
        return 'border-yellow-500/50 bg-yellow-500/10 opacity-60'
      default:
        return 'border-zinc-600 bg-zinc-800/50'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Müsait'
      case 'occupied':
        return 'Dolu'
      case 'reserved':
        return 'Rezerve'
      default:
        return status
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500 text-white'
      case 'occupied':
        return 'bg-red-500 text-white'
      case 'reserved':
        return 'bg-yellow-500 text-black'
      default:
        return 'bg-zinc-500 text-white'
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center p-6 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/cafe-bg.jpg)' }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
      >
        <ArrowLeft className="size-5" />
        <span className="font-medium">Geri</span>
      </button>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl pt-16">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            Masa Seçimi
          </h1>
          <p className="text-white/60 text-base md:text-lg">
            Oturmak istediğiniz masayı seçin
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="size-12 text-red-500 animate-spin mb-4" />
            <p className="text-white/60">Masalar yükleniyor...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="backdrop-blur-md bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-center">
            <p className="text-red-400 font-medium">{error}</p>
            <p className="text-white/60 text-sm mt-2">
              Backend sunucusunun çalıştığından emin olun
            </p>
          </div>
        )}

        {/* Tables Grid */}
        {!loading && !error && (
          <>
            {availableTables.length === 0 && tables.length > 0 && (
              <div className="backdrop-blur-md bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-6 text-center mb-6">
                <p className="text-yellow-400 font-medium">Şu anda müsait masa bulunmuyor</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
              {tables.map((table) => (
                <button
                  key={table.table_id}
                  onClick={() => table.status === 'available' && onSelectTable(table)}
                  disabled={table.status !== 'available'}
                  className={`
                    relative p-4 rounded-2xl backdrop-blur-md border-2 transition-all duration-200
                    ${getStatusColor(table.status)}
                    ${table.status === 'available' 
                      ? 'hover:scale-105 hover:border-green-400 cursor-pointer' 
                      : 'cursor-not-allowed'
                    }
                  `}
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Table Number */}
                    <div className="text-3xl font-bold text-white mb-2">
                      {table.table_number}
                    </div>
                    
                    {/* Capacity */}
                    <div className="flex items-center gap-1 text-white/70 text-sm mb-3">
                      <Users className="size-4" />
                      <span>{table.capacity} Kişilik</span>
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(table.status)}`}>
                      {getStatusText(table.status)}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {tables.length === 0 && (
              <div className="backdrop-blur-md bg-zinc-800/70 border border-zinc-700/50 rounded-xl p-8 text-center">
                <p className="text-white/60">Henüz masa tanımlanmamış</p>
              </div>
            )}
          </>
        )}
        
        {/* Footer Text */}
        <p className="mt-10 text-white/40 text-sm">
          Leblanc Cafe &copy; 2024
        </p>
      </div>
    </div>
  )
}
