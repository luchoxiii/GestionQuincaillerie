import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  stemSpanishWord,
  extractSearchTokens,
  fieldMatchesToken,
  matchProductNatural,
  matchCustomerNatural,
  matchUserNatural,
} from '@ferreteria/shared';

describe('Natural Language Search Engine (Motor de Búsqueda Natural)', () => {
  describe('normalizeText', () => {
    it('debe eliminar tildes, diacríticos y normalizar a minúsculas', () => {
      expect(normalizeText('PÉREZ')).toBe('perez');
      expect(normalizeText('Eléctrico y Cañón')).toBe('electrico y canon');
      expect(normalizeText('  Martillo Demoledor  ')).toBe('martillo demoledor');
    });

    it('debe manejar cadenas vacías, nulas o indefinidas de forma segura', () => {
      expect(normalizeText('')).toBe('');
      expect(normalizeText(null)).toBe('');
      expect(normalizeText(undefined)).toBe('');
    });
  });

  describe('stemSpanishWord & extractSearchTokens', () => {
    it('debe lematizar plurales en español al singular', () => {
      expect(stemSpanishWord('clavos')).toBe('clavo');
      expect(stemSpanishWord('tornillos')).toBe('tornillo');
      expect(stemSpanishWord('cables')).toBe('cable');
      expect(stemSpanishWord('nueces')).toBe('nuez');
    });

    it('debe omitir conectores y stop-words neutros en español', () => {
      const tokens = extractSearchTokens('cemento de 50kg con arena para obra');
      expect(tokens).toEqual(['cemento', '50kg', 'arena', 'obra']);
    });

    it('no debe descartar búsquedas cortas si el usuario sólo escribe un conector', () => {
      const single = extractSearchTokens('de');
      expect(single).toEqual(['de']);
    });
  });

  describe('fieldMatchesToken', () => {
    it('debe coincidir con palabras con tildes y variaciones singular/plural', () => {
      expect(fieldMatchesToken('Destornillador Phillips', 'destornillador')).toBe(true);
      expect(fieldMatchesToken('Destornillador Phillips', 'destornilladores')).toBe(true);
      expect(fieldMatchesToken('Cámara de Seguridad', 'camara')).toBe(true);
      expect(fieldMatchesToken('Pérez Construcciones', 'perez')).toBe(true);
    });
  });

  describe('matchProductNatural (Búsqueda Natural de Productos)', () => {
    const mockProducts = [
      {
        id: 'p1',
        name: 'Cemento Portland Loma Negra 50kg',
        sku: 'CEM-001',
        code: 'CEM-001',
        description: 'Bolsa de cemento para construcción pesada',
        salePrice: 12500,
        price: 12500,
        totalStock: 80,
        minStock: 10,
        category: { name: 'Materiales' },
        brand: { name: 'Loma Negra' },
        barcodes: [{ barcode: '7790001' }],
      },
      {
        id: 'p2',
        name: 'Taladro Percutor Bosch 700W GSB 13 RE',
        sku: 'BOS-002',
        code: 'BOS-002',
        description: 'Taladro con selector de percusión y velocidad variable',
        salePrice: 65000,
        price: 65000,
        totalStock: 0, // SIN STOCK
        minStock: 5,
        category: { name: 'Herramientas Eléctricas' },
        brand: { name: 'Bosch' },
        barcodes: [{ barcode: '7790002' }],
      },
      {
        id: 'p3',
        name: 'Tornillo Autoperforante Hexagonal 2 Pulgadas',
        sku: 'TOR-003',
        code: 'TOR-003',
        description: 'Caja x 100 tornillos para chapa y perfil C',
        salePrice: 8500,
        price: 8500,
        totalStock: 3, // BAJO STOCK (<= minStock)
        minStock: 5,
        category: { name: 'Fijaciones' },
        brand: { name: 'Tel' },
        barcodes: [{ barcode: '7790003' }],
      },
    ];

    it('debe encontrar producto con palabras desordenadas y conectores ("50kg cemento de loma negra")', () => {
      const match = mockProducts.filter((p) => matchProductNatural(p, '50kg cemento de loma negra'));
      expect(match).toHaveLength(1);
      expect(match[0].id).toBe('p1');
    });

    it('debe tolerar plurales en la consulta ("tornillos autoperforantes")', () => {
      const match = mockProducts.filter((p) => matchProductNatural(p, 'tornillos autoperforantes'));
      expect(match).toHaveLength(1);
      expect(match[0].id).toBe('p3');
    });

    it('debe tolerar omisión de tildes ("taladro electrico")', () => {
      const match = mockProducts.filter((p) => matchProductNatural(p, 'taladro electrico'));
      expect(match).toHaveLength(1);
      expect(match[0].id).toBe('p2');
    });

    it('debe filtrar semánticamente productos "sin stock"', () => {
      const match = mockProducts.filter((p) => matchProductNatural(p, 'sin stock'));
      expect(match).toHaveLength(1);
      expect(match[0].id).toBe('p2');
    });

    it('debe filtrar semánticamente productos "bajo stock"', () => {
      const match = mockProducts.filter((p) => matchProductNatural(p, 'bajo stock'));
      expect(match).toHaveLength(1);
      expect(match[0].id).toBe('p3');
    });

    it('debe filtrar semánticamente productos por rango de precio ("< 10000" y "> 20000")', () => {
      const cheap = mockProducts.filter((p) => matchProductNatural(p, '< 10000'));
      expect(cheap).toHaveLength(1);
      expect(cheap[0].id).toBe('p3');

      const expensive = mockProducts.filter((p) => matchProductNatural(p, '> 50000'));
      expect(expensive).toHaveLength(1);
      expect(expensive[0].id).toBe('p2');
    });

    it('debe combinar texto y operador de precio ("cemento < 15000")', () => {
      const match = mockProducts.filter((p) => matchProductNatural(p, 'cemento < 15000'));
      expect(match).toHaveLength(1);
      expect(match[0].id).toBe('p1');

      const noMatch = mockProducts.filter((p) => matchProductNatural(p, 'cemento < 10000'));
      expect(noMatch).toHaveLength(0);
    });
  });

  describe('matchCustomerNatural (Búsqueda Natural de Clientes)', () => {
    const mockCustomers = [
      {
        id: 'c1',
        name: 'Constructora del Plata SA',
        businessName: 'Constructora del Plata SA',
        documentNum: '30-71234567-8',
        email: 'compras@delplata.com',
        phone: '11-4444-5555',
        address: 'Av Corrientes 1234',
        balance: 145000, // CON DEUDA
        creditLimit: 200000,
        isBanned: false,
      },
      {
        id: 'c2',
        name: 'Juan Carlos Pérez',
        businessName: 'Pérez Instalaciones',
        documentNum: '28.123.456',
        email: 'jperez@gmail.com',
        phone: '11-2222-3333',
        address: 'Calle Falsa 123',
        balance: 0, // AL DIA
        creditLimit: 50000,
        isBanned: false,
      },
      {
        id: 'c3',
        name: 'Distribuidora Morosa SRL',
        businessName: 'Distribuidora Morosa SRL',
        documentNum: '30-99887766-5',
        email: 'cobranzas@morosa.com',
        phone: '11-9999-8888',
        address: 'Ruta 3 Km 40',
        balance: 350000,
        creditLimit: 100000, // EXCEDIDO
        isBanned: true, // VETADO
      },
    ];

    it('debe encontrar cliente con nombre invertido ("perez juan")', () => {
      const match = mockCustomers.filter((c) => matchCustomerNatural(c, 'perez juan'));
      expect(match).toHaveLength(1);
      expect(match[0].id).toBe('c2');
    });

    it('debe filtrar clientes con intención "con deuda" o "morosos"', () => {
      const debtors = mockCustomers.filter((c) => matchCustomerNatural(c, 'con deuda'));
      expect(debtors.map((c) => c.id)).toEqual(['c1', 'c3']);

      const namedDebtor = mockCustomers.filter((c) => matchCustomerNatural(c, 'constructora con deuda'));
      expect(namedDebtor).toHaveLength(1);
      expect(namedDebtor[0].id).toBe('c1');
    });

    it('debe filtrar clientes con intención "sin deuda" o "al dia"', () => {
      const clean = mockCustomers.filter((c) => matchCustomerNatural(c, 'sin deuda'));
      expect(clean).toHaveLength(1);
      expect(clean[0].id).toBe('c2');
    });

    it('debe filtrar clientes con intención "vetado" o "bloqueado"', () => {
      const banned = mockCustomers.filter((c) => matchCustomerNatural(c, 'vetados'));
      expect(banned).toHaveLength(1);
      expect(banned[0].id).toBe('c3');
    });

    it('debe filtrar clientes con intención "excedido"', () => {
      const exceeded = mockCustomers.filter((c) => matchCustomerNatural(c, 'excedido'));
      expect(exceeded).toHaveLength(1);
      expect(exceeded[0].id).toBe('c3');
    });
  });

  describe('matchUserNatural (Búsqueda Natural de Usuarios)', () => {
    const mockUsers = [
      {
        id: 'u1',
        username: 'admin',
        firstName: 'Administrador',
        lastName: 'General',
        email: 'admin@ferreteria.local',
        isActive: true,
        userRoles: [{ role: { name: 'Administrador' }, roleId: 'r-admin' }],
      },
      {
        id: 'u2',
        username: 'jperez',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'cajero1@ferreteria.local',
        isActive: true,
        userRoles: [{ role: { name: 'Vendedor' }, roleId: 'r-vendedor' }],
      },
      {
        id: 'u3',
        username: 'clopez',
        firstName: 'Carlos',
        lastName: 'López',
        email: 'deposito@ferreteria.local',
        isActive: false, // INACTIVO
        userRoles: [{ role: { name: 'Depósito' }, roleId: 'r-deposito' }],
      },
    ];

    it('debe encontrar usuarios por nombre invertido o sin tildes ("perez juan")', () => {
      const match = mockUsers.filter((u) => matchUserNatural(u, 'perez juan'));
      expect(match).toHaveLength(1);
      expect(match[0].id).toBe('u2');
    });

    it('debe filtrar por rol operativo ("cajero" o "vendedor")', () => {
      const match = mockUsers.filter((u) => matchUserNatural(u, 'cajero'));
      expect(match).toHaveLength(1);
      expect(match[0].id).toBe('u2');
    });

    it('debe filtrar por estado "inactivo" o "baja"', () => {
      const match = mockUsers.filter((u) => matchUserNatural(u, 'inactivo'));
      expect(match).toHaveLength(1);
      expect(match[0].id).toBe('u3');
    });

    it('debe combinar rol y estado ("deposito inactivo")', () => {
      const match = mockUsers.filter((u) => matchUserNatural(u, 'deposito inactivo'));
      expect(match).toHaveLength(1);
      expect(match[0].id).toBe('u3');

      const noMatch = mockUsers.filter((u) => matchUserNatural(u, 'admin inactivo'));
      expect(noMatch).toHaveLength(0);
    });
  });
});
