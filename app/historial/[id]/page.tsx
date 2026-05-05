'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { ChevronRight, Dumbbell, Check, X } from 'lucide-react';

const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

interface DetalleMock {
  id: string;
  ejercicioId: string;
  ejercicioNombre: string;
  series: { numeroSerie: number; peso: number; repeticiones: number; completado: boolean }[];
}

interface RegistroDetalleMock {
  id: string;
  rutinaNombre: string;
  fecha: string;
  hora: string;
  duracionMinutos: number;
  estado: string;
  volumenTotal: number;
  detalles: DetalleMock[];
}

const mockDetalle: RegistroDetalleMock = {
  id: '1',
  rutinaNombre: 'Pierna - Cuádriceps',
  fecha: '04 May 2026',
  hora: '18:30',
  duracionMinutos: 65,
  estado: 'completado',
  volumenTotal: 24500,
  detalles: [
    {
      id: 'ej1',
      ejercicioId: 'ej1',
      ejercicioNombre: 'Sentadilla con Barra',
      series: [
        { numeroSerie: 1, peso: 80, repeticiones: 12, completado: true },
        { numeroSerie: 2, peso: 85, repeticiones: 10, completado: true },
        { numeroSerie: 3, peso: 90, repeticiones: 8, completado: true },
      ],
    },
    {
      id: 'ej2',
      ejercicioId: 'ej2',
      ejercicioNombre: 'Prensa de Piernas 45º',
      series: [
        { numeroSerie: 1, peso: 100, repeticiones: 15, completado: true },
        { numeroSerie: 2, peso: 100, repeticiones: 12, completado: true },
        { numeroSerie: 3, peso: 100, repeticiones: 10, completado: true },
      ],
    },
    {
      id: 'ej3',
      ejercicioId: 'ej3',
      ejercicioNombre: 'Extensión de Cuádriceps',
      series: [
        { numeroSerie: 1, peso: 45, repeticiones: 20, completado: true },
        { numeroSerie: 2, peso: 45, repeticiones: 18, completado: true },
        { numeroSerie: 3, peso: 50, repeticiones: 15, completado: true },
      ],
    },
    {
      id: 'ej4',
      ejercicioId: 'ej4',
      ejercicioNombre: 'Peso Muerto Rumano',
      series: [
        { numeroSerie: 1, peso: 60, repeticiones: 12, completado: true },
        { numeroSerie: 2, peso: 60, repeticiones: 10, completado: true },
        { numeroSerie: 3, peso: 65, repeticiones: 8, completado: false },
      ],
    },
  ],
};

export default function HistorialDetallePage() {
  const [loading] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e1416] text-[#dde4e6]">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-2 border-[#ff6b00] border-t-transparent rounded-full animate-spin" />
        </div>
        <BottomNav />
      </div>
    );
  }

  const registro = mockDetalle;
  const volumenDisplay = registro.volumenTotal >= 1000
    ? `${(registro.volumenTotal / 1000).toFixed(1)}k`
    : String(registro.volumenTotal);
  const seriesCompletadas = registro.detalles.reduce((acc, ej) => acc + ej.series.filter(s => s.completado).length, 0);
  const totalSeries = registro.detalles.reduce((acc, ej) => acc + ej.series.length, 0);

  return (
    <div className="min-h-screen bg-[#0e1416] text-[#dde4e6]">
      <header className="fixed top-0 w-full z-50 bg-[#0e1416] border-b border-[#2f3638] flex justify-between items-center px-5 h-16">
        <div className="flex items-center gap-4">
          <Link href="/historial" className="text-[#dde4e6] active:scale-95 transition-transform">
            <ChevronRight className="rotate-180" size={24} />
          </Link>
          <h1 className="font-bold tracking-tighter text-[#ff6b00] text-xl font-['Lexend']">{registro.rutinaNombre}</h1>
        </div>
      </header>

      <main className="pt-20 pb-32 px-5 max-w-md mx-auto">
        <div className="bg-[#1a2123] rounded-xl p-4 mb-6 border border-[#ff6b00]/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-[#a98a7d] font-['Lexend']">{registro.fecha}</p>
              <p className="text-sm text-[#e2bfb0] font-['Lexend']">{registro.hora}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#a98a7d] font-['Lexend']">Estado</p>
              <p className="text-sm font-bold text-[#4caf50] font-['Lexend'] capitalize">{registro.estado.replace('_', ' ')}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#242b2d] rounded-lg p-3 text-center">
              <p className="text-[10px] text-[#a98a7d] uppercase tracking-wider font-['Lexend'] mb-1">Duración</p>
              <p className="text-lg font-bold text-[#dde4e6] font-['Lexend']">{registro.duracionMinutos}<span className="text-xs text-[#a98a7d] ml-1">min</span></p>
            </div>
            <div className="bg-[#242b2d] rounded-lg p-3 text-center">
              <p className="text-[10px] text-[#a98a7d] uppercase tracking-wider font-['Lexend'] mb-1">Series</p>
              <p className="text-lg font-bold text-[#dde4e6] font-['Lexend']">{seriesCompletadas}<span className="text-xs text-[#a98a7d] ml-1">/ {totalSeries}</span></p>
            </div>
            <div className="bg-[#242b2d] rounded-lg p-3 text-center">
              <p className="text-[10px] text-[#a98a7d] uppercase tracking-wider font-['Lexend'] mb-1">Volumen</p>
              <p className="text-lg font-bold text-[#dde4e6] font-['Lexend']">{volumenDisplay}<span className="text-xs text-[#a98a7d] ml-1">kg</span></p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {registro.detalles.map((ejercicio) => {
            const allCompleted = ejercicio.series.every(s => s.completado);
            const completedCount = ejercicio.series.filter(s => s.completado).length;

            return (
              <div key={ejercicio.id} className={`bg-[#1a2123] rounded-xl overflow-hidden border-l-4 ${allCompleted ? 'border-[#4caf50]' : 'border-[#ff6b00]'}`}>
                <div className="flex items-center justify-between p-4 border-b border-[#2f3638]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[#242b2d] flex items-center justify-center">
                      <Dumbbell size={20} className="text-[#a98a7d]" />
                    </div>
                    <p className="font-bold text-[#dde4e6] font-['Lexend']">{ejercicio.ejercicioNombre}</p>
                  </div>
                  {allCompleted ? (
                    <div className="w-8 h-8 rounded-full bg-[#4caf50] flex items-center justify-center">
                      <Check size={16} className="text-white" />
                    </div>
                  ) : (
                    <div className="px-3 py-1 rounded-full bg-[#ff6b00]/10">
                      <span className="text-xs font-bold text-[#ff6b00] font-['Lexend']">{completedCount}/{ejercicio.series.length}</span>
                    </div>
                  )}
                </div>

                <div className="divide divide-[#2f3638]">
                  {ejercicio.series.map((set) => (
                    <div key={set.numeroSerie} className={`flex items-center gap-3 px-4 py-3 ${set.completado ? 'bg-[#0e1416]/30' : ''}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-['Lexend'] font-bold ${set.completado ? 'bg-[#ff6b00] text-[#351000]' : 'bg-[#242b2d] text-[#a98a7d]'}`}>
                        {set.numeroSerie}
                      </div>
                      <div className="flex-1 flex items-center gap-3">
                        <div className="flex-1 bg-[#242b2d] rounded-lg px-3 py-2">
                          <p className="text-[10px] text-[#a98a7d] uppercase tracking-wider font-['Lexend'] mb-0.5">Peso</p>
                          <p className="text-base font-bold text-[#dde4e6] font-['Lexend']">{set.peso} kg</p>
                        </div>
                        <div className="flex-1 bg-[#242b2d] rounded-lg px-3 py-2">
                          <p className="text-[10px] text-[#a98a7d] uppercase tracking-wider font-['Lexend'] mb-0.5">Reps</p>
                          <p className="text-base font-bold text-[#dde4e6] font-['Lexend']">{set.repeticiones}</p>
                        </div>
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${set.completado ? 'text-[#4caf50]' : 'text-[#5a4136]'}`}>
                        {set.completado ? <Check size={20} /> : <X size={20} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}