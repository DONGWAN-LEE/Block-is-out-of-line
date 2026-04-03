import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface AppleStoreVerifyResult {
  isValid: boolean;
  transactionId: string;
  productId: string;
}

interface AppleVerifyResponse {
  status: number;
  receipt?: {
    in_app?: Array<{
      transaction_id: string;
      product_id: string;
    }>;
  };
}

@Injectable()
export class AppleStoreValidator {
  private readonly logger = new Logger(AppleStoreValidator.name);
  private readonly sharedSecret: string;
  private readonly productionUrl: string;
  private readonly sandboxUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.sharedSecret = this.configService.get<string>('APPLE_SHARED_SECRET', '');
    this.productionUrl = this.configService.get<string>(
      'APPLE_VERIFY_URL',
      'https://buy.itunes.apple.com/verifyReceipt',
    );
    this.sandboxUrl = this.configService.get<string>(
      'APPLE_SANDBOX_URL',
      'https://sandbox.itunes.apple.com/verifyReceipt',
    );
  }

  async verify(receiptData: string): Promise<AppleStoreVerifyResult> {
    try {
      const payload = {
        'receipt-data': receiptData,
        password: this.sharedSecret,
        'exclude-old-transactions': true,
      };

      let response = await axios.post<AppleVerifyResponse>(this.productionUrl, payload);

      // status 21007 means the receipt is from the sandbox environment
      if (response.data.status === 21007) {
        this.logger.debug('Apple receipt is sandbox, retrying with sandbox URL');
        response = await axios.post<AppleVerifyResponse>(this.sandboxUrl, payload);
      }

      const { status, receipt } = response.data;

      if (status !== 0) {
        this.logger.warn(`Apple receipt verification returned status=${status}`);
        return { isValid: false, transactionId: '', productId: '' };
      }

      const latestPurchase = receipt?.in_app?.[receipt.in_app.length - 1];
      if (!latestPurchase) {
        this.logger.warn('Apple receipt contains no in_app purchases');
        return { isValid: false, transactionId: '', productId: '' };
      }

      return {
        isValid: true,
        transactionId: latestPurchase.transaction_id,
        productId: latestPurchase.product_id,
      };
    } catch (err) {
      this.logger.warn(`Apple Store verification failed: ${(err as Error).message}`);
      return { isValid: false, transactionId: '', productId: '' };
    }
  }
}
