'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Shield, Activity, Lock, LogOut, Earth } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, hasPermission } = useAuth();

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      permission: null,
    },
    {
      name: 'Usuarios',
      icon: Users,
      path: '/dashboard/users',
      permission: 'users:read',
    },
    {
      name: 'Roles',
      icon: Shield,
      path: '/dashboard/roles',
      permission: 'roles:read',
    },
    { 
      name: 'Permisos', 
      icon: Lock, 
      path: '/dashboard/permissions' 
    }, // ← Agregar
    { 
      name: 'API Endpoints', 
      path: '/dashboard/api-endpoints', 
      icon: Earth, 
      roles: ['Administrator', 'Manager'] },
    {
      name: 'Auditoría',
      icon: Activity,
      path: '/dashboard/audit',
      permission: 'audit:read',
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );
const username = user?.username ?? user?.name ?? user?.email ?? '';
const avatarInitial = username ? String(username).charAt(0).toUpperCase() : '?';
  return (
    <div className="w-64 bg-steel-900 text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-steel-800">
        <div className="flex items-center space-x-3">
          <img src="/logobit.png" alt="QBIT" className="w-50 h-10" />
          <div>
            <h1 className="text-lg font-bold">BIT</h1>
            <p className="text-xs text-steel-400">Sistema de Gestión</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-steel-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-qbit-blue to-qbit-green rounded-full flex items-center justify-center text-sm font-semibold">
           {avatarInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.username}</p>
            <p className="text-xs text-steel-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-qbit-blue text-white shadow-lg'
                  : 'text-steel-300 hover:bg-steel-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-steel-800">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-steel-300 hover:bg-qbit-green hover:text-white transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
