import { Controller, Post, Body, Req, Res, Get, Put, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@UseGuards(JwtAuthGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: any, @Res({ passthrough: true }) res: any) {
    const ip = req.ip || req.connection?.remoteAddress || '';
    const user = await this.authService.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      await this.authService.recordLoginFailure(loginDto.username, ip, 'Credenciales inválidas');
      throw new UnauthorizedException('Credenciales inválidas');
    }
    await this.authService.recordLoginSuccess(user, ip);
    const { accessToken, refreshToken } = await this.authService.login(user);

    res.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
    });

    return { accessToken, user };
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: any) {
    const token = req.cookies?.['refreshToken'];
    if (!token) throw new UnauthorizedException('No refresh token');

    const { accessToken, refreshToken } = await this.authService.refreshToken(token);

    res.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
    });

    return { accessToken };
  }

  @Post('logout')
  async logout(@CurrentUser() user: any, @Req() req: any, @Res({ passthrough: true }) res: any) {
    const ip = req.ip || req.connection?.remoteAddress || '';
    await this.authService.recordLogout(user.id, ip);
    await this.authService.logout(user.id);
    res.clearCookie('refreshToken', { path: '/api/auth' });
    return { success: true };
  }

  @Get('me')
  async me(@CurrentUser() user: any) {
    return this.authService.getProfile(user.id);
  }

  @Put('change-password')
  async changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    await this.authService.changePassword(user.id, dto.currentPassword, dto.newPassword);
    return { success: true };
  }
}
