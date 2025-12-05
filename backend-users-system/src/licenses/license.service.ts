// backend-users-system/src/licenses/license.service.ts
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { License } from './entities/license.entity';
import * as crypto from 'crypto';

@Injectable()
export class LicenseService {
  // usa env LICENSE_SECRET, con fallback seguro
  private readonly SECRET_KEY =
    process.env.LICENSE_SECRET || 'QBIT-ULTRA-SECRET-2025-KEY-DO-NOT-SHARE';
  private readonly ALGORITHM = 'aes-256-cbc';

  constructor(
    @InjectRepository(License)
    private licenseRepository: Repository<License>,
  ) {}

  // Genera un license.key legible a partir de payload pequeño
  private generateKey(payload: any): string {
    const hash = crypto
      .createHmac('sha256', this.SECRET_KEY)
      .update(JSON.stringify(payload))
      .digest('hex')
      .slice(0, 16);
    const parts = hash.match(/.{1,4}/g) || [];
    return `QBIT-${parts.join('-').toUpperCase()}`;
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(this.SECRET_KEY, 'salt', 32);
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(text: string): string {
    const parts = text.split(':');
    if (parts.length < 2) throw new Error('Invalid encrypted text');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts.slice(1).join(':');
    const key = crypto.scryptSync(this.SECRET_KEY, 'salt', 32);

    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private validateKey(key: string, encryptedData: string): boolean {
    try {
      const decrypted = this.decrypt(encryptedData);
      const payload = JSON.parse(decrypted);
      const regeneratedKey = this.generateKey(payload);
      return key === regeneratedKey;
    } catch (e) {
      return false;
    }
  }

  // Crear licencia (persistir)
  async createLicense(data: {
    companyName: string;
    maxUsers: number;
    expirationDate: Date;
    features?: string[];
  }): Promise<License> {
    const payload = {
      c: data.companyName,
      u: data.maxUsers,
      e: new Date(data.expirationDate).getTime(),
      f: data.features || [],
      t: Date.now(),
    };

    const encryptedData = this.encrypt(JSON.stringify(payload));
    const key = this.generateKey(payload);

    const license = this.licenseRepository.create({
      key,
      encryptedData,
      companyName: data.companyName,
      maxUsers: data.maxUsers,
      expirationDate: new Date(data.expirationDate),
      features: data.features || [],
      isActive: false,
    });

    return this.licenseRepository.save(license);
  }

  // Obtener todas (admin)
  async getAll(): Promise<License[]> {
    return this.licenseRepository.find({ order: { id: 'DESC' } });
  }

  async getById(id: number): Promise<License> {
    const lic = await this.licenseRepository.findOne({ where: { id } });
    if (!lic) throw new NotFoundException('Licencia no encontrada');
    return lic;
  }

  // Actualizar registro de licencia (admin)
  async update(id: number, data: Partial<License>): Promise<License> {
    const lic = await this.getById(id);
    if (data.expirationDate) lic.expirationDate = new Date(data.expirationDate);
    if (typeof data.isActive === 'boolean') lic.isActive = data.isActive;
    if (data.companyName) lic.companyName = data.companyName;
    if (typeof data.maxUsers === 'number') lic.maxUsers = data.maxUsers;
    if (data.features) lic.features = data.features;
    return this.licenseRepository.save(lic);
  }

  // Activar licencia (marca isActive true)
  async activateLicense(key: string, activatedBy: string): Promise<License> {
    const license = await this.licenseRepository.findOne({ where: { key } });
    if (!license) throw new BadRequestException('Licencia inválida');
    if (license.isActive) throw new BadRequestException('Licencia ya activada');

    // validar expiración
    if (new Date() > new Date(license.expirationDate)) {
      throw new BadRequestException('Licencia expirada');
    }

    // validar integridad
    if (!this.validateKey(key, license.encryptedData)) {
      throw new UnauthorizedException('Licencia corrupta o modificada');
    }

    license.isActive = true;
    license.activatedAt = new Date();
    license.activatedBy = activatedBy;
    return this.licenseRepository.save(license);
  }

  // Revocar
  async revoke(id: number): Promise<License> {
    const lic = await this.getById(id);
    lic.isActive = false;
    return this.licenseRepository.save(lic);
  }

  // Validar licencia actual del sistema: devuelve boolean
  // userRoles: lista de roles del usuario que hace la petición
  async validateSystemLicense(userRoles: string[] = []): Promise<{ isValid: boolean; reason?: string }> {
    // super admin (o Administrator) siempre pasa
    const bypassRoles = ['superadmin', 'Administrator', 'administrator', 'ADMIN'];
    const hasBypass = userRoles.some((r) => bypassRoles.includes(String(r)));
    if (hasBypass) {
      return { isValid: true, reason: 'Bypass role' };
    }

    // tomar la licencia activa más reciente (si existe)
    const license = await this.licenseRepository.findOne({ where: { isActive: true }, order: { id: 'DESC' } });

    if (!license) return { isValid: false, reason: 'No active license' };

    // verificar integridad y expiración
    if (!this.validateKey(license.key, license.encryptedData)) return { isValid: false, reason: 'Invalid signature' };

    if (new Date() > new Date(license.expirationDate)) return { isValid: false, reason: 'Expired' };

    return { isValid: true };
  }
}
