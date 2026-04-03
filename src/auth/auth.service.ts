import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ErrorCodes } from '../common/constants/error-codes.js';
import { GuestLoginDto } from './dto/guest-login.dto.js';
import { LinkAccountDto } from './dto/link-account.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { SocialLoginDto } from './dto/social-login.dto.js';
import { TokenResponseDto } from './dto/token-response.dto.js';
import { PlayerAccount } from './entities/player-account.entity.js';
import { RefreshToken } from './entities/refresh-token.entity.js';

const BCRYPT_ROUNDS = 10;
const REFRESH_TOKEN_TTL_DAYS = 30;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(PlayerAccount)
    private readonly playerRepository: Repository<PlayerAccount>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
  ) {}

  async guestLogin(dto: GuestLoginDto): Promise<TokenResponseDto> {
    let player = await this.playerRepository.findOne({
      where: { deviceId: dto.deviceId },
    });

    let isNewPlayer = false;

    if (!player) {
      player = this.playerRepository.create({ deviceId: dto.deviceId });
      player = await this.playerRepository.save(player);
      isNewPlayer = true;
    }

    this.assertNotBanned(player);

    await this.playerRepository.update(player.id, { lastLoginAt: new Date() });

    const tokens = await this.generateTokens(player.id);
    return { ...tokens, isNewPlayer };
  }

  async socialLogin(dto: SocialLoginDto): Promise<TokenResponseDto> {
    const socialId = await this.verifySocialToken(dto.provider, dto.accessToken);

    const socialField = this.socialField(dto.provider);

    let player = await this.playerRepository.findOne({
      where: { [socialField]: socialId },
    });

    let isNewPlayer = false;

    if (!player) {
      player = this.playerRepository.create({ [socialField]: socialId });
      player = await this.playerRepository.save(player);
      isNewPlayer = true;
    }

    this.assertNotBanned(player);

    await this.playerRepository.update(player.id, { lastLoginAt: new Date() });

    const tokens = await this.generateTokens(player.id);
    return { ...tokens, isNewPlayer };
  }

  async refreshToken(dto: RefreshTokenDto): Promise<TokenResponseDto> {
    const allTokens = await this.refreshTokenRepository.find({
      where: {},
      relations: ['player'],
    });

    let matchedToken: RefreshToken | null = null;

    for (const token of allTokens) {
      const isMatch = await bcrypt.compare(dto.refreshToken, token.tokenHash);
      if (isMatch) {
        matchedToken = token;
        break;
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedException(
        ErrorCodes.AUTH_003.code + ': ' + ErrorCodes.AUTH_003.message,
      );
    }

    if (matchedToken.expiresAt < new Date()) {
      await this.refreshTokenRepository.delete(matchedToken.id);
      throw new UnauthorizedException(
        ErrorCodes.AUTH_002.code + ': ' + ErrorCodes.AUTH_002.message,
      );
    }

    const player = matchedToken.player;
    this.assertNotBanned(player);

    await this.refreshTokenRepository.delete(matchedToken.id);

    const tokens = await this.generateTokens(player.id);
    return { ...tokens, isNewPlayer: false };
  }

  async logout(playerId: string): Promise<void> {
    await this.refreshTokenRepository.delete({ playerId });
  }

  async linkAccount(playerId: string, dto: LinkAccountDto): Promise<void> {
    const socialId = await this.verifySocialToken(dto.provider, dto.accessToken);
    const socialField = this.socialField(dto.provider);

    const player = await this.playerRepository.findOne({ where: { id: playerId } });
    if (!player) {
      throw new UnauthorizedException(ErrorCodes.AUTH_001.message);
    }

    if (player[socialField]) {
      throw new ConflictException(
        ErrorCodes.AUTH_005.code + ': ' + ErrorCodes.AUTH_005.message,
      );
    }

    const existing = await this.playerRepository.findOne({
      where: { [socialField]: socialId },
    });
    if (existing) {
      throw new ConflictException(
        ErrorCodes.AUTH_006.code + ': ' + ErrorCodes.AUTH_006.message,
      );
    }

    await this.playerRepository.update(playerId, { [socialField]: socialId });
  }

  private assertNotBanned(player: PlayerAccount): void {
    if (!player.isBanned) return;

    const now = new Date();
    if (!player.banExpiresAt || player.banExpiresAt > now) {
      throw new UnauthorizedException(
        ErrorCodes.AUTH_004.code + ': ' + ErrorCodes.AUTH_004.message,
      );
    }
  }

  private socialField(
    provider: 'google' | 'facebook' | 'naver',
  ): 'googleId' | 'facebookId' | 'naverId' {
    const map = {
      google: 'googleId',
      facebook: 'facebookId',
      naver: 'naverId',
    } as const;
    return map[provider];
  }

  private async verifySocialToken(
    provider: 'google' | 'facebook' | 'naver',
    accessToken: string,
  ): Promise<string> {
    try {
      if (provider === 'google') {
        const res = await axios.get<{ sub: string }>(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        return res.data.sub;
      }

      if (provider === 'facebook') {
        const res = await axios.get<{ id: string }>(
          'https://graph.facebook.com/me?fields=id,name',
          { params: { access_token: accessToken } },
        );
        return res.data.id;
      }

      if (provider === 'naver') {
        const res = await axios.get<{ response: { id: string } }>(
          'https://openapi.naver.com/v1/nid/me',
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        return res.data.response.id;
      }
    } catch {
      throw new BadRequestException(
        ErrorCodes.AUTH_001.code + ': ' + ErrorCodes.AUTH_001.message,
      );
    }

    throw new BadRequestException(ErrorCodes.AUTH_001.message);
  }

  private async generateTokens(
    playerId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.jwtService.sign(
      { sub: playerId, type: 'access' },
    );

    const rawRefreshToken = uuidv4();
    const tokenHash = await bcrypt.hash(rawRefreshToken, BCRYPT_ROUNDS);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

    const refreshTokenEntity = this.refreshTokenRepository.create({
      playerId,
      tokenHash,
      expiresAt,
    });
    await this.refreshTokenRepository.save(refreshTokenEntity);

    return { accessToken, refreshToken: rawRefreshToken };
  }
}
