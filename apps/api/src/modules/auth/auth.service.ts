import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async recordLoginSuccess(user: any, ip: string) {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'LOGIN',
          entity: 'User',
          entityId: user.id,
          userId: user.id,
          details: { username: user.username, message: 'Inicio de sesión exitoso' },
          ipAddress: ip,
        },
      });
    } catch {}
  }

  async recordLoginFailure(username: string, ip: string, reason: string) {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'LOGIN_FAILED',
          entity: 'User',
          entityId: username,
          details: { username, reason },
          ipAddress: ip,
        },
      });
    } catch {}
  }

  async recordLogout(userId: string, ip: string) {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'LOGOUT',
          entity: 'User',
          entityId: userId,
          userId: userId,
          details: { message: 'Cierre de sesión' },
          ipAddress: ip,
        },
      });
    } catch {}
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, tv: user.tokenVersion };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(
      { sub: user.id, tv: user.tokenVersion },
      { expiresIn: '7d' },
    );

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });

      if (!user || user.tokenVersion !== payload.tv) {
        throw new UnauthorizedException();
      }

      return this.login(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
  }

  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await bcrypt.compare(currentPass, user.password))) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }
    const hashedPassword = await bcrypt.hash(newPass, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        tokenVersion: { increment: 1 },
      },
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) throw new UnauthorizedException();

    const { password, ...profile } = user;
    const permissions = user.userRoles.flatMap((ur) =>
      ur.role.permissions.map((rp) => rp.permission.action),
    );

    return { ...profile, permissions: [...new Set(permissions)] };
  }
}
