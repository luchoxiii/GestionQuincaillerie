import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WarehousesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const warehouses = await this.prisma.warehouse.findMany({
      where: { isActive: true },
      include: {
        stocks: true,
      }
    });

    return warehouses.map(w => {
      const totalProducts = w.stocks.length;
      const totalStock = w.stocks.reduce((acc, curr) => acc + Number(curr.quantity), 0);
      return {
        ...w,
        summary: {
          totalProducts,
          totalStock
        }
      };
    });
  }

  async findOne(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: { 
        stocks: { 
          include: { product: true } 
        } 
      }
    });
    if (!warehouse) throw new NotFoundException('Warehouse not found');
    return warehouse;
  }

  create(data: any) {
    return this.prisma.warehouse.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.warehouse.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.warehouse.update({
      where: { id },
      data: { isActive: false }
    });
  }
}
