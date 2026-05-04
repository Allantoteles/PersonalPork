'use client';

import Link from 'next/link';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { Dumbbell, ChevronRight } from 'lucide-react';

const routines = [
  { id: '1', name: 'Pierna - Cuádriceps', description: '6 Ejercicios • 65 min', calories: 420 },
  { id: '2', name: 'Empuje / Pecho', description: '6 Ejercicios • 55 min', calories: 380 },
  { id: '3', name: 'Tracción & Espalda', description: '5 Ejercicios • 50 min', calories: 350 },
];

export default function AthleteTrainPage() {
  return (
    <div className="min-h-screen bg-[#0e1416] text-[#dde4e6]">
      <Header />

      <main className="pt-20 pb-32 px-5 max-w-md mx-auto">
        <section className="mb-10">
          <p className="text-sm font-bold text-[#ffb693] uppercase tracking-widest mb-2 font-['Lexend']">Entrenamiento Hoy</p>
          <h1 className="text-2xl font-bold text-[#dde4e6] leading-none font-['Lexend']">Selecciona tu Rutina</h1>
        </section>

        <div className="flex flex-col gap-3">
          {routines.map((routine) => (
            <Link
              key={routine.id}
              href={`/atleta/entrenar/${routine.id}`}
              className="bg-[#242b2d] rounded-lg overflow-hidden border-l-4 border-[#ff6b00] flex active:scale-[0.98] transition-transform duration-150"
            >
              <div className="w-24 h-24 shrink-0 bg-[#2f3638] relative overflow-hidden flex items-center justify-center">
                <Dumbbell className="text-[#a98a7d]" size={32} />
              </div>
              <div className="p-4 flex flex-col justify-center flex-1">
                <h3 className="font-bold text-[#dde4e6] mb-1 font-['Lexend']">{routine.name}</h3>
                <div className="flex items-center gap-4">
                  <span className="text-[#e2bfb0] text-sm font-bold font-['Lexend']">{routine.description}</span>
                </div>
              </div>
              <div className="flex items-center px-4">
                <ChevronRight className="text-[#a98a7d]" size={24} />
              </div>
            </Link>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}