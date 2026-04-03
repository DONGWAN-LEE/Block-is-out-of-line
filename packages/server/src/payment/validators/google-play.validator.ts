import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';

export interface GooglePlayVerifyResult {
  isValid: boolean;
  transactionId: string;
}

@Injectable()
export class GooglePlayValidator {
  private readonly logger = new Logger(GooglePlayValidator.name);
  private readonly packageName: string;
  private auth: GoogleAuth | null = null;

  constructor(private readonly configService: ConfigService) {
    this.packageName = this.configService.getOrThrow<string>('GOOGLE_PLAY_PACKAGE_NAME');
    const keyFile = this.configService.get<string>('GOOGLE_PLAY_SERVICE_ACCOUNT_KEY');
    if (keyFile) {
      this.auth = new GoogleAuth({
        keyFile,
        scopes: ['https://www.googleapis.com/auth/androidpublisher'],
      });
    }
  }

  async verify(
    productId: string,
    purchaseToken: string,
  ): Promise<GooglePlayVerifyResult> {
    if (!this.auth) {
      throw new Error('Google Play service account not configured');
    }

    try {
      const client = await this.auth.getClient();
      const tokenResponse = await client.getAccessToken();
      const accessToken = tokenResponse.token;

      const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${this.packageName}/purchases/products/${productId}/tokens/${purchaseToken}`;
      this.logger.debug(`Google Play verify URL: ${url}`);

      const response = await axios.get<{ purchaseState: number; orderId: string }>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { purchaseState, orderId } = response.data;
      // purchaseState 0 = purchased
      return {
        isValid: purchaseState === 0,
        transactionId: orderId,
      };
    } catch (err) {
      this.logger.warn(
        `Google Play verification failed for productId=${productId}: ${(err as Error).message}`,
      );
      return { isValid: false, transactionId: '' };
    }
  }
}
