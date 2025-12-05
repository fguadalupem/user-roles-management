// frontend-users-system/src/services/api.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { LoginResponse, User, Role, Permission, AuditLog, ApiError } from '@/types';

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Log para debug
    console.log('API URL:', this.axiosInstance.defaults.baseURL);

    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError<ApiError>) {
    if (error.response) {
      return {
        message: error.response.data.message || 'Error en el servidor',
        statusCode: error.response.status,
      };
    } else if (error.request) {
      return {
        message: 'No se pudo conectar con el servidor',
        statusCode: 0,
      };
    } else {
      return {
        message: 'Error al realizar la petición',
        statusCode: 0,
      };
    }
  }

  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');
    }
  }

  // Métodos axios directos para compatibilidad
  get(url: string, config?: any) {
    return this.axiosInstance.get(url, config);
  }

  post(url: string, data?: any, config?: any) {
    return this.axiosInstance.post(url, data, config);
  }

  put(url: string, data?: any, config?: any) {
    return this.axiosInstance.put(url, data, config);
  }

  patch(url: string, data?: any, config?: any) {
    return this.axiosInstance.patch(url, data, config);
  }

  delete(url: string, config?: any) {
    return this.axiosInstance.delete(url, config);
  }

  // AUTH
  async login(email: string, password: string): Promise<LoginResponse> {
    console.log('🔐 API: Iniciando login...');
    const response = await this.axiosInstance.post<LoginResponse>('/auth/login', { email, password });
    
    console.log('🔐 API: Respuesta recibida:', response.data);
    
    // Guardar token inmediatamente
    const token = response.data.access_token;
    console.log('🔐 API: Token a guardar:', token ? 'Existe' : 'NO EXISTE');
    
    if (token) {
      this.setToken(token);
      
      // Verificar que se guardó
      const savedToken = this.getToken();
      console.log('🔐 API: Token guardado en localStorage:', savedToken ? 'SÍ' : 'NO');
      
      // Actualizar headers del axios
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
      }
    } else {
      console.error('❌ API: No se recibió token en la respuesta');
    }
    
    return response.data;
  }

  async getProfile() {
    const response = await this.axiosInstance.get('/auth/profile');
    return response.data;
  }

  // USERS
  async getUsers(): Promise<User[]> {
    const response = await this.axiosInstance.get<User[]>('/users');
    return response.data;
  }

  async getUser(id: string): Promise<User> {
    const response = await this.axiosInstance.get<User>(`/users/${id}`);
    return response.data;
  }

  async createUser(data: {
    username: string;
    email: string;
    password: string;
    roleIds?: string[];
  }): Promise<User> {
    const response = await this.axiosInstance.post<User>('/users', data);
    return response.data;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await this.axiosInstance.patch<User>(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.axiosInstance.delete(`/users/${id}`);
  }

  // ROLES
  async getRoles(): Promise<Role[]> {
    const response = await this.axiosInstance.get<Role[]>('/roles');
    return response.data;
  }

  async getRole(id: string): Promise<Role> {
    const response = await this.axiosInstance.get<Role>(`/roles/${id}`);
    return response.data;
  }

  async createRole(data: {
    name: string;
    description?: string;
    permissionIds?: string[];
  }): Promise<Role> {
    console.log('🔵 API: createRole', data);
    const response = await this.axiosInstance.post<Role>('/roles', data);
    console.log('✅ API: Role creado', response.data);
    return response.data;
  }

  async updateRole(id: string, data: Partial<Role>): Promise<Role> {
    console.log('🔵 API: updateRole', id, data);
    const response = await this.axiosInstance.patch<Role>(`/roles/${id}`, data);
    console.log('✅ API: Role actualizado', response.data);
    return response.data;
  }

  async deleteRole(id: string): Promise<void> {
    console.log('🔵 API: deleteRole', id);
    await this.axiosInstance.delete(`/roles/${id}`);
    console.log('✅ API: Role eliminado');
  }

  async assignPermissions(roleId: string, permissionIds: string[]): Promise<Role> {
    console.log('🔵 API: assignPermissions', roleId, permissionIds);
    const response = await this.axiosInstance.post<Role>(`/roles/${roleId}/permissions`, { permissionIds });
    console.log('✅ API: Permisos asignados', response.data);
    return response.data;
  }

  // PERMISSIONS
  async getPermissions(): Promise<Permission[]> {
    const response = await this.axiosInstance.get<Permission[]>('/permissions');
    return response.data;
  }

  async getPermissionsGrouped(): Promise<Record<string, Permission[]>> {
    const response = await this.axiosInstance.get<Record<string, Permission[]>>('/permissions/grouped');
    return response.data;
  }

  async createPermission(data: {
    name: string;
    resource: string;
    action: string;
    description?: string;
  }): Promise<Permission> {
    const response = await this.axiosInstance.post<Permission>('/permissions', data);
    return response.data;
  }

  async updatePermission(id: string, data: Partial<Permission>): Promise<Permission> {
    const response = await this.axiosInstance.patch<Permission>(`/permissions/${id}`, data);
    return response.data;
  }

  async deletePermission(id: string): Promise<void> {
    await this.axiosInstance.delete(`/permissions/${id}`);
  }

  // AUDIT
  async getAuditLogs(limit = 100, offset = 0): Promise<{ data: AuditLog[], total: number }> {
    const response = await this.axiosInstance.get<{ data: AuditLog[], total: number }>(`/audit?limit=${limit}&offset=${offset}`);
    return response.data;
  }

  async getAuditByUser(userId: string): Promise<AuditLog[]> {
    const response = await this.axiosInstance.get<AuditLog[]>(`/audit/user/${userId}`);
    return response.data;
  }
}

const api = new ApiService();
export default api;