import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class GuestLoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  deviceId: string;
}
