import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { ErrorCodes } from '../common/constants/error-codes.js';
import { AdminGoogleLoginDto } from './dto/admin-login.dto.js';
import { AdminAccount } from './entities/admin-account.entity.js';

interface GoogleTokenInfo {
  email: string;
  name?: string;
  sub: string;
  aud: string;
}

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);

  constructor(
    @InjectRepository(AdminAccount)
    private readonly adminRepository: Repository<AdminAccount>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async googleLogin(
    dto: AdminGoogleLoginDto,
  ): Promise<{ accessToken: string; admin: AdminAccount }> {
    let tokenInfo: GoogleTokenInfo;
    try {
      const res = await axios.get<GoogleTokenInfo>(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${dto.idToken}`,
      );
      tokenInfo = res.data;
    } catch {
      throw new UnauthorizedException(
        ErrorCodes.ADMIN_004.code + ': ' + ErrorCodes.ADMIN_004.message,
      );
    }

    const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID', '');
    if (googleClientId && tokenInfo.aud !== googleClientId) {
      throw new UnauthorizedException(
        ErrorCodes.ADMIN_004.code + ': ' + ErrorCodes.ADMIN_004.message,
      );
    }

    const admin = await this.adminRepository.findOne({
      where: { email: tokenInfo.email },
    });

    if (!admin) {
      throw new ForbiddenException(
        ErrorCodes.ADMIN_002.code + ': ' + ErrorCodes.ADMIN_002.message,
      );
    }

    if (!admin.isActive) {
      throw new ForbiddenException(
        ErrorCodes.ADMIN_003.code + ': ' + ErrorCodes.ADMIN_003.message,
      );
    }

    await this.adminRepository.update(admin.id, { lastLoginAt: new Date() });
    admin.lastLoginAt = new Date();

    const secret = this.configService.get<string>(
      'ADMIN_JWT_SECRET',
      'admin-default-secret',
    );
    const expiresIn = this.configService.get<string>('ADMIN_JWT_EXPIRY', '8h');

    const accessToken = this.jwtService.sign(
      { sub: admin.id, role: admin.role, type: 'admin_access' },
      { secret, expiresIn: expiresIn as any },
    );

    this.logger.log(`Admin login: ${admin.email}`);

    return { accessToken, admin };
  }

  async validateAdmin(payload: {
    sub: string;
    role: string;
  }): Promise<AdminAccount> {
    const admin = await this.adminRepository.findOne({
      where: { id: payload.sub },
    });

    if (!admin) {
      throw new UnauthorizedException(
        ErrorCodes.ADMIN_002.code + ': ' + ErrorCodes.ADMIN_002.message,
      );
    }

    if (!admin.isActive) {
      throw new UnauthorizedException(
        ErrorCodes.ADMIN_003.code + ': ' + ErrorCodes.ADMIN_003.message,
      );
    }

    return admin;
  }
}
