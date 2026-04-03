import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class VerifyReceiptDto {
  @IsEnum(['google', 'apple', 'toss'])
  store: string;

  @IsString()
  @IsNotEmpty()
  receipt: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  transactionId: string;
}
