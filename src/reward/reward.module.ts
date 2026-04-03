import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceLog } from './entities/attendance-log.entity.js';
import { FirstLoginBonus } from './entities/first-login-bonus.entity.js';
import { RewardConfig } from './entities/reward-config.entity.js';
import { CurrencyModule } from '../currency/currency.module.js';
import { RewardService } from './reward.service.js';
import { RewardController } from './reward.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttendanceLog, FirstLoginBonus, RewardConfig]),
    CurrencyModule,
  ],
  providers: [RewardService],
  controllers: [RewardController],
})
export class RewardModule {}
