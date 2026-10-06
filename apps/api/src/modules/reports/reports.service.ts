import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSalesReport(query: any) {
    const { period = '30d', startDate, endDate } = query;
    let start = new Date();
    let end = new Date();
    
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      if (typeof endDate === 'string' && endDate.length <= 10) {
        end.setHours(23, 59, 59, 999);
      }
    } else {
      switch (period) {
        case 'today':
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          break;
        case 'yesterday':
          start.setDate(start.getDate() - 1);
          start.setHours(0, 0, 0, 0);
          end.setDate(end.getDate() - 1);
          end.setHours(23, 59, 59, 999);
          break;
        case '7d':
        case '7-days':
          start.setDate(start.getDate() - 7);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          break;
        case '30d':
        case '30-days':
          start.setDate(start.getDate() - 30);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          break;
        case 'month':
        case 'this-month':
          start.setDate(1);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          break;
        case 'year':
        case 'this-year':
          start.setMonth(0, 1);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          break;
        default:
          start.setDate(start.getDate() - 30);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          break;
      }
    }

    const sales = await this.prisma.sale.findMany({
      where: {
        date: { gte: start, lte: end },
        status: { notIn: ['VOIDED'] },
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    let totalRevenue = 0;
    let totalCost = 0;
    const timeSeriesData: Record<string, any> = {};

    sales.forEach(sale => {
      const dateStr = sale.date.toISOString().split('T')[0];
      if (!timeSeriesData[dateStr]) {
        timeSeriesData[dateStr] = { date: dateStr, revenue: 0, cost: 0, count: 0 };
      }
      
      const revenue = Number(sale.total);
      let cost = 0;
      
      sale.items.forEach(item => {
        cost += Number(item.quantity) * Number(item.product.costPrice);
      });

      timeSeriesData[dateStr].revenue += revenue;
      timeSeriesData[dateStr].cost += cost;
      timeSeriesData[dateStr].count += 1;
      
      totalRevenue += revenue;
      totalCost += cost;
    });

    const grossProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const count = sales.length;
    const averageTicket = count > 0 ? totalRevenue / count : 0;
    const timeSeries = Object.values(timeSeriesData);

    return {
      summary: {
        totalRevenue,
        totalCost,
        grossProfit,
        profitMargin,
        averageMargin: profitMargin,
        count,
        averageTicket,
      },
      timeSeries,
      chartData: timeSeries.map((item: any) => ({
        date: item.date,
        sales: item.revenue,
        cost: item.cost,
        count: item.count,
      })),
    };
  }

  async getTopProducts(query: any) {
    const { limit = 10, period, startDate, endDate } = query;
    let start: Date | null = null;
    let end: Date | null = null;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      if (typeof endDate === 'string' && endDate.length <= 10) {
        end.setHours(23, 59, 59, 999);
      }
    } else if (period) {
      end = new Date();
      end.setHours(23, 59, 59, 999);
      start = new Date();
      switch (period) {
        case 'today':
          start.setHours(0, 0, 0, 0);
          break;
        case 'yesterday':
          start.setDate(start.getDate() - 1);
          start.setHours(0, 0, 0, 0);
          end.setDate(end.getDate() - 1);
          end.setHours(23, 59, 59, 999);
          break;
        case '7d':
        case '7-days':
          start.setDate(start.getDate() - 7);
          start.setHours(0, 0, 0, 0);
          break;
        case '30d':
        case '30-days':
          start.setDate(start.getDate() - 30);
          start.setHours(0, 0, 0, 0);
          break;
        case 'month':
        case 'this-month':
          start.setDate(1);
          start.setHours(0, 0, 0, 0);
          break;
        case 'year':
        case 'this-year':
          start.setMonth(0, 1);
          start.setHours(0, 0, 0, 0);
          break;
      }
    }

    const whereSale: any = { status: { notIn: ['VOIDED'] } };
    if (start && end) {
      whereSale.date = { gte: start, lte: end };
    }

    const topItems = await this.prisma.saleItem.groupBy({
      by: ['productId'],
      where: {
        sale: whereSale,
      },
      _sum: {
        quantity: true,
        total: true,
      },
      orderBy: {
        _sum: { quantity: 'desc' }
      },
      take: Number(limit)
    });

    const products = await Promise.all(topItems.map(async item => {
      const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
      return {
        productId: item.productId,
        productName: product?.name,
        code: product?.code,
        quantitySold: item._sum.quantity,
        revenue: item._sum.total,
      };
    }));

    return products;
  }

  async getProfitability(query: any) {
    const { categoryId, brandId } = query;
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;

    const products = await this.prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        code: true,
        costPrice: true,
        salePrice: true,
        category: { select: { name: true } },
        brand: { select: { name: true } }
      }
    });

    return products.map(p => {
      const cost = Number(p.costPrice);
      const price = Number(p.salePrice);
      const profit = price - cost;
      const margin = price > 0 ? (profit / price) * 100 : 0;
      
      return {
        ...p,
        costPrice: cost,
        salePrice: price,
        profit,
        margin
      };
    });
  }

  async getIvaVentas(query: any) {
    const { month, year } = query;
    if (!month || !year) return { items: [], totals: {} };
    
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 0, 23, 59, 59);

    const invoices = await this.prisma.invoice.findMany({
      where: {
        date: { gte: start, lte: end },
        status: { in: ['AUTHORIZED', 'VOIDED'] }
      },
      include: {
        customer: true,
        invoiceType: true,
        salePoint: true,
        taxes: true
      },
      orderBy: { date: 'asc' }
    });

    const report = invoices.map(inv => {
      const net21 = inv.taxes.find(t => Number(t.taxRate) === 21)?.baseAmount || 0;
      const iva21 = inv.taxes.find(t => Number(t.taxRate) === 21)?.taxAmount || 0;
      const net105 = inv.taxes.find(t => Number(t.taxRate) === 10.5)?.baseAmount || 0;
      const iva105 = inv.taxes.find(t => Number(t.taxRate) === 10.5)?.taxAmount || 0;
      const exempt = inv.taxes.find(t => Number(t.taxRate) === 0)?.baseAmount || 0;

      return {
        date: inv.date,
        invoiceType: inv.invoiceType?.letter || '',
        salePoint: inv.salePoint?.number || '',
        number: inv.number,
        customerName: inv.customer?.name || '',
        customerDocType: inv.customer?.documentType || '',
        customerDocNum: inv.customer?.documentNum || '',
        customerTaxCondition: inv.customer?.taxCondition || '',
        net21: Number(net21),
        iva21: Number(iva21),
        net105: Number(net105),
        iva105: Number(iva105),
        exempt: Number(exempt),
        total: Number(inv.total),
        cae: inv.cae
      };
    });
    
    const totals = report.reduce((acc, curr) => ({
      totalNet21: acc.totalNet21 + curr.net21,
      totalNet105: acc.totalNet105 + curr.net105,
      totalIva21: acc.totalIva21 + curr.iva21,
      totalIva105: acc.totalIva105 + curr.iva105,
      totalExempt: acc.totalExempt + curr.exempt,
      totalInvoiced: acc.totalInvoiced + curr.total,
    }), { totalNet21: 0, totalNet105: 0, totalIva21: 0, totalIva105: 0, totalExempt: 0, totalInvoiced: 0 });

    return { items: report, totals };
  }

  async getIvaCompras(query: any) {
    const { month, year } = query;
    if (!month || !year) return [];
    
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 0, 23, 59, 59);

    const purchases = await this.prisma.purchase.findMany({
      where: {
        date: { gte: start, lte: end },
        status: { in: ['RECEIVED'] }
      },
      include: {
        supplier: true
      },
      orderBy: { date: 'asc' }
    });

    return purchases.map(p => ({
      date: p.date,
      supplierName: p.supplier?.name || '',
      supplierDocNum: p.supplier?.documentNum || '',
      invoiceNum: p.invoiceNum,
      net: Number(p.subtotal),
      iva: Number(p.taxAmount),
      total: Number(p.total)
    }));
  }

  async getInventoryValuation() {
    const items = await this.prisma.warehouseStock.findMany({
      include: {
        product: true
      }
    });

    let totalCostValue = 0;
    let totalSaleValue = 0;

    items.forEach(item => {
      const qty = Number(item.quantity);
      if (qty > 0) {
        totalCostValue += qty * Number(item.product.costPrice);
        totalSaleValue += qty * Number(item.product.salePrice);
      }
    });

    return {
      totalCostValue,
      totalSaleValue,
      potentialGrossProfit: totalSaleValue - totalCostValue,
      profitMargin: totalSaleValue > 0 ? ((totalSaleValue - totalCostValue) / totalSaleValue) * 100 : 0
    };
  }
}
