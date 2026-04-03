import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyBalance } from './entities/currency-balance.entity.js';
import { CurrencyLedger } from './entities/currency-ledger.entity.js';
import { CurrencyService } from './currency.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([CurrencyBalance, CurrencyLedger])],
  providers: [CurrencyService],
  exports: [CurrencyService],
})
export class CurrencyModule {}
