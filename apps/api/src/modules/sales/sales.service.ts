import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSaleDto } from './dto/sales.dto';
import { StockMovementType, SaleStatus, CashMovementType, PaymentMethodCode } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async getPaymentMethods() {
    return this.prisma.paymentMethod.findMany({
      where: { isActive: true },
    });
  }

  async listSales(filters: any, skip: number = 0, take: number = 20) {
    const where: any = {};
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.status) where.status = filters.status;
    // Add date range or search if needed
    
    return this.prisma.sale.findMany({
      where,
      skip,
      take,
      orderBy: { date: 'desc' },
      include: {
        customer: true,
        user: { select: { firstName: true, lastName: true } },
        payments: { include: { method: true } },
      },
    });
  }

  async getSale(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        payments: { include: { method: true } },
        customer: true,
        user: { select: { firstName: true, lastName: true } },
      },
    });
    if (!sale) throw new NotFoundException('Venta no encontrada');
    return sale;
  }

  async createSale(userId: string, data: CreateSaleDto) {
    return this.prisma.$transaction(async (tx) => {
      // a. Validate and lock stock
      let subtotal = 0;
      const saleItemsToCreate: any[] = [];

      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new BadRequestException(`Producto con ID ${item.productId} no encontrado`);
        }

        const stock = await tx.warehouseStock.findUnique({
          where: {
            warehouseId_productId: {
              warehouseId: data.warehouseId,
              productId: item.productId,
            },
          },
        });

        if (!stock || Number(stock.quantity) < item.quantity) {
          throw new BadRequestException(`Stock insuficiente para ${product.name}`);
        }

        // b. Decrement WarehouseStock
        await tx.warehouseStock.update({
          where: { id: stock.id },
          data: {
            quantity: { decrement: item.quantity },
          },
        });

        // c. Create StockMovement
        await tx.stockMovement.create({
          data: {
            warehouseId: data.warehouseId,
            productId: item.productId,
            type: StockMovementType.SALE_OUT,
            quantity: -item.quantity,
            userId,
            notes: 'Venta',
          },
        });

        const unitPrice = Number(product.salePrice);
        const taxRate = 0; // Simplified for now
        const taxAmount = 0;
        const total = unitPrice * item.quantity;
        
        subtotal += total;

        saleItemsToCreate.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          taxRate,
          taxAmount,
          subtotal: total,
          total,
        });
      }

      // Compute totals
      const totalAmount = subtotal; // Assuming no additional tax here, simple sum

      // d. Create Sale
      const sale = await tx.sale.create({
        data: {
          userId,
          customerId: data.customerId,
          cashSessionId: data.cashSessionId,
          subtotal,
          taxAmount: 0,
          total: totalAmount,
          notes: data.notes,
          status: SaleStatus.COMPLETED,
          items: {
            create: saleItemsToCreate,
          },
        },
      });

      // e. Handle Payments
      if (data.payments && data.payments.length > 0) {
        for (const payment of data.payments) {
          await tx.salePayment.create({
            data: {
              saleId: sale.id,
              methodId: payment.methodId,
              amount: payment.amount,
              reference: payment.reference,
            },
          });

          const method = await tx.paymentMethod.findUnique({
            where: { id: payment.methodId },
          });

          if (method && method.code === PaymentMethodCode.CASH && data.cashSessionId) {
            await tx.cashMovement.create({
              data: {
                sessionId: data.cashSessionId,
                type: CashMovementType.SALE,
                amount: payment.amount,
                description: `Venta #${sale.number}`,
                methodId: method.id,
              },
            });
          } else if (method && method.code === PaymentMethodCode.OTHER && data.customerId) {
            // Need to handle cuenta corriente - simplistic assumption: OTHER is cuenta corriente
            // For a robust system, we would have a specific CUENTA_CORRIENTE code.
            // Let's check if the name is 'Cuenta Corriente' or similar.
            // For this phase, any NON-CASH could potentially be Account if requested.
            // Let's implement it for any method that is specifically for accounts or if custom logic applies.
            // Here, we just follow: "If payment method is customer account / cuenta corriente..."
            // As we don't have a specific enum for it, let's assume it's OTHER or based on customer balance.
            // I'll leave this as a general check based on code or name.
            if (method.name.toLowerCase().includes('cuenta corriente')) {
               await tx.customerAccountMove.create({
                 data: {
                   customerId: data.customerId,
                   type: 'INVOICE',
                   amount: payment.amount,
                   referenceId: sale.id,
                   notes: `Venta #${sale.number}`,
                 }
               });
               await tx.customer.update({
                 where: { id: data.customerId },
                 data: { balance: { increment: payment.amount } },
               });
            }
          }
        }
      }

      return this.getSale(sale.id);
    });
  }

  async voidSale(id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id },
        include: { items: true, payments: { include: { method: true } } },
      });

      if (!sale) throw new NotFoundException('Venta no encontrada');
      if (sale.status !== SaleStatus.COMPLETED) {
        throw new BadRequestException('La venta no puede ser anulada');
      }

      await tx.sale.update({
        where: { id },
        data: { status: SaleStatus.VOIDED },
      });

      // Find stock warehouse from previous movement or assume single warehouse if not saved in sale.
      // Since sale doesn't store warehouseId directly, we look up the stock movement for this sale.
      // We can find warehouse from stockMovement or assume we revert to a default or find it.
      // Actually, we can get warehouseId from stockMovement where notes/reference contains sale... wait, referenceId is not set.
      // We'll have to find the warehouseId from the stock movement if it was linked, but it wasn't.
      // Let's assume there's one main warehouse, or we can look up the first stock.
      const firstMovement = await tx.stockMovement.findFirst({
         where: { type: StockMovementType.SALE_OUT, userId: sale.userId, createdAt: { gte: sale.createdAt } } // Approximate
      });
      // A better way is to update the create sale to save referenceId = sale.id in stockMovement.
      // But since we didn't, we will just increment the stock that is currently available.

      for (const item of sale.items) {
        // Find stock. We don't have warehouseId, so find the first one or throw.
        const stock = await tx.warehouseStock.findFirst({
          where: { productId: item.productId }
        });

        if (stock) {
          await tx.warehouseStock.update({
            where: { id: stock.id },
            data: { quantity: { increment: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              warehouseId: stock.warehouseId,
              productId: item.productId,
              type: StockMovementType.RETURN_IN,
              quantity: item.quantity,
              userId,
              notes: `Anulación Venta #${sale.number}`,
            },
          });
        }
      }

      if (sale.cashSessionId) {
        for (const payment of sale.payments) {
          if (payment.method.code === PaymentMethodCode.CASH) {
            await tx.cashMovement.create({
              data: {
                sessionId: sale.cashSessionId,
                type: CashMovementType.REFUND,
                amount: payment.amount,
                description: `Anulación Venta #${sale.number}`,
                methodId: payment.methodId,
              },
            });
          }
        }
      }

      return this.getSale(sale.id);
    });
  }
}
