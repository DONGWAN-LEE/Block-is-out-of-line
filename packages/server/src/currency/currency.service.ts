import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CurrencyBalance } from './entities/currency-balance.entity.js';
import { CurrencyLedger } from './entities/currency-ledger.entity.js';
import { ErrorCodes } from '../common/constants/error-codes.js';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);

  constructor(
    @InjectRepository(CurrencyBalance)
    private readonly balanceRepository: Repository<CurrencyBalance>,

    @InjectRepository(CurrencyLedger)
    private readonly ledgerRepository: Repository<CurrencyLedger>,
  ) {}

  async getBalance(playerId: string, currencyType: string): Promise<CurrencyBalance | null> {
    return this.balanceRepository.findOne({ where: { playerId, currencyType } });
  }

  async getBalances(playerId: string): Promise<CurrencyBalance[]> {
    return this.balanceRepository.find({ where: { playerId } });
  }

  async credit(
    playerId: string,
    currencyType: string,
    amount: bigint,
    reason: string,
    referenceId?: string,
    manager?: EntityManager,
  ): Promise<CurrencyBalance> {
    const run = async (em: EntityManager): Promise<CurrencyBalance> => {
      const balanceRepo = em.getRepository(CurrencyBalance);
      const ledgerRepo = em.getRepository(CurrencyLedger);

      let balance = await balanceRepo.findOne({
        where: { playerId, currencyType },
        lock: { mode: 'pessimistic_write' },
      });

      if (!balance) {
        balance = balanceRepo.create({
          playerId,
          currencyType,
          balance: '0',
        });
      }

      const currentBalance = BigInt(balance.balance);
      const newBalance = currentBalance + amount;

      balance.balance = newBalance.toString();
      await balanceRepo.save(balance);

      const ledger = ledgerRepo.create({
        playerId,
        currencyType,
        amount: amount.toString(),
        balanceAfter: newBalance.toString(),
        reason,
        referenceId: referenceId ?? null,
      });
      await ledgerRepo.save(ledger);

      this.logger.log(
        `credit playerId=${playerId} type=${currencyType} amount=${amount} reason=${reason} balanceAfter=${newBalance}`,
      );

      return balance;
    };

    if (manager) {
      return run(manager);
    }

    return this.balanceRepository.manager.transaction(run);
  }

  async debit(
    playerId: string,
    currencyType: string,
    amount: bigint,
    reason: string,
    referenceId?: string,
    manager?: EntityManager,
  ): Promise<CurrencyBalance> {
    const run = async (em: EntityManager): Promise<CurrencyBalance> => {
      const balanceRepo = em.getRepository(CurrencyBalance);
      const ledgerRepo = em.getRepository(CurrencyLedger);

      const balance = await balanceRepo.findOne({
        where: { playerId, currencyType },
        lock: { mode: 'pessimistic_write' },
      });

      const currentBalance = balance ? BigInt(balance.balance) : 0n;

      if (currentBalance < amount) {
        throw new HttpException(
          {
            code: ErrorCodes.CURRENCY_001.code,
            message: ErrorCodes.CURRENCY_001.message,
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      const newBalance = currentBalance - amount;

      if (!balance) {
        throw new HttpException(
          {
            code: ErrorCodes.CURRENCY_001.code,
            message: ErrorCodes.CURRENCY_001.message,
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      balance.balance = newBalance.toString();
      await balanceRepo.save(balance);

      const ledger = ledgerRepo.create({
        playerId,
        currencyType,
        amount: (-amount).toString(),
        balanceAfter: newBalance.toString(),
        reason,
        referenceId: referenceId ?? null,
      });
      await ledgerRepo.save(ledger);

      this.logger.log(
        `debit playerId=${playerId} type=${currencyType} amount=${amount} reason=${reason} balanceAfter=${newBalance}`,
      );

      return balance;
    };

    if (manager) {
      return run(manager);
    }

    return this.balanceRepository.manager.transaction(run);
  }
}
