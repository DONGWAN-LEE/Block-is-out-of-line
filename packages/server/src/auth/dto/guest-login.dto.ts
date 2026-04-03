import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class GuestLoginDto {
  @ApiProperty({
    description: 'Device UUID from Unity SystemInfo.deviceUniqueIdentifier',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  deviceId: string;
}
