'use client';

import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { TrendingUp, Calendar, Dumbbell, ChevronRight } from 'lucide-react';

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-[#0e1416] text-[#dde4e6]">
      <Header />

      <main className="mt-16 px-5 pb-32 max-w-md mx-auto">
        <section className="py-6">
          <h2 className="text-2xl font-bold text-[#e5e2e1] font-['Lexend']">Progreso</h2>
          <p className="text-[#e2bfb0]">Visualiza tu evolución y récords personales.</p>
        </section>

        <section className="grid grid-cols-1 gap-4 mb-10">
          <div className="bg-[#1a2123] rounded-xl p-6 border-l-4 border-[#ff6b00]">
            <div className="flex justify-between items-end mb-3">
              <div>
                <span className="text-sm font-bold text-[#ff6b00] uppercase tracking-wider font-['Lexend']">Sentadilla</span>
                <div className="text-4xl font-semibold text-[#dde4e6] mt-1 font-['Lexend']">145<span className="text-xl ml-1 text-[#e2bfb0]">kg</span></div>
              </div>
              <div className="text-right">
                <span className="text-[#ff6b00] font-bold text-sm flex items-center justify-end">
                  <TrendingUp size={16} className="mr-1" />+12%
                </span>
                <p className="text-xs text-[#e2bfb0]">vs mes pasado</p>
              </div>
            </div>
            <div className="h-32 w-full relative overflow-hidden mt-4">
              <svg className="w-full h-full" viewBox="0 0 400 100">
                <path style={{ filter: 'drop-shadow(0 0 8px rgba(255, 107, 0, 0.5))' }} d="M0,80 Q50,75 100,60 T200,65 T300,30 T400,20" fill="none" stroke="#FF6B00" strokeWidth="3"></path>
                <path d="M0,80 Q50,75 100,60 T200,65 T300,30 T400,20 L400,100 L0,100 Z" fill="url(#grad1)" opacity="0.3"></path>
                <defs>
                  <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#FF6B00', stopOpacity: 1 }}></stop>
                    <stop offset="100%" style={{ stopColor: '#FF6B00', stopOpacity: 0 }}></stop>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <div className="bg-[#1a2123] rounded-xl p-6 border-l-4 border-[#ff6b00] opacity-90">
            <div className="flex justify-between items-end mb-3">
              <div>
                <span className="text-sm font-bold text-[#ff6b00]/80 uppercase tracking-wider font-['Lexend']">Peso Muerto</span>
                <div className="text-4xl font-semibold text-[#dde4e6] mt-1 font-['Lexend']">180<span className="text-xl ml-1 text-[#e2bfb0]">kg</span></div>
              </div>
              <div className="text-right">
                <span className="text-[#ff6b00]/80 font-bold text-sm flex items-center justify-end">
                  <TrendingUp size={16} className="mr-1" />+8%
                </span>
                <p className="text-xs text-[#e2bfb0]">vs mes pasado</p>
              </div>
            </div>
            <div className="h-32 w-full relative overflow-hidden mt-4">
              <svg className="w-full h-full" viewBox="0 0 400 100">
                <path d="M0,90 Q50,85 100,70 T200,55 T300,45 T400,35" fill="none" opacity="0.6" stroke="#FF6B00" strokeWidth="3"></path>
                <path d="M0,90 Q50,85 100,70 T200,55 T300,45 T400,35 L400,100 L0,100 Z" fill="url(#grad2)" opacity="0.2"></path>
                <defs>
                  <linearGradient id="grad2" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#FF6B00', stopOpacity: 1 }}></stop>
                    <stop offset="100%" style={{ stopColor: '#FF6B00', stopOpacity: 0 }}></stop>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </section>

        <section className="mb-6 overflow-x-auto">
          <div className="flex gap-3 pb-2">
            <button className="bg-[#ff6b00] text-[#351000] px-6 py-2 rounded-full font-bold active:scale-95 transition-transform font-['Lexend']">Todos</button>
            <button className="bg-[#1a2123] border border-[#5a4136] text-[#dde4e6] px-6 py-2 rounded-full font-bold active:scale-95 transition-transform font-['Lexend']">Pierna</button>
            <button className="bg-[#1a2123] border border-[#5a4136] text-[#dde4e6] px-6 py-2 rounded-full font-bold active:scale-95 transition-transform font-['Lexend']">Empuje</button>
            <button className="bg-[#1a2123] border border-[#5a4136] text-[#dde4e6] px-6 py-2 rounded-full font-bold active:scale-95 transition-transform font-['Lexend']">Tracción</button>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-xl font-bold text-[#dde4e6] mb-2 font-['Lexend']">Entrenamientos Recientes</h3>

          <div className="bg-[#1a2123] rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
            <div className="w-14 h-14 bg-[#242b2d] rounded-lg flex items-center justify-center text-[#ff6b00]">
              <Dumbbell size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg text-[#dde4e6] font-['Lexend']">Pierna Pesada (A)</h4>
              <div className="flex items-center gap-3 text-[#e2bfb0] text-sm">
                <span className="flex items-center"><Calendar size={14} className="mr-1" />Hoy, 08:30</span>
                <span className="flex items-center"><span className="mr-1">⏱</span>75 min</span>
              </div>
            </div>
            <ChevronRight className="text-[#e2bfb0]" size={24} />
          </div>

          <div className="bg-[#1a2123] rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
            <div className="w-14 h-14 bg-[#242b2d] rounded-lg flex items-center justify-center text-[#e2bfb0]">
              <Dumbbell size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg text-[#dde4e6] font-['Lexend']">Empuje Hipertrofia</h4>
              <div className="flex items-center gap-3 text-[#e2bfb0] text-sm">
                <span className="flex items-center"><Calendar size={14} className="mr-1" />24 Oct</span>
                <span className="flex items-center"><span className="mr-1">⏱</span>62 min</span>
              </div>
            </div>
            <ChevronRight className="text-[#e2bfb0]" size={24} />
          </div>

          <div className="bg-[#1a2123] rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
            <div className="w-14 h-14 bg-[#242b2d] rounded-lg flex items-center justify-center text-[#e2bfb0]">
              <Dumbbell size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg text-[#dde4e6] font-['Lexend']">Tracción & Peso Muerto</h4>
              <div className="flex items-center gap-3 text-[#e2bfb0] text-sm">
                <span className="flex items-center"><Calendar size={14} className="mr-1" />22 Oct</span>
                <span className="flex items-center"><span className="mr-1">⏱</span>90 min</span>
              </div>
            </div>
            <ChevronRight className="text-[#e2bfb0]" size={24} />
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}