'use client';

import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { Dumbbell, Calendar, TrendingUp, Timer, Zap, Star, Play } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const today = new Date();
  const currentMonth = today.toLocaleDateString('es-ES', { month: 'long' }).charAt(0).toUpperCase() + today.toLocaleDateString('es-ES', { month: 'long' }).slice(1);
  const weekNumber = Math.ceil((today.getDate() - today.getDay() + 1) / 7);
  const currentDay = today.getDate();

  const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
  const dates = [14, 15, 16, 17, 18, 19, 20];
  const activeDays = [0, 2, 3];

  const handleStartWorkout = () => {
    router.push('/entrenar/1');
  };

  return (
    <div className="min-h-screen bg-[#0e1416] text-[#dde4e6]">
      <Header />

      <main className="pt-20 pb-32 px-5 max-w-md mx-auto">
        <section className="mb-10">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-2xl font-bold text-[#dde4e6]">{currentMonth}</h2>
            <p className="text-sm font-bold text-[#e2bfb0]">Semana {weekNumber}</p>
          </div>
          <div className="flex justify-between bg-[#1a2123] p-4 rounded-xl border border-white/5">
            {days.map((day, index) => (
              <div key={day} className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase mb-2">{day}</span>
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold ${
                    dates[index] === currentDay
                      ? 'bg-[#ff6b00] text-[#572000] shadow-[0_0_15px_rgba(255,107,0,0.3)]'
                      : dates[index] === 16
                      ? 'bg-[#ff6b00] text-[#572000] shadow-[0_0_15px_rgba(255,107,0,0.3)]'
                      : 'bg-white/5 text-[#dde4e6]'
                  }`}
                >
                  {dates[index]}
                </div>
                {activeDays.includes(index) && <div className="w-1 h-1 rounded-full bg-[#ff6b00] mt-1"></div>}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <div className="relative overflow-hidden rounded-2xl bg-[#1a2123] border-l-4 border-[#ff6b00]">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Dumbbell size={80} className="text-[#ff6b00]" />
            </div>
            <div className="p-6 relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-[#ff6b00]/20 text-[#ff6b00] text-[10px] font-bold uppercase tracking-widest mb-4">Rutina de Hoy</span>
              <h3 className="text-2xl font-bold text-[#dde4e6] mb-2">Empuje / Pecho</h3>
              <p className="text-[#e2bfb0] mb-6">6 Ejercicios • Aprox. 55 min</p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b00]"></span>
                  <span className="text-[#dde4e6]">Press de Banca Inclinado</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                  <span className="text-[#dde4e6]">Press Militar con Mancuernas</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                  <span className="text-[#dde4e6]">Aperturas en Polea Alta</span>
                </div>
              </div>
              <button
                onClick={handleStartWorkout}
                className="w-full h-[56px] bg-[#ff6b00] text-[#572000] font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Play size={20} fill="#572000" />
                COMENZAR ENTRENAMIENTO
              </button>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#dde4e6] mb-4">Resumen Semanal</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1a2123] p-5 rounded-2xl flex flex-col justify-between border border-white/5">
              <Timer className="text-[#ff6b00] mb-2" size={24} />
              <div>
                <p className="text-4xl font-semibold text-[#dde4e6]">184</p>
                <p className="text-sm font-bold text-[#313131] uppercase tracking-tight">Minutos</p>
              </div>
            </div>
            <div className="bg-[#1a2123] p-5 rounded-2xl flex flex-col justify-between border border-white/5">
              <Zap className="text-[#ff6b00] mb-2" size={24} />
              <div>
                <p className="text-4xl font-semibold text-[#dde4e6]">12.5k</p>
                <p className="text-sm font-bold text-[#313131] uppercase tracking-tight">Volumen kg</p>
              </div>
            </div>
            <div className="col-span-2 bg-[#1a2123] p-5 rounded-2xl border border-white/5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#313131] uppercase mb-1">Racha Actual</span>
                <p className="text-2xl font-bold text-[#dde4e6]">4 Días <span className="text-[#ff6b00]">🔥</span></p>
              </div>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#2f3638] border-2 border-[#1a2123] flex items-center justify-center">
                  <Star size={14} className="text-[#ff6b00]" fill="#ff6b00" />
                </div>
                <div className="w-8 h-8 rounded-full bg-[#2f3638] border-2 border-[#1a2123] flex items-center justify-center">
                  <Star size={14} className="text-[#ff6b00]" fill="#ff6b00" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}