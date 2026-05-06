import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { query, execute } from './turso';

export interface UsuarioRow {
  id: string;
  email: string;
  nombre: string;
  rolId: string | null;
  entrenadorId: string | null;
}

export interface RutinaVersionRow {
  id: string;
  nombre: string;
  descripcion: string | null;
  diaSemana: string;
  rutinaOriginalId: string | null;
  isActive: number;
}

export interface RutinaEjercicioVersionRow {
  id: string;
  rutinaVersionId: string;
  ejercicioId: string;
  series: number;
  repeticiones: number;
  peso: number;
  orden: number;
}

export interface ExerciseImage {
  id: string;
  imagen: string;
  isLocal: boolean;
}

async function fetchRoutineImages(rutinaVersionId: string): Promise<ExerciseImage[]> {
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
}

async function checkIsLocalExercise(exerciseId: string): Promise<boolean> {
  const result = await query<{ id: string }>(
    `SELECT id FROM Ejercicio WHERE id = ?`,
    [exerciseId]
  );
  return result.length > 0;
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

export function useAlumnoDb(alumnoId: string | null) {
  return useQuery({
    queryKey: ['alumno-db', alumnoId],
    queryFn: async () => {
      if (!alumnoId) return null;
      const usuarios = await query<UsuarioRow>(`SELECT * FROM Usuario WHERE id = ?`, [alumnoId]);
      return usuarios[0] || null;
    },
    enabled: !!alumnoId,
  });
}

export function useAlumnoRutinas(alumnoId: string | null) {
  return useQuery({
    queryKey: ['alumno-rutinas', alumnoId],
    queryFn: async () => {
      if (!alumnoId) return [];
      const rutinasData = await query<RutinaVersionRow>(
        `SELECT rv.* FROM RutinaVersion rv
         INNER JOIN Rutina r ON rv.rutinaOriginalId = r.id
         WHERE r.alumnoId = ? AND rv.isActive = 1
         ORDER BY rv.diaSemana ASC`,
        [alumnoId]
      );
      return rutinasData;
    },
    enabled: !!alumnoId,
  });
}

export function useRutinasAtleta(userId: string | null) {
  return useQuery({
    queryKey: ['rutinas-atleta', userId],
    queryFn: async () => {
      if (!userId) return [];
      const data = await query<RutinaVersionRow>(
        `SELECT rv.id, rv.nombre, rv.descripcion, rv.diaSemana FROM RutinaVersion rv
         INNER JOIN Rutina r ON rv.rutinaOriginalId = r.id
         WHERE r.alumnoId = ? AND rv.isActive = 1
         ORDER BY rv.diaSemana ASC`,
        [userId]
      );
      return data;
    },
    enabled: !!userId,
  });
}

export function useRutinaDetalleDb(rutinaVersionId: string | null) {
  return useQuery({
    queryKey: ['rutina-detalle-db', rutinaVersionId],
    queryFn: async () => {
      if (!rutinaVersionId) return null;
      const rutinasData = await query<RutinaVersionRow>(
        `SELECT * FROM RutinaVersion WHERE id = ?`,
        [rutinaVersionId]
      );
      if (rutinasData.length === 0) return null;

      const rutinaEjercicios = await query<RutinaEjercicioVersionRow>(
        `SELECT * FROM RutinaEjercicioVersion WHERE rutinaVersionId = ? ORDER BY orden ASC`,
        [rutinaVersionId]
      );

      return {
        ...rutinasData[0],
        ejercicios: rutinaEjercicios,
      };
    },
    enabled: !!rutinaVersionId,
  });
}

export function useRoutineImages(rutinaVersionId: string | null) {
  return useQuery({
    queryKey: ['rutina-imagenes', rutinaVersionId],
    queryFn: async () => {
      if (!rutinaVersionId) return [];
      return fetchRoutineImages(rutinaVersionId);
    },
    enabled: !!rutinaVersionId,
    staleTime: 1000 * 60 * 30,
  });
}
