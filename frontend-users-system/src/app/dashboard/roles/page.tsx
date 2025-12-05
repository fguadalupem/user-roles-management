'use client';

import { useState, useEffect } from 'react';
import { Shield, Plus, Search, Edit2, Trash2, Lock, X } from 'lucide-react';
import api from '@/services/api';
import { Role, Permission } from '@/types';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rolesData, permissionsData] = await Promise.all([
        api.getRoles(),
        api.getPermissions(),
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openEditModal = (role?: Role) => {
    if (role) {
      setSelectedRole(role);
      setFormData({ name: role.name, description: role.description || '' });
    } else {
      setSelectedRole(null);
      setFormData({ name: '', description: '' });
    }
    setShowEditModal(true);
  };

  const openPermissionsModal = (role: Role) => {
    setSelectedRole(role);
    const rolePermIds = role.permissions?.map(p => p.id) || [];
    setSelectedPermissions(rolePermIds);
    setShowPermissionsModal(true);
  };

  const handlePermissionToggle = (permId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Nombre requerido');
    
    setLoading(true);
    try {
      if (selectedRole) {
        await api.updateRole(selectedRole.id, formData);
      } else {
        await api.createRole(formData);
      }
      await loadData();
      setShowEditModal(false);
      alert('Rol guardado');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    
    setLoading(true);
    try {
      await api.assignPermissions(selectedRole.id, selectedPermissions);
      await loadData();
      setShowPermissionsModal(false);
      alert('Permisos guardados');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    try {
      await api.deleteRole(id);
      await loadData();
      alert('Eliminado');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error');
    }
  };

  const getColorByRole = (roleName: string) => {
    const colors: Record<string, string> = {
      admin: 'from-qbit-blue to-qbit-blue-dark',
      manager: 'from-qbit-green to-qbit-green-dark',
      user: 'from-steel-600 to-steel-700',
    };
    return colors[roleName.toLowerCase()] || 'from-steel-500 to-steel-600';
  };

  return (
    <div className="min-h-screen bg-snow">
      <div className="bg-white border-b border-steel-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-qbit p-3 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-steel-900">Gestión de Roles</h1>
              <p className="text-steel-500 text-sm">Administra roles y permisos del sistema</p>
            </div>
          </div>
          <button
            onClick={() => openEditModal()}
            className="flex items-center gap-2 bg-gradient-qbit text-white px-4 py-2 rounded-lg hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Nuevo Rol
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-steel-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-steel-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar roles..."
              className="w-full pl-10 pr-4 py-2.5 border border-steel-300 rounded-lg focus:ring-2 focus:ring-qbit-blue focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => (
            <div key={role.id} className="bg-white rounded-xl shadow-sm border border-steel-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className={`p-4 bg-gradient-to-r ${getColorByRole(role.name)} text-white border-b`}>
                <div className="flex items-center justify-between mb-2">
                  <Shield className="w-6 h-6" />
                  <div className="flex space-x-1">
                    <button onClick={() => openEditModal(role)} className="p-1.5 hover:bg-white/20 rounded transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(role.id, role.name)} className="p-1.5 hover:bg-white/20 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold">{role.name}</h3>
              </div>
              
              <div className="p-4">
                <p className="text-sm text-steel-600 mb-4 h-12">{role.description || 'Sin descripción'}</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 text-steel-600">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm">Permisos</span>
                  </div>
                  <span className="font-bold text-steel-900">{role.permissions?.length || 0}</span>
                </div>
                <button
                  onClick={() => openPermissionsModal(role)}
                  className="w-full py-2 bg-gradient-qbit text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                >
                  Gestionar Permisos
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedRole ? 'Editar' : 'Nuevo'} Rol</h2>
              <button onClick={() => setShowEditModal(false)}><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSaveRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="flex-1 bg-gradient-qbit text-white py-2 rounded disabled:opacity-50">
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-gray-300 py-2 rounded">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedRole && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-qbit p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Permisos de {selectedRole.name}</h2>
                  <p className="text-qbit-blue-light text-sm mt-1">{selectedPermissions.length} seleccionados</p>
                </div>
                <button onClick={() => setShowPermissionsModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-2">
                {permissions.map((permission) => (
                  <label key={permission.id} className="flex items-center justify-between p-4 border border-steel-200 rounded-lg hover:bg-smoke cursor-pointer transition-colors">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        className="w-5 h-5 text-qbit-blue border-steel-300 rounded focus:ring-qbit-blue"
                      />
                      <div>
                        <p className="font-medium text-steel-900">{permission.name}</p>
                        <p className="text-sm text-steel-500">{permission.resource}:{permission.action}</p>
                      </div>
                    </div>
                    <Lock className="w-4 h-4 text-steel-400" />
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-steel-200 p-6 bg-smoke">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPermissionsModal(false)}
                  disabled={loading}
                  className="px-4 py-2 border border-steel-300 rounded-lg font-medium text-steel-700 hover:bg-white disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePermissions}
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-qbit text-white rounded-lg font-medium hover:shadow-xl disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}