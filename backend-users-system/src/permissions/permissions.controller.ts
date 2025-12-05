// backend-users-system/src/permissions/permissions.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  // 📋 LISTAR TODOS
  @Get()
  @Roles('Administrator', 'Manager', 'admin') // ← Agregado 'admin'
  async findAll() {
    return this.permissionsService.findAll();
  }

  // 📋 LISTAR AGRUPADOS
  @Get('grouped')
  @Roles('Administrator', 'Manager', 'admin') // ← Agregado 'admin'
  async findGrouped() {
    return this.permissionsService.findGrouped();
  }

  // 🔍 OBTENER UNO
  @Get(':id')
  @Roles('Administrator', 'Manager', 'admin') // ← Agregado 'admin'
  async findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  // ✅ CREAR
  @Post()
  @Roles('Administrator', 'admin') // ← Agregado 'admin'
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    console.log('🔵 CREATE Permission - Body:', createPermissionDto);
    const permission = await this.permissionsService.create(createPermissionDto);
    console.log('✅ Permission creado:', permission);
    return permission;
  }

  // ✏️ ACTUALIZAR
  @Patch(':id')
  @Roles('Administrator', 'admin') // ← Agregado 'admin'
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    console.log('🔵 UPDATE Permission - ID:', id, 'Body:', updatePermissionDto);
    const permission = await this.permissionsService.update(id, updatePermissionDto);
    console.log('✅ Permission actualizado:', permission);
    return permission;
  }

  // 🗑️ ELIMINAR
  @Delete(':id')
  @Roles('Administrator', 'admin') // ← Agregado 'admin'
  async remove(@Param('id') id: string) {
    console.log('🔵 DELETE Permission - ID:', id);
    await this.permissionsService.remove(id);
    console.log('✅ Permission eliminado');
    return { message: 'Permiso eliminado correctamente' };
  }

  // 📋 POR RECURSO
  @Get('resource/:resource')
  @Roles('Administrator', 'Manager', 'admin') // ← Agregado 'admin'
  async findByResource(@Param('resource') resource: string) {
    return this.permissionsService.findByResource(resource);
  }

  // 📋 POR ROL
  @Get('role/:roleId')
  @Roles('Administrator', 'Manager', 'admin') // ← Agregado 'admin'
  async findByRole(@Param('roleId') roleId: string) {
    return this.permissionsService.findByRole(roleId);
  }
}