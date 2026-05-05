'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import BottomNav from '../../../components/BottomNav';
import { ChevronRight, Dumbbell, Check } from 'lucide-react';
import { query } from '../../../../lib/turso';
import { getExerciseImageUrl, ExerciseFromDB } from '../../../../lib/exerciseApi';
import { useAuth } from '../../../components/AuthProvider';

interface RutinaVersionRow {
  id: string;
  nombre: string;
  descripcion: string | null;
  diaSemana: string;
}

interface RutinaEjercicioVersionRow {
  id: string;
  rutinaVersionId: string;
  ejercicioId: string;
  series: number;
  repeticiones: number;
  peso: number;
  orden: number;
}

interface SetData {
  setNumber: number;
  peso: number;
  repeticiones: number;
  completed: boolean;
}

interface EjercicioExpandido extends RutinaEjercicioVersionRow {
  ejercicioDb: ExerciseFromDB | null;
  sets: SetData[];
}

let cachedExercises: ExerciseFromDB[] | null = null;
let cacheTime = 0;
const CACHE_DURATION = 1000 * 60 * 60 * 24;

export default function WorkoutPage() {
  const params = useParams();
  const rutinaVersionId = params.id as string;
  const { user } = useAuth();
  const [rutina, setRutina] = useState<RutinaVersionRow | null>(null);
  const [ejercicios, setEjercicios] = useState<EjercicioExpandido[]>([]);
  const [loading, setLoading] = useState(true);

  const guardarSet = async (rutinaEjercicioVersionId: string, setNumber: number, repeticiones: number, peso: number, completado: boolean) => {
    try {
      await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rutinaVersionId,
          alumnoId: user?.id,
          rutinaEjercicioVersionId,
          numeroSerie: setNumber,
          repeticiones,
          peso,
          completado,
        }),
      });
    } catch (error) {
      console.error('Error guardando set:', error);
    }
  };

  const toggleSetCompletado = (ejercicioIndex: number, setIndex: number) => {
    setEjercicios(prev => {
      const ejercicio = prev[ejercicioIndex];
      const set = ejercicio.sets[setIndex];
      const newCompleted = !set.completed;

      guardarSet(ejercicio.id, set.setNumber, set.repeticiones, set.peso, newCompleted);

      return prev.map((ej, ei) => {
        if (ei !== ejercicioIndex) return ej;
        const newSets = ej.sets.map((s, si) => si === setIndex ? { ...s, completed: newCompleted } : s);
        return { ...ej, sets: newSets };
      });
    });
  };

  useEffect(() => {
    const cargarDatos = async () => {
      const rutinasData = await query<RutinaVersionRow>(
        `SELECT * FROM RutinaVersion WHERE id = ?`,
        [rutinaVersionId]
      );
      if (rutinasData.length > 0) {
        setRutina(rutinasData[0]);
      }

      const rutinaEjercicios = await query<RutinaEjercicioVersionRow>(
        `SELECT * FROM RutinaEjercicioVersion WHERE rutinaVersionId = ? ORDER BY orden ASC`,
        [rutinaVersionId]
      );

      if (!cachedExercises || Date.now() - cacheTime > CACHE_DURATION) {
        const response = await fetch('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json');
        cachedExercises = await response.json();
        cacheTime = Date.now();
      }

      const ejerciciosCompletos: EjercicioExpandido[] = rutinaEjercicios.map(re => {
        const ejercicioInfo = cachedExercises?.find((e) => e.id === re.ejercicioId);

        const sets: SetData[] = [];
        for (let i = 0; i < re.series; i++) {
          sets.push({
            setNumber: i + 1,
            peso: re.peso || 0,
            repeticiones: re.repeticiones || 0,
            completed: false,
          });
        }

        return { ...re, ejercicioDb: ejercicioInfo || null, sets };
      });

      setEjercicios(ejerciciosCompletos);
      setLoading(false);
    };

    cargarDatos();
  }, [rutinaVersionId]);

  const updateSetDato = (ejercicioIndex: number, setIndex: number, campo: 'peso' | 'repeticiones', valor: number) => {
    setEjercicios(prev => prev.map((ej, ei) => {
      if (ei !== ejercicioIndex) return ej;
      const newSets = ej.sets.map((s, si) => si === setIndex ? { ...s, [campo]: valor } : s);
      return { ...ej, sets: newSets };
    }));
  };

  const completedCount = ejercicios.reduce((acc, ej) => acc + ej.sets.filter(s => s.completed).length, 0);
  const totalSets = ejercicios.reduce((acc, ej) => acc + ej.series, 0);
  const progress = totalSets > 0 ? Math.round((completedCount / totalSets) * 100) : 0;

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
      <header className="fixed top-0 w-full z-50 bg-[#0e1416] border-b border-[#2f3638] flex justify-between items-center px-5 h-16">
        <div className="flex items-center gap-4">
          <Link href="/atleta/entrenar" className="text-[#dde4e6] active:scale-95 transition-transform">
            <ChevronRight className="rotate-180" size={24} />
          </Link>
          <h1 className="font-bold tracking-tighter text-[#ff6b00] text-xl font-['Lexend']">{rutina?.nombre || 'Rutina'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-[#a98a7d] font-['Lexend']">{completedCount}/{totalSets}</p>
            <p className="text-sm font-bold text-[#ff6b00] font-['Lexend']">{progress}%</p>
          </div>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#5a4136]">
            <img alt="Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyTiK6DFzwLnZdsAfiAUCDUpZh7rBpFRvYS0k2DngrDvoLmb0xBzCltgSss-qwJWoNFRVFwTKK_zYlWMXLHPf7a-hsd7Gmlq8paafsY28aVswNeMcDS8UnpQS786INjq2Alj-1043MjtRb79SrMAKDv-eX42KtdVzsb6dZ2s7JHLdF3czc4lor7keexfTtMy_dC72LB-BYubVAMefP0xwAup8e-R0UWDj80B_qqu4wZ72fvmg9doiLoilhA0Cc6ySatMQV5wjVYjk" />
          </div>
        </div>
      </header>

      <main className="pt-20 pb-32 px-5 max-w-md mx-auto">
        <div className="w-full bg-[#1a2123] rounded-xl p-4 mb-6 border border-[#ff6b00]/20">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-[#ffb693] uppercase tracking-widest font-['Lexend']">Progreso</span>
            <span className="text-xs text-[#e2bfb0] font-['Lexend']">{completedCount} de {totalSets} series</span>
          </div>
          <div className="w-full bg-[#2f3638] h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-[#ff6b00] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {ejercicios.map((ejercicio, ejercicioIndex) => {
            const imageUrl = ejercicio.ejercicioDb ? getExerciseImageUrl(ejercicio.ejercicioDb) : '';
            const nombre = ejercicio.ejercicioDb?.nameEs || ejercicio.ejercicioDb?.name || 'Ejercicio';
            const primaryMuscle = ejercicio.ejercicioDb?.primaryMusclesEs?.[0] || ejercicio.ejercicioDb?.primaryMuscles?.[0] || '';
            const allCompleted = ejercicio.sets.every(s => s.completed);

            return (
              <div key={ejercicio.id} className={`bg-[#1a2123] rounded-xl overflow-hidden border-l-4 ${allCompleted ? 'border-[#4caf50]' : 'border-[#ff6b00]'}`}>
                <div className="flex items-center gap-3 p-4">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#242b2d] flex-shrink-0">
                    {imageUrl ? (
                      <img src={imageUrl} alt={nombre} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center ${imageUrl ? 'hidden' : ''}`}>
                      <Dumbbell size={22} className="text-[#a98a7d]" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[#dde4e6] font-['Lexend'] truncate">{nombre}</p>
                    <p className="text-xs text-[#e2bfb0] font-['Lexend'] truncate">{primaryMuscle} • {ejercicio.series} series</p>
                  </div>
                  {allCompleted && (
                    <div className="w-8 h-8 rounded-full bg-[#4caf50] flex items-center justify-center">
                      <Check size={16} className="text-white" />
                    </div>
                  )}
                </div>

                <div className="border-t border-[#2f3638]">
                  {ejercicio.sets.map((set, setIndex) => (
                    <div key={setIndex} className={`flex items-center gap-3 px-4 py-3 border-b border-[#2f3638] last:border-b-0 ${set.completed ? 'bg-[#0e1416]/30' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-['Lexend'] font-bold ${set.completed ? 'bg-[#ff6b00] text-[#351000]' : 'bg-[#242b2d] text-[#a98a7d]'}`}>
                        {set.setNumber}
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          className="w-20 h-11 bg-[#242b2d] rounded-lg border-b-2 border-[#ff6b00]/50 text-center text-[#dde4e6] font-['Lexend'] text-sm focus:ring-0 focus:outline-none focus:border-[#ff6b00]"
                          placeholder="KG"
                          type="number"
                          value={set.peso || ''}
                          onChange={(e) => updateSetDato(ejercicioIndex, setIndex, 'peso', Number(e.target.value))}
                        />
                        <span className="text-[#a98a7d] text-sm font-['Lexend']">kg</span>
                        <span className="text-[#5a4136]">×</span>
                        <input
                          className="w-16 h-11 bg-[#242b2d] rounded-lg border-b-2 border-[#ff6b00]/50 text-center text-[#dde4e6] font-['Lexend'] text-sm focus:ring-0 focus:outline-none focus:border-[#ff6b00]"
                          placeholder="Reps"
                          type="number"
                          value={set.repeticiones || ''}
                          onChange={(e) => updateSetDato(ejercicioIndex, setIndex, 'repeticiones', Number(e.target.value))}
                        />
                        <span className="text-[#a98a7d] text-sm font-['Lexend']">reps</span>
                      </div>
                      <button
                        onClick={() => toggleSetCompletado(ejercicioIndex, setIndex)}
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 ${set.completed ? 'bg-[#ff6b00] text-[#351000]' : 'bg-[#242b2d] border-2 border-[#5a4136] text-[#a98a7d]'}`}
                      >
                        <Check size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="fixed bottom-0 w-full bg-[#0e1416] p-4 z-50 border-t border-[#2f3638]">
        <button className="w-full h-14 bg-[#ff6b00] text-[#351000] font-bold uppercase tracking-widest rounded-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2 font-['Lexend']">
          Finalizar Entrenamiento
          <Check size={20} />
        </button>
      </footer>
    </div>
  );
}