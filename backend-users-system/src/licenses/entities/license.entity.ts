// backend-users-system/src/licenses/entities/license.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('licenses')
export class License {
  @PrimaryGeneratedColumn()
  id: number;

  // clave pública / id legible de licencia
  @Column({ unique: true, length: 200 })
  key: string;

  // datos cifrados (JSON stringify)
  @Column({ type: 'text' })
  encryptedData: string;

  // Fecha de expiración final (se usará para ver si está vencida)
  @Column({ type: 'datetime' })
  expirationDate: Date;

  // si está activada y en uso
  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  companyName: string;

  @Column({ default: 0 })
  maxUsers: number;

  // lista simple (features)
  @Column({ type: 'simple-json', nullable: true })
  features: string[];

  @Column({ type: 'datetime', nullable: true })
  activatedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  activatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
