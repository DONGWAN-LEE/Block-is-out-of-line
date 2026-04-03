import { IsNotEmpty, IsString } from 'class-validator';

export class AdminGoogleLoginDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
