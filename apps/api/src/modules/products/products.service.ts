import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { extractSearchTokens, normalizeText, stemSpanishWord } from '@ferreteria/shared';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.brandId) where.brandId = query.brandId;
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

    if (query.search) {
      const rawSearch = String(query.search).trim();
      const normSearch = normalizeText(rawSearch);

      // Price filter parsing (e.g. "< 10000", "> 50000", "menos de 1000", "mas de 5000")
      const lessThanMatch = normSearch.match(/(?:<|menos de|hasta)\s*(\d+(?:\.\d+)?)/i);
      if (lessThanMatch) {
        const maxVal = parseFloat(lessThanMatch[1]);
        if (!isNaN(maxVal)) {
          where.salePrice = { ...(where.salePrice as any || {}), lte: maxVal };
        }
      }

      const greaterThanMatch = normSearch.match(/(?:>|mas de|desde)\s*(\d+(?:\.\d+)?)/i);
      if (greaterThanMatch) {
        const minVal = parseFloat(greaterThanMatch[1]);
        if (!isNaN(minVal)) {
          where.salePrice = { ...(where.salePrice as any || {}), gte: minVal };
        }
      }

      // Stock status parsing
      const isZeroStock = /(?:sin\s+stock|agotado|sin\s+existencia|stock\s*0|cero\s+stock)/i.test(normSearch);
      if (isZeroStock) {
        where.stocks = { none: { quantity: { gt: 0 } } };
      }

      const isInStock = /(?:con\s+stock|en\s+stock|disponible|hay\s+stock)/i.test(normSearch);
      if (isInStock) {
        where.stocks = { some: { quantity: { gt: 0 } } };
      }

      // Clean special tokens
      const cleaned = normSearch
        .replace(/(?:sin\s+stock|agotado|sin\s+existencia|stock\s*0|cero\s+stock)/gi, ' ')
        .replace(/(?:con\s+stock|en\s+stock|disponible|hay\s+stock)/gi, ' ')
        .replace(/(?:bajo\s+stock|poco\s+stock|reponer|critico|stock\s+bajo)/gi, ' ')
        .replace(/(?:<|menos de|hasta)\s*\d+(?:\.\d+)?/gi, ' ')
        .replace(/(?:>|mas de|desde)\s*\d+(?:\.\d+)?/gi, ' ')
        .trim();

      const tokens = extractSearchTokens(cleaned);
      if (tokens.length > 0) {
        where.AND = tokens.map((token) => {
          const stem = stemSpanishWord(token);
          const orConditions: Prisma.ProductWhereInput[] = [
            { name: { contains: token, mode: 'insensitive' } },
            { description: { contains: token, mode: 'insensitive' } },
            { code: { contains: token, mode: 'insensitive' } },
            { category: { name: { contains: token, mode: 'insensitive' } } },
            { brand: { name: { contains: token, mode: 'insensitive' } } },
            { barcodes: { some: { barcode: { contains: token } } } },
          ];
          if (stem !== token && stem.length > 2) {
            orConditions.push({ name: { contains: stem, mode: 'insensitive' } });
            orConditions.push({ description: { contains: stem, mode: 'insensitive' } });
          }
          return { OR: orConditions };
        });
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          brand: true,
          unit: true,
          barcodes: true,
          stocks: {
            include: { warehouse: true },
          },
          taxes: {
            include: { tax: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    // Compute total stock per product
    const enriched = data.map((product) => {
      const totalStock = product.stocks.reduce(
        (sum, s) => sum + Number(s.quantity),
        0,
      );
      return { ...product, totalStock };
    });

    return {
      data: enriched,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        barcodes: true,
        images: true,
        category: true,
        brand: true,
        unit: true,
        taxes: { include: { tax: true } },
        stocks: { include: { warehouse: true } },
      },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async findByBarcode(code: string) {
    const barcode = await this.prisma.productBarcode.findUnique({
      where: { barcode: code },
      include: {
        product: {
          include: {
            category: true,
            brand: true,
            unit: true,
            taxes: { include: { tax: true } },
            stocks: { include: { warehouse: true } },
          },
        },
      },
    });
    if (!barcode) throw new NotFoundException('Código de barras no encontrado');
    return barcode.product;
  }

  async findLowStock() {
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        minStock: { not: null },
      },
      include: {
        category: true,
        stocks: { include: { warehouse: true } },
      },
    });

    return products.filter((product) => {
      const totalStock = product.stocks.reduce(
        (sum, s) => sum + Number(s.quantity),
        0,
      );
      return totalStock <= Number(product.minStock || 0);
    });
  }

  async getStockMovements(id: string, query?: any) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where: { productId: id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { warehouse: true, user: true },
      }),
      this.prisma.stockMovement.count({ where: { productId: id } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getPriceHistory(id: string) {
    return this.prisma.priceHistory.findMany({
      where: { productId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any) {
    const { barcodes, taxIds, ...productData } = data;

    const product = await this.prisma.product.create({
      data: {
        ...productData,
        barcodes: barcodes?.length
          ? { create: barcodes.map((b: any) => ({ barcode: b.barcode, type: b.type || 'EAN13' })) }
          : undefined,
        taxes: taxIds?.length
          ? { create: taxIds.map((taxId: string) => ({ taxId })) }
          : undefined,
      },
      include: {
        category: true,
        brand: true,
        unit: true,
        barcodes: true,
        taxes: { include: { tax: true } },
      },
    });

    return product;
  }

  async update(id: string, data: any) {
    const oldProduct = await this.prisma.product.findUnique({ where: { id } });
    if (!oldProduct) throw new NotFoundException('Producto no encontrado');

    const { barcodes, taxIds, ...updateData } = data;

    // Record price history if prices changed
    const costChanged = updateData.costPrice !== undefined &&
      Number(oldProduct.costPrice) !== Number(updateData.costPrice);
    const priceChanged = updateData.salePrice !== undefined &&
      Number(oldProduct.salePrice) !== Number(updateData.salePrice);

    if (costChanged || priceChanged) {
      await this.prisma.priceHistory.create({
        data: {
          productId: id,
          oldCost: oldProduct.costPrice,
          newCost: updateData.costPrice ?? oldProduct.costPrice,
          oldPrice: oldProduct.salePrice,
          newPrice: updateData.salePrice ?? oldProduct.salePrice,
          userId: data.userId || null,
        },
      });
    }

    // Update barcodes if provided
    if (barcodes !== undefined) {
      await this.prisma.productBarcode.deleteMany({ where: { productId: id } });
      if (barcodes.length > 0) {
        await this.prisma.productBarcode.createMany({
          data: barcodes.map((b: any) => ({
            productId: id,
            barcode: b.barcode,
            type: b.type || 'EAN13',
          })),
        });
      }
    }

    // Update taxes if provided
    if (taxIds !== undefined) {
      await this.prisma.productTax.deleteMany({ where: { productId: id } });
      if (taxIds.length > 0) {
        await this.prisma.productTax.createMany({
          data: taxIds.map((taxId: string) => ({ productId: id, taxId })),
        });
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        brand: true,
        unit: true,
        barcodes: true,
        taxes: { include: { tax: true } },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findAllBrands() {
    return this.prisma.brand.findMany({ orderBy: { name: 'asc' } });
  }

  async findAllUnits() {
    return this.prisma.unitOfMeasure.findMany({ orderBy: { name: 'asc' } });
  }

  async findAllTaxes() {
    return this.prisma.tax.findMany({ orderBy: { name: 'asc' } });
  }

  async massPriceUpdate(data: { categoryId?: string, brandId?: string, supplierId?: string, percentageChange: number, roundTo?: number, userId?: string }) {
    const { categoryId, brandId, percentageChange, roundTo = 2, userId } = data;
    
    const where: any = { isActive: true };
    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;

    const products = await this.prisma.product.findMany({ where });

    return this.prisma.$transaction(async (tx) => {
      let updatedCount = 0;
      for (const product of products) {
        const oldPrice = Number(product.salePrice);
        let newPrice = oldPrice * (1 + percentageChange / 100);
        
        const factor = Math.pow(10, roundTo);
        newPrice = Math.round(newPrice * factor) / factor;

        if (oldPrice !== newPrice) {
          await tx.product.update({
            where: { id: product.id },
            data: { salePrice: newPrice }
          });

          await tx.priceHistory.create({
            data: {
              productId: product.id,
              oldCost: product.costPrice,
              newCost: product.costPrice,
              oldPrice,
              newPrice,
              userId
            }
          });
          updatedCount++;
        }
      }
      return { updatedCount };
    });
  }

  async exportProducts() {
    return this.prisma.product.findMany({
      include: { brand: true, category: true, unit: true, barcodes: true }
    });
  }

  async importProducts(products: any[]) {
    return this.prisma.$transaction(async (tx) => {
      let count = 0;
      for (const p of products) {
        const product = await tx.product.upsert({
          where: { code: p.code },
          create: {
            code: p.code,
            name: p.name,
            description: p.description,
            costPrice: p.costPrice,
            salePrice: p.salePrice,
            categoryId: p.categoryId,
            brandId: p.brandId,
            unitId: p.unitId,
          },
          update: {
            name: p.name,
            description: p.description,
            costPrice: p.costPrice,
            salePrice: p.salePrice,
          }
        });

        if (p.barcode) {
          await tx.productBarcode.upsert({
            where: { barcode: p.barcode },
            create: { productId: product.id, barcode: p.barcode, type: 'EAN13' },
            update: { productId: product.id }
          });
        }
        count++;
      }
      return { importedCount: count };
    });
  }
}

