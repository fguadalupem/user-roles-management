// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(email: string, password: string, req?: any) {
    const user = await this.validateUser(email, password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const permissions = this.extractPermissions(user.roles);

    const payload = { 
      sub: user.id, 
      email: user.email,
      roles: user.roles.map(r => r.name),
      permissions 
    };

    // Registrar login en auditoría
    await this.auditService.log({
      userId: user.id,
      action: 'LOGIN',
      resource: 'AUTH',
      ip: req?.ip,
      userAgent: req?.headers['user-agent'],
    });

    // Actualizar último login
    await this.usersService.updateLastLogin(user.id);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles.map(r => r.name),
        permissions,
      },
    };
  }

  private extractPermissions(roles: any[]): string[] {
    const permissions = new Set<string>();
    roles.forEach(role => {
      role.permissions?.forEach(permission => {
//        permissions.add(`${permission.resource}:${permission.action}`);
        permissions.add(`${permission.resource}:${permission.action}`);
      });
    });
    return Array.from(permissions);
  }
}



