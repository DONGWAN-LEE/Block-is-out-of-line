import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class PlayerCurrenciesDto {
  @ApiProperty({ description: 'Diamond currency balance', example: '100' })
  diamond: string;

  @ApiProperty({ description: 'Gold currency balance', example: '5000' })
  gold: string;
}

export class PlayerProfileResponseDto {
  @ApiProperty({
    description: 'Player account UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Player display nickname',
    example: 'BlockMaster',
    nullable: true,
  })
  nickname: string | null;

  @ApiProperty({ description: 'Player current level', example: 5 })
  level: number;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2026-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Player currency balances',
    type: PlayerCurrenciesDto,
  })
  currencies: {
    diamond: string;
    gold: string;
  };
}

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'New display nickname for the player',
    example: 'BlockMaster',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;
}
