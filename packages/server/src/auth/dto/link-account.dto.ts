import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class LinkAccountDto {
  @ApiProperty({
    description: 'Social provider to link',
    example: 'google',
    enum: ['google', 'facebook', 'naver'],
  })
  @IsEnum(['google', 'facebook', 'naver'])
  provider: 'google' | 'facebook' | 'naver';

  @ApiProperty({
    description: 'OAuth access token from provider',
    example: 'ya29.a0AfH6SMBx...',
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
