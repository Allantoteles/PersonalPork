'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { TrendingUp, Calendar, Dumbbell, ChevronRight, Search, User, Loader2 } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { useAlumnos, useAlumno, useRutinas } from '../../lib/api-hooks';
import { Alumno } from '../../lib/types';

interface EjercicioDisplay {
  id: string;
  nombre: string;
  grupoMuscular: string;
  imagen: string;
  isLocal: boolean;
  peso: number;
}

interface RecentWorkout {
  id: string;
  nombre: string;
  fecha: string;
  duracion: number;
}

function ProgressContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { role, isLoading: authLoading, trainerId, user } = useAuth();
  const [selectedAlumnoId, setSelectedAlumnoId] = useState<string>('');
  const [selectedAlumnoNombre, setSelectedAlumnoNombre] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlumnoDropdown, setShowAlumnoDropdown] = useState(false);
  const [filter, setFilter] = useState('Todos');

  const isTrainer = role === 'entrenador';
  const queryAlumnoId = searchParams.get('alumno');

  const { data: alumnosList = [] } = useAlumnos(isTrainer ? trainerId : null);

  const activeAlumnoId = queryAlumnoId || selectedAlumnoId || (isTrainer ? '' : user?.id || '');

  const { data: alumnoData } = useAlumno(activeAlumnoId || null);
  const { data: rutinas = [], isLoading: loadingRutinas } = useRutinas(activeAlumnoId || null);

  const filteredAlumnos = searchQuery.length >= 2
    ? alumnosList.filter((a: Alumno) =>
        a.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const ejercicios: EjercicioDisplay[] = [];
  const recentWorkouts: RecentWorkout[] = rutinas.slice(0, 3).map(r => ({
    id: r.id,
    nombre: r.nombre,
    fecha: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    duracion: 60,
  }));

  const filteredEjercicios = filter === 'Todos'
    ? ejercicios
    : ejercicios.filter(e => {
        const muscleGroup = e.grupoMuscular.toLowerCase();
        if (filter === 'Pierna') return muscleGroup.includes('cuádriceps') || muscleGroup.includes('isquiotibial') || muscleGroup.includes('glúteo') || muscleGroup.includes('pantorrilla');
        if (filter === 'Empuje') return muscleGroup.includes('pecho') || muscleGroup.includes('hombro') || muscleGroup.includes('tríceps');
        if (filter === 'Tracción') return muscleGroup.includes('espalda') || muscleGroup.includes('bíceps');
        return true;
      });

  const seleccionarAlumno = (alumno: Alumno) => {
    setSelectedAlumnoId(alumno.id);
    setSelectedAlumnoNombre(alumno.nombre);
    setShowAlumnoDropdown(false);
    setSearchQuery('');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0e1416] text-[#dde4e6] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ff6b00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e1416] text-[#dde4e6]">
      <Header />

      <main className="mt-16 px-5 pb-32 max-w-md mx-auto">
        <section className="py-6">
          <h2 className="text-2xl font-bold text-[#e5e2e1] font-['Lexend']">Progreso</h2>
          <p className="text-[#e2bfb0]">Visualiza tu evolución y récords personales.</p>
        </section>

        {isTrainer && (
          <section className="mb-6 relative">
            <label className="block text-sm font-bold text-[#ffb693] uppercase tracking-wider mb-2 font-['Lexend']">
              Previsualizar Alumno
            </label>
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a4136]" />
              <input
                type="text"
                placeholder="Buscar alumno..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length < 2) {
                    setSelectedAlumnoId('');
                    setSelectedAlumnoNombre('');
                  }
                }}
                onFocus={() => setShowAlumnoDropdown(true)}
                className="w-full bg-[#1a2123] border-b-2 border-[#2f3638] focus:border-[#ff6b00] pl-10 pr-4 py-3 text-[#dde4e6] font-['Lexend'] focus:ring-0 focus:outline-none"
              />
            </div>

            {showAlumnoDropdown && searchQuery.length >= 2 && (
              <div className="bg-[#1a2123] border border-[#2f3638] mt-1 rounded-lg overflow-hidden absolute z-10 max-w-md w-full">
                {filteredAlumnos.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto">
                    {filteredAlumnos.map(alumno => (
                      <button
                        key={alumno.id}
                        onClick={() => seleccionarAlumno(alumno)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2f3638] text-left border-b border-[#2f3638] last:border-b-0"
                      >
                        <User size={18} className="text-[#ff6b00]" />
                        <div className="flex-1">
                          <p className="font-bold text-[#dde4e6] font-['Lexend']">{alumno.nombre}</p>
                          <p className="text-[#e2bfb0] text-sm font-['Lexend']">{alumno.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="px-4 py-3 text-[#5a4136] text-sm font-['Lexend'] text-center">
                    Sin resultados
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {loadingRutinas ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#ff6b00]" size={32} />
          </div>
        ) : rutinas.length > 0 ? (
          <>
            <section className="mb-6 overflow-x-auto">
              <div className="flex gap-3 pb-2">
                {['Todos', 'Pierna', 'Empuje', 'Tracción'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-6 py-2 rounded-full font-bold active:scale-95 transition-transform font-['Lexend'] ${
                      filter === f
                        ? 'bg-[#ff6b00] text-[#351000]'
                        : 'bg-[#1a2123] border border-[#5a4136] text-[#dde4e6]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-xl font-bold text-[#dde4e6] mb-2 font-['Lexend']">Entrenamientos Recientes</h3>

              {recentWorkouts.map((workout) => (
                <button
                  key={workout.id}
                  onClick={() => router.push('/historial')}
                  className="bg-[#1a2123] rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors text-left w-full"
                >
                  <div className="w-14 h-14 bg-[#242b2d] rounded-lg flex items-center justify-center text-[#ff6b00]">
                    <Dumbbell size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-[#dde4e6] font-['Lexend']">{workout.nombre}</h4>
                    <div className="flex items-center gap-3 text-[#e2bfb0] text-sm">
                      <span className="flex items-center"><Calendar size={14} className="mr-1" />{workout.fecha}</span>
                      <span className="flex items-center"><span className="mr-1">⏱</span>{workout.duracion} min</span>
                    </div>
                  </div>
                  <ChevronRight className="text-[#e2bfb0]" size={24} />
                </button>
              ))}
            </section>
          </>
        ) : activeAlumnoId ? (
          <section className="py-20 text-center">
            <Dumbbell size={48} className="mx-auto text-[#5a4136] mb-4" />
            <p className="text-[#e2bfb0] font-['Lexend]">Este alumno no tiene ejercicios registrados</p>
          </section>
        ) : (
          <section className="py-20 text-center">
            <Dumbbell size={48} className="mx-auto text-[#5a4136] mb-4" />
            <p className="text-[#e2bfb0] font-['Lexend]">
              {isTrainer
                ? 'Selecciona un alumno para ver su progreso'
                : 'Completa entrenamientos para ver tu progreso'}
            </p>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default function ProgressPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0e1416] text-[#dde4e6] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ff6b00] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProgressContent />
    </Suspense>
  );
}
