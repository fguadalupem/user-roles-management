// backend-users-system/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { AuditModule } from '../audit/audit.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    UsersModule,
    AuditModule,
    PassportModule,
    JwtModule.register({
      //secret: process.env.JWT_SECRET ,
      secret: 'QBIT-JWT-SECRET-2025-ULTRA-SECURE-DO-NOT-SHARE',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard, // ✅ Agregar como provider
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    RolesGuard, // ✅ Exportar para usar en otros módulos
  ],
})
export class AuthModule {}