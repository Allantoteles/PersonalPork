'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { Dumbbell, Calendar, ChevronRight } from 'lucide-react';

const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

interface RegistroMock {
  id: string;
  rutinaNombre: string;
  fecha: string;
  duracionMinutos: number;
  seriesCompletadas: number;
  totalSeries: number;
  volumenTotal: number;
  detalles: { numeroSerie: number; peso: number; repeticiones: number; completado: boolean }[];
}

const mockRegistros: RegistroMock[] = [
  {
    id: '1',
    rutinaNombre: 'Pierna - Cuádriceps',
    fecha: '2026-05-04T18:30:00',
    duracionMinutos: 65,
    seriesCompletadas: 12,
    totalSeries: 12,
    volumenTotal: 24500,
    detalles: [
      { numeroSerie: 1, peso: 80, repeticiones: 12, completado: true },
      { numeroSerie: 2, peso: 85, repeticiones: 10, completado: true },
      { numeroSerie: 3, peso: 90, repeticiones: 8, completado: true },
      { numeroSerie: 1, peso: 100, repeticiones: 15, completado: true },
      { numeroSerie: 2, peso: 100, repeticiones: 12, completado: true },
      { numeroSerie: 3, peso: 100, repeticiones: 10, completado: true },
    ],
  },
  {
    id: '2',
    rutinaNombre: 'Empuje / Pecho',
    fecha: '2026-05-02T17:00:00',
    duracionMinutos: 55,
    seriesCompletadas: 9,
    totalSeries: 9,
    volumenTotal: 18200,
    detalles: [
      { numeroSerie: 1, peso: 60, repeticiones: 12, completado: true },
      { numeroSerie: 2, peso: 65, repeticiones: 10, completado: true },
      { numeroSerie: 3, peso: 70, repeticiones: 8, completado: true },
      { numeroSerie: 1, peso: 30, repeticiones: 15, completado: true },
      { numeroSerie: 2, peso: 30, repeticiones: 12, completado: true },
      { numeroSerie: 3, peso: 30, repeticiones: 10, completado: true },
    ],
  },
  {
    id: '3',
    rutinaNombre: 'Tracción & Espalda',
    fecha: '2026-04-29T19:00:00',
    duracionMinutos: 50,
    seriesCompletadas: 6,
    totalSeries: 9,
    volumenTotal: 8400,
    detalles: [
      { numeroSerie: 1, peso: 50, repeticiones: 12, completado: true },
      { numeroSerie: 2, peso: 50, repeticiones: 10, completado: true },
      { numeroSerie: 3, peso: 55, repeticiones: 8, completado: true },
      { numeroSerie: 1, peso: 40, repeticiones: 12, completado: false },
      { numeroSerie: 2, peso: 40, repeticiones: 10, completado: false },
      { numeroSerie: 3, peso: 40, repeticiones: 8, completado: false },
    ],
  },
  {
    id: '4',
    rutinaNombre: 'Pierna - Glúteos',
    fecha: '2026-04-27T08:30:00',
    duracionMinutos: 70,
    seriesCompletadas: 12,
    totalSeries: 12,
    volumenTotal: 31200,
    detalles: [
      { numeroSerie: 1, peso: 100, repeticiones: 12, completado: true },
      { numeroSerie: 2, peso: 110, repeticiones: 10, completado: true },
      { numeroSerie: 3, peso: 120, repeticiones: 8, completado: true },
    ],
  },
];

function formatearFecha(fechaStr: string): { dia: string; mes: string; anio: string; hora: string } {
  const fecha = new Date(fechaStr);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = meses[fecha.getMonth()];
  const anio = String(fecha.getFullYear());
  const hora = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  return { dia, mes, anio, hora };
}

export default function HistorialPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <div className="min-h-screen bg-[#0e1416] text-[#dde4e6]">
      <Header />

      <main className="pt-20 pb-32 px-5 max-w-md mx-auto">
        <section className="mb-8">
          <p className="text-sm font-bold text-[#ffb693] uppercase tracking-widest mb-2 font-['Lexend']">Tu Progreso</p>
          <h1 className="text-2xl font-bold text-[#dde4e6] leading-none font-['Lexend']">Historial</h1>
        </section>

        <div className="flex flex-col gap-4">
          {mockRegistros.map((registro) => {
            const fecha = formatearFecha(registro.fecha);
            const volumenDisplay = registro.volumenTotal >= 1000
              ? `${(registro.volumenTotal / 1000).toFixed(1)}k`
              : String(registro.volumenTotal);

            return (
              <Link
                key={registro.id}
                href={`/atleta/historial/${registro.id}`}
                className="block bg-[#1a2123] rounded-xl overflow-hidden border-l-4 border-[#ff6b00] active:scale-[0.98] transition-transform duration-150"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-[#dde4e6] font-['Lexend']">{registro.rutinaNombre}</p>
                      <p className="text-xs text-[#e2bfb0] font-['Lexend']">
                        {fecha.hora} • {fecha.dia} {fecha.mes} {fecha.anio}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded ${
                        registro.seriesCompletadas === registro.totalSeries
                          ? 'bg-[#4caf50]/20'
                          : 'bg-[#ff6b00]/10'
                      }`}>
                        <Dumbbell size={12} className={registro.seriesCompletadas === registro.totalSeries ? 'text-[#4caf50]' : 'text-[#ff6b00]'} />
                        <span className={`text-xs font-bold font-['Lexend'] ${registro.seriesCompletadas === registro.totalSeries ? 'text-[#4caf50]' : 'text-[#ff6b00]'}`}>
                          {registro.seriesCompletadas}/{registro.totalSeries}
                        </span>
                      </div>
                      <ChevronRight size={18} className="text-[#a98a7d]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#242b2d] rounded-lg p-3">
                      <p className="text-[10px] text-[#a98a7d] uppercase tracking-wider font-['Lexend'] mb-1">Duración</p>
                      <p className="text-lg font-bold text-[#dde4e6] font-['Lexend']">{registro.duracionMinutos}'</p>
                    </div>
                    <div className="bg-[#242b2d] rounded-lg p-3">
                      <p className="text-[10px] text-[#a98a7d] uppercase tracking-wider font-['Lexend'] mb-1">Volumen</p>
                      <p className="text-lg font-bold text-[#dde4e6] font-['Lexend']">
                        {volumenDisplay}<span className="text-xs text-[#a98a7d] ml-1">kg</span>
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}