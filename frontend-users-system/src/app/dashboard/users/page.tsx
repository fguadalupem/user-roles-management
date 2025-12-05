'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit2, Trash2, X, Mail, Lock, User as UserIcon, Shield, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
//import { apiService } from '@/services/api';
import api from '@/services/api';
import { User, Role } from '@/types';
import UserModal from '@/components/users/UserModal';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    roleIds: [] as string[],
    isActive: true,
  });
  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, rolesData] = await Promise.all([
//        apiService.getUsers(),
//        apiService.getRoles(),
        api.getUsers(),
        api.getRoles(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        confirmPassword: '',
        roleIds: user.roles.map(r => r.id),
        isActive: user.isActive,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        roleIds: [],
        isActive: true,
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      roleIds: [],
      isActive: true,
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!selectedUser) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    } else if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    if (formData.roleIds.length === 0) {
      newErrors.roleIds = 'Seleccione al menos un rol';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (selectedUser) {
        const updateData: any = {
          username: formData.username,
          email: formData.email,
          isActive: formData.isActive,
          roleIds: formData.roleIds,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
//        await apiService.updateUser(selectedUser.id, updateData);
        await api.updateUser(selectedUser.id, updateData);
      } else {
//        await apiService.createUser({
        await api.createUser({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          roleIds: formData.roleIds,
        });
      }
      await loadData();
      closeModal();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Error al guardar el usuario' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`¿Estás seguro de eliminar a ${user.username}?`)) return;

    try {
//      await apiService.deleteUser(user.id);
      await api.deleteUser(user.id);
      await loadData();
    } catch (error) {
      alert('Error al eliminar el usuario');
    }
  };

  const toggleRole = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId]
    }));
    if (errors.roleIds) {
      setErrors((prev: any) => ({ ...prev, roleIds: null }));
    }
  };

  return (
    <div className="min-h-screen bg-snow">
      {/* Header */}
      <div className="bg-white border-b border-steel-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-qbit p-3 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-steel-900">Gestión de Usuarios</h1>
              <p className="text-steel-500 text-sm">Administra usuarios y sus permisos</p>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center space-x-2 bg-gradient-qbit text-white px-4 py-2.5 rounded-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Nuevo Usuario</span>
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
              placeholder="Buscar usuarios..."
              className="w-full pl-10 pr-4 py-2.5 border border-steel-300 rounded-lg focus:ring-2 focus:ring-qbit-blue focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-steel-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-smoke border-b border-steel-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-steel-600 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-steel-600 uppercase tracking-wider">Roles</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-steel-600 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-steel-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-smoke transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-qbit-blue to-qbit-green rounded-full flex items-center justify-center text-white font-semibold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-steel-900">{user.username}</div>
                          <div className="text-sm text-steel-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {user.roles.map(role => (
                          <span key={role.id} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-qbit-blue/10 text-qbit-blue border border-qbit-blue/20">
                            {role.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? 'bg-qbit-green/10 text-qbit-green border border-qbit-green/20'
                          : 'bg-steel-100 text-steel-600 border border-steel-200'
                      }`}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => openModal(user)}
                        className="p-2 text-qbit-blue hover:bg-qbit-blue/10 rounded-lg transition-colors mr-2"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {showModal && (
  <UserModal
    isOpen={showModal}
    onClose={closeModal}
    onSubmit={handleSubmit}
    selectedUser={selectedUser}
    formData={formData}
    setFormData={setFormData}
    roles={roles}
    errors={errors}
    loading={loading}
    showPassword={showPassword}
    setShowPassword={setShowPassword}
    toggleRole={toggleRole}
  />
)}
      </div>

      {/* Modal - Continúa en el siguiente artefacto */}
    </div>
  );
}