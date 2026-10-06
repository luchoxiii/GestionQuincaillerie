export * from './enums';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  action: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnitOfMeasure {
  id: string;
  name: string;
  abbreviation: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductBarcode {
  id: string;
  productId: string;
  barcode: string;
  type: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  categoryId?: string;
  brandId?: string;
  unitId?: string;
  isActive: boolean;
  costPrice: number;
  profitMargin?: number;
  salePrice: number;
  minStock?: number;
  maxStock?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  documentType: string;
  documentNum: string;
  documentNumber?: string;
  taxCondition: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  priceListId?: string;
  creditLimit?: number;
  balance: number;
  currentBalance?: number;
  isActive: boolean;
  isBanned?: boolean;
  banReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  documentType: string;
  documentNum: string;
  taxCondition: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  balance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: string;
  number: number;
  date: Date;
  status: string;
  customerId?: string;
  customerName?: string;
  userId: string;
  sellerName?: string;
  subtotal: number;
  discount: number;
  taxAmount: number;
  total: number;
  notes?: string;
  cashSessionId?: string;
  fiscalType?: 'BLANCO' | 'NEGRO';
  invoiceId?: string;
  invoiceNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  subtotal: number;
  total: number;
}

export interface SalePayment {
  id: string;
  saleId: string;
  methodId: string;
  amount: number;
  reference?: string;
}

export interface Purchase {
  id: string;
  number: number;
  date: Date;
  supplierId: string;
  purchaseOrderId?: string;
  invoiceNum?: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  subtotal: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  number: number;
  date: Date;
  supplierId: string;
  status: string;
  expectedDate?: Date;
  total: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  saleId?: string;
  customerId: string;
  salePointId: string;
  invoiceTypeId: string;
  number?: number;
  date: Date;
  status: string;
  cae?: string;
  caeDueDate?: Date;
  fiscalType?: 'BLANCO' | 'NEGRO';
  isFiscal?: boolean;
  netAmount?: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  afipError?: string;
  afipRequest?: any;
  afipResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export interface InvoiceTax {
  id: string;
  invoiceId: string;
  taxRate: number;
  baseAmount: number;
  taxAmount: number;
}

export interface CashRegister {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CashSession {
  id: string;
  registerId: string;
  userId: string;
  status: string;
  openedAt: Date;
  closedAt?: Date;
  openingBalance: number;
  closingBalance?: number;
  expectedBalance?: number;
  difference?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CashMovement {
  id: string;
  sessionId: string;
  type: string;
  amount: number;
  methodId?: string;
  description: string;
  referenceId?: string;
  createdAt: Date;
}

export interface Warehouse {
  id: string;
  name: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WarehouseStock {
  id: string;
  warehouseId: string;
  productId: string;
  quantity: number;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  warehouseId: string;
  productId: string;
  type: string;
  quantity: number;
  referenceId?: string;
  notes?: string;
  userId?: string;
  createdAt: Date;
}

export interface PriceList {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceListItem {
  id: string;
  priceListId: string;
  productId: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceHistory {
  id: string;
  productId: string;
  oldCost: number;
  newCost: number;
  oldPrice: number;
  newPrice: number;
  userId?: string;
  createdAt: Date;
}

export interface Tax {
  id: string;
  name: string;
  rate: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entity: string;
  entityId: string;
  details?: any;
  ipAddress?: string;
  createdAt: Date;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  group: string;
  type: string;
  description?: string;
  isPublic: boolean;
  updatedAt: Date;
}
