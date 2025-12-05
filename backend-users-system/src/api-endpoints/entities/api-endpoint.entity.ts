// backend-users-system/src/api-endpoints/entities/api-endpoint.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AuthType {
  NONE = 'none',
  BASIC = 'basic',
  DIGEST = 'digest',
  BEARER = 'bearer',
  API_KEY = 'api_key',
}

export enum EndpointStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
}

@Entity('api_endpoints')
export class ApiEndpoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  baseUrl: string; // http://192.168.1.79

  @Column({ type: 'simple-enum', enum: AuthType, default: AuthType.NONE })
  authType: AuthType;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  password: string; // Encriptado

  @Column({ nullable: true })
  token: string; // Para Bearer o API Key

  @Column({ type: 'simple-json', nullable: true })
  headers: Record<string, string>; // Headers personalizados

  @Column({ type: 'simple-json', nullable: true })
  endpoints: Array<{
    name: string;
    path: string;
    method: string;
    description?: string;
  }>;

  @Column({ type: 'simple-enum', enum: EndpointStatus, default: EndpointStatus.ACTIVE })
  status: EndpointStatus;

  @Column({ type: 'datetime', nullable: true })
  lastTestedAt: Date;

  @Column({ nullable: true })
  lastTestResult: string;

  @Column({ default: 0 })
  timeout: number; // ms

  @Column({ default: true })
  verifySSL: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string; // UUID del usuario
}