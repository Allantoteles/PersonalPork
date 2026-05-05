'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { ChevronRight, Plus, Calendar, Dumbbell, Pencil } from 'lucide-react';
import { query } from '../../../lib/turso';

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

interface UsuarioRow {
  id: string;
  email: string;
  nombre: string;
  rolId: string | null;
  entrenadorId: string | null;
}

interface RutinaVersionRow {
  id: string;
  nombre: string;
  descripcion: string | null;
  diaSemana: string;
  rutinaOriginalId: string | null;
  isActive: number;
}

export default function AlumnoDetailPage() {
  const params = useParams();
  const alumnoId = params.id as string;
  const [alumno, setAlumno] = useState<UsuarioRow | null>(null);
  const [rutinas, setRutinas] = useState<RutinaVersionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      const usuarios = await query<UsuarioRow>(`SELECT * FROM Usuario WHERE id = ?`, [alumnoId]);
      setAlumno(usuarios[0] || null);

      const rutinasData = await query<RutinaVersionRow>(
        `SELECT rv.* FROM RutinaVersion rv
         INNER JOIN Rutina r ON rv.rutinaOriginalId = r.id
         WHERE r.alumnoId = ? AND rv.isActive = 1
         ORDER BY rv.diaSemana ASC`,
        [alumnoId]
      );
      setRutinas(rutinasData);
      setLoading(false);
    };

    cargarDatos();
  }, [alumnoId]);

  const rutinasPorDia = diasSemana.map(dia => ({
    dia,
    rutinas: rutinas.filter(r => r.diaSemana === dia),
  }));

  return (
    <div className="min-h-screen bg-[#0e1416] text-[#dde4e6]">
      <Header />

      <main className="pt-20 pb-32 px-5 max-w-md mx-auto">
        <Link
          href="/alumnos"
          className="inline-flex items-center gap-2 text-[#ff6b00] mb-6 font-['Lexend']"
        >
          <ChevronRight size={20} className="rotate-180" />
          Volver a Alumnos
        </Link>

        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-8 h-8 border-2 border-[#ff6b00] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <section className="mb-8">
              <p className="text-sm font-bold text-[#ffb693] uppercase tracking-widest mb-2 font-['Lexend']">Alumno</p>
              <h1 className="text-2xl font-bold text-[#dde4e6] font-['Lexend']">{alumno?.nombre || 'No encontrado'}</h1>
              <p className="text-[#e2bfb0] font-['Lexend']">{alumno?.email}</p>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#dde4e6] font-['Lexend']">Rutinas</h2>
              </div>

              {rutinasPorDia.map(({ dia, rutinas: rutinasDia }) => (
                <div key={dia} className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-[#ffb693] uppercase tracking-wider font-['Lexend']">{dia}</h3>
                    <Link
                      href={`/rutinas?alumno=${alumnoId}&dia=${encodeURIComponent(dia)}`}
                      className="bg-[#ff6b00] text-[#351000] w-7 h-7 rounded-full flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <Plus size={16} />
                    </Link>
                  </div>

                  {rutinasDia.length === 0 ? (
                    <p className="text-[#5a4136] text-sm font-['Lexend']">Sin rutinas</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {rutinasDia.map(rutina => (
                        <div
                          key={rutina.id}
                          className="bg-[#1a2123] rounded-xl p-4 border-l-4 border-[#ff6b00]"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-bold text-[#dde4e6] font-['Lexend']">{rutina.nombre}</h4>
                              {rutina.descripcion && (
                                <p className="text-[#e2bfb0] text-sm font-['Lexend'] mt-1">{rutina.descripcion}</p>
                              )}
                            </div>
                            <Link
                              href={`/rutinas?alumno=${alumnoId}&version=${rutina.id}`}
                              className="p-2 bg-[#242b2d] rounded-lg active:scale-95 transition-transform"
                            >
                              <Pencil size={16} className="text-[#ff6b00]" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}