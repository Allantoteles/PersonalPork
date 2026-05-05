export interface Alumno {
  id: string;
  nombre: string;
  email: string;
  rutinas_count?: number;
}

export interface ExerciseFromDB {
  id: string;
  name: string;
  nameEs: string;
  primaryMuscles: string[];
  primaryMusclesEs: string[];
  secondaryMuscles: string[];
  secondaryMusclesEs: string[];
  equipment: string | null;
  level: string;
  instructions: string[];
  category: string;
  images: string[];
}