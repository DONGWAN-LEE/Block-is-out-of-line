import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('player_accounts')
export class PlayerAccount {
  @ApiProperty({
    description: 'Player account UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiPropertyOptional({
    description: 'Device UUID from Unity SystemInfo.deviceUniqueIdentifier',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    nullable: true,
  })
  @Column({ type: 'varchar', nullable: true, unique: true })
  deviceId: string | null;

  @ApiPropertyOptional({
    description: 'Google OAuth account ID',
    example: '117890123456789012345',
    nullable: true,
  })
  @Column({ type: 'varchar', nullable: true, unique: true })
  googleId: string | null;

  @ApiPropertyOptional({
    description: 'Facebook OAuth account ID',
    example: '1234567890123456',
    nullable: true,
  })
  @Column({ type: 'varchar', nullable: true, unique: true })
  facebookId: string | null;

  @ApiPropertyOptional({
    description: 'Naver OAuth account ID',
    example: 'abcdefghij1234567890',
    nullable: true,
  })
  @Column({ type: 'varchar', nullable: true, unique: true })
  naverId: string | null;

  @ApiPropertyOptional({
    description: 'Player display nickname',
    example: 'BlockMaster',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  nickname: string | null;

  @ApiProperty({
    description: 'Player current level',
    example: 1,
  })
  @Column({ type: 'int', default: 1 })
  level: number;

  @ApiProperty({
    description: 'Whether the player account is banned',
    example: false,
  })
  @Column({ type: 'boolean', default: false })
  isBanned: boolean;

  @ApiPropertyOptional({
    description: 'Reason for the ban, null if not banned',
    example: 'Cheating detected',
    nullable: true,
  })
  @Column({ type: 'varchar', nullable: true })
  banReason: string | null;

  @ApiPropertyOptional({
    description: 'Ban expiry timestamp, null for permanent ban or if not banned',
    example: '2026-12-31T23:59:59.000Z',
    nullable: true,
  })
  @Column({ type: 'timestamptz', nullable: true })
  banExpiresAt: Date | null;

  @ApiPropertyOptional({
    description: 'Timestamp of the player last login',
    example: '2026-04-01T12:00:00.000Z',
    nullable: true,
  })
  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2026-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    description: 'Account last updated timestamp',
    example: '2026-04-01T12:00:00.000Z',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
