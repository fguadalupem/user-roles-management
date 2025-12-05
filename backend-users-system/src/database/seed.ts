// Crear comando de seed: src/database/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);
  
  try {
    await seedService.seed();
    console.log('✨ Seed ejecutado correctamente');
  } catch (error) {
    console.error('❌ Error al ejecutar seed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
