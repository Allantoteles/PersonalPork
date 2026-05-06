'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { Plus, Trash2, ChevronRight, User, Save, Search, Dumbbell, Loader2, Pencil, X, ImagePlus } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { searchExercises, getExerciseById, ExerciseFromDB, getExerciseImageUrl } from '../../lib/exerciseApi';

interface Alumno {
  id: string;
  nombre: string;
  email: string;
}

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

interface EjercicioSeleccionado {
  id: string;
  ejercicio_id: string;
  series: number;
  repeticiones: number;
  peso: number;
  orden: number;
  ejercicioDb?: ExerciseFromDB;
  ejercicioLocal?: EjercicioLocal;
  isLocal?: boolean;
}

interface RutinaEditando {
  id: string;
  nombre: string;
  descripcion: string | null;
  diaSemana: string;
  ejercicios: {
    id: string;
    ejercicioId: string;
    series: number;
    repeticiones: number;
    peso: number;
    orden: number;
  }[];
}

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const GRUPOS_MUSCULARES = [
  'Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps',
  'Cuádriceps', 'Isquiotibiales', 'Glúteos', 'Pantorrillas',
  'Abdominales', 'Core'
];

const CATEGORIAS = [
  'Empuje', 'Tracción', 'Sentadilla', 'Pierna', 'Core',
  'Hombros', 'Brazos', 'Pecho', 'Espalda', 'Cardio'
];

const NIVELES = ['principiante', 'intermedio', 'avanzado'];

const EQUIPOS = ['Barra', 'Mancuernas', 'Máquina', 'Polea', 'Cuerpo Libre', 'Otro'];

async function checkIsLocalExercise(exerciseId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/ejercicios?search=${encodeURIComponent(exerciseId)}`);
    if (res.ok) {
      const ejercicios = await res.json();
      return ejercicios.some((e: { id: string; nombre: string }) => e.id === exerciseId || e.nombre === exerciseId);
    }
  } catch {}
  return false;
}

function CrearRutinaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role, isLoading: authLoading, trainerId } = useAuth();
  const [alumnoId, setAlumnoId] = useState('');
  const [alumnoNombre, setAlumnoNombre] = useState('');
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [dia, setDia] = useState(searchParams.get('dia') || '');
  const [nombreRutina, setNombreRutina] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ejercicios, setEjercicios] = useState<EjercicioSeleccionado[]>([]);
  const [ejerciciosDisponibles, setEjerciciosDisponibles] = useState<(ExerciseFromDB | EjercicioLocal)[]>([]);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);
  const [loadingEjercicios, setLoadingEjercicios] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAlumnoDropdown, setShowAlumnoDropdown] = useState(false);
  const [showCrearEjercicio, setShowCrearEjercicio] = useState(false);
  const [searchMode, setSearchMode] = useState<'api' | 'local'>('api');
  const [searchQuery, setSearchQuery] = useState('');
  const [rutinaVersionId, setRutinaVersionId] = useState<string | null>(null);
  const [loadingRutina, setLoadingRutina] = useState(false);

  useEffect(() => {
    const alumId = searchParams.get('alumno');
    const versionId = searchParams.get('version');
    const diaParam = searchParams.get('dia');

    if (versionId) {
      setRutinaVersionId(versionId);
      setLoadingRutina(true);
      fetch(`/api/rutinas/${versionId}`)
        .then(res => res.json())
        .then(async (data: RutinaEditando) => {
          setNombreRutina(data.nombre);
          setDescripcion(data.descripcion || '');
          setDia(data.diaSemana);

          const ejerciciosConDatos = await Promise.all(
            data.ejercicios.map(async (e, i) => {
              const isLocal = await checkIsLocalExercise(e.ejercicioId);
              if (isLocal) {
                const localRes = await fetch(`/api/ejercicios?search=${encodeURIComponent(e.ejercicioId)}`);
                const localData = await localRes.json();
                const ejercicioLocal = localData.find((l: EjercicioLocal) => l.id === e.ejercicioId);
                return {
                  id: crypto.randomUUID(),
                  ejercicio_id: e.ejercicioId,
                  series: e.series,
                  repeticiones: e.repeticiones,
                  peso: e.peso,
                  orden: i,
                  isLocal: true,
                  ejercicioLocal,
                  ejercicioDb: undefined,
                };
              } else {
                const ejercicioDb = await getExerciseById(e.ejercicioId);
                return {
                  id: crypto.randomUUID(),
                  ejercicio_id: e.ejercicioId,
                  series: e.series,
                  repeticiones: e.repeticiones,
                  peso: e.peso,
                  orden: i,
                  isLocal: false,
                  ejercicioDb: ejercicioDb || { id: e.ejercicioId, name: 'Ejercicio API', nameEs: 'Ejercicio API', images: [], primaryMuscles: [], primaryMusclesEs: [], secondaryMuscles: [], secondaryMusclesEs: [], equipment: null, level: '', instructions: [], category: '' },
                  ejercicioLocal: undefined,
                };
              }
            })
          );
          setEjercicios(ejerciciosConDatos);
        })
        .catch(err => console.error('Error cargando rutina:', err))
        .finally(() => setLoadingRutina(false));
    }

    if (alumId) {
      const preloadAlumno = async (id: string) => {
        const res = await fetch(`/api/alumnos/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setAlumnoId(data.id);
            setAlumnoNombre(data.nombre);
          }
        }
      };
      preloadAlumno(alumId);
    }
    if (diaParam && diasSemana.includes(diaParam)) {
      setDia(diaParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setEjerciciosDisponibles([]);
      return;
    }

    setLoadingEjercicios(true);

    if (searchMode === 'api') {
      searchExercises(searchQuery).then(results => {
        setEjerciciosDisponibles(results);
        setLoadingEjercicios(false);
      }).catch(() => setLoadingEjercicios(false));
    } else {
      fetch(`/api/ejercicios?search=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          setEjerciciosDisponibles(data);
          setLoadingEjercicios(false);
        })
        .catch(() => setLoadingEjercicios(false));
    }
  }, [searchQuery, searchMode]);

  const buscarAlumnos = async (query: string) => {
    if (query.length < 2) {
      setAlumnos([]);
      return;
    }
    setLoadingAlumnos(true);
    const res = await fetch(`/api/atletas?query=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      setAlumnos(data);
    }
    setLoadingAlumnos(false);
  };

  const seleccionarAlumno = (alumno: Alumno) => {
    setAlumnoId(alumno.id);
    setAlumnoNombre(alumno.nombre);
    setShowAlumnoDropdown(false);
    setAlumnos([]);
  };

  const agregarEjercicio = (exercise: ExerciseFromDB | EjercicioLocal, isLocal: boolean = false) => {
    const newEx: EjercicioSeleccionado = {
      id: crypto.randomUUID(),
      ejercicio_id: isLocal ? (exercise as EjercicioLocal).id : (exercise as ExerciseFromDB).id,
      series: 3,
      repeticiones: 10,
      peso: 0,
      orden: ejercicios.length,
      ejercicioDb: isLocal ? undefined : { ...exercise } as ExerciseFromDB,
      ejercicioLocal: isLocal ? { ...exercise } as EjercicioLocal : undefined,
      isLocal,
    };
    setEjercicios([...ejercicios, newEx]);
    setSearchQuery('');
    setEjerciciosDisponibles([]);
  };

  const actualizarEjercicio = (index: number, campo: string, valor: number) => {
    setEjercicios(prev => prev.map((ex, i) =>
      i === index ? { ...ex, [campo]: valor } : ex
    ));
  };

  const eliminarEjercicio = (index: number) => {
    setEjercicios(prev => prev.filter((_, i) => i !== index));
  };

  const guardarRutina = async () => {
    if (!alumnoId || !dia || !nombreRutina || ejercicios.length === 0) {
      alert('Completa todos los campos');
      return;
    }

    if (!trainerId) {
      alert('Error de autenticación');
      return;
    }

    setSaving(true);
    try {
      const endpoint = rutinaVersionId ? `/api/rutinas/${rutinaVersionId}` : '/api/rutinas';
      const method = rutinaVersionId ? 'PUT' : 'POST';
      const body = {
        nombre: nombreRutina,
        descripcion,
        diaSemana: dia,
        alumnoId,
        entrenadorId: trainerId,
        ejercicios: ejercicios.map((ex, index) => ({
          ejercicioId: ex.ejercicio_id,
          series: ex.series,
          repeticiones: ex.repeticiones,
          peso: ex.peso,
          orden: index,
        })),
      };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Error saving');
      router.push('/alumnos');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar la rutina');
    }
    setSaving(false);
  };

  if (role !== 'entrenador') {
    return (
      <div className="min-h-screen bg-[#0e1416] text-[#dde4e6]">
        <Header />
        <main className="pt-20 pb-32 px-5 max-w-md mx-auto flex items-center justify-center min-h-[50vh]">
          <p className="text-[#e2bfb0] font-['Lexend'] text-center">
            Cambia a modo Entrenador para ver esta página
          </p>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (loadingRutina) {
    return (
      <div className="min-h-screen bg-[#0e1416] text-[#dde4e6]">
        <Header />
        <main className="pt-20 pb-32 px-5 max-w-md mx-auto flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-2 border-[#ff6b00] border-t-transparent rounded-full animate-spin" />
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e1416] text-[#dde4e6]">
      <Header />

      <main className="pt-20 pb-44 px-5 max-w-md mx-auto">
        <section className="mb-6">
          <p className="text-sm font-bold text-[#ffb693] uppercase tracking-widest mb-2 font-['Lexend']">
            {rutinaVersionId ? 'Editando' : 'Entrenador'}
          </p>
          <h1 className="text-2xl font-bold text-[#dde4e6] font-['Lexend']">
            {rutinaVersionId ? 'Modificar Rutina' : 'Crear Rutina'}
          </h1>
        </section>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-[#ffb693] uppercase tracking-wider mb-2 font-['Lexend']">Alumno</label>
            <button
              onClick={() => setShowAlumnoDropdown(!showAlumnoDropdown)}
              disabled={!!rutinaVersionId}
              className="w-full bg-[#1a2123] border-b-2 border-[#2f3638] focus:border-[#ff6b00] px-4 py-3 text-[#dde4e6] font-['Lexend'] text-left flex items-center justify-between disabled:opacity-50"
            >
              {alumnoNombre || 'Seleccionar alumno...'}
              <ChevronRight className={`text-[#ff6b00] transition-transform ${showAlumnoDropdown ? 'rotate-90' : ''}`} size={20} />
            </button>

            {showAlumnoDropdown && (
              <div className="bg-[#1a2123] border border-[#2f3638] mt-1 rounded-lg overflow-hidden">
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a4136]" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      buscarAlumnos(e.target.value);
                    }}
                    className="w-full bg-transparent pl-10 pr-4 py-3 text-[#dde4e6] font-['Lexend'] focus:ring-0 focus:outline-none border-b border-[#2f3638]"
                  />
                </div>
                {alumnos.length > 0 && (
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
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#ffb693] uppercase tracking-wider mb-2 font-['Lexend']">Día</label>
            <div className="flex gap-2 flex-wrap">
              {diasSemana.map(d => (
                <button
                  key={d}
                  onClick={() => setDia(d)}
                  className={`px-4 py-2 rounded-full font-['Lexend'] text-sm font-bold transition-colors ${
                    dia === d
                      ? 'bg-[#ff6b00] text-[#351000]'
                      : 'bg-[#1a2123] text-[#dde4e6] border border-[#2f3638]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#ffb693] uppercase tracking-wider mb-2 font-['Lexend']">Nombre de Rutina</label>
            <input
              type="text"
              value={nombreRutina}
              onChange={(e) => setNombreRutina(e.target.value)}
              placeholder="Ej: Pecho y Tríceps"
              className="w-full bg-[#1a2123] border-b-2 border-[#2f3638] focus:border-[#ff6b00] px-4 py-3 text-[#dde4e6] font-['Lexend'] focus:ring-0 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#ffb693] uppercase tracking-wider mb-2 font-['Lexend']">Descripción (opcional)</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Notas sobre la rutina..."
              rows={2}
              className="w-full bg-[#1a2123] border-b-2 border-[#2f3638] focus:border-[#ff6b00] px-4 py-3 text-[#dde4e6] font-['Lexend'] focus:ring-0 focus:outline-none resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-[#ffb693] uppercase tracking-wider font-['Lexend']">Ejercicios</label>
              <button
                onClick={() => setShowCrearEjercicio(true)}
                className="bg-[#ff6b00] text-[#351000] p-2 rounded-full flex items-center justify-center active:scale-95 transition-transform"
              >
                <Plus size={20} />
              </button>
            </div>

            {showCrearEjercicio && (
              <CrearEjercicioModal
                onClose={() => setShowCrearEjercicio(false)}
                onCreated={(ejercicio) => {
                  agregarEjercicio(ejercicio, true);
                  setShowCrearEjercicio(false);
                }}
              />
            )}

            <div className="relative mb-3">
              <div className="flex border-b border-[#2f3638]">
                <button
                  onClick={() => setSearchMode('api')}
                  className={`flex-1 px-4 py-3 text-sm font-bold font-['Lexend'] ${
                    searchMode === 'api'
                      ? 'bg-[#ff6b00] text-[#351000]'
                      : 'text-[#dde4e6] hover:bg-[#2f3638]'
                  }`}
                >
                  API Externa
                </button>
                <button
                  onClick={() => setSearchMode('local')}
                  className={`flex-1 px-4 py-3 text-sm font-bold font-['Lexend'] ${
                    searchMode === 'local'
                      ? 'bg-[#ff6b00] text-[#351000]'
                      : 'text-[#dde4e6] hover:bg-[#2f3638]'
                  }`}
                >
                  BD Local
                </button>
              </div>
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a4136]" />
                <input
                  type="text"
                  placeholder={searchMode === 'api' ? 'Buscar en API externa...' : 'Buscar en ejercicios locales...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1a2123] pl-10 pr-4 py-3 text-[#dde4e6] font-['Lexend'] focus:ring-0 focus:outline-none"
                />
              </div>
              {searchQuery.length >= 2 && (
                <div className="bg-[#1a2123] border border-[#2f3638] mt-1 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                  {loadingEjercicios ? (
                    <div className="px-4 py-3 text-center">
                      <div className="w-6 h-6 border-2 border-[#ff6b00] border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : ejerciciosDisponibles.length === 0 ? (
                    <p className="px-4 py-3 text-[#5a4136] text-sm font-['Lexend'] text-center">
                      Sin resultados
                    </p>
                  ) : (
                    ejerciciosDisponibles.map(ex => {
                      const isLocal = searchMode === 'local';
                      const name = isLocal ? (ex as EjercicioLocal).nombre : (ex as ExerciseFromDB).nameEs;
                      const imageUrl = isLocal
                        ? `/ejercicios/${ex.id}.jpg`
                        : getExerciseImageUrl(ex as ExerciseFromDB);
                      const muscle = isLocal
                        ? (ex as EjercicioLocal).grupoMuscular
                        : (ex as ExerciseFromDB).primaryMusclesEs?.[0] || (ex as ExerciseFromDB).primaryMuscles?.[0];

                      return (
                        <button
                          key={ex.id}
                          onClick={() => {
                            agregarEjercicio(ex, isLocal);
                            setSearchQuery('');
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2f3638] text-left border-b border-[#2f3638] last:border-b-0"
                        >
                          <div className="relative w-12 h-12 flex-shrink-0 bg-[#242b2d] rounded overflow-hidden">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <Dumbbell size={18} className={`absolute inset-0 m-auto ${imageUrl ? 'hidden' : ''}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[#dde4e6] font-['Lexend'] truncate">{name}</p>
                            <p className="text-[#e2bfb0] text-sm font-['Lexend'] truncate">{muscle}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded font-['Lexend'] ${
                            isLocal ? 'bg-[#4caf50]/20 text-[#4caf50]' : 'bg-[#ff6b00]/20 text-[#ff6b00]'
                          }`}>
                            {isLocal ? 'Local' : 'API'}
                          </span>
                          <Plus size={18} className="text-[#ff6b00]" />
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {ejercicios.map((ex, index) => (
                  <div key={ex.id} className="bg-[#1a2123] rounded-xl p-3 flex items-center gap-3 border-l-4 border-[#ff6b00]">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#242b2d] flex-shrink-0">
                      {(() => {
                        const isLocal = ex.isLocal;
                        const imageUrl = isLocal
                          ? `/ejercicios/${ex.ejercicio_id}.jpg`
                          : (ex.ejercicioDb ? getExerciseImageUrl(ex.ejercicioDb) : '');
                        const displayName = isLocal
                          ? (ex.ejercicioLocal?.nombre || 'Sin nombre')
                          : (ex.ejercicioDb?.nameEs || ex.ejercicioDb?.name || 'Sin nombre');
                        return imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={displayName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Dumbbell size={22} className="text-[#a98a7d]" />
                          </div>
                        );
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-[#dde4e6] font-['Lexend'] truncate">
                          {ex.isLocal ? (ex.ejercicioLocal?.nombre || 'Sin nombre') : (ex.ejercicioDb?.nameEs || ex.ejercicioDb?.name || 'Sin nombre')}
                        </h4>
                        <span className={`text-xs px-2 py-0.5 rounded font-['Lexend'] flex-shrink-0 ${
                          ex.isLocal ? 'bg-[#4caf50]/20 text-[#4caf50]' : 'bg-[#ff6b00]/20 text-[#ff6b00]'
                        }`}>
                          {ex.isLocal ? 'Local' : 'API'}
                        </span>
                      </div>
                      <p className="text-xs text-[#e2bfb0] font-['Lexend'] truncate">
                        {ex.isLocal ? ex.ejercicioLocal?.grupoMuscular : (ex.ejercicioDb?.primaryMusclesEs?.[0] || ex.ejercicioDb?.primaryMuscles?.[0])}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          value={ex.series}
                          onChange={(e) => actualizarEjercicio(index, 'series', parseInt(e.target.value) || 0)}
                          min={1}
                          max={10}
                          className="w-12 bg-[#242b2d] border border-[#2f3638] rounded px-2 py-1 text-[#dde4e6] font-['Lexend'] text-center text-sm"
                        />
                        <span className="text-[#a98a7d] text-xs">s</span>
                        <input
                          type="number"
                          value={ex.repeticiones}
                          onChange={(e) => actualizarEjercicio(index, 'repeticiones', parseInt(e.target.value) || 0)}
                          min={1}
                          max={100}
                          className="w-14 bg-[#242b2d] border border-[#2f3638] rounded px-2 py-1 text-[#dde4e6] font-['Lexend'] text-center text-sm"
                        />
                        <span className="text-[#a98a7d] text-xs">r</span>
                        <input
                          type="number"
                          value={ex.peso}
                          onChange={(e) => actualizarEjercicio(index, 'peso', parseFloat(e.target.value) || 0)}
                          min={0}
                          step={0.5}
                          className="w-16 bg-[#242b2d] border border-[#2f3638] rounded px-2 py-1 text-[#dde4e6] font-['Lexend'] text-center text-sm"
                        />
                        <span className="text-[#a98a7d] text-xs">kg</span>
                      </div>
                    </div>
                    <button
                      onClick={() => eliminarEjercicio(index)}
                      className="text-red-500 hover:text-red-400 p-1 flex-shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-20 w-full bg-[#0e1416] p-4 z-40 border-t border-[#2f3638]">
        <button
          onClick={guardarRutina}
          disabled={saving || !alumnoId || !dia || !nombreRutina || ejercicios.length === 0}
          className="w-full bg-[#ff6b00] text-[#351000] py-4 rounded-xl font-['Lexend'] font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
          {saving ? 'Guardando...' : rutinaVersionId ? 'Guardar Nueva Versión' : 'Guardar Rutina'}
        </button>
      </footer>

      <BottomNav />
    </div>
  );
}

interface CrearEjercicioModalProps {
  onClose: () => void;
  onCreated: (ejercicio: EjercicioLocal) => void;
}

function CrearEjercicioModal({ onClose, onCreated }: CrearEjercicioModalProps) {
  const [nombre, setNombre] = useState('');
  const [grupoMuscular, setGrupoMuscular] = useState('');
  const [gruposSecundarios, setGruposSecundarios] = useState<string[]>([]);
  const [equipo, setEquipo] = useState('');
  const [nivel, setNivel] = useState('intermedio');
  const [instrucciones, setInstrucciones] = useState('');
  const [categoria, setCategoria] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagen(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleGruposSecundarios = (grupo: string) => {
    setGruposSecundarios(prev =>
      prev.includes(grupo) ? prev.filter(g => g !== grupo) : [...prev, grupo]
    );
  };

  const handleSubmit = async () => {
    if (!nombre || !grupoMuscular) {
      setError('Nombre y grupo muscular son obligatorios');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const gruposMuscularesJson = JSON.stringify(gruposSecundarios);
      const ejercicioData = {
        nombre,
        grupoMuscular,
        gruposMusculares: gruposMuscularesJson,
        equipo: equipo || null,
        nivel,
        instrucciones,
        categoria: categoria || null,
      };

      const res = await fetch('/api/ejercicios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ejercicioData),
      });

      if (!res.ok) throw new Error('Error creating ejercicio');

      const ejercicio = await res.json();

      if (imagen) {
        const formData = new FormData();
        formData.append('image', imagen);
        formData.append('ejercicioId', ejercicio.id);
        await fetch('/api/ejercicios/upload', {
          method: 'POST',
          body: formData,
        });
      }

      onCreated(ejercicio);
    } catch (err) {
      setError('Error al crear el ejercicio');
      console.error(err);
    }

    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a2123] w-full max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1a2123] border-b border-[#2f3638] p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#dde4e6] font-['Lexend']">Crear Ejercicio</h2>
          <button onClick={onClose} className="text-[#e2bfb0] hover:text-[#dde4e6]">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-2 text-red-500 text-sm font-['Lexend']">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-[#ffb693] uppercase tracking-wider mb-2 font-['Lexend']">Nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Press de Pecho en Máquina"
              className="w-full bg-[#242b2d] border border-[#2f3638] rounded-lg px-4 py-3 text-[#dde4e6] font-['Lexend'] focus:border-[#ff6b00] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#ffb693] uppercase tracking-wider mb-2 font-['Lexend']">Grupo Muscular Principal *</label>
            <select
              value={grupoMuscular}
              onChange={(e) => setGrupoMuscular(e.target.value)}
              className="w-full bg-[#242b2d] border border-[#2f3638] rounded-lg px-4 py-3 text-[#dde4e6] font-['Lexend'] focus:border-[#ff6b00] focus:outline-none"
            >
              <option value="">Seleccionar...</option>
              {GRUPOS_MUSCULARES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#ffb693] uppercase tracking-wider mb-2 font-['Lexend']">Grupos Musculares Secundarios</label>
            <div className="flex flex-wrap gap-2">
              {GRUPOS_MUSCULARES.map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGruposSecundarios(g)}
                  className={`px-3 py-1.5 rounded-full text-sm font-['Lexend'] font-bold transition-colors ${
                    gruposSecundarios.includes(g)
                      ? 'bg-[#ff6b00] text-[#351000]'
                      : 'bg-[#242b2d] text-[#dde4e6] border border-[#2f3638]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#ffb693] uppercase tracking-wider mb-2 font-['Lexend']">Equipo</label>
            <select
              value={equipo}
              onChange={(e) => setEquipo(e.target.value)}
              className="w-full bg-[#242b2d] border border-[#2f3638] rounded-lg px-4 py-3 text-[#dde4e6] font-['Lexend'] focus:border-[#ff6b00] focus:outline-none"
            >
              <option value="">Seleccionar...</option>
              {EQUIPOS.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#ffb693] uppercase tracking-wider mb-2 font-['Lexend']">Nivel *</label>
            <select
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              className="w-full bg-[#242b2d] border border-[#2f3638] rounded-lg px-4 py-3 text-[#dde4e6] font-['Lexend'] focus:border-[#ff6b00] focus:outline-none"
            >
              {NIVELES.map(n => (
                <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#ffb693] uppercase tracking-wider mb-2 font-['Lexend']">Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full bg-[#242b2d] border border-[#2f3638] rounded-lg px-4 py-3 text-[#dde4e6] font-['Lexend'] focus:border-[#ff6b00] focus:outline-none"
            >
              <option value="">Seleccionar...</option>
              {CATEGORIAS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#ffb693] uppercase tracking-wider mb-2 font-['Lexend']">Instrucciones</label>
            <textarea
              value={instrucciones}
              onChange={(e) => setInstrucciones(e.target.value)}
              placeholder="Una instrucción por línea..."
              rows={3}
              className="w-full bg-[#242b2d] border border-[#2f3638] rounded-lg px-4 py-3 text-[#dde4e6] font-['Lexend'] focus:border-[#ff6b00] focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#ffb693] uppercase tracking-wider mb-2 font-['Lexend']">Imagen</label>
            <div className="flex items-center gap-4">
              <label className="flex-1 bg-[#242b2d] border border-dashed border-[#5a4136] rounded-lg px-4 py-6 text-center cursor-pointer hover:border-[#ff6b00] transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImagenChange}
                  className="hidden"
                />
                <ImagePlus size={24} className="mx-auto text-[#5a4136] mb-2" />
                <p className="text-[#5a4136] text-sm font-['Lexend']">
                  {imagen ? 'Cambiar' : 'Subir imagen'}
                </p>
                <p className="text-[#5a4136] text-xs font-['Lexend'] mt-1">jpg, png, webp</p>
              </label>
              {imagenPreview && (
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#242b2d]">
                  <img src={imagenPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#1a2123] border-t border-[#2f3638] p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-['Lexend'] font-bold text-[#dde4e6] bg-[#242b2d] hover:bg-[#2f3638] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-3 rounded-xl font-['Lexend'] font-bold bg-[#ff6b00] text-[#351000] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : null}
            {saving ? 'Creando...' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CrearRutinaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0e1416] text-[#dde4e6] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ff6b00] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CrearRutinaContent />
    </Suspense>
  );
}