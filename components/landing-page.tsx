'use client'

import { Crown, ConciergeBell, BookOpen, UserCheck } from 'lucide-react'

interface LandingPageProps {
  onSelectRole: (role: 'admin' | 'customer' | 'waiter') => void
}

export function LandingPage({ onSelectRole }: LandingPageProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/cafe-bg.jpg)' }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 tracking-tight">
            Restoran Yönetim Sistemi
          </h1>
          <p className="text-white/60 text-base md:text-lg">
            Giriş şeklinizi seçin
          </p>
        </div>
        
        {/* Glassmorphism Cards */}
        <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          {/* Admin Card */}
          <div className="flex-1">
            <div className="relative p-6 rounded-2xl backdrop-blur-md bg-zinc-800/70 border border-zinc-700/50 shadow-2xl">
              <div className="flex flex-col items-center text-center">
                {/* Chess King Icon with Flames */}
                <div className="relative mb-4">
                  {/* Flame effect behind */}
                  <div className="absolute -inset-2 bg-gradient-to-t from-orange-600 via-red-500 to-yellow-500 rounded-full blur-md opacity-60" />
                  <div className="relative flex items-end justify-center">
                    {/* Left small piece */}
                    <Crown className="size-8 text-red-600 -mr-1 mb-1 drop-shadow-lg" />
                    {/* Center king */}
                    <Crown className="size-14 text-red-600 drop-shadow-lg z-10" />
                    {/* Right small piece */}
                    <Crown className="size-8 text-orange-500 -ml-1 mb-1 drop-shadow-lg" />
                  </div>
                </div>
                
                {/* Title */}
                <h2 className="text-2xl font-bold text-white mb-2">
                  Yönetici
                </h2>
                
                {/* Description */}
                <p className="text-white/60 text-sm mb-5">
                  Restoran yönetim paneline erişim
                </p>
                
                {/* Skewed Red Button */}
                <button
                  onClick={() => onSelectRole('admin')}
                  className="w-full relative group"
                >
                  <div className="relative transform -skew-x-6 bg-red-600 border-2 border-black px-6 py-3 shadow-lg transition-all duration-200 hover:bg-red-500 hover:scale-105">
                    <span className="block transform skew-x-6 text-white font-bold text-lg italic tracking-wide">
                      Giriş Yap
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Customer Card */}
          <div className="flex-1">
            <div className="relative p-6 rounded-2xl backdrop-blur-md bg-zinc-800/70 border border-zinc-700/50 shadow-2xl">
              <div className="flex flex-col items-center text-center">
                {/* Food Service & Menu Icons */}
                <div className="relative mb-4 flex items-center justify-center">
                  {/* Service Bell */}
                  <div className="relative">
                    <ConciergeBell className="size-12 text-red-500 drop-shadow-lg" />
                  </div>
                  {/* Menu Book */}
                  <div className="relative -ml-2 mt-2">
                    <div className="bg-yellow-400 rounded px-1.5 py-0.5 transform rotate-12 border border-yellow-600">
                      <span className="text-[10px] font-bold text-black">MENU</span>
                    </div>
                    <BookOpen className="size-8 text-yellow-400 -mt-1 drop-shadow-lg" />
                  </div>
                </div>
                
                {/* Title */}
                <h2 className="text-2xl font-bold text-white mb-2">
                  Müşteri
                </h2>
                
                {/* Description */}
                <p className="text-white/60 text-sm mb-5">
                  Menüyü görüntüle ve sipariş ver
                </p>
                
                {/* Skewed Yellow Button */}
                <button
                  onClick={() => onSelectRole('customer')}
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

          {/* Waiter Card */}
          <div className="flex-1">
            <div className="relative p-6 rounded-2xl backdrop-blur-md bg-zinc-800/70 border border-zinc-700/50 shadow-2xl">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="absolute -inset-2 bg-gradient-to-t from-blue-600 via-cyan-500 to-sky-400 rounded-full blur-md opacity-60" />
                  <UserCheck className="relative size-14 text-cyan-300 drop-shadow-lg" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Garson</h2>

                <p className="text-white/60 text-sm mb-5">Masa siparişlerini yönet</p>

                <button onClick={() => onSelectRole('waiter')} className="w-full relative group">
                  <div className="relative transform -skew-x-6 bg-cyan-400 border-2 border-black px-6 py-3 shadow-lg transition-all duration-200 hover:bg-cyan-300 hover:scale-105">
                    <span className="block transform skew-x-6 text-black font-bold text-lg italic tracking-wide">Giriş Yap</span>
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
