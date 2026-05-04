'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { Plus, Trash2, ChevronRight, User, Save, Search, Dumbbell, Loader2 } from 'lucide-react';
import { useAuth } from '../../components/AuthProvider';
import { searchExercises, ExerciseFromDB, getExerciseImageUrl } from '../../../lib/exerciseApi';

interface Alumno {
  id: string;
  nombre: string;
  email: string;
}

interface EjercicioSeleccionado {
  id: string;
  rutina_id: string;
  ejercicio_id: string;
  series: number;
  repeticiones: number;
  peso: number;
  orden: number;
  ejercicioDb?: ExerciseFromDB;
}

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function CrearRutinaPage() {
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
  const [ejerciciosDisponibles, setEjerciciosDisponibles] = useState<ExerciseFromDB[]>([]);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);
  const [loadingEjercicios, setLoadingEjercicios] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAlumnoDropdown, setShowAlumnoDropdown] = useState(false);
  const [showEjercicioDropdown, setShowEjercicioDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [preloadingAlumno, setPreloadingAlumno] = useState(false);

  const preloadAlumno = useCallback(async (id: string) => {
    setPreloadingAlumno(true);
    const res = await fetch(`/api/alumnos/${id}`);
    if (res.ok) {
      const data = await res.json();
      if (data) {
        setAlumnoId(data.id);
        setAlumnoNombre(data.nombre);
      }
    }
    setPreloadingAlumno(false);
  }, []);

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

  const agregarEjercicio = (exercise: ExerciseFromDB) => {
    const nuevoEjercicio: EjercicioSeleccionado = {
      id: crypto.randomUUID(),
      rutina_id: '',
      ejercicio_id: exercise.id,
      series: 3,
      repeticiones: 10,
      peso: 0,
      orden: ejercicios.length,
      ejercicioDb: exercise,
    };
    setEjercicios([...ejercicios, nuevoEjercicio]);
    setShowEjercicioDropdown(false);
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
      const res = await fetch('/api/rutinas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      });

      if (!res.ok) throw new Error('Error saving');
      router.push('/entrenador/alumnos');
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

  return (
    <div className="min-h-screen bg-[#0e1416] text-[#dde4e6]">
      <Header />

      <main className="pt-20 pb-44 px-5 max-w-md mx-auto">
        <section className="mb-6">
          <p className="text-sm font-bold text-[#ffb693] uppercase tracking-widest mb-2 font-['Lexend']">Entrenador</p>
          <h1 className="text-2xl font-bold text-[#dde4e6] font-['Lexend']">Crear Rutina</h1>
        </section>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-[#ffb693] uppercase tracking-wider mb-2 font-['Lexend']">Alumno</label>
            <button
              onClick={() => setShowAlumnoDropdown(!showAlumnoDropdown)}
              className="w-full bg-[#1a2123] border-b-2 border-[#2f3638] focus:border-[#ff6b00] px-4 py-3 text-[#dde4e6] font-['Lexend'] text-left flex items-center justify-between"
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
                onClick={() => setShowEjercicioDropdown(!showEjercicioDropdown)}
                className="bg-[#ff6b00] text-[#351000] p-2 rounded-full flex items-center justify-center active:scale-95 transition-transform"
              >
                <Plus size={20} />
              </button>
            </div>

            {showEjercicioDropdown && (
              <div className="bg-[#1a2123] border border-[#2f3638] rounded-lg overflow-hidden mb-3">
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a4136]" />
                  <input
                    type="text"
                    placeholder="Buscar ejercicios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent pl-10 pr-4 py-3 text-[#dde4e6] font-['Lexend'] focus:ring-0 focus:outline-none border-b border-[#2f3638]"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {ejerciciosDisponibles.map(ex => (
                    <button
                      key={ex.id}
                      onClick={() => agregarEjercicio(ex)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2f3638] text-left border-b border-[#2f3638] last:border-b-0"
                    >
                      <Dumbbell size={18} className="text-[#ff6b00]" />
                      <div className="flex-1">
                        <p className="font-bold text-[#dde4e6] font-['Lexend']">{ex.nombre}</p>
                        <p className="text-[#e2bfb0] text-sm font-['Lexend']">{ex.grupoMuscular}</p>
                      </div>
                      <Plus size={18} className="text-[#ff6b00]" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {ejercicios.length === 0 ? (
              <p className="text-[#5a4136] text-sm font-['Lexend'] text-center py-4">
                Agrega ejercicios a la rutina
              </p>
            ) : (
              <div className="space-y-3">
                {ejercicios.map((ex, index) => (
                  <div key={ex.id} className="bg-[#1a2123] rounded-xl p-4 border-l-4 border-[#ff6b00]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-[#dde4e6] font-['Lexend']">{ex.ejercicioDb?.nombre || ex.ejercicio_id}</h4>
                        <p className="text-[#e2bfb0] text-sm font-['Lexend']">{ex.ejercicioDb?.grupoMuscular}</p>
                      </div>
                      <button
                        onClick={() => eliminarEjercicio(index)}
                        className="text-red-500 hover:text-red-400 p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-[#ffb693] font-['Lexend']">Series</label>
                        <input
                          type="number"
                          value={ex.series}
                          onChange={(e) => actualizarEjercicio(index, 'series', parseInt(e.target.value) || 0)}
                          min={1}
                          max={10}
                          className="w-full bg-[#242b2d] border border-[#2f3638] rounded px-3 py-2 text-[#dde4e6] font-['Lexend'] text-center"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#ffb693] font-['Lexend']">Reps</label>
                        <input
                          type="number"
                          value={ex.repeticiones}
                          onChange={(e) => actualizarEjercicio(index, 'repeticiones', parseInt(e.target.value) || 0)}
                          min={1}
                          max={100}
                          className="w-full bg-[#242b2d] border border-[#2f3638] rounded px-3 py-2 text-[#dde4e6] font-['Lexend'] text-center"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#ffb693] font-['Lexend']">Peso(kg)</label>
                        <input
                          type="number"
                          value={ex.peso}
                          onChange={(e) => actualizarEjercicio(index, 'peso', parseFloat(e.target.value) || 0)}
                          min={0}
                          step={0.5}
                          className="w-full bg-[#242b2d] border border-[#2f3638] rounded px-3 py-2 text-[#dde4e6] font-['Lexend'] text-center"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
          {saving ? 'Guardando...' : 'Guardar Rutina'}
        </button>
      </footer>

      <BottomNav />
    </div>
  );
}