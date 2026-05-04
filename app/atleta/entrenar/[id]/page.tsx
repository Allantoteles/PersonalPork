'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import BottomNav from '../../../components/BottomNav';
import { Play, Check, ChevronRight, Plus, Minus } from 'lucide-react';

const mockExercises = [
  { id: '1', name: 'Sentadilla con Barra High Bar', sets: '4 x 12', weight: '60kg', completed: true },
  { id: '2', name: 'Prensa de Piernas 45º', sets: '3 x 15', weight: '120kg', completed: false },
  { id: '3', name: 'Extensión de Cuádriceps', sets: '3 x 20', weight: '45kg', completed: false },
];

export default function WorkoutPage() {
  const params = useParams();
  const routineId = params.id as string;
  const [exercises, setExercises] = useState(mockExercises);
  const [progress, setProgress] = useState(25);

  const toggleComplete = (id: string) => {
    setExercises(prev =>
      prev.map(ex => ex.id === id ? { ...ex, completed: !ex.completed } : ex)
    );
    const completedCount = exercises.filter(e => e.completed).length;
    setProgress(Math.round(((completedCount + (exercises.find(e => e.id === id)?.completed ? 0 : 1)) / exercises.length) * 100));
  };

  return (
    <div className="min-h-screen bg-[#0e1416] text-[#dde4e6]">
      <header className="fixed top-0 w-full z-50 bg-[#0e1416] border-b border-[#2f3638] flex justify-between items-center px-5 h-16">
        <div className="flex items-center gap-4">
          <Link href="/atleta/entrenar" className="text-[#dde4e6] active:scale-95 transition-transform">
            <ChevronRight className="rotate-180" size={24} />
          </Link>
          <h1 className="font-bold tracking-tighter text-[#ff6b00] text-xl font-['Lexend']">Press de Banca</h1>
        </div>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-[#5a4136]">
          <img alt="Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyTiK6DFzwLnZdsAfiAUCDUpZh7rBpFRvYS0k2DngrDvoLmb0xBzCltgSss-qwJWoNFRVFwTKK_zYlWMXLHPf7a-hsd7Gmlq8paafsY28aVswNeMcDS8UnpQS786INjq2Alj-1043MjtRb79SrMAKDv-eX42KtdVzsb6dZ2s7JHLdF3czc4lor7keexfTtMy_dC72LB-BYubVAMefP0xwAup8e-R0UWDj80B_qqu4wZ72fvmg9doiLoilhA0Cc6ySatMQV5wjVYjk" />
        </div>
      </header>

      <main className="pt-20 pb-32 px-5 max-w-md mx-auto">
        <section className="w-full bg-[#1a2123] rounded-xl p-6 border border-[#ff6b00]/20 mb-6" style={{ boxShadow: '0 0 20px rgba(255, 107, 0, 0.15)' }}>
          <div className="flex justify-between items-end mb-4">
            <span className="text-sm font-bold text-[#ff6b00] uppercase tracking-widest font-['Lexend']">Rest Timer</span>
            <span className="text-[#e2bfb0] text-sm font-['Lexend']">Next: Work Set 3</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-6xl leading-none text-[#ff6b00] tracking-tighter font-['Lexend']">01:45</div>
            <div className="flex gap-3">
              <button className="w-12 h-12 rounded-full border border-[#a98a7d] flex items-center justify-center active:scale-90 transition-all text-[#dde4e6]">
                <Plus size={20} />
              </button>
              <button className="w-12 h-12 rounded-full bg-[#ff6b00] flex items-center justify-center active:scale-90 transition-all">
                <Play size={20} fill="#351000" className="text-[#351000]" />
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#161d1f] p-4 rounded-lg border-l-4 border-[#5a4136]">
            <p className="text-[10px] font-bold text-[#e2bfb0] uppercase mb-1 font-['Lexend']">Previous Best</p>
            <p className="text-2xl font-bold text-[#dde4e6] font-['Lexend']">100<span className="text-sm ml-1 text-[#e2bfb0]">kg</span></p>
          </div>
          <div className="bg-[#161d1f] p-4 rounded-lg border-l-4 border-[#5a4136]">
            <p className="text-[10px] font-bold text-[#e2bfb0] uppercase mb-1 font-['Lexend']">Last Volume</p>
            <p className="text-2xl font-bold text-[#dde4e6] font-['Lexend']">2,400<span className="text-sm ml-1 text-[#e2bfb0]">kg</span></p>
          </div>
        </section>

        <section className="flex flex-col gap-3 mb-6">
          <div className="grid grid-cols-12 px-3 py-2 text-[#e2bfb0] text-[12px] uppercase tracking-wider font-['Lexend']">
            <div className="col-span-2">Set</div>
            <div className="col-span-4 text-center">Previous</div>
            <div className="col-span-3 text-center">KG</div>
            <div className="col-span-3 text-center">Reps</div>
          </div>

          {exercises.map((exercise, index) => (
            <div
              key={exercise.id}
              className={`grid grid-cols-12 items-center p-4 rounded-xl border-l-4 ${
                exercise.completed
                  ? 'bg-[#1a2123] border-[#ff6b00]'
                  : index === 1
                  ? 'bg-[#1a2123] border-[#ff6b00] ring-1 ring-[#ff6b00]'
                  : 'bg-[#080f11]/50 border-[#5a4136] opacity-60'
              }`}
            >
              <div className={`col-span-2 text-lg font-['Lexend'] ${exercise.completed ? 'text-[#ff6b00]' : index === 1 ? 'text-[#ff6b00]' : 'text-[#e2bfb0]'}`}>
                {index + 1}
              </div>
              <div className="col-span-4 text-center text-[#e2bfb0] italic font-['Lexend']">{exercise.weight} x {exercise.sets.split(' x ')[1]}</div>
              <div className="col-span-3 px-1">
                <input
                  className="w-full h-12 bg-[#2f3638] border-b-2 border-[#ff6b00] text-center text-[#dde4e6] font-['Lexend'] focus:ring-0 focus:outline-none"
                  placeholder={exercise.weight}
                  type="number"
                />
              </div>
              <div className="col-span-3 px-1">
                <input
                  className="w-full h-12 bg-[#2f3638] border-b-2 border-[#ff6b00] text-center text-[#dde4e6] font-['Lexend'] focus:ring-0 focus:outline-none"
                  placeholder={exercise.sets.split(' x ')[1]}
                  type="number"
                />
              </div>
            </div>
          ))}
        </section>

        <section className="bg-[#1a2123] p-4 rounded-xl mb-6">
          <h3 className="font-bold text-[#e2bfb0] uppercase text-center mb-3 font-['Lexend']">Weight Adjuster</h3>
          <div className="flex items-center justify-between">
            <button className="w-16 h-16 bg-[#242b2d] rounded-lg flex items-center justify-center active:bg-white/10 transition-colors">
              <Minus size={24} className="text-[#dde4e6]" />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-5xl text-[#dde4e6] font-['Lexend']">85.0</span>
              <span className="text-sm font-bold text-[#ff6b00] uppercase font-['Lexend']">Kilograms</span>
            </div>
            <button className="w-16 h-16 bg-[#242b2d] rounded-lg flex items-center justify-center active:bg-white/10 transition-colors">
              <Plus size={24} className="text-[#dde4e6]" />
            </button>
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 w-full bg-[#0e1416] p-4 flex flex-col gap-3 z-50 border-t border-[#2f3638]">
        <button className="w-full h-14 bg-[#ff6b00] text-[#351000] font-bold uppercase tracking-widest rounded-lg active:scale-95 transition-transform flex items-center justify-center gap-2 font-['Lexend']">
          Finalizar Serie
          <Check size={20} />
        </button>
        <button className="w-full h-14 border border-[#a98a7d] text-[#dde4e6] font-medium uppercase tracking-wider rounded-lg active:scale-95 transition-transform flex items-center justify-center gap-2 font-['Lexend']">
          Siguiente Ejercicio
          <ChevronRight size={20} />
        </button>
      </footer>
    </div>
  );
}