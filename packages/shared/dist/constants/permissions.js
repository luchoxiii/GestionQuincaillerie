"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ROLE_PERMISSIONS = exports.AppPermission = void 0;
const enums_1 = require("../types/enums");
var AppPermission;
(function (AppPermission) {
    AppPermission["DASHBOARD_VIEW"] = "dashboard.view";
    AppPermission["PRODUCTS_VIEW"] = "products.view";
    AppPermission["PRODUCTS_CREATE"] = "products.create";
    AppPermission["PRODUCTS_EDIT"] = "products.edit";
    AppPermission["PRODUCTS_DELETE"] = "products.delete";
    AppPermission["PRODUCTS_IMPORT"] = "products.import";
    AppPermission["PRODUCTS_EXPORT"] = "products.export";
    AppPermission["PRODUCTS_MASS_PRICE_UPDATE"] = "products.mass_price_update";
    AppPermission["INVENTORY_VIEW"] = "inventory.view";
    AppPermission["INVENTORY_ADJUST"] = "inventory.adjust";
    AppPermission["INVENTORY_TRANSFER"] = "inventory.transfer";
    AppPermission["INVENTORY_COUNT"] = "inventory.count";
    AppPermission["POS_CREATE_SALE"] = "pos.create_sale";
    AppPermission["POS_VOID_SALE"] = "pos.void_sale";
    AppPermission["POS_RETURN"] = "pos.return";
    AppPermission["POS_APPLY_DISCOUNT"] = "pos.apply_discount";
    AppPermission["SALES_VIEW"] = "sales.view";
    AppPermission["INVOICES_VIEW"] = "invoices.view";
    AppPermission["INVOICES_CREATE"] = "invoices.create";
    AppPermission["INVOICES_VOID"] = "invoices.void";
    AppPermission["INVOICES_AFIP"] = "invoices.afip";
    AppPermission["CUSTOMERS_VIEW"] = "customers.view";
    AppPermission["CUSTOMERS_CREATE"] = "customers.create";
    AppPermission["CUSTOMERS_EDIT"] = "customers.edit";
    AppPermission["CUSTOMERS_PAYMENTS"] = "customers.payments";
    AppPermission["SUPPLIERS_VIEW"] = "suppliers.view";
    AppPermission["SUPPLIERS_CREATE"] = "suppliers.create";
    AppPermission["SUPPLIERS_EDIT"] = "suppliers.edit";
    AppPermission["SUPPLIERS_PAYMENTS"] = "suppliers.payments";
    AppPermission["PURCHASES_VIEW"] = "purchases.view";
    AppPermission["PURCHASES_CREATE"] = "purchases.create";
    AppPermission["CASH_OPEN"] = "cash.open";
    AppPermission["CASH_CLOSE"] = "cash.close";
    AppPermission["CASH_MOVEMENT"] = "cash.movement";
    AppPermission["CASH_VIEW_ALL"] = "cash.view_all";
    AppPermission["REPORTS_SALES"] = "reports.sales";
    AppPermission["REPORTS_INVENTORY"] = "reports.inventory";
    AppPermission["REPORTS_FINANCIAL"] = "reports.financial";
    AppPermission["REPORTS_FISCAL"] = "reports.fiscal";
    AppPermission["USERS_VIEW"] = "users.view";
    AppPermission["USERS_CREATE"] = "users.create";
    AppPermission["USERS_EDIT"] = "users.edit";
    AppPermission["USERS_PERMISSIONS"] = "users.permissions";
    AppPermission["SETTINGS_VIEW"] = "settings.view";
    AppPermission["SETTINGS_EDIT"] = "settings.edit";
    AppPermission["AUDIT_VIEW"] = "audit.view";
})(AppPermission || (exports.AppPermission = AppPermission = {}));
exports.DEFAULT_ROLE_PERMISSIONS = {
    [enums_1.UserRole.ADMIN]: Object.values(AppPermission),
    [enums_1.UserRole.ENCARGADO]: [
        AppPermission.DASHBOARD_VIEW,
        AppPermission.PRODUCTS_VIEW, AppPermission.PRODUCTS_CREATE, AppPermission.PRODUCTS_EDIT, AppPermission.PRODUCTS_MASS_PRICE_UPDATE,
        AppPermission.INVENTORY_VIEW, AppPermission.INVENTORY_ADJUST, AppPermission.INVENTORY_TRANSFER, AppPermission.INVENTORY_COUNT,
        AppPermission.POS_CREATE_SALE, AppPermission.POS_VOID_SALE, AppPermission.POS_RETURN, AppPermission.POS_APPLY_DISCOUNT,
        AppPermission.SALES_VIEW,
        AppPermission.INVOICES_VIEW, AppPermission.INVOICES_CREATE, AppPermission.INVOICES_VOID, AppPermission.INVOICES_AFIP,
        AppPermission.CUSTOMERS_VIEW, AppPermission.CUSTOMERS_CREATE, AppPermission.CUSTOMERS_EDIT, AppPermission.CUSTOMERS_PAYMENTS,
        AppPermission.SUPPLIERS_VIEW, AppPermission.SUPPLIERS_CREATE, AppPermission.SUPPLIERS_EDIT, AppPermission.SUPPLIERS_PAYMENTS,
        AppPermission.PURCHASES_VIEW, AppPermission.PURCHASES_CREATE,
        AppPermission.CASH_OPEN, AppPermission.CASH_CLOSE, AppPermission.CASH_MOVEMENT, AppPermission.CASH_VIEW_ALL,
        AppPermission.REPORTS_SALES, AppPermission.REPORTS_INVENTORY, AppPermission.REPORTS_FINANCIAL
    ],
    [enums_1.UserRole.VENDEDOR]: [
        AppPermission.DASHBOARD_VIEW,
        AppPermission.PRODUCTS_VIEW,
        AppPermission.INVENTORY_VIEW,
        AppPermission.POS_CREATE_SALE, AppPermission.POS_RETURN,
        AppPermission.SALES_VIEW,
        AppPermission.INVOICES_VIEW, AppPermission.INVOICES_CREATE,
        AppPermission.CUSTOMERS_VIEW, AppPermission.CUSTOMERS_CREATE, AppPermission.CUSTOMERS_PAYMENTS,
        AppPermission.CASH_OPEN, AppPermission.CASH_CLOSE, AppPermission.CASH_MOVEMENT
    ],
    [enums_1.UserRole.DEPOSITO]: [
        AppPermission.PRODUCTS_VIEW,
        AppPermission.INVENTORY_VIEW, AppPermission.INVENTORY_ADJUST, AppPermission.INVENTORY_TRANSFER, AppPermission.INVENTORY_COUNT,
        AppPermission.PURCHASES_VIEW
    ]
};
