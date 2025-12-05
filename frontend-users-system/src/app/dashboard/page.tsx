'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Shield, Activity, TrendingUp, Clock, UserCheck, BarChart3 } from 'lucide-react';
//import { apiService } from '@/services/api';
import api from '@/services/api';
import { User, AuditLog } from '@/types';

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, auditData] = await Promise.all([
        api.getUsers(),
        api.getAuditLogs(5, 0),
      ]);
      setUsers(usersData);
      setAuditLogs(auditData.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Total Usuarios',
      value: users.length.toString(),
      change: '+12%',
      icon: Users,
      color: 'qbit-blue',
    },
    {
      label: 'Usuarios Activos',
      value: users.filter(u => u.isActive).length.toString(),
      change: '+8%',
      icon: UserCheck,
      color: 'qbit-green',
    },
    {
      label: 'Roles Configurados',
      value: '8',
      change: '+2',
      icon: Shield,
      color: 'steel-600',
    },
    {
      label: 'Acciones Hoy',
      value: auditLogs.length.toString(),
      change: '-5%',
      icon: Activity,
      color: 'qbit-blue-light',
    },
  ];

  const getActionIcon = (action: string) => {
    const icons = {
      CREATE: { icon: Users, color: 'text-qbit-green' },
      UPDATE: { icon: Shield, color: 'text-qbit-blue' },
      DELETE: { icon: Activity, color: 'text-red-500' },
      LOGIN: { icon: UserCheck, color: 'text-qbit-green' },
    };
    const config = icons[action as keyof typeof icons] || icons.CREATE;
    const Icon = config.icon;
    return <Icon className={`w-5 h-5 ${config.color}`} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-qbit-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-snow">
      {/* Header */}
      <div className="bg-white border-b border-steel-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-qbit p-2 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-steel-900">Dashboard</h1>
              <p className="text-sm text-steel-500">Bienvenido al sistema QBIT</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-steel-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`bg-${stat.color}/10 p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 text-${stat.color}`} />
                  </div>
                  <span className="text-sm font-medium text-qbit-green">{stat.change}</span>
                </div>
                <h3 className="text-2xl font-bold text-steel-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-steel-500">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-steel-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-steel-600" />
                <h2 className="text-lg font-bold text-steel-900">Actividad del Sistema</h2>
              </div>
            </div>
            
            <div className="space-y-4">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => {
                const height = Math.random() * 100 + 20;
                return (
                  <div key={day} className="flex items-center space-x-3">
                    <span className="text-sm text-steel-600 w-10">{day}</span>
                    <div className="flex-1 bg-smoke rounded-full h-8 relative overflow-hidden">
                      <div
                        className="bg-gradient-qbit h-full rounded-full transition-all duration-500"
                        style={{ width: `${height}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-steel-700 w-12 text-right">
                      {Math.round(height)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Users */}
          <div className="bg-white rounded-xl shadow-sm border border-steel-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="w-5 h-5 text-steel-600" />
              <h2 className="text-lg font-bold text-steel-900">Usuarios Más Activos</h2>
            </div>
            
            <div className="space-y-4">
              {users.slice(0, 4).map((user, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-smoke transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-qbit-blue to-qbit-green rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-steel-900 truncate">{user.username}</p>
                    <div className="flex items-center space-x-2 text-xs text-steel-500">
                      <Clock className="w-3 h-3" />
                      <span>{user.lastLogin ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-steel-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-steel-600" />
              <h2 className="text-lg font-bold text-steel-900">Actividad Reciente</h2>
            </div>
          </div>
          
          <div className="space-y-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-smoke transition-colors">
                <div className="flex-shrink-0">
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-steel-900">
                    <span className="font-medium">{log.action}</span>
                    {' '}
                    <span className="text-steel-600">en {log.resource}</span>
                  </p>
                </div>
                <div className="flex items-center text-xs text-steel-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(log.createdAt).toLocaleString('es-MX', { 
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}