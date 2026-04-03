import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({
    description: 'JWT access token (15min expiry)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1dWlkIn0...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token (7day expiry, single use)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1dWlkIn0...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'True if account was just created',
    example: false,
  })
  isNewPlayer: boolean;
}
