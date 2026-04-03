import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AdminGoogleLoginDto {
  @ApiProperty({
    description: 'Google OAuth id_token from Google Sign-In',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOT...',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
