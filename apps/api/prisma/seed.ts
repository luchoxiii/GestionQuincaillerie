import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Permissions
  const permissionsList = [
    'ALL',
    'dashboard.view',
    'products.view', 'products.create', 'products.edit', 'products.delete', 'products.import', 'products.export', 'products.mass_price_update',
    'inventory.view', 'inventory.adjust', 'inventory.transfer', 'inventory.count',
    'pos.create_sale', 'pos.void_sale', 'pos.return', 'pos.apply_discount',
    'sales.view',
    'invoices.view', 'invoices.create', 'invoices.void', 'invoices.afip',
    'customers.view', 'customers.create', 'customers.edit', 'customers.payments',
    'suppliers.view', 'suppliers.create', 'suppliers.edit', 'suppliers.payments',
    'purchases.view', 'purchases.create',
    'cash.open', 'cash.close', 'cash.movement', 'cash.view_all',
    'reports.sales', 'reports.inventory', 'reports.financial', 'reports.fiscal',
    'users.view', 'users.create', 'users.edit', 'users.permissions',
    'settings.view', 'settings.edit',
    'audit.view'
  ];

  for (const p of permissionsList) {
    await prisma.permission.upsert({
      where: { action: p },
      update: {},
      create: { action: p, description: `Permission for ${p}` },
    });
  }

  // 2. Roles
  const rolesData = [
    { name: 'Admin', perms: ['ALL'] },
    { name: 'Encargado', perms: ['dashboard.view', 'products.view', 'products.create', 'products.edit', 'products.mass_price_update', 'inventory.view', 'inventory.adjust', 'inventory.transfer', 'inventory.count', 'pos.create_sale', 'pos.void_sale', 'pos.return', 'pos.apply_discount', 'sales.view', 'invoices.view', 'invoices.create', 'invoices.void', 'invoices.afip', 'customers.view', 'customers.create', 'customers.edit', 'customers.payments', 'suppliers.view', 'suppliers.create', 'suppliers.edit', 'suppliers.payments', 'purchases.view', 'purchases.create', 'cash.open', 'cash.close', 'cash.movement', 'cash.view_all', 'reports.sales', 'reports.inventory', 'reports.financial'] },
    { name: 'Vendedor', perms: ['dashboard.view', 'products.view', 'inventory.view', 'pos.create_sale', 'pos.return', 'sales.view', 'invoices.view', 'invoices.create', 'customers.view', 'customers.create', 'customers.payments', 'cash.open', 'cash.close', 'cash.movement'] },
    { name: 'Deposito', perms: ['products.view', 'inventory.view', 'inventory.adjust', 'inventory.transfer', 'inventory.count', 'purchases.view'] },
  ];

  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: { name: r.name, description: `Role ${r.name}` },
    });

    for (const p of r.perms) {
      const perm = await prisma.permission.findUnique({ where: { action: p } });
      if (perm) {
        const existing = await prisma.rolePermission.findFirst({
          where: { roleId: role.id, permissionId: perm.id },
        });
        if (!existing) {
          await prisma.rolePermission.create({
            data: { roleId: role.id, permissionId: perm.id },
          });
        }
      }
    }
  }

  // 3. Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ferreteria.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@ferreteria.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
    },
  });

  const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
  if (adminRole) {
    const userRole = await prisma.userRole.findFirst({
      where: { userId: adminUser.id, roleId: adminRole.id },
    });
    if (!userRole) {
      await prisma.userRole.create({
        data: { userId: adminUser.id, roleId: adminRole.id },
      });
    }
  }

  // 4. Taxes
  const taxesData = [
    { name: 'IVA 21%', rate: 21 },
    { name: 'IVA 10.5%', rate: 10.5 },
    { name: 'IVA 27%', rate: 27 },
    { name: 'IVA 0%', rate: 0 },
    { name: 'Exento', rate: 0 },
  ];

  for (const t of taxesData) {
    const exists = await prisma.tax.findFirst({ where: { name: t.name } });
    if (!exists) {
      await prisma.tax.create({ data: { name: t.name, rate: t.rate, isDefault: t.name === 'IVA 21%' } });
    }
  }

  // 5. Units
  const unitsData = ['Unidad', 'Metro', 'Kilo', 'Litro', 'Caja', 'Par', 'Juego', 'Rollo', 'Bolsa'];
  for (const u of unitsData) {
    const exists = await prisma.unitOfMeasure.findFirst({ where: { name: u } });
    if (!exists) {
      await prisma.unitOfMeasure.create({ data: { name: u, abbreviation: u.substring(0, 3).toUpperCase() } });
    }
  }

  // 6. Categories
  const categoriesData = [
    'Herramientas Manuales', 'Herramientas Eléctricas', 'Tornillería', 'Bulonería',
    'Pinturas', 'Electricidad', 'Plomería', 'Construcción', 'Jardinería',
    'Seguridad', 'Adhesivos y Selladores', 'Herrajes', 'Ferretería General'
  ];

  for (const c of categoriesData) {
    const exists = await prisma.category.findFirst({ where: { name: c } });
    if (!exists) {
      await prisma.category.create({
        data: { name: c, description: `Categoría de ${c}` },
      });
    }
  }

  // 7. Warehouse
  const defaultWarehouse = await prisma.warehouse.findFirst({ where: { name: 'Depósito Principal' } });
  if (!defaultWarehouse) {
    await prisma.warehouse.create({
      data: { name: 'Depósito Principal', address: 'Av. Central 1234', isActive: true }
    });
  }

  // 8. Cash Register
  const defaultRegister = await prisma.cashRegister.findFirst({ where: { name: 'Caja 1' } });
  if (!defaultRegister) {
    await prisma.cashRegister.create({
      data: { name: 'Caja 1', isActive: true }
    });
  }

  // 9. Payment Methods
  const paymentMethods = [
    { code: 'CASH', name: 'Efectivo' },
    { code: 'DEBIT', name: 'Tarjeta de Débito' },
    { code: 'CREDIT', name: 'Tarjeta de Crédito' },
    { code: 'TRANSFER', name: 'Transferencia Bancaria' },
    { code: 'CHECK', name: 'Cheque' },
    { code: 'OTHER', name: 'Otro' }
  ] as const;

  for (const pm of paymentMethods) {
    const exists = await prisma.paymentMethod.findFirst({ where: { code: pm.code } });
    if (!exists) {
      await prisma.paymentMethod.create({
        data: { code: pm.code, name: pm.name, isActive: true }
      });
    }
  }

  // 10. Sale Point
  const defaultSalePoint = await prisma.salePoint.findUnique({ where: { number: 1 } });
  if (!defaultSalePoint) {
    await prisma.salePoint.create({
      data: { number: 1, name: 'Punto de Venta 1', isActive: true, isAfipSync: true }
    });
  }

  // 11. Invoice Types
  const invoiceTypes = [
    { code: '001', name: 'Factura A', letter: 'A' },
    { code: '006', name: 'Factura B', letter: 'B' },
    { code: '011', name: 'Factura C', letter: 'C' }
  ];

  for (const it of invoiceTypes) {
    const exists = await prisma.invoiceType.findFirst({ where: { code: it.code } });
    if (!exists) {
      await prisma.invoiceType.create({
        data: { code: it.code, name: it.name, letter: it.letter, isActive: true }
      });
    }
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
