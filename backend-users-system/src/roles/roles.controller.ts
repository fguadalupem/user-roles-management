// backend-users-system/src/roles/roles.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // 📋 LISTAR TODOS
  @Get()
  @Roles('Administrator', 'Manager', 'admin')
  async findAll() {
    console.log('🔵 GET /roles - Listando roles');
    const roles = await this.rolesService.findAll();
    console.log('✅ Roles encontrados:', roles.length);
    return roles;
  }

  // 🔍 OBTENER UNO
  @Get(':id')
  @Roles('Administrator', 'Manager', 'admin')
  async findOne(@Param('id') id: string) {
    console.log('🔵 GET /roles/:id - ID:', id);
    const role = await this.rolesService.findOne(id);
    console.log('✅ Role encontrado:', role);
    return role;
  }

  // ✅ CREAR
  @Post()
  @Roles('Administrator', 'admin')
  async create(@Body() createRoleDto: CreateRoleDto) {
    console.log('🔵 POST /roles - Body:', createRoleDto);
    const role = await this.rolesService.create(createRoleDto);
    console.log('✅ Role creado:', role);
    return role;
  }

  // ✏️ ACTUALIZAR
  @Patch(':id')
  @Roles('Administrator', 'admin')
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    console.log('🔵 PATCH /roles/:id - ID:', id, 'Body:', updateRoleDto);
    const role = await this.rolesService.update(id, updateRoleDto);
    console.log('✅ Role actualizado:', role);
    return role;
  }

  // 🗑️ ELIMINAR
  @Delete(':id')
  @Roles('Administrator', 'admin')
  async remove(@Param('id') id: string) {
    console.log('🔵 DELETE /roles/:id - ID:', id);
    await this.rolesService.remove(id);
    console.log('✅ Role eliminado');
    return { message: 'Rol eliminado correctamente' };
  }

  // 🔐 OBTENER PERMISOS DEL ROL
  @Get(':id/permissions')
  @Roles('Administrator', 'Manager', 'admin')
  async getPermissions(@Param('id') id: string) {
    console.log('🔵 GET /roles/:id/permissions - ID:', id);
    const permissions = await this.rolesService.getPermissions(id);
    console.log('✅ Permisos encontrados:', permissions.length);
    return permissions;
  }

  // 🔐 ASIGNAR PERMISOS AL ROL
  @Post(':id/permissions')
  @Roles('Administrator', 'admin')
  async assignPermissions(
    @Param('id') id: string,
    @Body() body: { permissionIds: string[] },
  ) {
    console.log('🔵 POST /roles/:id/permissions - ID:', id, 'Permisos:', body.permissionIds);
    const role = await this.rolesService.assignPermissions(id, body.permissionIds);
    console.log('✅ Permisos asignados');
    return role;
  }
}