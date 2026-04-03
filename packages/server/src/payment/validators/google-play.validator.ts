import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface GooglePlayVerifyResult {
  isValid: boolean;
  transactionId: string;
}

@Injectable()
export class GooglePlayValidator {
  private readonly logger = new Logger(GooglePlayValidator.name);
  private readonly packageName: string;

  constructor(private readonly configService: ConfigService) {
    this.packageName = this.configService.get<string>(
      'GOOGLE_PLAY_PACKAGE_NAME',
      'com.treenod.blockoutline',
    );
  }

  async verify(
    productId: string,
    purchaseToken: string,
  ): Promise<GooglePlayVerifyResult> {
    // TODO: Obtain an OAuth2 access token using a service account via google-auth-library
    // and call the Google Play Developer API:
    // GET https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{packageName}/purchases/products/{productId}/tokens/{token}
    // Expected response shape: { purchaseState: 0 (purchased) | 1 (canceled) | 2 (pending), orderId: string, ... }
    try {
      // Placeholder: replace with real API call once service account credentials are configured
      const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${this.packageName}/purchases/products/${productId}/tokens/${purchaseToken}`;
      this.logger.debug(`Google Play verify URL: ${url}`);

      // TODO: pass Authorization header with service account access token
      const response = await axios.get<{ purchaseState: number; orderId: string }>(url, {
        headers: {
          Authorization: `Bearer TODO_SERVICE_ACCOUNT_TOKEN`,
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
