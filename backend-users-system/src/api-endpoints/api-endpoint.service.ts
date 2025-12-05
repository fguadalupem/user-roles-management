// backend-users-system/src/api-endpoints/api-endpoint.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiEndpoint, AuthType, EndpointStatus } from './entities/api-endpoint.entity';
import * as crypto from 'crypto';
import axios, { AxiosRequestConfig } from 'axios';
import DigestClient from 'digest-fetch';

@Injectable()
export class ApiEndpointService {
  private readonly ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'qbit-encryption-key-32-chars!!';

  constructor(
    @InjectRepository(ApiEndpoint)
    private endpointRepository: Repository<ApiEndpoint>,
  ) {}

  // 🔐 ENCRIPTAR CONTRASEÑA
  private encrypt(text: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.ENCRYPTION_KEY, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(text: string): string {
    const algorithm = 'aes-256-cbc';
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const key = crypto.scryptSync(this.ENCRYPTION_KEY, 'salt', 32);
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // ✅ CREAR ENDPOINT
  async create(data: Partial<ApiEndpoint>): Promise<ApiEndpoint> {
    // Encriptar contraseña si existe
    if (data.password) {
      data.password = this.encrypt(data.password);
    }

    const endpoint = this.endpointRepository.create(data);
    return this.endpointRepository.save(endpoint);
  }

  // 📋 LISTAR ENDPOINTS
  async findAll(): Promise<ApiEndpoint[]> {
    return this.endpointRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // 🔍 OBTENER UNO
  async findOne(id: string): Promise<ApiEndpoint> {
    const endpoint = await this.endpointRepository.findOne({ where: { id } });
    if (!endpoint) throw new BadRequestException('Endpoint no encontrado');
    return endpoint;
  }

  // ✏️ ACTUALIZAR
  async update(id: string, data: Partial<ApiEndpoint>): Promise<ApiEndpoint> {
    const endpoint = await this.findOne(id);

    // Si se actualiza contraseña, encriptarla
    if (data.password) {
      data.password = this.encrypt(data.password);
    }

    Object.assign(endpoint, data);
    return this.endpointRepository.save(endpoint);
  }

  // 🗑️ ELIMINAR
  async remove(id: string): Promise<void> {
    await this.endpointRepository.delete(id);
  }

  // 🧪 PROBAR CONEXIÓN
  async testConnection(id: string): Promise<{ success: boolean; message: string; data?: any }> {
    const endpoint = await this.findOne(id);

    try {
      const response = await this.makeRequest(endpoint, endpoint.endpoints?.[0] || { path: '/', method: 'GET' });
      
      endpoint.lastTestedAt = new Date();
      endpoint.lastTestResult = 'success';
      endpoint.status = EndpointStatus.ACTIVE;
      await this.endpointRepository.save(endpoint);

      return {
        success: true,
        message: 'Conexión exitosa',
        data: response.data,
      };
    } catch (error: any) {
      endpoint.lastTestedAt = new Date();
      endpoint.lastTestResult = error.message;
      endpoint.status = EndpointStatus.ERROR;
      await this.endpointRepository.save(endpoint);

      return {
        success: false,
        message: error.message || 'Error de conexión',
      };
    }
  }

  // 🌐 EJECUTAR REQUEST A ENDPOINT EXTERNO
  async executeRequest(
    id: string,
    endpointPath: string,
    method: string = 'GET',
    body?: any,
    customHeaders?: Record<string, string>,
  ): Promise<any> {
    const endpoint = await this.findOne(id);
    
    const endpointConfig = endpoint.endpoints?.find(e => e.path === endpointPath && e.method === method);
    if (!endpointConfig) {
      throw new BadRequestException('Endpoint path no configurado');
    }

    return this.makeRequest(endpoint, { path: endpointPath, method, body }, customHeaders);
  }

  // 🔧 MÉTODO PRIVADO PARA HACER REQUESTS
  private async makeRequest(
    endpoint: ApiEndpoint,
    config: { path: string; method: string; body?: any },
    customHeaders?: Record<string, string>,
  ): Promise<any> {
    const url = `${endpoint.baseUrl}${config.path}`;
    const headers = { ...endpoint.headers, ...customHeaders };

    const axiosConfig: AxiosRequestConfig = {
      method: config.method,
      url,
      headers,
      timeout: endpoint.timeout || 10000,
      validateStatus: () => true, // No lanzar error en status != 2xx
    };

    if (config.body) {
      axiosConfig.data = config.body;
    }

    // AUTENTICACIÓN
    switch (endpoint.authType) {
      case AuthType.BASIC:
        axiosConfig.auth = {
          username: endpoint.username || '',
          password: this.decrypt(endpoint.password || ''),
        };
        break;

      case AuthType.BEARER:
        axiosConfig.headers = {
          ...axiosConfig.headers,
          Authorization: `Bearer ${endpoint.token}`,
        };
        break;

      case AuthType.API_KEY:
        axiosConfig.headers = {
          ...axiosConfig.headers,
          'X-API-Key': endpoint.token,
        };
        break;

      case AuthType.DIGEST:
        // Para Digest Auth, usar librería especializada
        return this.makeDigestRequest(endpoint, config.path, config.method, config.body);

      default:
        // Sin autenticación
        break;
    }

    const response = await axios(axiosConfig);
    return response;
  }

  // 🔐 REQUEST CON DIGEST AUTH (como Hikvision)
  private async makeDigestRequest(
    endpoint: ApiEndpoint,
    path: string,
    method: string,
    body?: any,
  ): Promise<any> {
    const url = `${endpoint.baseUrl}${path}`;
    const username = endpoint.username || '';
    const password = this.decrypt(endpoint.password || '');

    // Usar digest-fetch para manejar Digest Auth automáticamente
    const client = new DigestClient(username, password);

    const options: any = {
      method,
      headers: endpoint.headers || {},
    };

    if (body) {
      options.body = JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
    }

    const response = await client.fetch(url, options);
    const data = await response.text();

    // Intentar parsear como JSON, si no, retornar texto
    try {
      return { data: JSON.parse(data), status: response.status };
    } catch {
      return { data, status: response.status };
    }
  }
}