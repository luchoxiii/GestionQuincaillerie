import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ProductsService — Pruebas Unitarias Backend 📦', () => {
  let service: ProductsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      product: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      productBarcode: {
        findUnique: jest.fn(),
      },
      stockMovement: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      priceHistory: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('findAll', () => {
    it('debería calcular el totalStock acumulando las cantidades de los depósitos', async () => {
      const mockProducts = [
        {
          id: 'prod-1',
          name: 'Taladro Percutor 650W',
          code: 'ART-0001',
          salePrice: 45000,
          stocks: [
            { quantity: 5, warehouse: { name: 'Salón Mostrador' } },
            { quantity: 15, warehouse: { name: 'Depósito Central' } },
          ],
        },
        {
          id: 'prod-2',
          name: 'Tornillo Autoperforante',
          code: 'ART-0002',
          salePrice: 50,
          stocks: [{ quantity: 1000, warehouse: { name: 'Depósito Central' } }],
        },
      ];

      prisma.product.findMany.mockResolvedValue(mockProducts);
      prisma.product.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.data[0].totalStock).toBe(20); // 5 + 15
      expect(result.data[1].totalStock).toBe(1000);
      expect(result.meta.total).toBe(2);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe('findOne & findByBarcode', () => {
    it('debería retornar el producto cuando existe el ID', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Disco de Corte 115mm',
        code: 'ART-0003',
        salePrice: 1500,
      };
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne('prod-1');

      expect(result.id).toBe('prod-1');
      expect(result.name).toBe('Disco de Corte 115mm');
    });

    it('debería arrojar NotFoundException si el producto no existe', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('inexistente')).rejects.toThrow(NotFoundException);
    });

    it('debería encontrar un producto escaneando su código de barras', async () => {
      const mockBarcode = {
        barcode: '7791234567890',
        product: {
          id: 'prod-1',
          name: 'Martillo Galponero 500g',
          code: 'ART-0004',
        },
      };
      prisma.productBarcode.findUnique.mockResolvedValue(mockBarcode);

      const result = await service.findByBarcode('7791234567890');

      expect(result.id).toBe('prod-1');
      expect(result.name).toBe('Martillo Galponero 500g');
    });

    it('debería arrojar NotFoundException si el código de barras no coincide', async () => {
      prisma.productBarcode.findUnique.mockResolvedValue(null);

      await expect(service.findByBarcode('0000000000000')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findLowStock', () => {
    it('debería identificar únicamente artículos cuyo stock total sea menor o igual al stock mínimo', async () => {
      const mockProducts = [
        {
          id: 'prod-low',
          name: 'Electrodos 2.5mm',
          minStock: 20,
          isActive: true,
          stocks: [{ quantity: 8 }], // 8 <= 20 -> ALERTA
        },
        {
          id: 'prod-ok',
          name: 'Pintura Látex 20L',
          minStock: 5,
          isActive: true,
          stocks: [{ quantity: 12 }], // 12 > 5 -> OK
        },
      ];
      prisma.product.findMany.mockResolvedValue(mockProducts);

      const lowStockProducts = await service.findLowStock();

      expect(lowStockProducts).toHaveLength(1);
      expect(lowStockProducts[0].id).toBe('prod-low');
    });
  });
});
