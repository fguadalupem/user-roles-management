// backend-users-system/src/licenses/license.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  Delete,
  Put,
} from '@nestjs/common';
import { LicenseService } from './license.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('licenses')
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  // Endpoint público para validar desde el frontend; requiere JWT para conocer rol del usuario
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('validate')
  async validate(@Request() req: any) {
    const roles = req.user?.roles || [];
    const result = await this.licenseService.validateSystemLicense(roles);
    return { isValid: result.isValid, reason: result.reason || null };
  }

  // Obtener todas (solo administradores)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator')
  @Get()
  async getAll() {
    return this.licenseService.getAll();
  }

  // Crear (solo administradores)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator')
  @Post()
  async create(@Body() body: any) {
    // body: { companyName, maxUsers, expirationDate: ISOString, features: string[] }
    const lic = await this.licenseService.createLicense({
      companyName: body.companyName,
      maxUsers: Number(body.maxUsers || 0),
      expirationDate: new Date(body.expirationDate),
      features: body.features || [],
    });
    return { message: 'Licencia creada', license: lic };
  }

  // Activa una licencia por su key (solo Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator')
  @Post('activate')
async activate(@Body() body: { key: string, activatedBy?: string }) {
    // self-activation by admin
//    const lic = await this.licenseService.activateLicense(body.key, body.activatedBy || 'admin');
    const lic = await this.licenseService.activateLicense(body.key, 'admin');
    return { message: 'Licencia activada', license: lic };
  }

  // Actualizar (solo administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator')
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const lic = await this.licenseService.update(Number(id), body);
    return { message: 'Licencia actualizada', license: lic };
  }

  // Revocar (solo administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator')
  @Delete(':id')
  async revoke(@Param('id') id: string) {
    const license = await this.licenseService.revoke(Number(id));
    return { message: 'Licencia revocada', license };
  }
}
