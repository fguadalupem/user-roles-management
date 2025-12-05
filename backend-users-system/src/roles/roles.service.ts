// backend-users-system/src/roles/roles.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  // ✅ CREAR
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Verificar si ya existe
    const existing = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existing) {
      throw new ConflictException('Ya existe un rol con ese nombre');
    }

    const role = this.roleRepository.create({
      name: createRoleDto.name,
      description: createRoleDto.description,
    });

    const savedRole = await this.roleRepository.save(role);

    // Asignar permisos si se proporcionaron
    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      await this.assignPermissions(savedRole.id, createRoleDto.permissionIds);
      return this.findOne(savedRole.id);
    }

    return savedRole;
  }

  // 📋 LISTAR TODOS
  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['permissions'],
      order: { name: 'ASC' },
    });
  }

  // 🔍 OBTENER UNO
  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }

    return role;
  }

  // ✏️ ACTUALIZAR
  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    // Verificar nombre único si se actualiza
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existing = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name },
      });

      if (existing) {
        throw new ConflictException('Ya existe un rol con ese nombre');
      }
    }

    // Actualizar datos básicos
    if (updateRoleDto.name) role.name = updateRoleDto.name;
    if (updateRoleDto.description !== undefined) role.description = updateRoleDto.description;

    await this.roleRepository.save(role);

    // Actualizar permisos si se proporcionaron
    if (updateRoleDto.permissionIds) {
      await this.assignPermissions(id, updateRoleDto.permissionIds);
    }

    return this.findOne(id);
  }

  // 🗑️ ELIMINAR
  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);

    // Verificar que no sea un rol del sistema
    const systemRoles = ['Administrator', 'Manager', 'User', 'admin'];
    if (systemRoles.includes(role.name)) {
      throw new BadRequestException('No se puede eliminar un rol del sistema');
    }

    await this.roleRepository.remove(role);
  }

  // 🔐 OBTENER PERMISOS DEL ROL
  async getPermissions(id: string): Promise<Permission[]> {
    const role = await this.findOne(id);
    return role.permissions || [];
  }

  // 🔐 ASIGNAR PERMISOS AL ROL
  async assignPermissions(id: string, permissionIds: string[]): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }

    // Obtener los permisos
    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionIds) },
    });

    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('Algunos permisos no existen');
    }

    // Asignar permisos
    role.permissions = permissions;
    await this.roleRepository.save(role);

    return this.findOne(id);
  }

  // 📋 BUSCAR POR NOMBRE
  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });
  }
}