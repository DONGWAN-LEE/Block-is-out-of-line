import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { PlayerAccount } from '../entities/player-account.entity.js';

interface JwtPayload {
  sub: string;
  type: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    @InjectRepository(PlayerAccount)
    private readonly playerRepository: Repository<PlayerAccount>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'default-secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<PlayerAccount> {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    const player = await this.playerRepository.findOne({
      where: { id: payload.sub },
    });

    if (!player) {
      throw new UnauthorizedException('Player not found');
    }

    if (player.isBanned) {
      const now = new Date();
      if (!player.banExpiresAt || player.banExpiresAt > now) {
        throw new UnauthorizedException('Account is banned');
      }
    }

    return player;
  }
}
