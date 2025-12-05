'use client';

import { X, User as UserIcon, Mail, Lock, Shield, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { User, Role } from '@/types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  selectedUser: User | null;
  formData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    roleIds: string[];
    isActive: boolean;
  };
  setFormData: (data: any) => void;
  roles: Role[];
  errors: any;
  loading: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  toggleRole: (roleId: string) => void;
}

export default function UserModal({
  isOpen,
  onClose,
  onSubmit,
  selectedUser,
  formData,
  setFormData,
  roles,
  errors,
  loading,
  showPassword,
  setShowPassword,
  toggleRole,
}: UserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-qbit p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <UserIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h2>
                <p className="text-qbit-blue-light text-sm">
                  {selectedUser ? 'Actualiza la información del usuario' : 'Completa los datos del nuevo usuario'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-steel-700 mb-2">
                Nombre de Usuario *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-steel-400" />
                </div>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`block w-full pl-10 pr-3 py-2.5 border ${errors.username ? 'border-red-500' : 'border-steel-300'} rounded-lg focus:ring-2 focus:ring-qbit-blue focus:border-transparent outline-none`}
                  placeholder="Ej: juan_perez"
                />
              </div>
              {errors.username && (
                <div className="flex items-center mt-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.username}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-steel-700 mb-2">
                Correo Electrónico *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-steel-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`block w-full pl-10 pr-3 py-2.5 border ${errors.email ? 'border-red-500' : 'border-steel-300'} rounded-lg focus:ring-2 focus:ring-qbit-blue focus:border-transparent outline-none`}
                  placeholder="usuario@ejemplo.com"
                />
              </div>
              {errors.email && (
                <div className="flex items-center mt-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-steel-700 mb-2">
                  Contraseña {!selectedUser && '*'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-steel-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${errors.password ? 'border-red-500' : 'border-steel-300'} rounded-lg focus:ring-2 focus:ring-qbit-blue focus:border-transparent outline-none`}
                    placeholder={selectedUser ? 'Dejar en blanco para no cambiar' : '••••••••'}
                  />
                </div>
                {errors.password && (
                  <div className="flex items-center mt-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-steel-700 mb-2">
                  Confirmar Contraseña {!selectedUser && '*'}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`block w-full px-3 py-2.5 border ${errors.confirmPassword ? 'border-red-500' : 'border-steel-300'} rounded-lg focus:ring-2 focus:ring-qbit-blue focus:border-transparent outline-none`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <div className="flex items-center mt-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
            </div>

            <label className="flex items-center text-sm text-steel-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="w-4 h-4 text-qbit-blue border-steel-300 rounded focus:ring-qbit-blue mr-2"
              />
              Mostrar contraseñas
            </label>

            {/* Roles */}
            <div>
              <label className="block text-sm font-medium text-steel-700 mb-2">
                Roles *
              </label>
              <div className="space-y-2">
                {roles.map((role) => (
                  <label
                    key={role.id}
                    className={`flex items-center justify-between p-3 border ${formData.roleIds.includes(role.id) ? 'border-qbit-blue bg-qbit-blue/5' : 'border-steel-300'} rounded-lg cursor-pointer hover:bg-smoke transition-colors`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.roleIds.includes(role.id)}
                        onChange={() => toggleRole(role.id)}
                        className="w-5 h-5 text-qbit-blue border-steel-300 rounded focus:ring-qbit-blue"
                      />
                      <div>
                        <p className="font-medium text-steel-900">{role.name}</p>
                        <p className="text-sm text-steel-500">{role.description}</p>
                      </div>
                    </div>
                    <Shield className="w-5 h-5 text-steel-400" />
                  </label>
                ))}
              </div>
              {errors.roleIds && (
                <div className="flex items-center mt-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.roleIds}
                </div>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-smoke rounded-lg border border-steel-200">
              <div>
                <p className="font-medium text-steel-900">Estado del usuario</p>
                <p className="text-sm text-steel-500">El usuario podrá iniciar sesión</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-steel-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-qbit-blue/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-steel-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-qbit-blue"></div>
              </label>
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
        </div>

        {/* Footer */}
        <div className="border-t border-steel-200 p-6 bg-smoke">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 border border-steel-300 rounded-lg font-medium text-steel-700 hover:bg-white transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onSubmit}
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-qbit text-white rounded-lg font-medium hover:shadow-xl transition-all disabled:opacity-50"
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
                  <span>{selectedUser ? 'Actualizar' : 'Crear Usuario'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}