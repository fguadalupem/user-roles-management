// backend-users-system/src/api-endpoints/api-endpoint.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiEndpointService } from './api-endpoint.service';
import { ApiEndpointController } from './api-endpoint.controller';
import { ApiEndpoint } from './entities/api-endpoint.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApiEndpoint])],
  controllers: [ApiEndpointController],
  providers: [ApiEndpointService],
  exports: [ApiEndpointService],
})
export class ApiEndpointModule {}