import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerAccount } from '../auth/entities/player-account.entity.js';
import { CurrencyModule } from '../currency/currency.module.js';
import { PlayerService } from './player.service.js';
import { PlayerController } from './player.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlayerAccount]),
    CurrencyModule,
  ],
  providers: [PlayerService],
  controllers: [PlayerController],
})
export class PlayerModule {}
