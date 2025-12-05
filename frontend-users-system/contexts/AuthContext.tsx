// frontend-users-system/src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('🚀 AuthContext montado, ejecutando checkAuth...');
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    console.log('🔍 CheckAuth - Token existe:', !!token);
    
    if (!token) {
      console.log('❌ No hay token, saliendo');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Llamando a /auth/profile...');
      const response = await api.get('/auth/profile');
      console.log('✅ Respuesta de perfil:', response.data);
      
      // Verificar que tenga los campos necesarios
      if (!response.data.id || !response.data.email || !response.data.role) {
        console.error('❌ Perfil incompleto:', response.data);
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
        return;
      }
      
      console.log('✅ Usuario seteado:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('❌ Error al verificar perfil:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      console.log('🏁 CheckAuth finalizado, loading = false');
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔑 AuthContext: Llamando a api.login...');
      const response = await api.login(email, password);
      
      console.log('🔑 AuthContext: Respuesta:', response);
      
      // Verificar que el token se guardó
      const savedToken = localStorage.getItem('token');
      console.log('🔑 AuthContext: Token en localStorage:', savedToken ? 'Sí' : 'No');
      
      // IMPORTANTE: Setear el usuario INMEDIATAMENTE
      const userData = response.user;
      console.log('🔑 AuthContext: Seteando usuario:', userData);
      setUser(userData);
      
      console.log('✅ AuthContext: Login completado exitosamente');
      return userData;
    } catch (error: any) {
      console.error('❌ AuthContext: Error en login:', error);
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}