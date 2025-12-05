// backend-users-system/src/api-endpoints/api-endpoint.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiEndpointService } from './api-endpoint.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api-endpoints')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApiEndpointController {
  constructor(private readonly apiEndpointService: ApiEndpointService) {}

  // 📋 LISTAR ENDPOINTS
  @Get()
  @Roles('Administrator', 'Manager')
  async findAll() {
    return this.apiEndpointService.findAll();
  }

  // 🔍 OBTENER UNO
  @Get(':id')
  @Roles('Administrator', 'Manager')
  async findOne(@Param('id') id: string) {
    return this.apiEndpointService.findOne(id);
  }

  // ✅ CREAR ENDPOINT
  @Post()
  @Roles('Administrator')
  async create(@Body() data: any, @Request() req) {
    data.createdBy = req.user.id;
    return this.apiEndpointService.create(data);
  }

  // ✏️ ACTUALIZAR
  @Put(':id')
  @Roles('Administrator')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.apiEndpointService.update(id, data);
  }

  // 🗑️ ELIMINAR
  @Delete(':id')
  @Roles('Administrator')
  async remove(@Param('id') id: string) {
    await this.apiEndpointService.remove(id);
    return { message: 'Endpoint eliminado' };
  }

  // 🧪 PROBAR CONEXIÓN
  @Post(':id/test')
  @Roles('Administrator', 'Manager')
  async testConnection(@Param('id') id: string) {
    return this.apiEndpointService.testConnection(id);
  }

  // 🌐 EJECUTAR REQUEST
  @Post(':id/execute')
  @Roles('Administrator', 'Manager', 'User')
  async executeRequest(
    @Param('id') id: string,
    @Body() data: {
      path: string;
      method: string;
      body?: any;
      headers?: Record<string, string>;
    },
  ) {
    return this.apiEndpointService.executeRequest(
      id,
      data.path,
      data.method,
      data.body,
      data.headers,
    );
  }
}