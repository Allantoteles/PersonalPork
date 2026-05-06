'use client';

import Link from 'next/link';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { Dumbbell, ChevronRight } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { useHistorial } from '../../lib/api-hooks';

const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

interface RegistroDB {
  id: string;
  rutinaVersionId: string | null;
  alumnoId: string;
  fecha: string;
  estado: string;
  horaInicio: string | null;
  horaFin: string | null;
  duracionMinutos: number | null;
  observaciones: string | null;
  rutinaNombre: string;
  seriesCompletadas: number;
  totalSeries: number;
  volumenTotal: number;
}

function formatearFecha(fechaStr: string): { dia: string; mes: string; anio: string; hora: string } {
  const fecha = new Date(fechaStr);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = meses[fecha.getMonth()];
  const anio = String(fecha.getFullYear());
  const hora = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  return { dia, mes, anio, hora };
}

export default function HistorialPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: registros = [], isLoading } = useHistorial(user?.id || null);

  if (authLoading || isLoading) {
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

        {registros.length === 0 ? (
          <div className="text-center py-20">
            <Dumbbell size={48} className="mx-auto text-[#5a4136] mb-4" />
            <p className="text-[#e2bfb0] font-['Lexend]">No tienes entrenamientos registrados</p>
            <p className="text-[#5a4136] text-sm mt-2 font-['Lexend]">¡Completa tu primer entrenamiento!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {registros.map((registro: RegistroDB) => {
              const fecha = formatearFecha(registro.fecha);
              const volumenDisplay = registro.volumenTotal >= 1000
                ? `${(registro.volumenTotal / 1000).toFixed(1)}k`
                : String(registro.volumenTotal);

              return (
                <Link
                  key={registro.id}
                  href={`/historial/${registro.id}`}
                  className="block bg-[#1a2123] rounded-xl overflow-hidden border-l-4 border-[#ff6b00] active:scale-[0.98] transition-transform duration-150"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-[#dde4e6] font-['Lexend']">{registro.rutinaNombre}</p>
                        <p className="text-xs text-[#e2bfb0] font-['Lexend]">
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
                        <p className="text-lg font-bold text-[#dde4e6] font-['Lexend']">{registro.duracionMinutos || 0}'</p>
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
        )}
      </main>

      <BottomNav />
    </div>
  );
}
