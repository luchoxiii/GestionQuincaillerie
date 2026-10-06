import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { extractSearchTokens, normalizeText, stemSpanishWord } from '@ferreteria/shared';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = query.search || '';

    const where: any = {};
    if (search) {
      const rawSearch = String(search).trim();
      const normSearch = normalizeText(rawSearch);

      // Active / Inactive status intent
      const isActiveIntent = /(?:activo|activos|habilitado)/i.test(normSearch) && !/(?:inactivo|deshabilitado)/i.test(normSearch);
      if (isActiveIntent) {
        where.isActive = true;
      }
      const isInactiveIntent = /(?:inactivo|inactivos|deshabilitado|bloqueado|baja)/i.test(normSearch);
      if (isInactiveIntent) {
        where.isActive = false;
      }

      // Role intent
      const isCajero = /(?:cajero|cajeros|vendedor|vendedores)/i.test(normSearch);
      const isAdmin = /(?:admin|administrador|administradores)/i.test(normSearch);
      const isEncargado = /(?:encargado|encargados|supervisor)/i.test(normSearch);
      const isDeposito = /(?:deposito|almacen|bodega)/i.test(normSearch);

      if (isCajero || isAdmin || isEncargado || isDeposito) {
        const roleFilters: any[] = [];
        if (isCajero) roleFilters.push({ name: { contains: 'vendedor', mode: 'insensitive' } }, { name: { contains: 'cajero', mode: 'insensitive' } });
        if (isAdmin) roleFilters.push({ name: { contains: 'admin', mode: 'insensitive' } });
        if (isEncargado) roleFilters.push({ name: { contains: 'encargado', mode: 'insensitive' } });
        if (isDeposito) roleFilters.push({ name: { contains: 'deposito', mode: 'insensitive' } });

        where.userRoles = {
          some: {
            role: {
              OR: roleFilters,
            },
          },
        };
      }

      // Clean special intent phrases
      const cleaned = normSearch
        .replace(/(?:activo|activos|habilitado|inactivo|inactivos|deshabilitado|bloqueado|baja)/gi, ' ')
        .replace(/(?:cajero|cajeros|vendedor|vendedores)/gi, ' ')
        .replace(/(?:admin|administrador|administradores)/gi, ' ')
        .replace(/(?:encargado|encargados|supervisor)/gi, ' ')
        .replace(/(?:deposito|almacen|bodega)/gi, ' ')
        .trim();

      const tokens = extractSearchTokens(cleaned);
      if (tokens.length > 0) {
        where.AND = tokens.map((token) => {
          const stem = stemSpanishWord(token);
          const conditions: any[] = [
            { username: { contains: token, mode: 'insensitive' } },
            { firstName: { contains: token, mode: 'insensitive' } },
            { lastName: { contains: token, mode: 'insensitive' } },
            { email: { contains: token, mode: 'insensitive' } },
            { userRoles: { some: { role: { name: { contains: token, mode: 'insensitive' } } } } },
          ];
          if (stem !== token && stem.length > 2) {
            conditions.push({ firstName: { contains: stem, mode: 'insensitive' } });
            conditions.push({ lastName: { contains: stem, mode: 'insensitive' } });
          }
          return { OR: conditions };
        });
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          userRoles: {
            include: { role: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const { password, ...result } = user;
    return result;
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: any) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: data.username }, { email: data.email }],
      },
    });
    if (existing) {
      throw new ConflictException('El usuario o email ya existe');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (data.roleIds?.length) {
      await this.prisma.userRole.createMany({
        data: data.roleIds.map((roleId: string) => ({
          userId: user.id,
          roleId,
        })),
      });
    }

    return user;
  }

  async update(id: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const updateData: any = {};
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.email) updateData.email = data.email;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
      updateData.tokenVersion = { increment: 1 };
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async assignRoles(id: string, roleIds: string[]) {
    await this.prisma.userRole.deleteMany({ where: { userId: id } });

    if (roleIds.length > 0) {
      await this.prisma.userRole.createMany({
        data: roleIds.map((roleId) => ({ userId: id, roleId })),
      });
    }

    return this.findOne(id);
  }

  async findAllRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: { action: 'asc' },
    });
  }

  async setRolePermissions(roleId: string, permissionIds: string[]) {
    await this.prisma.rolePermission.deleteMany({ where: { roleId } });

    if (permissionIds.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
      });
    }

    return this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }
}
