'use client';

import { useState, useEffect } from 'react';
import { Globe, Plus, Edit2, Trash2, TestTube, Play, X } from 'lucide-react';
import api from '@/services/api';

interface ApiEndpoint {
  id: string;
  name: string;
  description?: string;
  baseUrl: string;
  authType: string;
  username?: string;
  status: string;
  lastTestedAt?: string;
  endpoints?: Array<{
    name: string;
    path: string;
    method: string;
    description?: string;
  }>;
}

export default function ApiEndpointsPage() {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    baseUrl: '',
    authType: 'digest',
    username: '',
    password: '',
    token: '',
  });

  useEffect(() => {
    loadEndpoints();
  }, []);

  const loadEndpoints = async () => {
    try {
      const response = await api.get('/api-endpoints');
      setEndpoints(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (endpoint?: ApiEndpoint) => {
    if (endpoint) {
      setSelectedEndpoint(endpoint);
      setFormData({
        name: endpoint.name,
        description: endpoint.description || '',
        baseUrl: endpoint.baseUrl,
        authType: endpoint.authType,
        username: endpoint.username || '',
        password: '',
        token: '',
      });
    } else {
      setSelectedEndpoint(null);
      setFormData({
        name: '',
        description: '',
        baseUrl: '',
        authType: 'digest',
        username: '',
        password: '',
        token: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (selectedEndpoint) {
        await api.put(`/api-endpoints/${selectedEndpoint.id}`, formData);
      } else {
        await api.post('/api-endpoints', formData);
      }
      await loadEndpoints();
      setShowModal(false);
    } catch (error) {
      alert('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este endpoint?')) return;

    try {
      await api.delete(`/api-endpoints/${id}`);
      await loadEndpoints();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const handleTest = async (id: string) => {
    setLoading(true);
    try {
      const response = await api.post(`/api-endpoints/${id}/test`);
      setTestResult(response.data);
      alert(response.data.message);
      await loadEndpoints();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">API Endpoints</h1>
          <p className="text-gray-600">Gestiona conexiones a APIs externas</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-[#005EB8] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Nuevo Endpoint
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {endpoints.map((endpoint) => (
          <div key={endpoint.id} className="bg-white rounded-lg shadow p-6 border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Globe className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-bold text-lg">{endpoint.name}</h3>
                  <p className="text-sm text-gray-500">{endpoint.baseUrl}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(endpoint.status)}`}>
                {endpoint.status}
              </span>
            </div>

            {endpoint.description && (
              <p className="text-sm text-gray-600 mb-4">{endpoint.description}</p>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Auth:</span>
                <span className="text-gray-600 uppercase">{endpoint.authType}</span>
              </div>
              {endpoint.username && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Usuario:</span>
                  <span className="text-gray-600">{endpoint.username}</span>
                </div>
              )}
              {endpoint.lastTestedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Último test:</span>
                  <span className="text-gray-600">
                    {new Date(endpoint.lastTestedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleTest(endpoint.id)}
                className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded hover:bg-green-100 flex items-center justify-center gap-2"
              >
                <TestTube className="w-4 h-4" />
                Test
              </button>
              <button
                onClick={() => openModal(endpoint)}
                className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100 flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={() => handleDelete(endpoint.id)}
                className="bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {selectedEndpoint ? 'Editar Endpoint' : 'Nuevo Endpoint'}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="block text-sm font-medium mb-2">URL Base *</label>
                <input
                  type="text"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  placeholder="http://192.168.1.79"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Autenticación *</label>
                <select
                  value={formData.authType}
                  onChange={(e) => setFormData({ ...formData, authType: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="none">Sin autenticación</option>
                  <option value="basic">Basic Auth</option>
                  <option value="digest">Digest Auth</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="api_key">API Key</option>
                </select>
              </div>

              {(formData.authType === 'basic' || formData.authType === 'digest') && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Usuario</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Contraseña</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      placeholder={selectedEndpoint ? 'Dejar vacío para no cambiar' : ''}
                    />
                  </div>
                </>
              )}

              {(formData.authType === 'bearer' || formData.authType === 'api_key') && (
                <div>
                  <label className="block text-sm font-medium mb-2">Token/API Key</label>
                  <input
                    type="text"
                    value={formData.token}
                    onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#005EB8] text-white py-2 rounded hover:bg-blue-700"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}