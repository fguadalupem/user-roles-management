'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Loading from '@/components/common/Loading';
import api from '@/services/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [licenseValid, setLicenseValid] = useState<boolean | null>(null);
  const [checkingLicense, setCheckingLicense] = useState(true);

  // 🔐 MUY IMPORTANTE:
  // Marca indicando que el usuario YA estuvo autenticado en este ciclo.
  const hadUser = useRef(false);

  useEffect(() => {
    // Si en algún render ya tuvimos user, nunca permitimos que user=null cause logout
    if (user && !hadUser.current) {
      hadUser.current = true;
    }

    // Caso 1: loading → no hacer nada
    if (loading) return;

    // Caso 2: Aún sin user, PERO sabiendo que tenemos token → esperar
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    if (!user && token && !hadUser.current) {
      // Esperar a que AuthContext termine de resolver
      return;
    }

    // Caso 3: De verdad no hay usuario → redirigir
    if (!user && !token) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // -------------------------
  // CHECK DE LICENCIA
  // -------------------------
  //useEffect(() => {
  //  if (user) checkLicense();
  //}, [user]);

  const checkLicense = async () => {
    try {
      const response = await api.get('/licenses/validate');
      setLicenseValid(response.data.isValid);
    } catch (error) {
      console.error('Error validating license:', error);
      setLicenseValid(false);
    } finally {
      setCheckingLicense(false);
    }
  };

  // -------------------------
  // RENDERS CONTROLADOS
  // -------------------------

  if (loading || (!user && !hadUser.current)) {
    return <Loading />;
  }

  const normalize = (v?: string) => v?.toLowerCase().trim();
  const isAdmin =
    normalize(user?.role) === 'admin' ||
    normalize(user?.role) === 'administrator' ||
    user?.roles?.some(
      (r: any) =>
        normalize(r?.name) === 'admin' ||
        normalize(r?.name) === 'administrator'
    );

  if (!checkingLicense && !licenseValid && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Sistema Sin Licencia
          </h1>
          <p className="text-gray-600 mb-4">
            El sistema no tiene una licencia activa. Contacta al administrador.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-[#005EB8] text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  const showLicenseWarning =
    !checkingLicense &&
    !licenseValid &&
    isAdmin &&
    pathname !== '/dashboard/licenses';

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {showLicenseWarning && (
          <div className="bg-yellow-500 text-white px-6 py-4 text-center">
            <span className="font-bold">⚠️ Sistema sin licencia activa.</span>{' '}
            <button
              onClick={() => router.push('/dashboard/licenses')}
              className="underline hover:text-yellow-100"
            >
              Click aquí para gestionar licencias
            </button>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
