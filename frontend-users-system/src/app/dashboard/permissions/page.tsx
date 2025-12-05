'use client';

import { useState, useEffect } from 'react';
import { Lock, Plus, Search, Edit2, Trash2, Shield, X, AlertCircle, CheckCircle } from 'lucide-react';
//import { apiService } from '@/services/api';
import api from '@/services/api';
import { Permission } from '@/types';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    resource: '',
    action: '',
    description: '',
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
//      const data = await apiService.getPermissions();
      const data = await api.getPermissions();
      setPermissions(data);
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  };

  const filteredPermissions = permissions.filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const openModal = (permission?: Permission) => {
    if (permission) {
      setSelectedPermission(permission);
      setFormData({
        name: permission.name,
        resource: permission.resource,
        action: permission.action,
        description: permission.description || '',
      });
    } else {
      setSelectedPermission(null);
      setFormData({
        name: '',
        resource: '',
        action: '',
        description: '',
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPermission(null);
    setFormData({ name: '', resource: '', action: '', description: '' });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.resource.trim()) {
      newErrors.resource = 'El recurso es requerido';
    }

    if (!formData.action.trim()) {
      newErrors.action = 'La acción es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async () => {
  console.log('🔧 handleSubmit iniciado');
  console.log('📝 FormData:', formData);
  console.log('📝 SelectedPermission:', selectedPermission);
  
  if (!validateForm()) {
    console.log('❌ Validación falló');
    return;
  }

  console.log('✅ Validación pasó');
  setLoading(true);
  
  try {
    if (selectedPermission) {
      console.log('🔄 Actualizando permiso ID:', selectedPermission.id);
      await api.updatePermission(selectedPermission.id, formData);
      console.log('✅ Permiso actualizado');
    } else {
      console.log('➕ Creando nuevo permiso');
      await api.createPermission(formData);
      console.log('✅ Permiso creado');
    }
    await loadPermissions();
    closeModal();
  } catch (error: any) {
    console.error('❌ Error al guardar:', error);
    setErrors({ submit: error.message || 'Error al guardar el permiso' });
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (permission: Permission) => {
    if (!confirm(`¿Estás seguro de eliminar el permiso "${permission.name}"?`)) return;

    try {
//       await apiService.deletePermission(permission.id);
     await api.deletePermission(permission.id);
      await loadPermissions();
    } catch (error) {
      alert('Error al eliminar el permiso');
    }
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: 'bg-qbit-green/10 text-qbit-green border-qbit-green/20',
      read: 'bg-qbit-blue/10 text-qbit-blue border-qbit-blue/20',
      update: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      delete: 'bg-red-50 text-red-600 border-red-200',
    };
    return colors[action.toLowerCase()] || 'bg-steel-100 text-steel-600 border-steel-200';
  };

  const getResourceColor = (resource: string) => {
    const colors: Record<string, string> = {
      users: 'from-qbit-blue to-qbit-blue-dark',
      roles: 'from-qbit-green to-qbit-green-dark',
      permissions: 'from-purple-500 to-purple-600',
      audit: 'from-steel-600 to-steel-700',
    };
    return colors[resource.toLowerCase()] || 'from-steel-500 to-steel-600';
  };

  return (
    <div className="min-h-screen bg-snow">
      {/* Header */}
      <div className="bg-white border-b border-steel-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-3 rounded-xl">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-steel-900">Gestión de Permisos</h1>
              <p className="text-steel-500 text-sm">Administra los permisos del sistema</p>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2.5 rounded-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Nuevo Permiso</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-steel-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-steel-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar permisos..."
              className="w-full pl-10 pr-4 py-2.5 border border-steel-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-steel-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-steel-500 mb-1">Total Permisos</p>
                <p className="text-2xl font-bold text-steel-900">{permissions.length}</p>
              </div>
              <Lock className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-steel-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-steel-500 mb-1">Recursos</p>
                <p className="text-2xl font-bold text-steel-900">{Object.keys(groupedPermissions).length}</p>
              </div>
              <Shield className="w-8 h-8 text-qbit-blue" />
            </div>
          </div>
        </div>

        {/* Grouped Permissions */}
        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([resource, perms]) => (
            <div key={resource} className="bg-white rounded-xl shadow-sm border border-steel-200 overflow-hidden">
              <div className={`bg-gradient-to-r ${getResourceColor(resource)} p-4 text-white`}>
                <div className="flex items-center space-x-3">
                  <Shield className="w-6 h-6" />
                  <h2 className="text-xl font-bold capitalize">{resource}</h2>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    {perms.length} permisos
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {perms.map((permission) => (
                    <div key={permission.id} className="border border-steel-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-steel-900 mb-1">{permission.name}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionColor(permission.action)}`}>
                            {permission.action}
                          </span>
                        </div>
                      </div>
                      {permission.description && (
                        <p className="text-sm text-steel-600 mb-3">{permission.description}</p>
                      )}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal(permission)}
                          className="flex-1 p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center justify-center"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          <span className="text-xs">Editar</span>
                        </button>
                        <button
                          onClick={() => handleDelete(permission)}
                          className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          <span className="text-xs">Eliminar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedPermission ? 'Editar Permiso' : 'Nuevo Permiso'}
                    </h2>
                    <p className="text-purple-100 text-sm">
                      {selectedPermission ? 'Modifica los datos del permiso' : 'Completa la información'}
                    </p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-steel-700 mb-2">Nombre del Permiso *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2.5 border ${errors.name ? 'border-red-500' : 'border-steel-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none`}
                  placeholder="Ej: Crear Usuario"
                />
                {errors.name && (
                  <div className="flex items-center mt-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.name}
                  </div>
                )}
              </div>

              {/* Resource & Action */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-steel-700 mb-2">Recurso *</label>
                  <input
                    type="text"
                    value={formData.resource}
                    onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                    className={`w-full px-4 py-2.5 border ${errors.resource ? 'border-red-500' : 'border-steel-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none`}
                    placeholder="Ej: users"
                  />
                  {errors.resource && (
                    <div className="flex items-center mt-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.resource}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-steel-700 mb-2">Acción *</label>
                  <select
                    value={formData.action}
                    onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                    className={`w-full px-4 py-2.5 border ${errors.action ? 'border-red-500' : 'border-steel-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white`}
                  >
                    <option value="">Seleccionar</option>
                    <option value="create">Create</option>
                    <option value="read">Read</option>
                    <option value="update">Update</option>
                    <option value="delete">Delete</option>
                  </select>
                  {errors.action && (
                    <div className="flex items-center mt-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.action}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-steel-700 mb-2">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-steel-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                  placeholder="Descripción del permiso..."
                />
              </div>

              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">{errors.submit}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-steel-200 p-6 bg-smoke flex justify-end space-x-3">
              <button
                onClick={closeModal}
                disabled={loading}
                className="px-5 py-2.5 border border-steel-300 rounded-lg font-medium text-steel-700 hover:bg-white transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:shadow-xl transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>{selectedPermission ? 'Actualizar' : 'Crear Permiso'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}