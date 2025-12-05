import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async seed() {
    console.log('🌱 Iniciando seed de datos...');

    const permissions = await this.createPermissions();
    console.log(`✅ ${permissions.length} permisos creados`);

    const roles = await this.createRoles(permissions);
    console.log(`✅ ${roles.length} roles creados`);

    const admin = await this.createAdmin(roles);
    console.log(`✅ Usuario administrador creado: ${admin.email}`);

    console.log('🎉 Seed completado exitosamente');
  }

  private async createPermissions(): Promise<Permission[]> {
    const permissionsData = [
      { name: 'Crear Usuario', resource: 'users', action: 'create', description: 'Permite crear nuevos usuarios' },
      { name: 'Leer Usuarios', resource: 'users', action: 'read', description: 'Permite ver usuarios' },
      { name: 'Actualizar Usuario', resource: 'users', action: 'update', description: 'Permite editar usuarios' },
      { name: 'Eliminar Usuario', resource: 'users', action: 'delete', description: 'Permite eliminar usuarios' },
      
      { name: 'Crear Rol', resource: 'roles', action: 'create', description: 'Permite crear nuevos roles' },
      { name: 'Leer Roles', resource: 'roles', action: 'read', description: 'Permite ver roles' },
      { name: 'Actualizar Rol', resource: 'roles', action: 'update', description: 'Permite editar roles' },
      { name: 'Eliminar Rol', resource: 'roles', action: 'delete', description: 'Permite eliminar roles' },
      
      { name: 'Crear Permiso', resource: 'permissions', action: 'create', description: 'Permite crear permisos' },
      { name: 'Leer Permisos', resource: 'permissions', action: 'read', description: 'Permite ver permisos' },
      { name: 'Actualizar Permiso', resource: 'permissions', action: 'update', description: 'Permite editar permisos' },
      { name: 'Eliminar Permiso', resource: 'permissions', action: 'delete', description: 'Permite eliminar permisos' },
      
      { name: 'Leer Auditoría', resource: 'audit', action: 'read', description: 'Permite ver logs de auditoría' },
    ];

    const permissions: Permission[] = [];
    
    for (const permData of permissionsData) {
      let permission = await this.permissionsRepository.findOne({
        where: { resource: permData.resource, action: permData.action },
      });

      if (!permission) {
        permission = this.permissionsRepository.create(permData);
        await this.permissionsRepository.save(permission);
      }
      permissions.push(permission);
    }

    return permissions;
  }

  private async createRoles(permissions: Permission[]): Promise<Role[]> {
    const rolesData = [
      {
        name: 'admin',
        description: 'Administrador con acceso total',
        permissions: permissions,
      },
      {
        name: 'manager',
        description: 'Gerente con permisos de lectura y actualización',
        permissions: permissions.filter(p => p.action === 'read' || p.action === 'update'),
      },
      {
        name: 'user',
        description: 'Usuario estándar con permisos de lectura',
        permissions: permissions.filter(p => p.action === 'read'),
      },
    ];

    const roles: Role[] = [];
    
    for (const roleData of rolesData) {
      let role = await this.rolesRepository.findOne({
        where: { name: roleData.name },
        relations: ['permissions'],
      });

      if (!role) {
        role = this.rolesRepository.create({
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions,
        });
        await this.rolesRepository.save(role);
      }
      roles.push(role);
    }

    return roles;
  }

  private async createAdmin(roles: Role[]): Promise<User> {
    const adminRole = roles.find(r => r.name === 'admin');
    
    if (!adminRole) {
      throw new Error('Rol de administrador no encontrado');
    }
    
    let admin = await this.usersRepository.findOne({
      where: { email: 'admin@system.com' },
    });

    if (!admin) {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      admin = this.usersRepository.create({
        email: 'admin@system.com',
        username: 'admin',
        password: hashedPassword,
        isActive: true,
        roles: [adminRole],
      });
      await this.usersRepository.save(admin);
    }

    return admin;
  }
}
// Agregar en package.json:
// "seed": "ts-node src/database/seed.ts"
