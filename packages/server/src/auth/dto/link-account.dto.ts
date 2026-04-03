import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class LinkAccountDto {
  @IsEnum(['google', 'facebook', 'naver'])
  provider: 'google' | 'facebook' | 'naver';

  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
