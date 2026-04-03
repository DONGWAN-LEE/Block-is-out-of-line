import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface TossGameVerifyResult {
  isValid: boolean;
  transactionId: string;
}

interface TossGameVerifyResponse {
  success: boolean;
  orderId: string;
}

@Injectable()
export class TossGameValidator {
  private readonly logger = new Logger(TossGameValidator.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('TOSS_GAME_API_KEY', '');
    // TODO: Replace with the actual Toss Game IAP verification endpoint once API documentation is available
    this.apiUrl = this.configService.get<string>(
      'TOSS_GAME_API_URL',
      'https://api.tosspayments.com/v1/game/purchases/verify',
    );
  }

  async verify(receipt: string, productId: string): Promise<TossGameVerifyResult> {
    // TODO: Implement actual verification once Toss Game API documentation is confirmed.
    // Expected request: POST {TOSS_GAME_API_URL} with { receipt, productId } and Authorization header.
    try {
      const response = await axios.post<TossGameVerifyResponse>(
        this.apiUrl,
        { receipt, productId },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const { success, orderId } = response.data;
      return {
        isValid: success === true,
        transactionId: orderId,
      };
    } catch (err) {
      this.logger.warn(
        `Toss Game verification failed for productId=${productId}: ${(err as Error).message}`,
      );
      return { isValid: false, transactionId: '' };
    }
  }
}
