import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponse } from '../common/dto/response.dto.js';
import { CurrentPlayer } from '../common/decorators/current-player.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { AuthService } from './auth.service.js';
import { GuestLoginDto } from './dto/guest-login.dto.js';
import { LinkAccountDto } from './dto/link-account.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { SocialLoginDto } from './dto/social-login.dto.js';
import { TokenResponseDto } from './dto/token-response.dto.js';
import { PlayerAccount } from './entities/player-account.entity.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('guest')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Guest login with device UUID' })
  @SwaggerApiResponse({ status: 201, description: 'JWT tokens returned' })
  @SwaggerApiResponse({ status: 400, description: 'Validation error' })
  async guestLogin(
    @Body() dto: GuestLoginDto,
  ): Promise<ApiResponse<TokenResponseDto>> {
    const data = await this.authService.guestLogin(dto);
    return ApiResponse.ok(data);
  }

  @Post('social')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Social login (Google/Facebook/Naver)' })
  @SwaggerApiResponse({ status: 400, description: 'Validation error' })
  async socialLogin(
    @Body() dto: SocialLoginDto,
  ): Promise<ApiResponse<TokenResponseDto>> {
    const data = await this.authService.socialLogin(dto);
    return ApiResponse.ok(data);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT tokens' })
  @SwaggerApiResponse({ status: 400, description: 'Validation error' })
  async refreshToken(
    @Body() dto: RefreshTokenDto,
  ): Promise<ApiResponse<TokenResponseDto>> {
    const data = await this.authService.refreshToken(dto);
    return ApiResponse.ok(data);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('player-jwt')
  @ApiOperation({ summary: 'Logout and revoke refresh tokens' })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @CurrentPlayer() player: PlayerAccount,
  ): Promise<ApiResponse<null>> {
    await this.authService.logout(player.id);
    return ApiResponse.ok(null);
  }

  @Post('link')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('player-jwt')
  @ApiOperation({ summary: 'Link guest account to social provider' })
  @SwaggerApiResponse({ status: 400, description: 'Validation error' })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  async linkAccount(
    @CurrentPlayer() player: PlayerAccount,
    @Body() dto: LinkAccountDto,
  ): Promise<ApiResponse<null>> {
    await this.authService.linkAccount(player.id, dto);
    return ApiResponse.ok(null);
  }
}
