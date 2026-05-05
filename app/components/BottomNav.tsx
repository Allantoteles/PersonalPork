'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { Dumbbell, History, TrendingUp, Users, Plus } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const { role } = useAuth();

  const entrenadorLinks = [
    { href: '/alumnos', icon: Users, label: 'Alumnos' },
    { href: '/progreso', icon: TrendingUp, label: 'Progreso' },
    { href: '/rutinas', icon: Plus, label: 'Crear' },
  ];

  const atletaLinks = [
    { href: '/entrenar', icon: Dumbbell, label: 'Entrenar' },
    { href: '/historial', icon: History, label: 'Historial' },
    { href: '/progreso', icon: TrendingUp, label: 'Progreso' },
  ];

  const links = role === 'entrenador' ? entrenadorLinks : atletaLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0e1416] border-t border-[#2f3638] z-50 pb-safe">
      <div className="max-w-md mx-auto flex justify-around items-center py-2">
        {links.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-[#ff6b00]'
                  : 'text-[#5a4136] hover:text-[#dde4e6]'
              }`}
            >
              <Icon size={22} />
              <span className="text-xs font-['Lexend']">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}