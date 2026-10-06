import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PurchasesService {
  constructor(private prisma: PrismaService) {}

  async getOrders(query: any) {
    const { supplierId, status, page = 1, limit = 50 } = query;
    const where: any = {};
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    
    const [data, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        skip,
        take: Number(limit),
        include: { supplier: true },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.purchaseOrder.count({ where })
    ]);

    return { data, total, page: Number(page), limit: Number(limit) };
  }

  async createOrder(data: any) {
    const { supplierId, expectedDate, notes, items } = data;
    
    const total = items.reduce((acc: number, curr: any) => acc + (curr.quantity * curr.unitPrice), 0);

    return this.prisma.purchaseOrder.create({
      data: {
        supplierId,
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        notes,
        total,
        status: 'DRAFT',
        items: {
          create: items.map((i: any) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            total: i.quantity * i.unitPrice
          }))
        }
      },
      include: { items: true }
    });
  }

  async updateOrderStatus(id: string, status: any) {
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status }
    });
  }

  async getPurchases(query: any) {
    const { supplierId, page = 1, limit = 50 } = query;
    const where: any = {};
    if (supplierId) where.supplierId = supplierId;

    const skip = (Number(page) - 1) * Number(limit);

    const [data, total] = await Promise.all([
      this.prisma.purchase.findMany({
        where,
        skip,
        take: Number(limit),
        include: { supplier: true, items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.purchase.count({ where })
    ]);

    return { data, total, page: Number(page), limit: Number(limit) };
  }

  async getPurchaseById(id: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: { 
        supplier: true, 
        items: { include: { product: true } },
        payments: true 
      }
    });
    if (!purchase) throw new NotFoundException('Purchase not found');
    return purchase;
  }

  async createPurchase(data: any) {
    const { supplierId, purchaseOrderId, invoiceNum, notes, warehouseId, userId, items, payment } = data;
    
    let subtotal = 0;
    let taxAmount = 0;
    
    items.forEach((i: any) => {
      const itemSubtotal = i.quantity * i.unitPrice;
      const itemTax = itemSubtotal * (i.taxRate / 100);
      subtotal += itemSubtotal;
      taxAmount += itemTax;
    });
    
    const total = subtotal + taxAmount;

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Purchase
      const purchase = await tx.purchase.create({
        data: {
          supplierId,
          purchaseOrderId,
          invoiceNum,
          notes,
          subtotal,
          taxAmount,
          total,
          status: 'RECEIVED',
          items: {
            create: items.map((i: any) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              taxRate: i.taxRate,
              taxAmount: (i.quantity * i.unitPrice) * (i.taxRate / 100),
              subtotal: i.quantity * i.unitPrice,
              total: (i.quantity * i.unitPrice) * (1 + i.taxRate / 100)
            }))
          }
        }
      });

      // 2. Process Items
      for (const item of items) {
        // Upsert WarehouseStock
        await tx.warehouseStock.upsert({
          where: { warehouseId_productId: { warehouseId, productId: item.productId } },
          create: { warehouseId, productId: item.productId, quantity: item.quantity },
          update: { quantity: { increment: item.quantity } }
        });

        // Stock Movement
        await tx.stockMovement.create({
          data: {
            warehouseId,
            productId: item.productId,
            type: 'PURCHASE_IN',
            quantity: item.quantity,
            referenceId: purchase.id,
            notes: `Ingreso por compra ${purchase.id}`,
            userId
          }
        });

        // Update Product cost/price
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (product) {
          const oldCost = product.costPrice;
          const oldPrice = product.salePrice;
          const newCost = item.unitPrice;
          
          let newPrice = oldPrice;
          if (product.profitMargin) {
            newPrice = Number(newCost) * (1 + Number(product.profitMargin) / 100) as any;
          }

          if (Number(oldCost) !== Number(newCost)) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                costPrice: newCost,
                salePrice: newPrice
              }
            });

            await tx.priceHistory.create({
              data: {
                productId: item.productId,
                oldCost,
                newCost,
                oldPrice,
                newPrice,
                userId
              }
            });
          }
        }
      }

      // 3. Supplier Account Movement
      await tx.supplierAccountMove.create({
        data: {
          supplierId,
          type: 'PURCHASE',
          amount: total, // increase debt
          referenceId: purchase.id,
          notes: `Compra ${purchase.id}`
        }
      });

      await tx.supplier.update({
        where: { id: supplierId },
        data: { balance: { increment: total } }
      });

      // 4. Payment if provided
      if (payment) {
        await tx.purchasePayment.create({
          data: {
            purchaseId: purchase.id,
            methodId: payment.methodId,
            amount: payment.amount,
            reference: payment.reference
          }
        });

        await tx.supplierAccountMove.create({
          data: {
            supplierId,
            type: 'PAYMENT',
            amount: payment.amount,
            referenceId: purchase.id,
            notes: `Pago asociado a compra ${purchase.id}`
          }
        });

        await tx.supplier.update({
          where: { id: supplierId },
          data: { balance: { decrement: payment.amount } }
        });
      }

      // 5. Update PO status if provided
      if (purchaseOrderId) {
        await tx.purchaseOrder.update({
          where: { id: purchaseOrderId },
          data: { status: 'RECEIVED' }
        });
      }

      return purchase;
    });
  }
}
