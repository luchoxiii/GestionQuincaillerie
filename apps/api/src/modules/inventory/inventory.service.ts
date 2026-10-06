import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getStock(lowStock: boolean, warehouseId?: string) {
    const where: any = {};
    if (warehouseId) where.warehouseId = warehouseId;
    
    const stocks = await this.prisma.warehouseStock.findMany({
      where,
      include: {
        product: true,
        warehouse: true
      }
    });

    if (lowStock) {
      return stocks.filter(s => {
        const minStock = s.product.minStock ? Number(s.product.minStock) : 0;
        return Number(s.quantity) <= minStock;
      });
    }

    return stocks;
  }

  async getMovements(query: any) {
    const { productId, warehouseId, type, startDate, endDate, page = 1, limit = 50 } = query;
    const where: any = {};
    
    if (productId) where.productId = productId;
    if (warehouseId) where.warehouseId = warehouseId;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [data, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        skip,
        take: Number(limit),
        include: { product: true, warehouse: true, user: true },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.stockMovement.count({ where })
    ]);

    return { data, total, page: Number(page), limit: Number(limit) };
  }

  async adjustStock(data: { productId: string, warehouseId: string, quantity: number, type: 'ADJUSTMENT' | 'INITIAL', notes?: string, userId?: string }) {
    const { productId, warehouseId, quantity, type, notes, userId } = data;
    
    return this.prisma.$transaction(async (tx) => {
      const stock = await tx.warehouseStock.findUnique({
        where: { warehouseId_productId: { warehouseId, productId } }
      });
      
      const currentQty = stock ? Number(stock.quantity) : 0;
      const newQty = currentQty + quantity;

      const updatedStock = await tx.warehouseStock.upsert({
        where: { warehouseId_productId: { warehouseId, productId } },
        create: { warehouseId, productId, quantity: newQty },
        update: { quantity: newQty }
      });

      const movement = await tx.stockMovement.create({
        data: {
          warehouseId,
          productId,
          type,
          quantity,
          notes: notes || `Stock ajustado (Antes: ${currentQty}, Después: ${newQty})`,
          userId
        }
      });

      return { stock: updatedStock, movement };
    });
  }

  async getTransfers() {
    return this.prisma.stockTransfer.findMany({
      include: {
        source: true,
        destination: true,
        createdBy: true,
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createTransfer(data: { sourceId: string, destinationId: string, items: { productId: string, quantity: number }[], notes?: string, createdById: string }) {
    const { sourceId, destinationId, items, notes, createdById } = data;

    return this.prisma.$transaction(async (tx) => {
      const transfer = await tx.stockTransfer.create({
        data: {
          sourceId,
          destinationId,
          createdById,
          status: 'COMPLETED',
          notes,
          items: {
            create: items.map(i => ({
              productId: i.productId,
              quantity: i.quantity
            }))
          }
        }
      });

      for (const item of items) {
        // Decrease source
        const sourceStock = await tx.warehouseStock.findUnique({
          where: { warehouseId_productId: { warehouseId: sourceId, productId: item.productId } }
        });
        
        if (!sourceStock || Number(sourceStock.quantity) < item.quantity) {
          throw new BadRequestException(`Stock insuficiente en origen para el producto ${item.productId}`);
        }

        await tx.warehouseStock.update({
          where: { id: sourceStock.id },
          data: { quantity: Number(sourceStock.quantity) - item.quantity }
        });

        await tx.stockMovement.create({
          data: {
            warehouseId: sourceId,
            productId: item.productId,
            type: 'TRANSFER_OUT',
            quantity: -item.quantity,
            referenceId: transfer.id,
            notes: `Transferencia a almacén ${destinationId}`,
            userId: createdById
          }
        });

        // Increase destination
        await tx.warehouseStock.upsert({
          where: { warehouseId_productId: { warehouseId: destinationId, productId: item.productId } },
          create: { warehouseId: destinationId, productId: item.productId, quantity: item.quantity },
          update: { quantity: { increment: item.quantity } }
        });

        await tx.stockMovement.create({
          data: {
            warehouseId: destinationId,
            productId: item.productId,
            type: 'TRANSFER_IN',
            quantity: item.quantity,
            referenceId: transfer.id,
            notes: `Transferencia desde almacén ${sourceId}`,
            userId: createdById
          }
        });
      }

      return transfer;
    });
  }

  async getCounts() {
    return this.prisma.inventoryCount.findMany({
      include: {
        warehouse: true,
        user: true,
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createCount(data: { warehouseId: string, userId: string, productIds?: string[] }) {
    const { warehouseId, userId, productIds } = data;
    
    const whereClause: any = { warehouseId };
    if (productIds && productIds.length > 0) {
      whereClause.productId = { in: productIds };
    }

    const currentStocks = await this.prisma.warehouseStock.findMany({
      where: whereClause
    });

    const countItems = currentStocks.map(stock => ({
      productId: stock.productId,
      systemQty: stock.quantity
    }));

    return this.prisma.inventoryCount.create({
      data: {
        warehouseId,
        userId,
        status: 'PENDING',
        items: {
          create: countItems
        }
      },
      include: { items: true }
    });
  }

  async updateCountItem(countId: string, data: { productId: string, countedQty: number }) {
    const { productId, countedQty } = data;
    
    const item = await this.prisma.inventoryCountItem.findFirst({
      where: { inventoryCountId: countId, productId }
    });

    if (!item) throw new NotFoundException('Count item not found');

    const difference = countedQty - Number(item.systemQty);

    return this.prisma.inventoryCountItem.update({
      where: { id: item.id },
      data: { countedQty, difference }
    });
  }

  async applyCount(countId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const count = await tx.inventoryCount.findUnique({
        where: { id: countId },
        include: { items: true }
      });

      if (!count) throw new NotFoundException('Count not found');
      if (count.status === 'COMPLETED') throw new BadRequestException('Count already applied');

      for (const item of count.items) {
        if (item.countedQty === null) continue;

        const difference = Number(item.difference);
        if (difference !== 0) {
          await tx.warehouseStock.update({
            where: { warehouseId_productId: { warehouseId: count.warehouseId, productId: item.productId } },
            data: { quantity: Number(item.countedQty) }
          });

          await tx.stockMovement.create({
            data: {
              warehouseId: count.warehouseId,
              productId: item.productId,
              type: 'COUNT_ADJUSTMENT',
              quantity: difference,
              referenceId: count.id,
              userId,
              notes: 'Ajuste por inventario físico'
            }
          });
        }
      }

      return tx.inventoryCount.update({
        where: { id: countId },
        data: { status: 'COMPLETED' }
      });
    });
  }
}
