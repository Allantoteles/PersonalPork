'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, ArrowRight, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'entrenador' | 'atleta'>('atleta');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/login');
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#0e1416] text-[#dde4e6] flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        <div className="mb-10">
          <h1 className="text-5xl font-extrabold text-[#ff6b00] italic uppercase tracking-tighter font-['Lexend']">
            IRON_FOCUS
          </h1>
          <p className="text-sm font-bold text-[#e2bfb0] uppercase tracking-widest mt-2 font-['Lexend']">
            Regístrate gratis
          </p>
        </div>

        <form className="w-full space-y-4" onSubmit={handleSubmit}>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a4136] group-focus-within:text-[#ff6b00] transition-colors" size={20} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-14 bg-[#1a2123] border-b-2 border-[#2f3638] focus:border-[#ff6b00] text-[#dde4e6] pl-12 pr-4 outline-none transition-all placeholder:text-[#5a4136] font-['Lexend']"
              placeholder="Nombre completo"
              required
            />
          </div>

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a4136] group-focus-within:text-[#ff6b00] transition-colors" size={20} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 bg-[#1a2123] border-b-2 border-[#2f3638] focus:border-[#ff6b00] text-[#dde4e6] pl-12 pr-4 outline-none transition-all placeholder:text-[#5a4136] font-['Lexend']"
              placeholder="Correo Electrónico"
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a4136] group-focus-within:text-[#ff6b00] transition-colors" size={20} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 bg-[#1a2123] border-b-2 border-[#2f3638] focus:border-[#ff6b00] text-[#dde4e6] pl-12 pr-12 outline-none transition-all placeholder:text-[#5a4136] font-['Lexend']"
              placeholder="Contraseña"
              required
              minLength={6}
            />
            <EyeOff className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5a4136] cursor-pointer hover:text-[#dde4e6] transition-colors" size={20} />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={() => setRole('atleta')}
              className={`py-3 px-4 rounded-lg font-bold uppercase text-[12px] transition font-['Lexend'] ${
                role === 'atleta'
                  ? 'bg-[#ff6b00] text-[#351000]'
                  : 'bg-[#1a2123] text-[#e2bfb0] border border-[#5a4136]'
              }`}
            >
              Atleta
            </button>
            <button
              type="button"
              onClick={() => setRole('entrenador')}
              className={`py-3 px-4 rounded-lg font-bold uppercase text-[12px] transition font-['Lexend'] ${
                role === 'entrenador'
                  ? 'bg-[#ff6b00] text-[#351000]'
                  : 'bg-[#1a2123] text-[#e2bfb0] border border-[#5a4136]'
              }`}
            >
              Entrenador
            </button>
          </div>

          <button
            type="submit"
            className="w-full h-[56px] bg-[#ff6b00] text-[#351000] font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform mt-10 font-['Lexend']"
          >
            CREAR CUENTA
            <ArrowRight size={20} />
          </button>
        </form>

        <p className="mt-10 text-[#e2bfb0] font-['Lexend']">
          ¿Ya tienes cuenta?
          <Link className="text-[#ff6b00] font-bold hover:underline ml-1" href="/login">
            Inicia sesión
          </Link>
        </p>
      </div>

      <div className="w-full h-2 bg-[#ff6b00] fixed bottom-0 left-0"></div>
    </main>
  );
}