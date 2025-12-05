import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { AuditModule } from './audit/audit.module';
import { User } from './users/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import { Permission } from './permissions/entities/permission.entity';
import { AuditLog } from './audit/entities/audit.entity';
import { SeedService } from './database/seed.service';
import { LicenseModule } from './licenses/license.module'; 
import { License } from './licenses/entities/license.entity'; 
import { ApiEndpoint } from './api-endpoints/entities/api-endpoint.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [User, Role, Permission, AuditLog, License],
      synchronize: true,
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([User, Role, Permission]),
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    AuditModule,
    LicenseModule, 
    ApiEndpoint,
  ],
  providers: [SeedService],
})
export class AppModule {}