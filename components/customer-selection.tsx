'use client'

import { ArrowLeft, Armchair, Bike } from 'lucide-react'

interface CustomerSelectionProps {
  onSelectDineIn: () => void
  onSelectOnline: () => void
  onBack: () => void
}

export function CustomerSelection({ onSelectDineIn, onSelectOnline, onBack }: CustomerSelectionProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/cafe-bg.jpg)' }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
      >
        <ArrowLeft className="size-5" />
        <span className="font-medium">Geri</span>
      </button>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 tracking-tight">
            Sipariş Türü
          </h1>
          <p className="text-white/60 text-base md:text-lg">
            Nasıl sipariş vermek istersiniz?
          </p>
        </div>
        
        {/* Glassmorphism Cards */}
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
          {/* Dine-In Card */}
          <div className="flex-1">
            <div className="relative p-6 rounded-2xl backdrop-blur-md bg-zinc-800/70 border border-zinc-700/50 shadow-2xl">
              <div className="flex flex-col items-center text-center">
                {/* Table Icon */}
                <div className="relative mb-4">
                  {/* Glow effect */}
                  <div className="absolute -inset-3 bg-gradient-to-t from-red-600 via-red-500 to-orange-400 rounded-full blur-lg opacity-50" />
                  <div className="relative bg-zinc-900/50 p-4 rounded-xl">
                    <Armchair className="size-14 text-red-500 drop-shadow-lg" />
                  </div>
                </div>
                
                {/* Title */}
                <h2 className="text-2xl font-bold text-white mb-2">
                  Restoranda Yemek
                </h2>
                
                {/* Description */}
                <p className="text-white/60 text-sm mb-5">
                  Masanızı seçin ve sipariş verin
                </p>
                
                {/* Skewed Red Button */}
                <button
                  onClick={onSelectDineIn}
                  className="w-full relative group"
                >
                  <div className="relative transform -skew-x-6 bg-red-600 border-2 border-black px-6 py-3 shadow-lg transition-all duration-200 hover:bg-red-500 hover:scale-105">
                    <span className="block transform skew-x-6 text-white font-bold text-lg italic tracking-wide">
                      Masa Seç
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Online Order Card */}
          <div className="flex-1">
            <div className="relative p-6 rounded-2xl backdrop-blur-md bg-zinc-800/70 border border-zinc-700/50 shadow-2xl">
              <div className="flex flex-col items-center text-center">
                {/* Motorcycle/Courier Icon */}
                <div className="relative mb-4">
                  {/* Glow effect */}
                  <div className="absolute -inset-3 bg-gradient-to-t from-yellow-600 via-yellow-400 to-orange-300 rounded-full blur-lg opacity-50" />
                  <div className="relative bg-zinc-900/50 p-4 rounded-xl">
                    <Bike className="size-14 text-yellow-400 drop-shadow-lg" />
                  </div>
                </div>
                
                {/* Title */}
                <h2 className="text-2xl font-bold text-white mb-2">
                  Online Sipariş
                </h2>
                
                {/* Description */}
                <p className="text-white/60 text-sm mb-5">
                  Eve veya iş yerinize teslim
                </p>
                
                {/* Skewed Yellow Button */}
                <button
                  onClick={onSelectOnline}
                  className="w-full relative group"
                >
                  <div className="relative transform -skew-x-6 bg-yellow-400 border-2 border-black px-6 py-3 shadow-lg transition-all duration-200 hover:bg-yellow-300 hover:scale-105">
                    <span className="block transform skew-x-6 text-black font-bold text-lg italic tracking-wide">
                      Menüye Git
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Text */}
        <p className="mt-10 text-white/40 text-sm">
          Leblanc Cafe &copy; 2024
        </p>
      </div>
    </div>
  )
}
