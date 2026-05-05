const MUSCLE_TRANSLATION: Record<string, string> = {
  abdominals: 'abdominales',
  abductors: 'abductores',
  adductors: 'aductores',
  biceps: 'bíceps',
  calves: 'pantorrillas',
  chest: 'pecho',
  forearms: 'antebrazos',
  glutes: 'glúteos',
  hamstrings: 'isquiotibiales',
  lats: 'dorsales',
  lower_back: 'espalda baja',
  middle_back: 'espalda media',
  neck: 'cuello',
  obliques: 'oblicuos',
  quadriceps: 'cuádriceps',
  shoulders: 'hombros',
  traps: 'trapecios',
  triceps: 'tríceps',
};

const EXERCISE_NAME_TRANSLATION: Record<string, string> = {
  'Barbell Bench Press': 'Press de Banca con Barra',
  'Barbell Squat': 'Sentadilla con Barra',
  'Barbell Deadlift': 'Peso Muerto con Barra',
  'Barbell Curl': 'Curl con Barra',
  'Barbell Row': 'Remo con Barra',
  'Barbell Shoulder Press': 'Press Militar con Barra',
  'Dumbbell Bench Press': 'Press de Banca con Mancuernas',
  'Dumbbell Curl': 'Curl con Mancuernas',
  'Dumbbell Row': 'Remo con Mancuerna',
  'Dumbbell Shoulder Press': 'Press Militar con Mancuernas',
  'Lat Pulldown': 'Jalón al Pecho',
  'Seated Cable Row': 'Remo Sentado en Polea',
  'Leg Press': 'Prensa de Piernas',
  'Leg Extension': 'Extensión de Piernas',
  'Leg Curl': 'Curl de Piernas',
  'Calf Raise': 'Elevación de Talones',
  'Plank': 'Plancha',
  'Push-Up': 'Flexiones',
  'Pull-Up': 'Dominadas',
  'Chin-Up': 'Dominadas Supinas',
  'Dips': 'Fondos',
  'Russian Twist': 'Giro Ruso',
  'Lunges': 'Zancadas',
  'Hip Thrust': 'Empujón de Cadera',
  'Face Pull': 'Jalón Facial',
  'Lateral Raise': 'Elevaciones Laterales',
  'Front Raise': 'Elevaciones Frontales',
  'Tricep Pushdown': 'Extensión de Tríceps',
  'Hammer Curl': 'Curl Martillo',
  'Preacher Curl': 'Curl Predicador',
  'Shrugs': 'Encogimientos',
  'Good Morning': 'Buenos Días',
  'Hyperextension': 'Hiperextensión',
  'Cable Fly': 'Aperturas en Polea',
  'Pec Deck': 'Máquina de Pec',
  'T-Bar Row': 'Remo en T',
  'Incline Bench Press': 'Press Inclinado',
  'Decline Bench Press': 'Press Declinado',
  'Reverse Crunch': 'Crunch Inverso',
  'Bicycle Crunch': 'Crunch Bicicleta',
  'Mountain Climber': 'Escalador',
  'Burpee': 'Burpee',
  'Box Jump': 'Salto al Cajón',
  'Kettlebell Swing': 'Swing con Pesadilla',
  'Turkish Get-Up': 'Turkish Get-Up',
  'Wall Ball': 'Pelota en Pared',
  'Wall Sit': 'Sentadilla en Pared',
  'Squat': 'Sentadilla',
  'Deadlift': 'Peso Muerto',
  'Clean': 'Clean',
  'Snatch': 'Snatch',
  'Clean and Jerk': 'Clean y Jerk',
};

const CDN_URL =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';

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

let cachedExercises: ExerciseFromDB[] | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 1000 * 60 * 60 * 24;

export function translateMuscle(muscle: string): string {
  const normalized = muscle.toLowerCase().replace(/[^a-z_]/g, '');
  return MUSCLE_TRANSLATION[normalized] || muscle;
}

export function translateExerciseName(name: string): string {
  const normalized = name.replace(/[^a-zA-Z\s]/g, '').trim();
  return EXERCISE_NAME_TRANSLATION[normalized] || name;
}

export function translateExercise(exercise: {
  id: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string | null;
  level: string;
  instructions: string[];
  category: string;
  images: string[];
}): ExerciseFromDB {
  return {
    id: exercise.id,
    name: exercise.name,
    nameEs: translateExerciseName(exercise.name),
    primaryMuscles: exercise.primaryMuscles,
    primaryMusclesEs: exercise.primaryMuscles.map(translateMuscle),
    secondaryMuscles: exercise.secondaryMuscles,
    secondaryMusclesEs: exercise.secondaryMuscles.map(translateMuscle),
    equipment: exercise.equipment,
    level: exercise.level,
    instructions: exercise.instructions,
    category: exercise.category,
    images: exercise.images,
  };
}

export async function fetchExercises(): Promise<ExerciseFromDB[]> {
  const now = Date.now();

  if (cachedExercises && now - cacheTime < CACHE_DURATION) {
    return cachedExercises;
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('exercises_cache');
    if (cached) {
      try {
        const { exercises, timestamp } = JSON.parse(cached);
        if (now - timestamp < CACHE_DURATION) {
          cachedExercises = exercises as ExerciseFromDB[];
          cacheTime = timestamp;
return cachedExercises as ExerciseFromDB[];
        }
      } catch (e) {
        console.warn('Error reading cache:', e);
      }
    }
  }

  try {
    const response = await fetch(CDN_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    cachedExercises = data.map(translateExercise);
    cacheTime = now;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('exercises_cache', JSON.stringify({
          exercises: cachedExercises,
          timestamp: cacheTime,
        }));
      } catch (e) {
        console.warn('Error saving to cache:', e);
      }
    }

    return cachedExercises as ExerciseFromDB[];
  } catch (error) {
    if (cachedExercises) {
      return cachedExercises as ExerciseFromDB[];
    }
    console.error('Failed to fetch exercises:', error);
    throw error;
  }
}

export async function searchExercises(query: string): Promise<ExerciseFromDB[]> {
  const exercises = await fetchExercises();
  const normalizedQuery = query.toLowerCase().trim();

  if (normalizedQuery.length < 2) return [];

  return exercises
    .filter((ex) => {
      const nameMatch =
        ex.name.toLowerCase().includes(normalizedQuery) ||
        ex.nameEs.toLowerCase().includes(normalizedQuery);
      const muscleMatch =
        ex.primaryMuscles.some((m) => m.toLowerCase().includes(normalizedQuery)) ||
        ex.primaryMusclesEs.some((m) => m.toLowerCase().includes(normalizedQuery));
      return nameMatch || muscleMatch;
    })
    .slice(0, 20);
}

export function getExerciseImageUrl(exercise: ExerciseFromDB): string {
  if (!exercise.images || exercise.images.length === 0) {
    return '';
  }
  return `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${exercise.images[0]}`;
}