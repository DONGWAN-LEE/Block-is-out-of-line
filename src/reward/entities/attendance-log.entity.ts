import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { PlayerAccount } from '../../auth/entities/player-account.entity.js';

@Entity('attendance_logs')
@Unique(['playerId', 'attendanceDate'])
export class AttendanceLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'player_id' })
  playerId: string;

  @ManyToOne(() => PlayerAccount)
  player: PlayerAccount;

  @Column({ type: 'date', name: 'attendance_date' })
  attendanceDate: Date;

  @Column({ type: 'int', name: 'day_number' })
  dayNumber: number;

  @Column({ type: 'varchar', length: 20, name: 'reward_type' })
  rewardType: string;

  @Column({ type: 'int', name: 'reward_amount' })
  rewardAmount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
