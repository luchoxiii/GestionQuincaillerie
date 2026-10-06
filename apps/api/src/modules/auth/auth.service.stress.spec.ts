import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

describe('AuthService Stress & Concurrency Tests', () => {
  let service: AuthService;
  let usersService: { findByUsername: jest.Mock };
  let jwtService: { sign: jest.Mock; verify: jest.Mock };
  let prisma: { user: { findUnique: jest.Mock; update: jest.Mock } };

  beforeEach(async () => {
    usersService = {
      findByUsername: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockImplementation((payload) => `signed-${payload.sub}-${Date.now()}`),
      verify: jest.fn().mockImplementation((token) => ({ sub: 'u-stress', tv: 1 })),
    };
    prisma = {
      user: {
        findUnique: jest.fn().mockImplementation(async ({ where }) => ({
          id: where.id,
          username: `user_${where.id}`,
          password: await bcrypt.hash('password123', 4), // 4 rounds for fast stress testing
          tokenVersion: 1,
        })),
        update: jest.fn().mockResolvedValue({ id: 'u-updated' }),
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

  it('debería soportar 100 logins simultáneos sin tildarse ni fallar por concurrencia', async () => {
    const hashedPassword = await bcrypt.hash('concurrencia123', 4);
    usersService.findByUsername.mockResolvedValue({
      id: 'u-concurrent',
      username: 'operador',
      password: hashedPassword,
      tokenVersion: 1,
    });

    const startTime = Date.now();
    const concurrentLogins = Array.from({ length: 100 }, (_, i) =>
      service.validateUser('operador', 'concurrencia123').then((user) => {
        expect(user).toBeDefined();
        return service.login(user);
      }),
    );

    const results = await Promise.all(concurrentLogins);
    const duration = Date.now() - startTime;

    expect(results.length).toBe(100);
    results.forEach((tokens) => {
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
    });
    // Debe completarse en menos de 5 segundos
    expect(duration).toBeLessThan(5000);
  });

  it('debería soportar ráfagas de 50 refrescos de token en paralelo', async () => {
    const refreshes = Array.from({ length: 50 }, (_, i) =>
      service.refreshToken(`token-refresh-${i}`),
    );

    const results = await Promise.all(refreshes);
    expect(results.length).toBe(50);
    results.forEach((res) => {
      expect(res.accessToken).toBeDefined();
    });
  });

  it('debería soportar 20 cambios de clave simultáneos sin interbloqueos', async () => {
    const password = await bcrypt.hash('antigua123', 4);
    prisma.user.findUnique.mockResolvedValue({
      id: 'u-target',
      password,
      tokenVersion: 0,
    });

    const startTime = Date.now();
    const passwordChanges = Array.from({ length: 20 }, (_, i) =>
      service.changePassword('u-target', 'antigua123', `nuevaClave-${i}`),
    );

    await Promise.all(passwordChanges);
    const duration = Date.now() - startTime;

    expect(prisma.user.update).toHaveBeenCalledTimes(20);
    expect(duration).toBeLessThan(8000);
  }, 15000);
});
