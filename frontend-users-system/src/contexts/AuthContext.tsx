// frontend-users-system/src/contexts/AuthContext.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

type RawProfile = any;

interface User {
  id: string;
  email: string;
  username: string;
  roles: string[];
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// KEY used to store token in localStorage (must be consistent with api)
const TOKEN_KEY = 'token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Prevent double execution under React StrictMode
  const initializedRef = useRef(false);

  // Tracks if we had a user previously in this lifecycle (prevents transient redirect)
  const hadUserRef = useRef(false);

  // Ensure axios has the token if present on init (helps SSR-less dev)
  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (t) {
      // set header for axios instance
      try {
        api.axiosInstance && (api.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${t}`);
      } catch (e) {
        // api may not expose axiosInstance depending on implementation; safe ignore
      }
    }
  }, []);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      checkAuth();
    }
    // sync logout/login between tabs
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === TOKEN_KEY) {
        // if token removed -> logout in this tab
        if (!ev.newValue) {
          console.log('AuthContext: token removed via storage event -> logging out locally');
          setUser(null);
          setLoading(false);
          // do not push here, let layout handle redirect
        } else {
          // token added/changed in another tab -> refresh profile
          console.log('AuthContext: token added/changed via storage event -> re-check profile');
          checkAuth();
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkAuth() {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('🔍 CheckAuth - Token existe:', !!token);

    // If no token, set state and stop
    if (!token) {
      console.log('🔍 CheckAuth - no token found');
      setUser(null);
      setLoading(false);
      return;
    }

    // Ensure axios has header
    try {
      api.axiosInstance && (api.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`);
    } catch {}

    try {
      console.log('🔍 CheckAuth - fetching /auth/profile');
      const res = await api.get('/auth/profile');
      const profile: RawProfile = res.data;

      // Normalize profile coming from backend
      const normalized: User = {
        id: profile.id,
        email: profile.email,
        username: profile.username ?? profile.name ?? profile.email.split('@')[0],
        roles: Array.isArray(profile.roles) ? profile.roles : profile.role ? [profile.role] : [],
        permissions: Array.isArray(profile.permissions) ? profile.permissions : [],
      };

      console.log('🔍 CheckAuth - profile normalized:', normalized);

      setUser(normalized);
      hadUserRef.current = true;
    } catch (err: any) {
      console.error('🔍 CheckAuth - error fetching profile', err);

      // If 401 unauthorized, remove token
      const status = err?.response?.status;
      if (status === 401) {
        console.warn('🔐 CheckAuth - token invalid or expired, removing token');
        localStorage.removeItem(TOKEN_KEY);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // login: will call api.login which MUST save token into localStorage (see api.ts)
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('🔑 AuthContext.login -> calling api.login');
      const res = await api.login(email, password); // api.login should set localStorage token
      // read token from storage
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        console.warn('🔑 AuthContext.login - token not found AFTER api.login');
      } else {
        // ensure axios has header
        try {
          api.axiosInstance && (api.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`);
        } catch {}
      }

      // Build user object
      const profile = res.user;
      const normalized: User = {
        id: profile.id,
        email: profile.email,
        username: profile.username ?? profile.name ?? profile.email.split('@')[0],
        roles: Array.isArray(profile.roles) ? profile.roles : profile.role ? [profile.role] : [],
        permissions: Array.isArray(profile.permissions) ? profile.permissions : [],
      };

      setUser(normalized);
      hadUserRef.current = true;
      setLoading(false);
      return normalized;
    } catch (err: any) {
      setUser(null);
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    try {
      api.axiosInstance && delete api.axiosInstance.defaults.headers.common['Authorization'];
    } catch {}
    setUser(null);
    router.push('/login');
  };

  const hasRole = (role: string) => {
    return !!user?.roles?.some((r) => String(r).toLowerCase() === role.toLowerCase());
  };

  const hasPermission = (permission: string) => {
    return !!user?.permissions?.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
