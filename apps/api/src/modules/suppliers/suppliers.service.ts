import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const { search, page = 1, limit = 50 } = query;
    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { documentNum: { contains: search } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [data, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { name: 'asc' }
      }),
      this.prisma.supplier.count({ where })
    ]);

    return { data, total, page: Number(page), limit: Number(limit) };
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        purchases: { take: 10, orderBy: { date: 'desc' } }
      }
    });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  create(data: any) {
    return this.prisma.supplier.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.supplier.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.supplier.update({
      where: { id },
      data: { isActive: false }
    });
  }

  getAccountMoves(id: string) {
    return this.prisma.supplierAccountMove.findMany({
      where: { supplierId: id },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createPayment(id: string, data: { amount: number, methodId: string, reference?: string, notes?: string }) {
    const { amount, methodId, reference, notes } = data;

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.supplierPayment.create({
        data: {
          supplierId: id,
          amount,
          methodId,
          reference,
          notes
        }
      });

      const move = await tx.supplierAccountMove.create({
        data: {
          supplierId: id,
          type: 'PAYMENT',
          amount: amount, // Positive or negative depends on convention, assuming payment reduces balance
          referenceId: payment.id,
          notes: notes || 'Pago a proveedor'
        }
      });

      // Decrease balance
      const supplier = await tx.supplier.update({
        where: { id },
        data: {
          balance: { decrement: amount }
        }
      });

      return { payment, move, balance: supplier.balance };
    });
  }
}
