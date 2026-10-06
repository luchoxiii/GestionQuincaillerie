import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findByUsername: jest.Mock };
  let jwtService: { sign: jest.Mock; verify: jest.Mock };
  let prisma: { user: { findUnique: jest.Mock; update: jest.Mock } };

  beforeEach(async () => {
    usersService = {
      findByUsername: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn(),
    };
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({ id: 'u1' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('debería retornar el usuario sin contraseña cuando las credenciales son correctas', async () => {
      const hashedPassword = await bcrypt.hash('secret123', 6);
      const mockUser = {
        id: 'u1',
        username: 'admin',
        password: hashedPassword,
        name: 'Administrador',
        tokenVersion: 0,
      };

      usersService.findByUsername.mockResolvedValue(mockUser);

      const result = await service.validateUser('admin', 'secret123');

      expect(result).toBeDefined();
      expect(result.username).toBe('admin');
      expect(result.password).toBeUndefined();
    });

    it('debería retornar null cuando el usuario no existe', async () => {
      usersService.findByUsername.mockResolvedValue(null);

      const result = await service.validateUser('inexistente', 'password');

      expect(result).toBeNull();
    });

    it('debería retornar null cuando la contraseña es incorrecta', async () => {
      const hashedPassword = await bcrypt.hash('correctPassword', 6);
      usersService.findByUsername.mockResolvedValue({
        id: 'u1',
        username: 'admin',
        password: hashedPassword,
      });

      const result = await service.validateUser('admin', 'wrongPassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('debería generar accessToken y refreshToken y actualizar lastLoginAt', async () => {
      const mockUser = {
        id: 'u1',
        username: 'vendedor',
        tokenVersion: 2,
      };

      const tokens = await service.login(mockUser);

      expect(tokens).toEqual({
        accessToken: 'mock-jwt-token',
        refreshToken: 'mock-jwt-token',
      });
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { lastLoginAt: expect.any(Date) },
      });
    });
  });

  describe('refreshToken', () => {
    it('debería emitir nuevos tokens si el token es válido y la versión coincide', async () => {
      jwtService.verify.mockReturnValue({ sub: 'u1', tv: 1 });
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        username: 'cajero',
        tokenVersion: 1,
      });

      const result = await service.refreshToken('valid-refresh-token');

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
    });

    it('debería lanzar UnauthorizedException si tokenVersion no coincide (sesión revocada)', async () => {
      jwtService.verify.mockReturnValue({ sub: 'u1', tv: 1 });
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        username: 'cajero',
        tokenVersion: 2, // Token revocado tras logout
      });

      await expect(service.refreshToken('old-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debería lanzar UnauthorizedException si el usuario no existe', async () => {
      jwtService.verify.mockReturnValue({ sub: 'u-deleted', tv: 0 });
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.refreshToken('orphan-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debería lanzar UnauthorizedException si jwt.verify falla', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Expired token');
      });

      await expect(service.refreshToken('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('debería incrementar el tokenVersion para invalidar refresh tokens existentes', async () => {
      await service.logout('user-123');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { tokenVersion: { increment: 1 } },
      });
    });
  });

  describe('changePassword', () => {
    it('debería actualizar la contraseña con hash y aumentar tokenVersion si currentPassword es correcta', async () => {
      const currentHashed = await bcrypt.hash('claveVieja', 6);
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        password: currentHashed,
      });

      await service.changePassword('u1', 'claveVieja', 'claveNuevaSegura');

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'u1' },
          data: expect.objectContaining({
            tokenVersion: { increment: 1 },
          }),
        }),
      );
    });

    it('debería rechazar si la contraseña actual es errónea', async () => {
      const currentHashed = await bcrypt.hash('claveReal', 6);
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        password: currentHashed,
      });

      await expect(
        service.changePassword('u1', 'claveErronea', 'nuevaClave'),
      ).rejects.toThrow('Contraseña actual incorrecta');
    });

    it('debería rechazar si el usuario no existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.changePassword('u-inexistente', 'pass', 'nueva'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('debería retornar el perfil sin password y con los permisos aplanados y únicos', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        username: 'encargado',
        password: 'hashed-secret',
        userRoles: [
          {
            role: {
              permissions: [
                { permission: { action: 'READ_PRODUCTS' } },
                { permission: { action: 'CREATE_SALE' } },
              ],
            },
          },
          {
            role: {
              permissions: [
                { permission: { action: 'CREATE_SALE' } }, // Duplicado a deduplicar
                { permission: { action: 'VIEW_REPORTS' } },
              ],
            },
          },
        ],
      });

      const profile = await service.getProfile('u1');

      expect((profile as any).password).toBeUndefined();
      expect(profile.username).toBe('encargado');
      expect(profile.permissions).toEqual([
        'READ_PRODUCTS',
        'CREATE_SALE',
        'VIEW_REPORTS',
      ]);
    });

    it('debería lanzar UnauthorizedException si no encuentra el usuario', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('not-found')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
