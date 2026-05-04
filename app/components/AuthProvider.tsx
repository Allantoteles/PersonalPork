'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Role, Usuario } from '@prisma/client';

type UserRole = 'atleta' | 'entrenador';

interface User {
  id: string;
  email: string;
  nombre: string;
  rolId: string | null;
  rol: Role | null;
  entrenadorId: string | null;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  trainerId: string | null;
  athleteId: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'atleta',
  setRole: () => {},
  isLoading: false,
  isAuthenticated: false,
  trainerId: null,
  athleteId: null,
});

export const useAuth = () => useContext(AuthContext);

const CREDENTIALS: Record<UserRole, { email: string; password: string }> = {
  atleta: { email: 'atleta@test.com', password: 'test123456' },
  entrenador: { email: 'entrenador@test.com', password: 'test123456' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<UserRole>('atleta');
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async (userRole: UserRole) => {
    setIsLoading(true);
    const { email } = CREDENTIALS[userRole];

    try {
      const res = await fetch(`/api/auth?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const foundUser = await res.json();
        setUser(foundUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const savedRole = localStorage.getItem('iron_focus_role') as UserRole;
    if (savedRole && (savedRole === 'atleta' || savedRole === 'entrenador')) {
      setRoleState(savedRole);
      loadUser(savedRole);
    } else {
      loadUser('atleta');
    }
  }, [loadUser]);

  const setRole = (newRole: UserRole) => {
    localStorage.setItem('iron_focus_role', newRole);
    setRoleState(newRole);
    loadUser(newRole);
  };

  const trainerId = user?.rol?.nombre === 'entrenador' ? user.id : null;
  const athleteId = user?.rol?.nombre === 'atleta' ? user.id : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        setRole,
        isLoading,
        isAuthenticated: !!user,
        trainerId,
        athleteId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}