import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse } from '../common/dto/response.dto.js';
import { AdminAuthService } from './admin-auth.service.js';
import { CurrentAdmin } from './decorators/current-admin.decorator.js';
import { AdminGoogleLoginDto } from './dto/admin-login.dto.js';
import { AdminAuthGuard } from './guards/admin-auth.guard.js';
import { AdminAccount } from './entities/admin-account.entity.js';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleLogin(
    @Body() dto: AdminGoogleLoginDto,
  ): Promise<ApiResponse<{ accessToken: string; admin: AdminAccount }>> {
    const data = await this.adminAuthService.googleLogin(dto);
    return ApiResponse.ok(data);
  }

  @Get('me')
  @UseGuards(AdminAuthGuard)
  async getCurrentAdmin(
    @CurrentAdmin() admin: AdminAccount,
  ): Promise<ApiResponse<AdminAccount>> {
    return ApiResponse.ok(admin);
  }
}
