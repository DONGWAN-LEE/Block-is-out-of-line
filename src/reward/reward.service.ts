import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AttendanceLog } from './entities/attendance-log.entity.js';
import { FirstLoginBonus } from './entities/first-login-bonus.entity.js';
import { RewardConfig } from './entities/reward-config.entity.js';
import { CurrencyService } from '../currency/currency.service.js';
import { ErrorCodes } from '../common/constants/error-codes.js';
import { AttendanceStatusDto } from './dto/attendance-status.dto.js';
import { RewardResultDto } from './dto/reward-result.dto.js';

@Injectable()
export class RewardService {
  constructor(
    @InjectRepository(AttendanceLog)
    private readonly attendanceLogRepository: Repository<AttendanceLog>,

    @InjectRepository(FirstLoginBonus)
    private readonly firstLoginBonusRepository: Repository<FirstLoginBonus>,

    @InjectRepository(RewardConfig)
    private readonly rewardConfigRepository: Repository<RewardConfig>,

    private readonly currencyService: CurrencyService,
    private readonly dataSource: DataSource,
  ) {}

  private getTodayDate(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  async getAttendanceStatus(playerId: string): Promise<AttendanceStatusDto> {
    const totalDays = await this.attendanceLogRepository.count({ where: { playerId } });

    const today = this.getTodayDate();
    const todayLog = await this.attendanceLogRepository.findOne({
      where: { playerId, attendanceDate: today },
    });
    const claimedToday = !!todayLog;

    const nextDayNumber = totalDays + (claimedToday ? 0 : 1);
    const configs = await this.rewardConfigRepository.find({
      where: { rewardCategory: 'attendance', isActive: true },
      order: { dayNumber: 'ASC' },
    });

    let nextReward: AttendanceStatusDto['nextReward'] = null;
    if (configs.length > 0 && !claimedToday) {
      const maxDay = Math.max(...configs.map((c) => c.dayNumber ?? 0));
      const cycledDay = maxDay > 0 ? ((nextDayNumber - 1) % maxDay) + 1 : 1;
      const config = configs.find((c) => c.dayNumber === cycledDay) ?? configs[0];
      nextReward = {
        dayNumber: nextDayNumber,
        rewardType: config.rewardType,
        rewardAmount: config.rewardAmount,
      };
    }

    return { totalDays, claimedToday, nextReward };
  }

  async claimAttendance(playerId: string): Promise<RewardResultDto> {
    const today = this.getTodayDate();

    const existing = await this.attendanceLogRepository.findOne({
      where: { playerId, attendanceDate: today },
    });
    if (existing) {
      throw new HttpException(
        { code: ErrorCodes.REWARD_001.code, message: ErrorCodes.REWARD_001.message },
        HttpStatus.CONFLICT,
      );
    }

    const totalDays = await this.attendanceLogRepository.count({ where: { playerId } });
    const dayNumber = totalDays + 1;

    const configs = await this.rewardConfigRepository.find({
      where: { rewardCategory: 'attendance', isActive: true },
      order: { dayNumber: 'ASC' },
    });
    if (configs.length === 0) {
      throw new HttpException(
        { code: ErrorCodes.REWARD_003.code, message: ErrorCodes.REWARD_003.message },
        HttpStatus.NOT_FOUND,
      );
    }

    const maxDay = Math.max(...configs.map((c) => c.dayNumber ?? 0));
    const cycledDay = maxDay > 0 ? ((dayNumber - 1) % maxDay) + 1 : 1;
    const config = configs.find((c) => c.dayNumber === cycledDay) ?? configs[0];

    await this.dataSource.manager.transaction(async (manager) => {
      const log = manager.getRepository(AttendanceLog).create({
        playerId,
        attendanceDate: today,
        dayNumber,
        rewardType: config.rewardType,
        rewardAmount: config.rewardAmount,
      });
      await manager.getRepository(AttendanceLog).save(log);

      await this.currencyService.credit(
        playerId,
        config.rewardType,
        BigInt(config.rewardAmount),
        'attendance_reward',
        log.id,
        manager,
      );
    });

    return {
      rewardType: config.rewardType,
      rewardAmount: config.rewardAmount,
      message: `Day ${dayNumber} attendance reward claimed`,
    };
  }

  async getFirstLoginStatus(playerId: string): Promise<{ claimed: boolean }> {
    const bonus = await this.firstLoginBonusRepository.findOne({ where: { playerId } });
    return { claimed: !!bonus };
  }

  async claimFirstLoginBonus(playerId: string): Promise<RewardResultDto> {
    const existing = await this.firstLoginBonusRepository.findOne({ where: { playerId } });
    if (existing) {
      throw new HttpException(
        { code: ErrorCodes.REWARD_002.code, message: ErrorCodes.REWARD_002.message },
        HttpStatus.CONFLICT,
      );
    }

    const config = await this.rewardConfigRepository.findOne({
      where: { rewardCategory: 'first_login', isActive: true },
    });
    if (!config) {
      throw new HttpException(
        { code: ErrorCodes.REWARD_003.code, message: ErrorCodes.REWARD_003.message },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.dataSource.manager.transaction(async (manager) => {
      const bonus = manager.getRepository(FirstLoginBonus).create({
        playerId,
        claimedAt: new Date(),
        rewardType: config.rewardType,
        rewardAmount: config.rewardAmount,
      });
      await manager.getRepository(FirstLoginBonus).save(bonus);

      await this.currencyService.credit(
        playerId,
        config.rewardType,
        BigInt(config.rewardAmount),
        'first_login_bonus',
        bonus.id,
        manager,
      );
    });

    return {
      rewardType: config.rewardType,
      rewardAmount: config.rewardAmount,
      message: 'First login bonus claimed',
    };
  }
}
