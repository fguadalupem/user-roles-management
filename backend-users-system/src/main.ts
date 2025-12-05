import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as os from 'os';

function getLocalIpAddress(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

async function bootstrap() {
    require('dotenv').config();
  
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Configurado' : '❌ NO configurado');
  
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true, // Permitir cualquier origen en desarrollo
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  const localIp = getLocalIpAddress();

  await app.listen(port, '0.0.0.0');
  
  console.log('\n🚀 Backend corriendo en:');
  console.log(`   Local:    http://localhost:${port}/api`);
  console.log(`   Red:      http://${localIp}:${port}/api`);
  console.log('\n📝 Credenciales de prueba:');
  console.log('   Email:    admin@system.com');
  console.log('   Password: Admin123!\n');
}

bootstrap();