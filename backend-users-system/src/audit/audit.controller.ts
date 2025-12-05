import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('audit')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermissions('audit:read')
  async findAll(
    @Query('limit') limit: number = 100,
    @Query('offset') offset: number = 0,
  ) {
    return this.auditService.findAll(limit, offset);
  }

  @Get('user/:userId')
  @RequirePermissions('audit:read')
  async findByUser(@Param('userId') userId: string) {
    return this.auditService.findByUser(userId);
  }

  @Get('resource/:resource')
  @RequirePermissions('audit:read')
  async findByResource(@Param('resource') resource: string) {
    return this.auditService.findByResource(resource);
  }
}