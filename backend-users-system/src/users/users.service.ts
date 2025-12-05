import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { AuditService } from '../audit/audit.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private auditService: AuditService,
  ) {}

  async create(createUserDto: CreateUserDto, currentUserId?: string): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const user = this.usersRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);

    await this.auditService.log({
      userId: currentUserId || savedUser.id,
      action: 'CREATE',
      resource: 'USER',
      newData: { id: savedUser.id, email: savedUser.email, username: savedUser.username },
    });

    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['roles', 'roles.permissions'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUserId: string): Promise<User> {
    const user = await this.findOne(id);
    const oldData = { 
      id: user.id,
      email: user.email, 
      isActive: user.isActive 
    };

    if (updateUserDto.username) {
      user.username = updateUserDto.username;
    }

    if (updateUserDto.email) {
      user.email = updateUserDto.email;
    }

    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.isActive !== undefined) {
      user.isActive = updateUserDto.isActive;
    }

    const updatedUser = await this.usersRepository.save(user);

    await this.auditService.log({
      userId: currentUserId,
      action: 'UPDATE',
      resource: 'USER',
      oldData,
      newData: { 
        id: updatedUser.id, 
        email: updatedUser.email, 
        isActive: updatedUser.isActive 
      },
    });

    return updatedUser;
  }

  async remove(id: string, currentUserId: string): Promise<void> {
    const user = await this.findOne(id);

    await this.auditService.log({
      userId: currentUserId,
      action: 'DELETE',
      resource: 'USER',
      oldData: { id: user.id, email: user.email, username: user.username },
    });

    await this.usersRepository.remove(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { lastLogin: new Date() });
  }
}