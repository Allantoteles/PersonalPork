'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { TrendingUp, Calendar, Dumbbell, ChevronRight, Search, User, Loader2 } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { searchExercises, getExerciseById, ExerciseFromDB, getExerciseImageUrl } from '../../lib/exerciseApi';
import { Alumno } from '../../lib/types';

interface EjercicioLocal {
  id: string;
  nombre: string;
  grupoMuscular: string;
  gruposMusculares: string;
  equipo: string | null;
  nivel: string;
  instrucciones: string;
  categoria: string | null;
  imagen: string | null;
}

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
  ejercicios: string[];
}

function ProgressContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { role, isLoading: authLoading, trainerId, user } = useAuth();
  const [selectedAlumnoId, setSelectedAlumnoId] = useState<string>('');
  const [selectedAlumnoNombre, setSelectedAlumnoNombre] = useState<string>('');
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlumnoDropdown, setShowAlumnoDropdown] = useState(false);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [ejercicios, setEjercicios] = useState<EjercicioDisplay[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [filter, setFilter] = useState('Todos');

  const isTrainer = role === 'entrenador';
  const queryAlumnoId = searchParams.get('alumno');

  useEffect(() => {
    if (queryAlumnoId) {
      setSelectedAlumnoId(queryAlumnoId);
      fetchAlumnoNombre(queryAlumnoId);
    }
  }, [queryAlumnoId]);

  useEffect(() => {
    if (!isTrainer && user && !selectedAlumnoId) {
      setSelectedAlumnoId(user.id);
      setSelectedAlumnoNombre(user.nombre || '');
    }
  }, [isTrainer, user, selectedAlumnoId]);

  const fetchAlumnoNombre = async (id: string) => {
    try {
      const res = await fetch(`/api/alumnos/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedAlumnoNombre(data.nombre || '');
      }
    } catch (error) {
      console.error('Error fetching alumno:', error);
    }
  };

  const buscarAlumnos = async (query: string) => {
    if (query.length < 2) {
      setAlumnos([]);
      return;
    }
    setLoadingAlumnos(true);
    try {
      const res = await fetch(`/api/alumnos?trainerId=${trainerId}&search=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setAlumnos(data);
      }
    } catch (error) {
      console.error('Error searching alumnos:', error);
    }
    setLoadingAlumnos(false);
  };

  const seleccionarAlumno = (alumno: Alumno) => {
    setSelectedAlumnoId(alumno.id);
    setSelectedAlumnoNombre(alumno.nombre);
    setShowAlumnoDropdown(false);
    setSearchQuery('');
    setAlumnos([]);
  };

  useEffect(() => {
    if (searchQuery.length >= 2) {
      buscarAlumnos(searchQuery);
    } else {
      setAlumnos([]);
    }
  }, [searchQuery, trainerId]);

  useEffect(() => {
    if (!selectedAlumnoId) return;

    const fetchData = async () => {
      setLoadingData(true);
      try {
        const rutinasRes = await fetch(`/api/rutinas?alumnoId=${selectedAlumnoId}`);
        if (!rutinasRes.ok) throw new Error('Error fetching rutinas');
        const rutinas = await rutinasRes.json();

        const exerciseMap = new Map<string, EjercicioDisplay>();
        const workouts: RecentWorkout[] = [];

        for (const rutina of rutinas.slice(0, 3)) {
          const rutinaRes = await fetch(`/api/rutinas/${rutina.id}`);
          if (!rutinaRes.ok) continue;
          const rutinaData = await rutinaRes.json();

          workouts.push({
            id: rutina.id,
            nombre: rutina.nombre,
            fecha: new Date(rutina.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
            duracion: 60,
            ejercicios: [],
          });

          for (const ej of rutinaData.ejercicios || []) {
            if (exerciseMap.has(ej.ejercicioId)) continue;

            const isLocalEj = await checkIfLocalExercise(ej.ejercicioId);
            let ejercicioDisplay: EjercicioDisplay | null = null;

            if (isLocalEj) {
              const localRes = await fetch(`/api/ejercicios?search=${encodeURIComponent(ej.ejercicioId)}`);
              if (localRes.ok) {
                const localEjercicios = await localRes.json();
                const localEj = localEjercicios.find((l: EjercicioLocal) => l.id === ej.ejercicioId);
                if (localEj) {
                  ejercicioDisplay = {
                    id: localEj.id,
                    nombre: localEj.nombre,
                    grupoMuscular: localEj.grupoMuscular,
                    imagen: localEj.imagen || '',
                    isLocal: true,
                    peso: ej.peso,
                  };
                }
              }
            } else {
              const apiEj = await getExerciseById(ej.ejercicioId);
              if (apiEj) {
                ejercicioDisplay = {
                  id: apiEj.id,
                  nombre: apiEj.nameEs,
                  grupoMuscular: apiEj.primaryMusclesEs?.[0] || apiEj.primaryMuscles?.[0] || '',
                  imagen: getExerciseImageUrl(apiEj),
                  isLocal: false,
                  peso: ej.peso,
                };
              }
            }

            if (ejercicioDisplay) {
              exerciseMap.set(ej.ejercicioId, ejercicioDisplay);
            }
          }
        }

        setEjercicios(Array.from(exerciseMap.values()));
        setRecentWorkouts(workouts);
      } catch (error) {
        console.error('Error fetching progress data:', error);
      }
      setLoadingData(false);
    };

    fetchData();
  }, [selectedAlumnoId]);

  const checkIfLocalExercise = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/ejercicios?search=${encodeURIComponent(id)}`);
      if (res.ok) {
        const ejercicios = await res.json();
        return ejercicios.some((e: EjercicioLocal) => e.id === id);
      }
    } catch {}
    return false;
  };

  const filteredEjercicios = filter === 'Todos'
    ? ejercicios
    : ejercicios.filter(e => {
        const muscleGroup = e.grupoMuscular.toLowerCase();
        if (filter === 'Pierna') return muscleGroup.includes('cuádriceps') || muscleGroup.includes('isquiotibial') || muscleGroup.includes('glúteo') || muscleGroup.includes('pantorrilla');
        if (filter === 'Empuje') return muscleGroup.includes('pecho') || muscleGroup.includes('hombro') || muscleGroup.includes('tríceps');
        if (filter === 'Tracción') return muscleGroup.includes('espalda') || muscleGroup.includes('bíceps');
        return true;
      });

  const getMuscleIcon = (grupo: string) => {
    return <Dumbbell size={24} />;
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
                value={selectedAlumnoId ? selectedAlumnoNombre : searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  if (selectedAlumnoId && val !== selectedAlumnoNombre) {
                    setSelectedAlumnoId('');
                    setSelectedAlumnoNombre('');
                  }
                  setSearchQuery(val);
                }}
                onFocus={() => setShowAlumnoDropdown(true)}
                className="w-full bg-[#1a2123] border-b-2 border-[#2f3638] focus:border-[#ff6b00] pl-10 pr-4 py-3 text-[#dde4e6] font-['Lexend'] focus:ring-0 focus:outline-none"
              />
            </div>

            {showAlumnoDropdown && searchQuery.length >= 2 && (
              <div className="bg-[#1a2123] border border-[#2f3638] mt-1 rounded-lg overflow-hidden absolute z-10 max-w-md w-full">
                {loadingAlumnos ? (
                  <div className="px-4 py-3 text-center">
                    <Loader2 className="animate-spin mx-auto" size={20} />
                  </div>
                ) : alumnos.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto">
                    {alumnos.map(alumno => (
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

        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#ff6b00]" size={32} />
          </div>
        ) : ejercicios.length > 0 ? (
          <>
            <section className="grid grid-cols-1 gap-4 mb-10">
              {filteredEjercicios.slice(0, 2).map((ej, index) => (
                <div key={ej.id} className="bg-[#1a2123] rounded-xl p-6 border-l-4 border-[#ff6b00]">
                  <div className="flex justify-between items-end mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-[#242b2d] rounded-lg flex items-center justify-center overflow-hidden">
                        {ej.imagen ? (
                          <img
                            src={ej.imagen}
                            alt={ej.nombre}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <Dumbbell size={24} className={`text-[#ff6b00] ${ej.imagen ? 'hidden' : ''}`} />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-[#ff6b00] uppercase tracking-wider font-['Lexend']">{ej.nombre}</span>
                        <div className="text-3xl font-semibold text-[#dde4e6] mt-1 font-['Lexend']">{ej.peso}<span className="text-xl ml-1 text-[#e2bfb0]">kg</span></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[#ff6b00] font-bold text-sm flex items-center justify-end">
                        <TrendingUp size={16} className="mr-1" />+{Math.floor(Math.random() * 15 + 5)}%
                      </span>
                      <p className="text-xs text-[#e2bfb0]">vs mes pasado</p>
                    </div>
                  </div>
                  <div className="h-32 w-full relative overflow-hidden mt-4">
                    <svg className="w-full h-full" viewBox="0 0 400 100">
                      <path
                        style={{ filter: 'drop-shadow(0 0 8px rgba(255, 107, 0, 0.5))' }}
                        d={`M0,${80 - index * 20} Q50,${75 - index * 20} 100,${60 - index * 10} T200,${65 - index * 5} T300,${30 + index * 10} T400,${20 + index * 15}`}
                        fill="none"
                        stroke="#FF6B00"
                        strokeWidth="3"
                      />
                      <path
                        d={`M0,${80 - index * 20} Q50,${75 - index * 20} 100,${60 - index * 10} T200,${65 - index * 5} T300,${30 + index * 10} T400,${20 + index * 15} L400,100 L0,100 Z`}
                        fill="url(#grad1)"
                        opacity="0.3"
                      />
                      <defs>
                        <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#FF6B00', stopOpacity: 1 }}></stop>
                          <stop offset="100%" style={{ stopColor: '#FF6B00', stopOpacity: 0 }}></stop>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              ))}
            </section>

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
        ) : selectedAlumnoId ? (
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