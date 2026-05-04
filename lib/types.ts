import { query } from './turso';

export type { Role, Usuario, Rutina, Ejercicio, RutinaEjercicio } from '@prisma/client';

export type Alumno = Pick<Usuario, 'id' | 'nombre' | 'email'> & {
  rutinas_count?: number;
};

export type ExerciseFromDB = Pick<Ejercicio, 'id' | 'nombre' | 'grupoMuscular' | 'equipo'>;