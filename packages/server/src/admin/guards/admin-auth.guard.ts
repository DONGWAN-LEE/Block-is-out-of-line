import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AdminAuthService } from '../admin-auth.service.js';
import { ErrorCodes } from '../../common/constants/error-codes.js';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly adminAuthService: AdminAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        ErrorCodes.ADMIN_001.code + ': ' + ErrorCodes.ADMIN_001.message,
      );
    }

    const token = authHeader.slice(7);
    const secret = this.configService.getOrThrow<string>('ADMIN_JWT_SECRET');

    let payload: { sub: string; role: string; type: string };
    try {
      payload = this.jwtService.verify(token, { secret });
    } catch {
      throw new UnauthorizedException(
        ErrorCodes.ADMIN_001.code + ': ' + ErrorCodes.ADMIN_001.message,
      );
    }

    if (payload.type !== 'admin_access') {
      throw new UnauthorizedException(
        ErrorCodes.ADMIN_001.code + ': ' + ErrorCodes.ADMIN_001.message,
      );
    }

    if (payload.role !== 'admin' && payload.role !== 'super_admin') {
      throw new UnauthorizedException(
        ErrorCodes.ADMIN_001.code + ': ' + ErrorCodes.ADMIN_001.message,
      );
    }

    const admin = await this.adminAuthService.validateAdmin(payload);
    (request as any).admin = admin;

    return true;
  }
}
