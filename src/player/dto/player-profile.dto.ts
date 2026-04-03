import { IsOptional, IsString, MaxLength } from 'class-validator';

export class PlayerProfileResponseDto {
  id: string;
  nickname: string | null;
  level: number;
  createdAt: Date;
  currencies: {
    diamond: string;
    gold: string;
  };
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;
}
