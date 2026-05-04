'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { Loader2, User, ChevronDown, LogOut } from 'lucide-react';

export default function Header() {
  const { role, setRole, isLoading, isAuthenticated, user } = useAuth();

  const handleRoleSwitch = () => {
    setRole(role === 'entrenador' ? 'atleta' : 'entrenador');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#0e1416]/95 backdrop-blur-md z-50 border-b border-[#2f3638]">
      <div className="max-w-md mx-auto px-5 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold font-['Lexend'] text-[#ff6b00]">IRON</span>
          <span className="text-xl font-bold font-['Lexend'] text-[#dde4e6]">FOCUS</span>
        </Link>

        {isLoading ? (
          <div className="w-8 h-8 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-[#ff6b00] animate-spin" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#1a2123] rounded-full px-3 py-1.5 border border-[#2f3638]">
              <User size={16} className="text-[#ff6b00]" />
              <span className="text-sm font-['Lexend'] text-[#dde4e6] capitalize">
                {role === 'entrenador' ? 'Entrenador' : 'Atleta'}
              </span>
              <button
                onClick={handleRoleSwitch}
                className="ml-1 text-[#ff6b00] hover:text-[#ff8533] transition-colors"
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}