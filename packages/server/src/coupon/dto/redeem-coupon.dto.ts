import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RedeemCouponDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;
}
