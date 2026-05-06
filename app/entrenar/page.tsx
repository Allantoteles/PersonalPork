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

interface ExerciseImage {
  id: string;
  imagen: string;
  isLocal: boolean;
}

async function fetchRoutineImages(rutinaVersionId: string): Promise<ExerciseImage[]> {
  try {
    const ejercicios = await query<{ ejercicioId: string }>(
      `SELECT DISTINCT ejercicioId FROM RutinaEjercicioVersion WHERE rutinaVersionId = ? LIMIT 4`,
      [rutinaVersionId]
    );

    const images: ExerciseImage[] = [];

    for (const ej of ejercicios) {
      const isLocal = await checkIsLocalExercise(ej.ejercicioId);

      if (isLocal) {
        images.push({
          id: ej.ejercicioId,
          imagen: `/ejercicios/${ej.ejercicioId}.jpg`,
          isLocal: true,
        });
      } else {
        const apiImages = await getApiExerciseImage(ej.ejercicioId);
        if (apiImages) {
          images.push({
            id: ej.ejercicioId,
            imagen: apiImages,
            isLocal: false,
          });
        }
      }
    }

    return images;
  } catch (error) {
    console.error('Error fetching routine images:', error);
    return [];
  }
}

async function checkIsLocalExercise(exerciseId: string): Promise<boolean> {
  try {
    const result = await query<{ id: string }>(
      `SELECT id FROM Ejercicio WHERE id = ?`,
      [exerciseId]
    );
    return result.length > 0;
  } catch {
    return false;
  }
}

async function getApiExerciseImage(exerciseId: string): Promise<string | null> {
  try {
    const exercises = await fetch(
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
    );
    if (!exercises.ok) return null;

    const data = await exercises.json();
    const exercise = data.find((ex: { id: string }) => ex.id === exerciseId);

    if (exercise?.images?.[0]) {
      return `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${exercise.images[0]}`;
    }
    return null;
  } catch {
    return null;
  }
}

function ExerciseMosaic({ images }: { images: ExerciseImage[] }) {
  if (images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#2f3638]">
        <Dumbbell className="text-[#a98a7d]" size={32} />
      </div>
    );
  }

  const displayImages = images.slice(0, 4);
  const gridClass = displayImages.length === 1
    ? 'grid-cols-1 grid-rows-1'
    : displayImages.length === 2
      ? 'grid-cols-2 grid-rows-1'
      : displayImages.length === 3
        ? 'grid-cols-2 grid-rows-2 [&>*:last-child]:col-span-2'
        : 'grid-cols-2 grid-rows-2';

  return (
    <div className={`w-full h-full grid ${gridClass} gap-0.5`}>
      {displayImages.map((img, index) => (
        <div
          key={`${img.id}-${index}`}
          className="bg-[#2f3638] overflow-hidden"
        >
          <img
            src={img.imagen}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.classList.add('flex', 'items-center', 'justify-center');
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default function AthleteTrainPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [rutinas, setRutinas] = useState<RutinaVersionRow[]>([]);
  const [rutinaImages, setRutinaImages] = useState<Record<string, ExerciseImage[]>>({});
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

      const imagesMap: Record<string, ExerciseImage[]> = {};
      for (const rutina of data) {
        imagesMap[rutina.id] = await fetchRoutineImages(rutina.id);
      }
      setRutinaImages(imagesMap);
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
                    <div className="w-24 h-24 shrink-0 overflow-hidden">
                      <ExerciseMosaic images={rutinaImages[routine.id] || []} />
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