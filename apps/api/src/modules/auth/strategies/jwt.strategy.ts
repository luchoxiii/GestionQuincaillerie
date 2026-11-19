import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'super-secret'),
    });
  }

  async validate(payload: any) {
    if (payload.type && payload.type !== 'access') {
      throw new UnauthorizedException();
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
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

    if (!user || user.isActive === false || user.tokenVersion !== payload.tv) {
      throw new UnauthorizedException();
    }

    const permissions = new Set<string>();
    const roles: string[] = [];
    user.userRoles.forEach((ur) => {
      if (ur.role?.name) roles.push(ur.role.name);
      ur.role.permissions.forEach((rp) => permissions.add(rp.permission.action));
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles,
      permissions: Array.from(permissions),
    };
  }
}
