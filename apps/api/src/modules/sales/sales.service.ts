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

  async getSale(id: string, prismaClient: any = this.prisma) {
    const sale = await prismaClient.sale.findUnique({
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
      let totalTaxAmount = 0;
      const saleItemsToCreate: any[] = [];

      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { taxes: { include: { tax: true } } },
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

        const unitPrice = item.unitPrice !== undefined ? Number(item.unitPrice) : Number(product.salePrice);
        const itemDiscount = item.discount ? Number(item.discount) : 0;
        const productTaxRate =
          Array.isArray(product.taxes) && product.taxes.length > 0
            ? Number(product.taxes[0]?.tax?.rate ?? 0)
            : 0;
        const taxRate = item.taxRate !== undefined ? Number(item.taxRate) : productTaxRate;
        const lineSubtotal = Math.max(0, unitPrice * item.quantity - itemDiscount);
        const taxAmount = taxRate > 0 ? Number(((lineSubtotal * taxRate) / 100).toFixed(2)) : 0;
        const total = lineSubtotal + taxAmount;
        
        subtotal += lineSubtotal;
        totalTaxAmount += taxAmount;

        saleItemsToCreate.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          discount: itemDiscount,
          taxRate,
          taxAmount,
          subtotal: lineSubtotal,
          total,
        });
      }

      // Compute totals
      const globalDiscount = data.discount ? Number(data.discount) : 0;
      const totalAmount =
        data.total !== undefined
          ? Number(data.total)
          : Math.max(0, subtotal + totalTaxAmount - globalDiscount);

      // d. Create Sale
      const sale = await tx.sale.create({
        data: {
          userId,
          customerId: data.customerId,
          cashSessionId: data.cashSessionId,
          subtotal: data.subtotal !== undefined ? Number(data.subtotal) : subtotal,
          discount: globalDiscount,
          taxAmount: data.taxAmount !== undefined ? Number(data.taxAmount) : totalTaxAmount,
          total: totalAmount,
          notes: data.notes,
          status: SaleStatus.COMPLETED,
          items: {
            create: saleItemsToCreate,
          },
        },
      });

      // c. Create StockMovement linked to sale.id
      for (const item of data.items) {
        await tx.stockMovement.create({
          data: {
            warehouseId: data.warehouseId,
            productId: item.productId,
            type: StockMovementType.SALE_OUT,
            quantity: -item.quantity,
            referenceId: sale.id,
            userId,
            notes: `Venta #${sale.number}`,
          },
        });
      }

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
          } else if (
            method &&
            data.customerId &&
            (method.name.toLowerCase().includes('cuenta corriente') ||
              (method.code as string) === 'ACCOUNT' ||
              method.code === PaymentMethodCode.OTHER)
          ) {
            await tx.customerAccountMove.create({
              data: {
                customerId: data.customerId,
                type: 'INVOICE',
                amount: payment.amount,
                referenceId: sale.id,
                notes: `Venta #${sale.number}`,
              },
            });
            await tx.customer.update({
              where: { id: data.customerId },
              data: { balance: { increment: payment.amount } },
            });
          }
        }
      }

      return this.getSale(sale.id, tx);
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

      const refMovement = await tx.stockMovement.findFirst({
        where: {
          type: StockMovementType.SALE_OUT,
          OR: [
            { referenceId: sale.id },
            { userId: sale.userId, createdAt: { gte: sale.createdAt } },
          ],
        },
        orderBy: { createdAt: 'asc' },
      });

      for (const item of sale.items) {
        const itemMovement = await tx.stockMovement.findFirst({
          where: {
            type: StockMovementType.SALE_OUT,
            productId: item.productId,
            OR: [
              { referenceId: sale.id },
              { userId: sale.userId, createdAt: { gte: sale.createdAt } },
            ],
          },
          orderBy: { createdAt: 'asc' },
        });

        const targetWarehouseId = itemMovement?.warehouseId || refMovement?.warehouseId;

        const stock = targetWarehouseId
          ? await tx.warehouseStock.findUnique({
              where: {
                warehouseId_productId: {
                  warehouseId: targetWarehouseId,
                  productId: item.productId,
                },
              },
            })
          : await tx.warehouseStock.findFirst({
              where: { productId: item.productId },
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
              referenceId: sale.id,
              userId,
              notes: `Anulación Venta #${sale.number}`,
            },
          });
        }
      }

      for (const payment of sale.payments) {
        const isAccount =
          payment.method.name.toLowerCase().includes('cuenta corriente') ||
          (payment.method.code as string) === 'ACCOUNT' ||
          payment.method.code === PaymentMethodCode.OTHER;

        if (isAccount && sale.customerId) {
          await tx.customerAccountMove.create({
            data: {
              customerId: sale.customerId,
              type: 'NOTE',
              amount: -Number(payment.amount),
              referenceId: sale.id,
              notes: `Anulación Venta #${sale.number}`,
            },
          });
          await tx.customer.update({
            where: { id: sale.customerId },
            data: { balance: { decrement: payment.amount } },
          });
        }
      }

      if (sale.cashSessionId) {
        const session = await tx.cashSession.findUnique({
          where: { id: sale.cashSessionId },
        });
        if (session && session.status === 'OPEN') {
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
      }

      return this.getSale(sale.id, tx);
    });
  }
}
