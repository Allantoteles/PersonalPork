import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Alumno {
  id: string;
  email: string;
  nombre: string;
  rolId: string | null;
  entrenadorId: string | null;
  createdAt?: string;
}

export interface Atleta extends Alumno {}

export interface RutinaVersion {
  id: string;
  nombre: string;
  descripcion: string | null;
  diaSemana: string;
  rutinaOriginalId: string | null;
  isActive: number;
  createdAt?: string;
}

export interface EjercicioLocal {
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

export interface HistorialRegistro {
  id: string;
  rutinaVersionId: string | null;
  alumnoId: string;
  fecha: string;
  estado: string;
  horaInicio: string | null;
  horaFin: string | null;
  duracionMinutos: number | null;
  observaciones: string | null;
  rutinaNombre: string;
  seriesCompletadas: number;
  totalSeries: number;
  volumenTotal: number;
}

export interface HistorialDetalle {
  id: string;
  rutinaVersionId: string | null;
  alumnoId: string;
  fecha: string;
  estado: string;
  horaInicio: string | null;
  horaFin: string | null;
  duracionMinutos: number | null;
  observaciones: string | null;
  rutinaNombre: string;
  volumenTotal: number;
  seriesCompletadas: number;
  totalSeries: number;
  detalles: DetalleEjercicio[];
}

export interface DetalleEjercicio {
  id: string;
  ejercicioId: string;
  ejercicioNombre: string;
  imagen: string;
  isLocal: boolean;
  series: SerieDetalle[];
}

export interface SerieDetalle {
  numeroSerie: number;
  peso: number;
  repeticiones: number;
  completado: boolean;
}

const API_BASE = '';

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

async function poster<T>(url: string, data: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

async function putter<T>(url: string, data: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

async function patcher<T>(url: string, data: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export function useAlumnos(trainerId: string | null) {
  return useQuery({
    queryKey: ['alumnos', trainerId],
    queryFn: () => fetcher<Alumno[]>(`${API_BASE}/api/alumnos?trainerId=${trainerId}`),
    enabled: !!trainerId,
  });
}

export function useAlumno(alumnoId: string | null) {
  return useQuery({
    queryKey: ['alumno', alumnoId],
    queryFn: () => fetcher<Alumno>(`${API_BASE}/api/alumnos/${alumnoId}`),
    enabled: !!alumnoId,
  });
}

export function useBuscarAlumnos(trainerId: string | null, query: string) {
  return useQuery({
    queryKey: ['alumnos-buscar', query, trainerId],
    queryFn: () => fetcher<Alumno[]>(`${API_BASE}/api/alumnos?trainerId=${trainerId}&search=${encodeURIComponent(query)}`),
    enabled: query.length >= 2 && !!trainerId,
  });
}

export function useAtletasDisponibles() {
  return useQuery({
    queryKey: ['atletas-disponibles'],
    queryFn: () => fetcher<Atleta[]>(`${API_BASE}/api/atletas?disponibles=true`),
  });
}

export function useBuscarAtletas(query: string) {
  return useQuery({
    queryKey: ['buscar-atletas', query],
    queryFn: () => fetcher<Atleta[]>(`${API_BASE}/api/atletas?query=${encodeURIComponent(query)}`),
    enabled: query.length >= 2,
  });
}

export function useAsignarAlumno() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ atletaId, entrenadorId }: { atletaId: string; entrenadorId: string }) =>
      patcher(`${API_BASE}/api/atletas/${atletaId}`, { entrenadorId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumnos'] });
      queryClient.invalidateQueries({ queryKey: ['atletas-disponibles'] });
      queryClient.invalidateQueries({ queryKey: ['alumnos-buscar'] });
    },
  });
}

export function useQuitarAlumno() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (atletaId: string) =>
      patcher(`${API_BASE}/api/atletas/${atletaId}`, { entrenadorId: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumnos'] });
      queryClient.invalidateQueries({ queryKey: ['atletas-disponibles'] });
      queryClient.invalidateQueries({ queryKey: ['alumnos-buscar'] });
    },
  });
}

export function useRutinas(alumnoId: string | null) {
  return useQuery({
    queryKey: ['rutinas', alumnoId],
    queryFn: () => fetcher<RutinaVersion[]>(`${API_BASE}/api/rutinas?alumnoId=${alumnoId}`),
    enabled: !!alumnoId,
  });
}

export function useRutina(rutinaId: string | null) {
  return useQuery({
    queryKey: ['rutina', rutinaId],
    queryFn: () => fetcher<RutinaVersion & { ejercicios: RutinaEjercicio[] }>(`${API_BASE}/api/rutinas/${rutinaId}`),
    enabled: !!rutinaId,
  });
}

export interface RutinaEjercicio {
  id: string;
  ejercicioId: string;
  series: number;
  repeticiones: number;
  peso: number;
  orden: number;
}

export interface CrearRutinaPayload {
  nombre: string;
  descripcion?: string;
  diaSemana: string;
  alumnoId: string;
  entrenadorId: string;
  ejercicios: {
    ejercicioId: string;
    series: number;
    repeticiones: number;
    peso: number;
    orden: number;
  }[];
}

export function useCrearRutina() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CrearRutinaPayload) => poster<{ id: string; rutinaOriginalId: string; success: boolean }>(`${API_BASE}/api/rutinas`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rutinas'] });
      queryClient.invalidateQueries({ queryKey: ['rutinas-atleta'] });
      queryClient.invalidateQueries({ queryKey: ['alumno-rutinas'] });
    },
  });
}

export function useActualizarRutina() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CrearRutinaPayload> }) =>
      putter<{ id: string; rutinaId: string; success: boolean }>(`${API_BASE}/api/rutinas/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rutinas'] });
      queryClient.invalidateQueries({ queryKey: ['rutina'] });
      queryClient.invalidateQueries({ queryKey: ['rutinas-atleta'] });
      queryClient.invalidateQueries({ queryKey: ['alumno-rutinas'] });
    },
  });
}

export function useHistorial(userId: string | null) {
  return useQuery({
    queryKey: ['historial', userId],
    queryFn: () => fetcher<HistorialRegistro[]>(`${API_BASE}/api/historial?userId=${userId}`),
    enabled: !!userId,
  });
}

export function useHistorialDetalle(registroId: string | null) {
  return useQuery({
    queryKey: ['historial-detalle', registroId],
    queryFn: () => fetcher<HistorialDetalle>(`${API_BASE}/api/historial/${registroId}`),
    enabled: !!registroId,
  });
}

export function useEjerciciosLocales(searchQuery: string) {
  return useQuery({
    queryKey: ['ejercicios-locales', searchQuery],
    queryFn: () => fetcher<EjercicioLocal[]>(`${API_BASE}/api/ejercicios?search=${encodeURIComponent(searchQuery)}`),
    enabled: searchQuery.length >= 2,
  });
}

export function useCrearEjercicio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<EjercicioLocal>) => poster<EjercicioLocal>(`${API_BASE}/api/ejercicios`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ejercicios-locales'] });
    },
  });
}

export function useRegistrarSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      rutinaVersionId: string;
      alumnoId: string;
      rutinaEjercicioVersionId: string;
      numeroSerie: number;
      repeticiones: number;
      peso: number;
      completado: boolean;
    }) => poster<{ id: string; registroId: string; success: boolean }>(`${API_BASE}/api/registro`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['historial'] });
      queryClient.invalidateQueries({ queryKey: ['historial-detalle', variables.rutinaVersionId] });
    },
  });
}

export function useCheckEjercicioLocal(exerciseId: string | null) {
  return useQuery({
    queryKey: ['ejercicio-existe', exerciseId],
    queryFn: async () => {
      if (!exerciseId) return false;
      const res = await fetch(`${API_BASE}/api/ejercicios?search=${encodeURIComponent(exerciseId)}`);
      if (!res.ok) return false;
      const ejercicios = await res.json() as EjercicioLocal[];
      return ejercicios.some((e: EjercicioLocal) => e.id === exerciseId);
    },
    enabled: !!exerciseId,
  });
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

export function useEjerciciosApi(searchQuery: string) {
  return useQuery({
    queryKey: ['ejercicios-api', searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];
      const { searchExercises } = await import('./exerciseApi');
      return searchExercises(searchQuery);
    },
    enabled: searchQuery.length >= 2,
    staleTime: 1000 * 60 * 30,
  });
}
