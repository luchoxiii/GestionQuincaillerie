export enum SaleStatus {
  COMPLETED = 'COMPLETED',
  VOIDED = 'VOIDED',
  RETURNED = 'RETURNED',
  PARTIAL_RETURN = 'PARTIAL_RETURN'
}

export enum InvoiceStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  REJECTED = 'REJECTED',
  VOIDED = 'VOIDED'
}

export enum PurchaseStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PARTIAL = 'PARTIAL',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED'
}

export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PARTIAL = 'PARTIAL',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED'
}

export enum StockMovementType {
  PURCHASE_IN = 'PURCHASE_IN',
  SALE_OUT = 'SALE_OUT',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  RETURN_IN = 'RETURN_IN',
  INITIAL = 'INITIAL',
  COUNT_ADJUSTMENT = 'COUNT_ADJUSTMENT'
}

export enum CashMovementType {
  SALE = 'SALE',
  REFUND = 'REFUND',
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  WITHDRAWAL = 'WITHDRAWAL',
  OPENING = 'OPENING'
}

export enum CashSessionStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export enum DocumentType {
  DNI = 'DNI',
  CUIT = 'CUIT',
  CUIL = 'CUIL'
}

export enum TaxCondition {
  RESPONSABLE_INSCRIPTO = 'RESPONSABLE_INSCRIPTO',
  MONOTRIBUTISTA = 'MONOTRIBUTISTA',
  EXENTO = 'EXENTO',
  CONSUMIDOR_FINAL = 'CONSUMIDOR_FINAL'
}

export enum TransferStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum BarcodeType {
  EAN13 = 'EAN13',
  CODE128 = 'CODE128',
  INTERNAL = 'INTERNAL',
  QR = 'QR'
}

export enum PaymentMethodCode {
  CASH = 'CASH',
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
  TRANSFER = 'TRANSFER',
  CHECK = 'CHECK',
  OTHER = 'OTHER'
}

export enum UserRole {
  ADMIN = 'Admin',
  ENCARGADO = 'Encargado',
  VENDEDOR = 'Vendedor',
  DEPOSITO = 'Deposito'
}

export enum SalesChannel {
  POS = 'POS',
  MERCADO_LIBRE = 'MERCADO_LIBRE',
  TIENDA_ONLINE = 'TIENDA_ONLINE',
  WHATSAPP = 'WHATSAPP',
  OTRO = 'OTRO'
}

export enum ShippingStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY_TO_SHIP = 'READY_TO_SHIP',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}
