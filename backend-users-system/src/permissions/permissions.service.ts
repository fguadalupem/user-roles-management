// backend-users-system/src/permissions/permissions.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  // ✅ CREAR
  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    // Verificar si ya existe
    const existing = await this.permissionRepository.findOne({
      where: {
        resource: createPermissionDto.resource,
        action: createPermissionDto.action,
      },
    });

    if (existing) {
      throw new ConflictException('Ya existe un permiso con ese recurso y acción');
    }

    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  // 📋 LISTAR TODOS
  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({
      order: { resource: 'ASC', action: 'ASC' },
    });
  }

  // 📋 LISTAR AGRUPADOS
  async findGrouped(): Promise<Record<string, Permission[]>> {
    const permissions = await this.findAll();
    
    return permissions.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  }

  // 🔍 OBTENER UNO
  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({ where: { id } });
    
    if (!permission) {
      throw new NotFoundException('Permiso no encontrado');
    }
    
    return permission;
  }

  // ✏️ ACTUALIZAR
  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);

    // Si se actualiza resource o action, verificar que no exista
    if (updatePermissionDto.resource || updatePermissionDto.action) {
      const resource = updatePermissionDto.resource || permission.resource;
      const action = updatePermissionDto.action || permission.action;

      const existing = await this.permissionRepository.findOne({
        where: { resource, action },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Ya existe un permiso con ese recurso y acción');
      }
    }

    Object.assign(permission, updatePermissionDto);
    return this.permissionRepository.save(permission);
  }

  // 🗑️ ELIMINAR
  async remove(id: string): Promise<void> {
    const permission = await this.findOne(id);
    await this.permissionRepository.remove(permission);
  }

  // 📋 POR RECURSO
  async findByResource(resource: string): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { resource },
      order: { action: 'ASC' },
    });
  }

  // 📋 POR ROL
  async findByRole(roleId: string): Promise<Permission[]> {
    return this.permissionRepository
      .createQueryBuilder('permission')
      .innerJoin('permission.roles', 'role')
      .where('role.id = :roleId', { roleId })
      .getMany();
  }
}