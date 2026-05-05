'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { ChevronRight, Dumbbell } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { query } from '../../lib/turso';

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

interface RutinaVersionRow {
  id: string;
  nombre: string;
  descripcion: string | null;
  diaSemana: string;
}

export default function AthleteTrainPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [rutinas, setRutinas] = useState<RutinaVersionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    const cargarRutinas = async () => {
      const data = await query<RutinaVersionRow>(
        `SELECT rv.id, rv.nombre, rv.descripcion, rv.diaSemana FROM RutinaVersion rv
         INNER JOIN Rutina r ON rv.rutinaOriginalId = r.id
         WHERE r.alumnoId = ? AND rv.isActive = 1
         ORDER BY rv.diaSemana ASC`,
        [user.id]
      );
      setRutinas(data);
      setLoading(false);
    };

    cargarRutinas();
  }, [user, authLoading]);

  const rutinasPorDia = diasSemana.map(dia => ({
    dia,
    rutinas: rutinas.filter(r => r.diaSemana === dia),
  }));

  if (authLoading || loading) {
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
        <section className="mb-10">
          <p className="text-sm font-bold text-[#ffb693] uppercase tracking-widest mb-2 font-['Lexend']">Entrenamiento Hoy</p>
          <h1 className="text-2xl font-bold text-[#dde4e6] leading-none font-['Lexend']">Selecciona tu Rutina</h1>
        </section>

        {rutinasPorDia.map(({ dia, rutinas: rutinasDia }) => (
          rutinasDia.length > 0 && (
            <div key={dia} className="mb-8">
              <h3 className="text-sm font-bold text-[#ffb693] uppercase tracking-wider font-['Lexend'] mb-3">{dia}</h3>
              <div className="flex flex-col gap-3">
                {rutinasDia.map((routine) => (
                  <Link
                    key={routine.id}
                    href={`/entrenar/${routine.id}`}
                    className="bg-[#242b2d] rounded-lg overflow-hidden border-l-4 border-[#ff6b00] flex active:scale-[0.98] transition-transform duration-150"
                  >
                    <div className="w-24 h-24 shrink-0 bg-[#2f3638] relative overflow-hidden flex items-center justify-center">
                      <Dumbbell className="text-[#a98a7d]" size={32} />
                    </div>
                    <div className="p-4 flex flex-col justify-center flex-1">
                      <h3 className="font-bold text-[#dde4e6] mb-1 font-['Lexend']">{routine.nombre}</h3>
                      {routine.descripcion && (
                        <span className="text-[#e2bfb0] text-sm font-bold font-['Lexend']">{routine.descripcion}</span>
                      )}
                    </div>
                    <div className="flex items-center px-4">
                      <ChevronRight className="text-[#a98a7d]" size={24} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        ))}

        {rutinas.length === 0 && (
          <p className="text-[#5a4136] text-sm font-['Lexend'] text-center py-8">
            No tenés rutinas asignadas todavía
          </p>
        )}
      </main>

      <BottomNav />
    </div>
  );
}