'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { User, ChevronRight, Plus, Search, X, TrendingUp, Trash2, Calendar } from 'lucide-react';
import { useAuth } from '../../components/AuthProvider';
import { Alumno } from '../../../../lib/types';

async function getAlumnos(entrenadorId: string): Promise<Alumno[]> {
  const res = await fetch(`/api/alumnos?trainerId=${entrenadorId}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

async function getAtletasDisponibles(): Promise<Alumno[]> {
  const res = await fetch('/api/atletas?disponibles=true');
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

async function buscarAtletas(query: string): Promise<Alumno[]> {
  const res = await fetch(`/api/atletas?query=${query}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

async function asignarAlumno(atletaId: string, entrenadorId: string) {
  const res = await fetch(`/api/atletas/${atletaId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entrenadorId }),
  });
  if (!res.ok) throw new Error('Failed to assign');
}

async function quitarAlumno(atletaId: string) {
  const res = await fetch(`/api/atletas/${atletaId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entrenadorId: null }),
  });
  if (!res.ok) throw new Error('Failed to remove');
}

export default function AlumnosPage() {
  const { role, isLoading: authLoading, trainerId } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);
  const [showActionsModal, setShowActionsModal] = useState(false);

  const { data: misAlumnos = [], isLoading: loadingMisAlumnos } = useQuery({
    queryKey: ['alumnos', trainerId],
    queryFn: () => getAlumnos(trainerId!),
    enabled: !!trainerId,
  });

  const { data: atletasDisponibles = [] } = useQuery({
    queryKey: ['atletas-disponibles'],
    queryFn: getAtletasDisponibles,
  });

  const { data: searchResults = [] } = useQuery({
    queryKey: ['buscar-atletas', searchQuery],
    queryFn: () => buscarAtletas(searchQuery),
    enabled: searchQuery.length >= 2,
  });

  const asignarMutation = useMutation({
    mutationFn: ({ atletaId }: { atletaId: string }) => asignarAlumno(atletaId, trainerId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumnos'] });
      queryClient.invalidateQueries({ queryKey: ['atletas-disponibles'] });
      setSearchQuery('');
      setSearchResults([]);
      setShowAddSection(false);
    },
  });

  const quitarMutation = useMutation({
    mutationFn: (atletaId: string) => quitarAlumno(atletaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumnos'] });
      queryClient.invalidateQueries({ queryKey: ['atletas-disponibles'] });
      setShowActionsModal(false);
      setSelectedAlumno(null);
    },
  });

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

  if (authLoading || loadingMisAlumnos) {
    return (
      <div className="min-h-screen bg-[#0e1416] text-[#dde4e6] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ff6b00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e1416] text-[#dde4e6]">
      <Header />

      <main className="pt-20 pb-32 px-5 max-w-md mx-auto">
        <section className="mb-8">
          <p className="text-sm font-bold text-[#ffb693] uppercase tracking-widest mb-2 font-['Lexend']">Entrenador</p>
          <h1 className="text-2xl font-bold text-[#dde4e6] leading-none font-['Lexend']">Mis Alumnos</h1>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#dde4e6] mb-4 font-['Lexend']">
            Mis Alumnos ({misAlumnos.length})
          </h2>

          {misAlumnos.length === 0 ? (
            <div className="bg-[#1a2123]/50 rounded-xl p-6 border border-dashed border-[#5a4136] text-center">
              <User size={40} className="mx-auto text-[#5a4136] mb-3" />
              <p className="text-[#e2bfb0] font-['Lexend]">No tienes alumnos asignados</p>
              <p className="text-[#5a4136] text-sm mt-1 font-['Lexend']">
                Agrega atletas de la sección de abajo
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {misAlumnos.map((alumno) => (
                <button
                  key={alumno.id}
                  onClick={() => {
                    setSelectedAlumno(alumno);
                    setShowActionsModal(true);
                  }}
                  className="bg-[#1a2123] rounded-xl p-4 flex items-center gap-4 hover:bg-[#242b2d] transition-colors border-l-4 border-[#ff6b00] text-left w-full"
                >
                  <div className="w-12 h-12 bg-[#242b2d] rounded-full flex items-center justify-center">
                    <User size={24} className="text-[#ff6b00]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#dde4e6] font-['Lexend']">{alumno.nombre}</h3>
                    <p className="text-[#e2bfb0] text-sm font-['Lexend'] truncate">{alumno.email}</p>
                  </div>
                  <ChevronRight className="text-[#e2bfb0]" size={20} />
                </button>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#dde4e6] font-['Lexend']">
              Agregar Alumnos
            </h2>
            <button
              onClick={() => setShowAddSection(!showAddSection)}
              className="bg-[#ff6b00] text-[#351000] p-2 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            >
              {showAddSection ? <X size={20} /> : <Plus size={20} />}
            </button>
          </div>

          {showAddSection && (
            <div className="mb-4">
              <div className="relative mb-3">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a4136]" />
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1a2123] border-b-2 border-[#2f3638] focus:border-[#ff6b00] pl-10 pr-4 py-3 text-[#dde4e6] font-['Lexend'] focus:ring-0 focus:outline-none"
                />
              </div>

              {searchResults.length > 0 && (
                <div className="bg-[#1a2123] rounded-lg border border-[#2f3638] overflow-hidden mb-3 max-h-60 overflow-y-auto">
                  {searchResults.map((atleta) => (
                    <button
                      key={atleta.id}
                      onClick={() => asignarMutation.mutate({ atletaId: atleta.id })}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2f3638] text-left border-b border-[#2f3638] last:border-b-0"
                    >
                      <User size={18} className="text-[#ff6b00]" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#dde4e6] font-['Lexend']">{atleta.nombre}</p>
                        <p className="text-[#e2bfb0] text-sm font-['Lexend'] truncate">{atleta.email}</p>
                      </div>
                      <Plus size={18} className="text-[#ff6b00]" />
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.length >= 2 && searchResults.length === 0 && (
                <p className="text-[#e2bfb0] text-sm font-['Lexend'] text-center py-2">
                  No se encontraron atletas disponibles
                </p>
              )}

              {atletasDisponibles.length > 0 && !searchQuery && (
                <div className="flex flex-col gap-2">
                  {atletasDisponibles.slice(0, 5).map((atleta) => (
                    <button
                      key={atleta.id}
                      onClick={() => asignarMutation.mutate({ atletaId: atleta.id })}
                      className="bg-[#1a2123]/50 rounded-lg px-4 py-3 flex items-center gap-3 hover:bg-[#2f3638] transition-colors border border-dashed border-[#5a4136] w-full"
                    >
                      <User size={18} className="text-[#5a4136]" />
                      <div className="flex-1 text-left">
                        <p className="font-bold text-[#dde4e6] font-['Lexend']">{atleta.nombre}</p>
                        <p className="text-[#5a4136] text-sm font-['Lexend']">{atleta.email}</p>
                      </div>
                      <Plus size={18} className="text-[#ff6b00]" />
                    </button>
                  ))}
                </div>
              )}

              {atletasDisponibles.length === 0 && !searchQuery && (
                <p className="text-[#e2bfb0] text-sm font-['Lexend'] text-center py-4">
                  No hay atletas disponibles para agregar
                </p>
              )}
            </div>
          )}
        </section>
      </main>

      {showActionsModal && selectedAlumno && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center">
          <div className="bg-[#1a2123] w-full max-w-md rounded-t-2xl p-6 animate-slideUp">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-[#242b2d] rounded-full flex items-center justify-center">
                <User size={28} className="text-[#ff6b00]" />
              </div>
              <div>
                <h3 className="font-bold text-[#dde4e6] text-xl font-['Lexend']">{selectedAlumno.nombre}</h3>
                <p className="text-[#e2bfb0] text-sm font-['Lexend']">{selectedAlumno.email}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href={`/entrenador/alumnos/${selectedAlumno.id}`}
                className="flex items-center gap-3 bg-[#242b2d] px-4 py-4 rounded-xl hover:bg-[#2f3638] transition-colors"
              >
                <Calendar size={22} className="text-[#ff6b00]" />
                <span className="font-bold text-[#dde4e6] font-['Lexend']">Ver Rutinas</span>
              </Link>

              <Link
                href={`/entrenador/progreso?alumno=${selectedAlumno.id}`}
                className="flex items-center gap-3 bg-[#242b2d] px-4 py-4 rounded-xl hover:bg-[#2f3638] transition-colors"
              >
                <TrendingUp size={22} className="text-[#ff6b00]" />
                <span className="font-bold text-[#dde4e6] font-['Lexend']">Dashboard</span>
              </Link>

              <button
                onClick={() => quitarMutation.mutate(selectedAlumno.id)}
                className="flex items-center gap-3 bg-red-500/20 px-4 py-4 rounded-xl hover:bg-red-500/30 transition-colors"
              >
                <Trash2 size={22} className="text-red-500" />
                <span className="font-bold text-red-500 font-['Lexend']">Quitar de mis alumnos</span>
              </button>
            </div>

            <button
              onClick={() => {
                setShowActionsModal(false);
                setSelectedAlumno(null);
              }}
              className="w-full mt-4 py-3 text-[#e2bfb0] font-bold font-['Lexend']"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <BottomNav />

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}