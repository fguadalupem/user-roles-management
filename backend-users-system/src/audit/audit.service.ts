import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit.entity';

export interface LogAuditDto {
  userId: string;
  action: string;
  resource: string;
  oldData?: any;
  newData?: any;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepository: Repository<AuditLog>,
  ) {}

  async log(logData: LogAuditDto): Promise<AuditLog> {
    const auditLog = this.auditRepository.create(logData);
    return this.auditRepository.save(auditLog);
  }

  async findByUser(userId: string, limit: number = 100): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByResource(resource: string, limit: number = 100): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { resource },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findAll(limit: number = 100, offset: number = 0): Promise<{ data: AuditLog[], total: number }> {
    const [data, total] = await this.auditRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { data, total };
  }
}