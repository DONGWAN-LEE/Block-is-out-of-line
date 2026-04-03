import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class SocialLoginDto {
  @IsEnum(['google', 'facebook', 'naver'])
  provider: 'google' | 'facebook' | 'naver';

  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
