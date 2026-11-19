"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingStatus = exports.SalesChannel = exports.UserRole = exports.PaymentMethodCode = exports.BarcodeType = exports.TransferStatus = exports.TaxCondition = exports.DocumentType = exports.CashSessionStatus = exports.CashMovementType = exports.StockMovementType = exports.PurchaseOrderStatus = exports.PurchaseStatus = exports.InvoiceStatus = exports.SaleStatus = void 0;
var SaleStatus;
(function (SaleStatus) {
    SaleStatus["COMPLETED"] = "COMPLETED";
    SaleStatus["VOIDED"] = "VOIDED";
    SaleStatus["RETURNED"] = "RETURNED";
    SaleStatus["PARTIAL_RETURN"] = "PARTIAL_RETURN";
})(SaleStatus || (exports.SaleStatus = SaleStatus = {}));
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["PENDING"] = "PENDING";
    InvoiceStatus["AUTHORIZED"] = "AUTHORIZED";
    InvoiceStatus["REJECTED"] = "REJECTED";
    InvoiceStatus["VOIDED"] = "VOIDED";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
var PurchaseStatus;
(function (PurchaseStatus) {
    PurchaseStatus["DRAFT"] = "DRAFT";
    PurchaseStatus["SENT"] = "SENT";
    PurchaseStatus["PARTIAL"] = "PARTIAL";
    PurchaseStatus["RECEIVED"] = "RECEIVED";
    PurchaseStatus["CANCELLED"] = "CANCELLED";
})(PurchaseStatus || (exports.PurchaseStatus = PurchaseStatus = {}));
var PurchaseOrderStatus;
(function (PurchaseOrderStatus) {
    PurchaseOrderStatus["DRAFT"] = "DRAFT";
    PurchaseOrderStatus["SENT"] = "SENT";
    PurchaseOrderStatus["PARTIAL"] = "PARTIAL";
    PurchaseOrderStatus["RECEIVED"] = "RECEIVED";
    PurchaseOrderStatus["CANCELLED"] = "CANCELLED";
})(PurchaseOrderStatus || (exports.PurchaseOrderStatus = PurchaseOrderStatus = {}));
var StockMovementType;
(function (StockMovementType) {
    StockMovementType["PURCHASE_IN"] = "PURCHASE_IN";
    StockMovementType["SALE_OUT"] = "SALE_OUT";
    StockMovementType["ADJUSTMENT"] = "ADJUSTMENT";
    StockMovementType["TRANSFER_IN"] = "TRANSFER_IN";
    StockMovementType["TRANSFER_OUT"] = "TRANSFER_OUT";
    StockMovementType["RETURN_IN"] = "RETURN_IN";
    StockMovementType["INITIAL"] = "INITIAL";
    StockMovementType["COUNT_ADJUSTMENT"] = "COUNT_ADJUSTMENT";
})(StockMovementType || (exports.StockMovementType = StockMovementType = {}));
var CashMovementType;
(function (CashMovementType) {
    CashMovementType["SALE"] = "SALE";
    CashMovementType["REFUND"] = "REFUND";
    CashMovementType["INCOME"] = "INCOME";
    CashMovementType["EXPENSE"] = "EXPENSE";
    CashMovementType["WITHDRAWAL"] = "WITHDRAWAL";
    CashMovementType["OPENING"] = "OPENING";
})(CashMovementType || (exports.CashMovementType = CashMovementType = {}));
var CashSessionStatus;
(function (CashSessionStatus) {
    CashSessionStatus["OPEN"] = "OPEN";
    CashSessionStatus["CLOSED"] = "CLOSED";
})(CashSessionStatus || (exports.CashSessionStatus = CashSessionStatus = {}));
var DocumentType;
(function (DocumentType) {
    DocumentType["DNI"] = "DNI";
    DocumentType["CUIT"] = "CUIT";
    DocumentType["CUIL"] = "CUIL";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var TaxCondition;
(function (TaxCondition) {
    TaxCondition["RESPONSABLE_INSCRIPTO"] = "RESPONSABLE_INSCRIPTO";
    TaxCondition["MONOTRIBUTISTA"] = "MONOTRIBUTISTA";
    TaxCondition["EXENTO"] = "EXENTO";
    TaxCondition["CONSUMIDOR_FINAL"] = "CONSUMIDOR_FINAL";
})(TaxCondition || (exports.TaxCondition = TaxCondition = {}));
var TransferStatus;
(function (TransferStatus) {
    TransferStatus["PENDING"] = "PENDING";
    TransferStatus["IN_TRANSIT"] = "IN_TRANSIT";
    TransferStatus["COMPLETED"] = "COMPLETED";
    TransferStatus["CANCELLED"] = "CANCELLED";
})(TransferStatus || (exports.TransferStatus = TransferStatus = {}));
var BarcodeType;
(function (BarcodeType) {
    BarcodeType["EAN13"] = "EAN13";
    BarcodeType["CODE128"] = "CODE128";
    BarcodeType["INTERNAL"] = "INTERNAL";
    BarcodeType["QR"] = "QR";
})(BarcodeType || (exports.BarcodeType = BarcodeType = {}));
var PaymentMethodCode;
(function (PaymentMethodCode) {
    PaymentMethodCode["CASH"] = "CASH";
    PaymentMethodCode["DEBIT"] = "DEBIT";
    PaymentMethodCode["CREDIT"] = "CREDIT";
    PaymentMethodCode["TRANSFER"] = "TRANSFER";
    PaymentMethodCode["CHECK"] = "CHECK";
    PaymentMethodCode["OTHER"] = "OTHER";
})(PaymentMethodCode || (exports.PaymentMethodCode = PaymentMethodCode = {}));
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "Admin";
    UserRole["ENCARGADO"] = "Encargado";
    UserRole["VENDEDOR"] = "Vendedor";
    UserRole["DEPOSITO"] = "Deposito";
})(UserRole || (exports.UserRole = UserRole = {}));
var SalesChannel;
(function (SalesChannel) {
    SalesChannel["POS"] = "POS";
    SalesChannel["MERCADO_LIBRE"] = "MERCADO_LIBRE";
    SalesChannel["TIENDA_ONLINE"] = "TIENDA_ONLINE";
    SalesChannel["WHATSAPP"] = "WHATSAPP";
    SalesChannel["OTRO"] = "OTRO";
})(SalesChannel || (exports.SalesChannel = SalesChannel = {}));
var ShippingStatus;
(function (ShippingStatus) {
    ShippingStatus["PENDING"] = "PENDING";
    ShippingStatus["PREPARING"] = "PREPARING";
    ShippingStatus["READY_TO_SHIP"] = "READY_TO_SHIP";
    ShippingStatus["SHIPPED"] = "SHIPPED";
    ShippingStatus["DELIVERED"] = "DELIVERED";
    ShippingStatus["CANCELLED"] = "CANCELLED";
})(ShippingStatus || (exports.ShippingStatus = ShippingStatus = {}));
