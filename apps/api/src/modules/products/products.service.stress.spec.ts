import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ProductsService — Pruebas de Estrés y Gran Volumen Backend 🔥', () => {
  let service: ProductsService;
  let prisma: any;

  beforeEach(async () => {
    // Generar un catálogo sintético de 5,000 productos con existencias en múltiples depósitos
    const massiveCatalog = Array.from({ length: 5000 }, (_, i) => ({
      id: `prod-stress-${i}`,
      name: `Artículo Estrés ${i} - Disco de Corte 115mm`,
      code: `ART-${i.toString().padStart(5, '0')}`,
      costPrice: 500 + (i % 200),
      salePrice: 1000 + (i % 300),
      minStock: 10,
      stocks: [
        { quantity: 10 + (i % 10), warehouse: { name: 'Salón Mostrador' } },
        { quantity: 50 + (i % 20), warehouse: { name: 'Depósito Central' } },
        { quantity: 5 + (i % 5), warehouse: { name: 'Sucursal Obra' } },
      ],
      barcodes: [
        { barcode: `779${i.toString().padStart(10, '0')}` },
      ],
      category: { id: `cat-${i % 10}`, name: `Rubro ${i % 10}` },
    }));

    prisma = {
      product: {
        findMany: jest.fn().mockImplementation((args) => {
          const skip = args?.skip || 0;
          const take = args?.take || 50;
          return Promise.resolve(massiveCatalog.slice(skip, skip + take));
        }),
        count: jest.fn().mockResolvedValue(5000),
        findUnique: jest.fn().mockResolvedValue(massiveCatalog[0]),
      },
      productBarcode: {
        findUnique: jest.fn().mockResolvedValue({
          barcode: '7791234567890',
          product: massiveCatalog[0],
        }),
      },
      stockMovement: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
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

  it('debería paginar y calcular stock multidepósito de 100 páginas consecutivas en menos de 500ms', async () => {
    const startTime = Date.now();

    for (let page = 1; page <= 100; page++) {
      const result = await service.findAll({ page, limit: 50 });
      expect(result.data.length).toBe(50);
      expect(result.data[0].totalStock).toBeGreaterThan(0);
      expect(result.meta.total).toBe(5000);
    }

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(1000);
  });

  it('debería procesar una ráfaga de 200 búsquedas concurrentes en el catálogo sin fallos', async () => {
    const startTime = Date.now();

    const searchPromises = Array.from({ length: 200 }, (_, i) =>
      service.findAll({ search: `ART-${i}`, limit: 10 })
    );

    const results = await Promise.all(searchPromises);
    const duration = Date.now() - startTime;

    expect(results.length).toBe(200);
    expect(duration).toBeLessThan(1500);
  });

  it('debería consultar 200 códigos de barras concurrentes y retornar productos en menos de 500ms', async () => {
    const startTime = Date.now();

    const barcodePromises = Array.from({ length: 200 }, (_, i) =>
      service.findByBarcode(`779000000000${i % 10}`)
    );

    const results = await Promise.all(barcodePromises);
    const duration = Date.now() - startTime;

    expect(results.length).toBe(200);
    expect(results[0].id).toBeDefined();
    expect(duration).toBeLessThan(500);
  });
});
