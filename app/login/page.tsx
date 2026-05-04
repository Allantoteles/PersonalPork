'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
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
            Forge Your Reality
          </p>
        </div>

        <div className="w-full relative h-64 mb-10 overflow-hidden rounded-xl border border-[#2f3638]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b00]/20 to-[#1a2123]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full bg-[#1a2123]/50"></div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1416] via-transparent to-transparent"></div>
        </div>

        <form className="w-full space-y-4" onSubmit={handleSubmit}>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a4136] group-focus-within:text-[#ff6b00] transition-colors" size={20} />
            <input
              className="w-full h-14 bg-[#1a2123] border-b-2 border-[#2f3638] focus:border-[#ff6b00] text-[#dde4e6] pl-12 pr-4 outline-none transition-all placeholder:text-[#5a4136] font-['Lexend']"
              placeholder="Correo Electrónico"
              type="email"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a4136] group-focus-within:text-[#ff6b00] transition-colors" size={20} />
            <input
              className="w-full h-14 bg-[#1a2123] border-b-2 border-[#2f3638] focus:border-[#ff6b00] text-[#dde4e6] pl-12 pr-12 outline-none transition-all placeholder:text-[#5a4136] font-['Lexend']"
              placeholder="Contraseña"
              type="password"
            />
            <EyeOff className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5a4136] cursor-pointer hover:text-[#dde4e6] transition-colors" size={20} />
          </div>

          <div className="flex justify-end pt-2">
            <a className="text-sm font-bold text-[#a98a7d] hover:text-[#ff6b00] transition-colors font-['Lexend']" href="#">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button
            className="w-full h-[56px] bg-[#ff6b00] text-[#351000] font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform mt-10 font-['Lexend']"
            type="submit"
          >
            ENTRAR
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="w-full flex items-center gap-4 my-6">
          <div className="h-[1px] flex-grow bg-[#2f3638]"></div>
          <span className="text-[10px] font-bold text-[#5a4136] uppercase">O accede con</span>
          <div className="h-[1px] flex-grow bg-[#2f3638]"></div>
        </div>

        <div className="w-full grid grid-cols-2 gap-4">
          <button className="h-[56px] border border-[#2f3638] flex items-center justify-center gap-3 bg-[#1a2123] hover:bg-white/5 transition-colors active:scale-95">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
              <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
              <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
              <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.705175 1.23746264,17.3349879 L5.27698177,14.2678769 Z"/>
            </svg>
            <span className="font-bold text-[#dde4e6] uppercase text-[12px] font-['Lexend']">Google</span>
          </button>
          <button className="h-[56px] border border-[#2f3638] flex items-center justify-center gap-3 bg-[#1a2123] hover:bg-white/5 transition-colors active:scale-95">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="font-bold text-[#dde4e6] uppercase text-[12px] font-['Lexend']">Facebook</span>
          </button>
        </div>

        <p className="mt-10 text-[#e2bfb0] font-['Lexend']">
          ¿No tienes cuenta?
          <Link className="text-[#ff6b00] font-bold hover:underline ml-1" href="/register">
            Regístrate gratis
          </Link>
        </p>
      </div>

      <div className="w-full h-2 bg-[#ff6b00] fixed bottom-0 left-0"></div>
    </main>
  );
}