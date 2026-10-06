import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AfipService } from './afip.service';
import { CreateDirectInvoiceDto } from './dto/invoicing.dto';
import { InvoiceStatus, TaxCondition, Prisma } from '@prisma/client';

@Injectable()
export class InvoicingService {
  private readonly logger = new Logger(InvoicingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly afipService: AfipService,
  ) {}

  async getSalePoints() {
    return this.prisma.salePoint.findMany({
      where: { isActive: true },
      orderBy: { number: 'asc' },
    });
  }

  async getInvoiceTypes() {
    return this.prisma.invoiceType.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });
  }

  async determineInvoiceType(customerTaxCondition: TaxCondition, isCreditNote = false): Promise<string> {
    const types = await this.getInvoiceTypes();
    
    // Si es RESPONSABLE_INSCRIPTO -> Factura A ('001') o NC A ('003')
    if (customerTaxCondition === TaxCondition.RESPONSABLE_INSCRIPTO) {
      const code = isCreditNote ? '003' : '001';
      const type = types.find(t => t.code === code);
      if (!type) throw new BadRequestException(`Tipo de comprobante ${code} no encontrado`);
      return type.id;
    }
    
    // CONSUMIDOR_FINAL, MONOTRIBUTISTA, EXENTO -> Factura B ('006') o NC B ('008')
    const code = isCreditNote ? '008' : '006';
    const type = types.find(t => t.code === code);
    if (!type) throw new BadRequestException(`Tipo de comprobante ${code} no encontrado`);
    return type.id;
  }

  async createFromSale(saleId: string, options?: { salePointId?: string }) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id: saleId },
        include: {
          customer: true,
          items: {
            include: { product: true }
          },
          invoice: true
        }
      });

      if (!sale) throw new NotFoundException('Venta no encontrada');
      if (sale.invoice) throw new BadRequestException('La venta ya fue facturada');
      if (!sale.customer) throw new BadRequestException('La venta no tiene un cliente asociado');

      const invoiceTypeId = await this.determineInvoiceType(sale.customer.taxCondition);
      
      let salePointId = options?.salePointId;
      if (!salePointId) {
        const salePoint = await tx.salePoint.findFirst({ where: { isActive: true }, orderBy: { number: 'asc' } });
        if (!salePoint) throw new BadRequestException('No hay puntos de venta activos');
        salePointId = salePoint.id;
      }

      // Authorize with AFIP
      const afipData = {
        salePointId,
        invoiceTypeId,
        total: Number(sale.total),
        customerDocType: sale.customer.documentType,
        customerDocNum: sale.customer.documentNum
      };

      const afipResult = await this.afipService.authorizeInvoice(afipData);

      // Create invoice
      const invoice = await tx.invoice.create({
        data: {
          saleId: sale.id,
          customerId: sale.customer.id,
          salePointId,
          invoiceTypeId,
          number: afipResult.number,
          status: InvoiceStatus.AUTHORIZED,
          cae: afipResult.cae,
          caeDueDate: afipResult.caeDueDate,
          subtotal: sale.subtotal,
          taxAmount: sale.taxAmount,
          total: sale.total,
          afipRequest: afipResult.afipRequest,
          afipResponse: afipResult.afipResponse,
          items: {
            create: sale.items.map(item => ({
              productId: item.productId,
              description: item.product.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              subtotal: item.subtotal,
              taxRate: item.taxRate,
              taxAmount: item.taxAmount,
              total: item.total
            }))
          }
        },
        include: {
          items: true,
          salePoint: true,
          invoiceType: true,
          customer: true
        }
      });

      // Calculate taxes breakdown
      const taxesMap = new Map<number, { base: number, amount: number }>();
      for (const item of sale.items) {
        const rate = Number(item.taxRate);
        const base = Number(item.subtotal);
        const amount = Number(item.taxAmount);
        
        if (rate > 0) {
          const current = taxesMap.get(rate) || { base: 0, amount: 0 };
          taxesMap.set(rate, {
            base: current.base + base,
            amount: current.amount + amount
          });
        }
      }

      for (const [rate, values] of taxesMap.entries()) {
        await tx.invoiceTax.create({
          data: {
            invoiceId: invoice.id,
            taxRate: new Prisma.Decimal(rate),
            baseAmount: new Prisma.Decimal(values.base),
            taxAmount: new Prisma.Decimal(values.amount)
          }
        });
      }

      return invoice;
    });
  }

  async createDirectInvoice(data: CreateDirectInvoiceDto) {
    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: data.customerId }
      });
      if (!customer) throw new NotFoundException('Cliente no encontrado');

      let subtotal = 0;
      let taxAmount = 0;
      let total = 0;

      const itemsData = await Promise.all(data.items.map(async item => {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new NotFoundException(`Producto ${item.productId} no encontrado`);
        
        const itemSubtotal = item.quantity * (item.unitPrice - (item.discount || 0));
        const itemTaxAmount = itemSubtotal * (item.taxRate / 100);
        const itemTotal = itemSubtotal + itemTaxAmount;
        
        subtotal += itemSubtotal;
        taxAmount += itemTaxAmount;
        total += itemTotal;

        return {
          productId: product.id,
          description: item.description || product.name,
          quantity: new Prisma.Decimal(item.quantity),
          unitPrice: new Prisma.Decimal(item.unitPrice),
          discount: new Prisma.Decimal(item.discount || 0),
          subtotal: new Prisma.Decimal(itemSubtotal),
          taxRate: new Prisma.Decimal(item.taxRate),
          taxAmount: new Prisma.Decimal(itemTaxAmount),
          total: new Prisma.Decimal(itemTotal)
        };
      }));

      const afipData = {
        salePointId: data.salePointId,
        invoiceTypeId: data.invoiceTypeId,
        total,
        customerDocType: customer.documentType,
        customerDocNum: customer.documentNum
      };

      const afipResult = await this.afipService.authorizeInvoice(afipData);

      const invoice = await tx.invoice.create({
        data: {
          customerId: customer.id,
          salePointId: data.salePointId,
          invoiceTypeId: data.invoiceTypeId,
          number: afipResult.number,
          status: InvoiceStatus.AUTHORIZED,
          cae: afipResult.cae,
          caeDueDate: afipResult.caeDueDate,
          subtotal: new Prisma.Decimal(subtotal),
          taxAmount: new Prisma.Decimal(taxAmount),
          total: new Prisma.Decimal(total),
          afipRequest: afipResult.afipRequest,
          afipResponse: afipResult.afipResponse,
          items: {
            create: itemsData
          }
        },
        include: {
          items: true,
          salePoint: true,
          invoiceType: true,
          customer: true
        }
      });

      // Calculate taxes breakdown
      const taxesMap = new Map<number, { base: number, amount: number }>();
      for (const item of itemsData) {
        const rate = Number(item.taxRate);
        const base = Number(item.subtotal);
        const amt = Number(item.taxAmount);
        
        if (rate > 0) {
          const current = taxesMap.get(rate) || { base: 0, amount: 0 };
          taxesMap.set(rate, {
            base: current.base + base,
            amount: current.amount + amt
          });
        }
      }

      for (const [rate, values] of taxesMap.entries()) {
        await tx.invoiceTax.create({
          data: {
            invoiceId: invoice.id,
            taxRate: new Prisma.Decimal(rate),
            baseAmount: new Prisma.Decimal(values.base),
            taxAmount: new Prisma.Decimal(values.amount)
          }
        });
      }

      return invoice;
    });
  }

  async createCreditNote(invoiceId: string, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      const origInvoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          customer: true,
          items: true,
          invoiceType: true
        }
      });

      if (!origInvoice) throw new NotFoundException('Factura original no encontrada');
      if (origInvoice.status !== InvoiceStatus.AUTHORIZED) {
        throw new BadRequestException('Solo se pueden hacer notas de crédito de facturas autorizadas');
      }

      // Check if it already has a credit note? We might skip this for simplicity if not modeled explicitly, 
      // but conceptually a credit note reverses it. We will issue one.

      const ncTypeId = await this.determineInvoiceType(origInvoice.customer.taxCondition, true);

      const afipData = {
        salePointId: origInvoice.salePointId,
        invoiceTypeId: ncTypeId,
        total: Number(origInvoice.total),
        customerDocType: origInvoice.customer.documentType,
        customerDocNum: origInvoice.customer.documentNum
      };

      const afipResult = await this.afipService.authorizeInvoice(afipData);

      const creditNote = await tx.invoice.create({
        data: {
          customerId: origInvoice.customerId,
          salePointId: origInvoice.salePointId,
          invoiceTypeId: ncTypeId,
          number: afipResult.number,
          status: InvoiceStatus.AUTHORIZED,
          cae: afipResult.cae,
          caeDueDate: afipResult.caeDueDate,
          subtotal: origInvoice.subtotal,
          taxAmount: origInvoice.taxAmount,
          total: origInvoice.total,
          afipRequest: afipResult.afipRequest,
          afipResponse: afipResult.afipResponse,
          items: {
            create: origInvoice.items.map(item => ({
              productId: item.productId,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              subtotal: item.subtotal,
              taxRate: item.taxRate,
              taxAmount: item.taxAmount,
              total: item.total
            }))
          }
        },
        include: {
          items: true,
          salePoint: true,
          invoiceType: true,
          customer: true
        }
      });

      // Duplicate taxes for NC
      const origTaxes = await tx.invoiceTax.findMany({ where: { invoiceId: origInvoice.id } });
      for (const tax of origTaxes) {
        await tx.invoiceTax.create({
          data: {
            invoiceId: creditNote.id,
            taxRate: tax.taxRate,
            baseAmount: tax.baseAmount,
            taxAmount: tax.taxAmount
          }
        });
      }

      return creditNote;
    });
  }

  async findAll(query: any) {
    const { skip = 0, take = 10, startDate, endDate, customerId, salePointId, invoiceTypeId, status } = query;

    const where: Prisma.InvoiceWhereInput = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (customerId) where.customerId = customerId;
    if (salePointId) where.salePointId = salePointId;
    if (invoiceTypeId) where.invoiceTypeId = invoiceTypeId;
    if (status) where.status = status as InvoiceStatus;

    const [total, items] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.findMany({
        where,
        include: {
          customer: true,
          invoiceType: true,
          salePoint: true
        },
        skip: Number(skip),
        take: Number(take),
        orderBy: { date: 'desc' }
      })
    ]);

    return { total, items, skip: Number(skip), take: Number(take) };
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: { product: true }
        },
        taxes: true,
        salePoint: true,
        invoiceType: true
      }
    });

    if (!invoice) throw new NotFoundException('Factura no encontrada');

    // Reconstruct QR code
    let qrUrl: string | null = null;
    if (invoice.cae) {
      let tipoDocRec = 99;
      if (invoice.customer.documentType === 'CUIT') tipoDocRec = 80;
      else if (invoice.customer.documentType === 'DNI') tipoDocRec = 96;
      else if (invoice.customer.documentType === 'CUIL') tipoDocRec = 86;

      const dateStr = invoice.date.toISOString().split('T')[0];
      const tipoCmp = parseInt(invoice.invoiceType.code, 10);
      const nroDocRec = parseInt(invoice.customer.documentNum.replace(/\D/g, ''), 10) || 0;

      const qrPayload = {
        ver: 1,
        fecha: dateStr,
        cuit: 30712345678, // Example CUIT
        ptoVta: invoice.salePoint.number,
        tipoCmp: tipoCmp,
        nroCmp: invoice.number,
        importe: Number(invoice.total),
        moneda: "PES",
        ctz: 1,
        tipoDocRec: tipoDocRec,
        nroDocRec: nroDocRec,
        tipoCodAut: "E",
        codAut: parseInt(invoice.cae, 10)
      };
      const base64Json = Buffer.from(JSON.stringify(qrPayload)).toString('base64');
      qrUrl = `https://www.afip.gob.ar/fe/qr/?p=${base64Json}`;
    }

    return { ...invoice, qrUrl };
  }

  async getFiscalSummary(month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month ? month - 1 : now.getMonth();
    const targetYear = year || now.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    const invoices = await this.prisma.invoice.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        status: InvoiceStatus.AUTHORIZED
      },
      include: {
        invoiceType: true,
        taxes: true
      }
    });

    let totalFacturado = 0;
    let totalIva21 = 0;
    let totalIva105 = 0;
    let countFacturasA = 0;
    let countFacturasB = 0;

    for (const inv of invoices) {
      const mult = (inv.invoiceType.code === '003' || inv.invoiceType.code === '008') ? -1 : 1;
      
      totalFacturado += Number(inv.total) * mult;

      if (inv.invoiceType.letter === 'A') countFacturasA++;
      else if (inv.invoiceType.letter === 'B') countFacturasB++;

      for (const tax of inv.taxes) {
        const rate = Number(tax.taxRate);
        const amt = Number(tax.taxAmount) * mult;
        if (rate === 21) totalIva21 += amt;
        else if (rate === 10.5) totalIva105 += amt;
      }
    }

    return {
      period: `${targetMonth + 1}/${targetYear}`,
      totalFacturado,
      totalIva21,
      totalIva105,
      countFacturasA,
      countFacturasB
    };
  }
}
