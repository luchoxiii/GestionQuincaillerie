# 📋 Informe Técnico Exhaustivo de Auditoría, Diagnóstico y Reparación Integral

> 🌐 **Languages / Idiomas / Langues:** [🇪🇸 Español](./AUDIT_REPORT.md) • [🇺🇸 English](./AUDIT_REPORT.en.md) • [🇧🇷 Português](./AUDIT_REPORT.pt.md) • [🇫🇷 Français](./AUDIT_REPORT.fr.md)  
> 📖 **General Documentation / Documentación General:** [🇪🇸 Español (README.md)](./README.md) • [🇺🇸 English (README.en.md)](./README.en.md) • [🇧🇷 Português (README.pt.md)](./README.pt.md) • [🇫🇷 Français (README.fr.md)](./README.fr.md)

---

**Proyecto:** `GestionQuincaillerie` (Ferretería & Corralón ERP + POS)  
**Directorio:** `D:\TPs Univerty\GestionQuincaillerie-main`  
**Arquitectura:** Monorepo `pnpm` (`@ferreteria/shared`, `@ferreteria/api`, `@ferreteria/web`)  
**Alcance:** Inspección línea por línea de los **285 archivos** del repositorio (16 módulos de backend NestJS/Prisma, 23 servicios frontend, 4 stores Zustand, 32 páginas/modales React, componentes UI/accesibilidad, esquemas Zod, motor criptográfico SHA-256 y scripts).

---

## 1. Resumen Ejecutivo

Se llevó a cabo una **auditoría técnica profunda en tres frentes paralelos** (Backend/Prisma/Shared, Servicios/Stores/Hooks Frontend y Páginas/Modales/Componentes React), identificando y solucionando desde su origen **más de 65 errores reales de programación, lógica comercial y fiscal, colisiones de eventos/teclado, fugas de memoria/timers, corrupción de datos y vulnerabilidades de seguridad**.

| Indicador de Calidad | Antes de la Auditoría | Después de las Reparaciones |
| :--- | :---: | :---: |
| **Bundle Inicial Frontend (`index.js`)** | `2,128.76 kB` (monolítico, sin code-splitting) | **`307.45 kB`** (`-85.6%`, carga diferida + chunks) |
| **Artefactos Residuales en `apps/web/`** | `vite.config.js`, `.d.ts`, `.tsbuildinfo`, `.csv` | **0 archivos residuales** (`node_modules/.tmp`) |
| **Build Producción Backend (`dist/main.js`)** | Roto (`dist/src/main.js` por incluir `prisma/seed.ts`) | **`dist/main.js` funcional** (`include: ["src/**/*"]`) |
| **Controladores API con RBAC (`@RequirePermissions`)** | 4 de 15 (11 controladores desprotegidos) | **15 de 15 controladores protegidos (100%)** |
| **Verificación de Tipos (`pnpm -r run lint`)** | Advertencias y desajustes de esquemas | **0 errores TypeScript en los 3 paquetes** |
| **Suite Frontend (`Vitest`)** | 20 suites / 138 tests | **20 suites / 138 tests (100% aprobados)** |
| **Suite Backend (`Jest`)** | 8 suites / 49 tests | **8 suites / 49 tests (100% aprobados)** |

---

## 2. Catálogo Completo de Errores Detectados y Soluciones de Raíz Aplicadas

### A. Terminal POS, Colisiones de Teclado, Escáner Láser y Facturación en Mostrador

1. **Vaciado Accidental del Carrito al Cerrar Modales con `Escape`**
   * **Archivos:** [PosPage.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/pages/pos/PosPage.tsx)
   * **Causa raíz:** El listener global `window.addEventListener('keydown', ...)` en `PosPage.tsx` ejecutaba `clearCart()` al presionar `Escape` sin verificar si `CheckoutModal`, `PriceCheckModal`, `TicketReceiptModal`, `AccessibilityModal` o cualquier diálogo Radix (`[role="dialog"]`) estaba abierto. Cerrar un modal con `Escape` destruía toda la venta en curso.
   * **Solución aplicada:** Se blindó el listener de `PosPage.tsx` para ignorar `Escape`, `F2`, `F4` y disparos del escáner cuando cualquier modal/diálogo está activo o cuando el foco se encuentra en un elemento editable.

2. **Colisión y Duplicación del Modal Consultor de Precios (`F3`)**
   * **Archivos:** [DashboardLayout.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/components/layout/DashboardLayout.tsx), [PosPage.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/pages/pos/PosPage.tsx)
   * **Causa raíz:** Tanto `DashboardLayout` como `PosPage` montaban su propia instancia de `<PriceCheckModal>` y escuchaban la tecla `F3` en `window`. En `/pos`, presionar `F3` abría **dos modales superpuestos** simultáneamente.
   * **Solución aplicada:** Se unificó `<PriceCheckModal>` en `DashboardLayout.tsx` como única instancia global y el botón `F3` del POS dispara el evento hacia dicho controlador único.

3. **Cálculo de Vuelto (`change`) Siempre en `$0` y Bloqueo del Selector de Medio de Pago**
   * **Archivos:** [CheckoutModal.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/pages/pos/CheckoutModal.tsx)
   * **Causa raíz:**
     1. `handleAddPayment` recortaba `actualAmount = amount > remaining ? remaining : amount` y enseguida reseteaba `setTendered('')`. Como `change` se calculaba como `Number(tendered) - remaining`, al limpiar `tendered` el vuelto pasaba instantáneamente a `$0`, ocultando el cartel de `"Vuelto a entregar"` y anunciando `$0` por síntesis de voz.
     2. El componente `<Select>` de medios de pago no era controlado (`value` omitido). Tras seleccionar `"Efectivo"` y cambiar entre Blanco/Negro (que vaciaba `payments`), Radix retenía `"pm-1"` internamente y no volvía a disparar `onValueChange` al hacer clic en `"Efectivo"`.
     3. `createInvoice.mutateAsync` se invocaba sin pasar el arreglo `items`, generando facturas con detalle vacío (`items: []`) en `/facturacion`.
     4. Permitía cobrar con `"Cuenta Corriente"` (`pm-5`) a `"Consumidor Final"` o excediendo el `creditLimit` del cliente.
   * **Solución aplicada:**
     * Se incorporó el estado `lastChange` para acumular y preservar el vuelto real entregado en pagos en efectivo, junto con botones de selección rápida, selector controlado `selectedMethodId`, botón explícito `"Agregar Pago"` y botón para eliminar líneas de pago individuales.
     * Se validó que los pagos en Cuenta Corriente (`pm-5`) exijan un cliente asignado y respeten su límite de crédito disponible.
     * Se enviaron todos los renglones (`items`), `netAmount`, `taxAmount` y `taxRate` al emitir el comprobante en `createInvoice.mutateAsync`.

4. **Fallo de Escaneo de Códigos de Barras EAN-13, Buffer Obsoleto y Stock Ficticio (`Stock: 10`)**
   * **Archivos:** [useBarcodeScanner.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/hooks/useBarcodeScanner.ts), [PosPage.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/pages/pos/PosPage.tsx), [PriceCheckModal.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/components/common/PriceCheckModal.tsx)
   * **Causa raíz:**
     1. En `useBarcodeScanner.ts`, la condición `if (e.key === 'Enter' && window.barcodeBuffer)` se ejecutaba **antes** de verificar si habían transcurrido más de `50ms` desde la última tecla (`now - window.lastKeyTime > 50`). Si el operador presionaba una letra suelta y minutos después presionaba `Enter`, se disparaba un escaneo falso de 1 carácter.
     2. `PosPage.tsx` solo comparaba `(p.code || p.sku) === barcode` sobre la lista filtrada por categoría, ignorando el arreglo `p.barcodes` (EAN-13).
     3. En la grilla del POS, `<Badge>Stock: {product.stock || 10}</Badge>` evaluaba `0` como falsy y mostraba `Stock: 10` para artículos agotados, permitiendo venderlos sin stock.
     4. La alícuota de IVA leía `product.taxRate ?? 21` ignorando `product.taxes?.[0]?.tax?.rate` (donde se almacenan tasas del `10.5%`, `27%` o `0%`).
   * **Solución aplicada:**
     * En `useBarcodeScanner.ts` se verifica la caducidad temporal antes de procesar `Enter`, se exige longitud mínima de código (`>= 3` caracteres) y se ignoran elementos `HTMLSelectElement` e `isContentEditable`.
     * En `PosPage.tsx` se busca sobre el catálogo completo incluyendo `p.barcodes`, se muestra el stock real `Number(product.stock ?? product.totalStock ?? 0)`, se bloquea la adición de productos sin stock y se extrae la tasa de IVA real desde `product.taxRate ?? product.taxes?.[0]?.tax?.rate ?? 21`.

5. **Distorsión de Cupones de Monto Fijo (`FIXED`), Tope `maxDiscountAmount` y Precio Congelado de Presupuestos en `pos.store.ts`**
   * **Archivos:** [pos.store.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/stores/pos.store.ts)
   * **Causa raíz:**
     1. Al aplicar un cupón `FIXED` (ej. `$5.000`), `applyCoupon` lo convertía en un porcentaje redondeado (`discountPct`). Si luego se agregaban productos o se cambiaban cantidades en el carrito, el cupón fijo se comportaba como un descuento porcentual permanente que escalaba sin límite.
     2. Los cupones `PERCENTAGE` ignoraban el tope `maxDiscountAmount`.
     3. `addItem` y `updateQuantity` multiplicaban `item.product.price * quantity` en lugar de `item.unitPrice * quantity`, sobrescribiendo los precios congelados de presupuestos cargados al carrito.
   * **Solución aplicada:** Se implementó la función centralizada `recalculateCart` en `pos.store.ts` que preserva `item.unitPrice`, elimina renglones cuando `qty <= 0`, redistribuye proporcionalmente el monto exacto en cupones `FIXED` ante cualquier cambio del carrito y respeta `maxDiscountAmount` en cupones porcentuales.

6. **Ticket Térmico con Datos Estáticos Hardcodeados**
   * **Archivos:** [TicketReceiptModal.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/pages/pos/TicketReceiptModal.tsx)
   * **Causa raíz:** Renderizaba `"FERRETERÍA EL CLAVO"`, `"Cliente: Consumidor Final"` y el texto `"Ver detalle en sistema..."` en lugar de los renglones vendidos.
   * **Solución aplicada:** Se conectó con la configuración fiscal de la empresa (`useCompanySettings`), el nombre real del comprador y el desglose completo de artículos (`sale.items`), subtotales, descuentos e impuestos.

---

### B. Servicios Offline-First, Sincronización Cruzada (`localStorage`), Caja, Inventario y Excel

7. **Doble Contabilización del Fondo Inicial en el Saldo Teórico de Caja (`2x Opening Balance`)**
   * **Archivos:** [cash.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/cash.service.ts), [CashRegisterPage.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/pages/cash/CashRegisterPage.tsx)
   * **Causa raíz:** `useOpenCashSession` guardaba `session.openingBalance = 10000` y además insertaba un movimiento `{ type: 'IN', amount: 10000, description: 'Apertura de caja (Fondo inicial)' }`. Luego `CashRegisterPage.tsx` sumaba todos los movimientos `'IN'` a `session.openingBalance`, duplicando el saldo teórico desde el primer segundo.
   * **Solución aplicada:** Se eliminó la inserción del movimiento `'IN'` redundante al abrir la sesión en `cash.service.ts` y se excluyeron movimientos de apertura en el cálculo de `ingresos` de `CashRegisterPage.tsx`.

8. **Desalineación Crítica de Claves en `backup.service.ts` y `purchases.service.ts`**
   * **Archivos:** [backup.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/backup.service.ts), [purchases.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/purchases.service.ts)
   * **Causa raíz:**
     1. `backup.service.ts` leía y restauraba claves inexistentes: `'ferreteria_company_settings'` (en vez de `'ferreteria_local_settings'`), `'ferreteria_local_coupons'` (en vez de `'ferreteria_marketing_coupons'`), `'ferreteria_custom_users'` (en vez de `'ferreteria_local_users'`) y `'ferreteria_custom_roles'` (en vez de `'ferreteria_local_roles'`), además de omitir `stores`, `invoices`, `stock` y `stockMovements`.
     2. `purchases.service.ts` buscaba sesiones abiertas en `'ferreteria_local_cash_sessions'` (plural, como array) y guardaba egresos en `'ferreteria_local_cash_movements_' + id`, por lo que las compras pagadas en efectivo jamás descontaban dinero de la caja activa (`'ferreteria_local_cash_session'` / `'ferreteria_local_cash_movements'`).
   * **Solución aplicada:** Se alinearon todas las claves de `backup.service.ts` (manteniendo compatibilidad retroactiva al restaurar backups antiguos y agregando `stores`, `invoices`, `stock` y `stockMovements`) y se conectó `purchases.service.ts` con las claves reales del servicio de caja y la bitácora de auditoría.

9. **Transferencias entre Depósitos sin Efecto en Stock y Ajustes Monodepósito**
   * **Archivos:** [inventory.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/inventory.service.ts), [InventoryPage.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/pages/inventory/InventoryPage.tsx), [StockAdjustModal.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/pages/inventory/StockAdjustModal.tsx)
   * **Causa raíz:**
     1. `useCreateTransfer` en `inventory.service.ts` registraba el movimiento en el Kardex y en la bitácora, pero **nunca modificaba las cantidades en `ferreteria_local_stock` ni llamaba a `saveLocalStock()`**.
     2. `useAdjustStock` buscaba el ítem solo por `productId` ignorando `warehouseId`, sobrescribía `totalStock` global cuando `type === 'ADJUST'` y guardaba el movimiento como `'IN'` en vez de `'ADJUST'`.
     3. `StockAdjustModal.tsx` rechazaba `qty === 0`, impidiendo ajustar a cero un stock agotado, y la pestaña `"Transferencias"` en `InventoryPage.tsx` era un texto estático.
   * **Solución aplicada:** `useCreateTransfer` ahora descuenta atómicamente del depósito origen e incrementa/crea el registro en el depósito destino en `ferreteria_local_stock`; `useAdjustStock` filtra por `productId + warehouseId` y recalcula el diferencial real; `StockAdjustModal` permite ajuste exacto a `0` y preselecciona el producto/depósito de la fila; e `InventoryPage.tsx` renderiza la tabla real de transferencias.

10. **Impacto Erróneo en Caja para Ventas con Tarjeta/Cuenta Corriente y Desajuste `VOIDED` vs `CANCELLED`**
    * **Archivos:** [sales.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/sales.service.ts), [SalesPage.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/pages/sales/SalesPage.tsx), [DashboardPage.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/pages/DashboardPage.tsx), [reports.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/reports.service.ts)
    * **Causa raíz:**
      1. `useCreateSale` agregaba un movimiento `'IN'` en la caja de efectivo por el `payload.total` completo sin importar si la venta se había cobrado con Tarjeta, Transferencia, Cuenta Corriente o Mercado Libre, y no actualizaba el saldo deudor del cliente en ventas con Cuenta Corriente (`pm-5`) ni el stock por depósito (`ferreteria_local_stock`).
      2. `useVoidSale` marcaba la venta con `status = 'CANCELLED'` sin revertir stock, caja ni cuenta corriente, mientras que `SalesPage.tsx`, `DashboardPage.tsx` y `reports.service.ts` filtraban `status === 'VOIDED'`. Por ende, las ventas anuladas seguían sumando como ingresos válidos en los reportes y podían anularse infinitas veces.
    * **Solución aplicada:** `useCreateSale` ahora registra en caja únicamente la porción cobrada en efectivo (`pm-1`/`CASH`), incrementa la deuda del cliente en `pm-5` y descuenta de `ferreteria_local_stock` + Kardex. `useVoidSale` marca `status = 'VOIDED'` y revierte el stock del producto/depósito, el movimiento de caja y la deuda en cuenta corriente.

11. **Corrupción de Decimales (`10.5% -> 105`) y Contaminación de Columnas en Importador Excel/CSV**
    * **Archivos:** [excel-import.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/excel-import.service.ts)
    * **Causa raíz:**
      1. `parseNumber` aplicaba `.replace(/\./g, '').replace(',', '.')`, eliminando todos los puntos decimales en números estándar (`10.5` pasaba a `105` y se reseteaba a `21%` IVA; `125.50` pasaba a `12550`).
      2. `getColumnValue` usaba coincidencia parcial codiciosa (`kNorm.includes(c)`): si `"Precio Venta ($)"` venía vacío para autocalcularse por margen, el candidato `'precio'` hacía match con `"Precio Costo ($)"`, fijando el precio de venta igual al costo (0% ganancia).
      3. `downloadProductTemplate` y `downloadCustomerTemplate` llamaban a `XLSX.writeFile`, lo cual en entorno Node/Vitest escribía archivos `.csv` directamente en la raíz de `apps/web/`.
    * **Solución aplicada:** Se implementó detección inteligente de formato numérico (distinguiendo separadores de miles de puntos decimales), se bloqueó la contaminación cruzada de subcadenas en `getColumnValue` y se utilizó descarga mediante `Blob` en navegador.

12. **Truncamiento de Archivos CSV por Carácter `#`, Inflación de Reportes y Doble Entrecomillado en Dataset ML**
    * **Archivos:** [quotes.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/quotes.service.ts), [customer-analytics.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/customer-analytics.service.ts), [reports.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/reports.service.ts), [invoicing.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/invoicing.service.ts)
    * **Causa raíz:**
      1. `exportQuotesCsv` usaba `encodeURI('data:text/csv...')`, que no escapa el carácter `#` (presente en notas como `"ticket #9823"`), truncando el archivo CSV descargado.
      2. `customer-analytics.service.ts` incluía ventas anuladas en el cálculo de RFM/LTV, tenía un error de precedencia booleana en el segmento `BIG_BUILDER` (clasificando clientes vetados o sin compras como Grandes Obras) y envolvía campos en comillas dobles manuales antes de llamar a `exportToCsv` (generando triples comillas `"""..."""`).
      3. `reports.service.ts` sumaba un `+ (baselineRevenue * 0.3)` ficticio encima de las ventas reales cuando `totalRevenue > 0`.
      4. `invoicing.service.ts` evaluaba `Number(inv.taxAmount) || (Number(inv.total) * 0.1735)`, fabricando un 21% de IVA sobre facturas exentas (`taxAmount === 0`), y emitía Notas de Crédito con `letter: orig.letter` en vez de `'NC'` sin anular la factura original.
    * **Solución aplicada:** Todos estos servicios fueron corregidos de raíz: descarga CSV por `Blob`, exclusión de ventas anuladas en RFM, corrección de precedencia booleana y comillas en `customer-analytics.service.ts`, métricas reales sin inflación artificial en `reports.service.ts`, y manejo exacto de exentos y Notas de Crédito (`letter: 'NC'`, `orig.status = 'ANULADO'`) en `invoicing.service.ts`.

---

### C. Autenticación, Control de Acceso, Audio/Accesibilidad y Componentes UI

13. **Bypass de Contraseña y Estado Activo en Login Local, Guardas de Ruta y Reactividad de Sucursal Activa**
    * **Archivos:** [LoginPage.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/pages/LoginPage.tsx), [users.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/users.service.ts), [App.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/App.tsx), [Sidebar.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/components/layout/Sidebar.tsx), [UserModal.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/pages/users/UserModal.tsx), [UserBitacoraModal.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/components/users/UserBitacoraModal.tsx), [stores.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/stores.service.ts)
    * **Solución aplicada:**
      * `LoginPage.tsx` ahora inicializa y consulta `getLocalUsers()`, rechaza cuentas desactivadas (`isActive === false`), valida la contraseña del usuario, preserva `username` y mapea correctamente la respuesta del backend (`accessToken`, `firstName/lastName`, `permissions`).
      * Se agregó un `ErrorBoundary` global en `App.tsx`, control de permisos por ruta en `ProtectedRoute` y filtrado por permisos en `Sidebar.tsx`.
      * Se habilitó la revocación individual de permisos de rol (`deniedPermissions`) en `UserModal.tsx` y la correlación por `id`, `username` y nombre completo en `UserBitacoraModal.tsx`.
      * Se hizo reactivo `useActiveStore()` en `stores.service.ts` mediante eventos de sincronización para que `Header.tsx` y `StoresSettingsTab.tsx` actualicen la sucursal activa al instante.

14. **Fugas de Nodos en Web Audio API, Desincronización de `isMuted`, Favicon Roto y Estilos de Impresión**
    * **Archivos:** [a11y-audio.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/a11y-audio.service.ts), [accessibility.store.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/stores/accessibility.store.ts), [index.html](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/index.html), [index.css](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/index.css)
    * **Solución aplicada:**
      * En `a11y-audio.service.ts` se verificó `if (this.isMuted)` dentro de `speak()`, se desconectaron `OscillatorNode` y `GainNode` en `osc.onended`, se limpiaron los timers activos al silenciar/cancelar y se cerró el `AudioContext` en `resetContext()`.
      * En `accessibility.store.ts` se sincronizó `a11yAudio.setMuted(!soundFeedback)` al iniciar, cambiar o resetear preferencias.
      * En `index.html` se reemplazó el favicon inexistente `/vite.svg` por un SVG inline y se cargó la fuente `'Atkinson Hyperlegible'` para el modo dislexia.
      * En `index.css` se agregaron reglas `@media print` para ocultar fondos y barras de navegación al imprimir comprobantes, etiquetas, facturas y presupuestos.

---

### D. Backend NestJS, Prisma ORM, Criptografía SHA-256 y Paquete Compartido (`@ferreteria/api` & `@ferreteria/shared`)

15. **Rollback Forzado en `SalesService.createSale` y `voidSale` por Consulta Fuera de Transacción (`tx`)**
    * **Archivos:** [sales.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/sales/sales.service.ts), [sales.dto.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/sales/dto/sales.dto.ts)
    * **Causa raíz:** Dentro de `this.prisma.$transaction(async (tx) => { ... })`, tanto `createSale` como `voidSale` finalizaban llamando a `return this.getSale(sale.id)`, el cual ejecutaba `this.prisma.sale.findUnique` fuera de `tx`. En PostgreSQL (`READ COMMITTED`), el registro aún no confirmado en `tx` era invisible para `this.prisma`, lanzando `NotFoundException('Venta no encontrada')` y revirtiendo toda la venta. Además, `createSale` fijaba `taxRate = 0` y `taxAmount = 0`, y `voidSale` no revertía el saldo de cuenta corriente del cliente.
    * **Solución aplicada:** `getSale(id, prismaClient = this.prisma)` ahora recibe el cliente transaccional `tx`; `createSale` calcula las alícuotas de IVA reales del producto o DTO y vincula `referenceId: sale.id` en `StockMovement`; y `voidSale` devuelve el stock al depósito original y revierte el saldo en cuenta corriente del cliente.

16. **Sombreado de Ruta `GET /api/products/export`, Transaccionalidad en `ProductsService.update` y `massPriceUpdate`**
    * **Archivos:** [products.controller.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/products/products.controller.ts), [products.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/products/products.service.ts)
    * **Causa raíz:** `@Get(':id')` estaba declarado antes de `@Get('export')`, capturando `/api/products/export` como `id = "export"` (404). En `ProductsService.update`, `userId` no se extraía de `updateData` (causando error en Prisma) y el borrado/recreación de códigos de barra e impuestos se ejecutaba sin transacción. En `massPriceUpdate`, enviar `percentage` en lugar de `percentageChange` producía `NaN`.
    * **Solución aplicada:** Se reordenó `@Get('export')` antes de `@Get(':id')`, se extrajo `userId` envolviendo `update()` en `$transaction`, y se soportó `percentageChange ?? percentage` en `massPriceUpdate`.

17. **Tipos de Nota de Crédito (`003`, `008`, `013`) en `seed.ts`, `NULLS FIRST` en Numeración AFIP y Reporte Libro IVA Ventas**
    * **Archivos:** [seed.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/prisma/seed.ts), [afip.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/invoicing/afip.service.ts), [invoicing.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/invoicing/invoicing.service.ts), [reports.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/reports/reports.service.ts)
    * **Causa raíz:** `seed.ts` no incluía los códigos AFIP `003`, `008` y `013`, haciendo fallar siempre `createCreditNote`. En `AfipService`, `ORDER BY number DESC` sobre la columna anulable `number` colocaba `NULL` primero en PostgreSQL (`NULLS FIRST`), reiniciando la numeración a `1` y chocando con la restricción única. En `ReportsService.getIvaVentas`, se incluían facturas `VOIDED` y se sumaban las Notas de Crédito en vez de restarlas.
    * **Solución aplicada:** Se sembraron los tipos `003`, `008` y `013` en `seed.ts`; se filtró `number: { not: null }` en `AfipService`; se excluyeron facturas anuladas y se restaron las Notas de Crédito (incluyendo alícuota del 27%) en `InvoicingService` y `ReportsService`; y se eliminó la consulta N+1 en `getTopProducts`.

18. **Criptografía SHA-256 (`packages/shared/src/utils/crypto.ts`)**
    * **Archivos:** [crypto.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/packages/shared/src/utils/crypto.ts)
    * **Causa raíz:** `JSON.stringify(data.details, Object.keys(data.details).sort())` utilizaba un array como segundo argumento (`replacer`), lo cual en el estándar ECMAScript actúa como lista blanca global en todos los niveles y descarta cualquier propiedad de objetos hijos cuya clave no exista en la raíz. Además, `sha256` operaba sobre code units UTF-16 sin codificar previamente a bytes UTF-8.
    * **Solución aplicada:** Se implementó codificación UTF-8 previa en `sha256` y serialización canónica recursiva (`canonicalizeValue`) en `computeAuditLogHash`.

19. **Blindaje RBAC de los 15 Controladores, Seguridad JWT, Filtro Prisma y Limpieza de Handles en Telemetría**
    * **Archivos:** [permissions.guard.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/common/guards/permissions.guard.ts), [audit.interceptor.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/common/interceptors/audit.interceptor.ts), [http-exception.filter.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/common/filters/http-exception.filter.ts), [auth.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/auth/auth.service.ts), [jwt.strategy.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/auth/strategies/jwt.strategy.ts), [backend-telemetry.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/telemetry/backend-telemetry.service.ts) y los 15 controladores en `apps/api/src/modules/**`.
    * **Solución aplicada:**
      * Se añadieron `@UseGuards(JwtAuthGuard, PermissionsGuard)` y `@RequirePermissions(...)` en la totalidad de los controladores del backend, normalizando separadores `.` y `:` y soportando comodines en `PermissionsGuard`.
      * Se registró `RolesController` en `UsersModule` y se omitió el hash `password` en las respuestas de usuario.
      * Se verificó `user.isActive !== false` y el tipo de token (`type: 'access' | 'refresh'`) en `AuthService` y `JwtStrategy`.
      * Se mapearon los códigos de error de Prisma (`P2002` -> 409, `P2025` -> 404, `P2003` -> 400) en `HttpExceptionFilter`.
      * Se eliminaron las credenciales de Telegram hardcodeadas en el código fuente, se amplió el filtro anti-SSRF para bloquear redes privadas/loopback y se aplicó `.unref()` + limpieza en `onModuleDestroy()` sobre los timers de `BackendTelemetryService`.

---

## 3. Auditoría de Seguridad OWASP Top 10 y Remediaciones de Raíz

Se realizó un escaneo exhaustivo y análisis estático/dinámico de vulnerabilidades sobre la arquitectura del sistema, alineado al estándar **OWASP Top 10 (2021)** y **OWASP API Security Top 10 (2023)**. Todas las brechas detectadas fueron reparadas directamente en el código fuente:

| Categoría OWASP | Vulnerabilidad / Debilidad Detectada | CWE Asociado | Archivo(s) Afectado(s) | Remediación Aplicada | Estado |
|---|---|---|---|---|---|
| **A03: Injection** | **CSV Formula Injection / DDE Macro Execution**: Celdas con nombres de producto, clientes o notas iniciando con `=`, `+`, `-`, `@`, `\t`, `\r` se ejecutaban como fórmulas/código en Excel/Calc. | CWE-1236 | [utils.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/lib/utils.ts), [quotes.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/quotes.service.ts) | Se introdujo `sanitizeCsvCell()` que detecta disparadores de fórmula y antepone una comilla simple (`'`), desactivando la ejecución de fórmulas en hojas de cálculo. | **Corregido & Testeado** |
| **A03: Injection** | **Cross-Site Scripting (XSS) / Template Injection en Comprobantes de Correo**: Nombres de clientes, artículos o razones sociales se concatenaban en texto plano en la plantilla HTML del correo. | CWE-79 | [email-notification.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/email-notification.service.ts) | Implementación de `escapeHtml()` para codificar rigurosamente entidades HTML (`&`, `<`, `>`, `"`, `'`) en todos los valores inyectados al HTML del comprobante y pruebas SMTP. | **Corregido & Testeado** |
| **A01: Broken Access Control** | **Insecure Direct Object Reference (IDOR) en Cajas**: Cualquier usuario autenticado podía forzar el cierre de sesión (`closeSession`) o inyectar movimientos de efectivo (`createMovement`) en sesiones ajenas. | CWE-639 / CWE-284 | [cash-register.controller.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/cash-register/cash-register.controller.ts), [cash-register.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/cash-register/cash-register.service.ts) | Se vinculó el usuario autenticado (`req.user.id`) en el servicio de caja y se validó pertenencia de sesión estricta (`session.userId === userId`), salvo roles con permiso `cash.view_all`. | **Corregido & Testeado** |
| **A01: Broken Access Control** | **Suplantación de Identidad y Manipulación de Auditoría en Inventario y Compras**: Envíos de `userId` en el payload HTTP sobrescribían el ID del usuario en el token JWT (`data.userId || user?.id`). | CWE-287 / CWE-306 | [inventory.controller.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/inventory/inventory.controller.ts), [purchases.controller.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/purchases/purchases.controller.ts) | Se forzó la prioridad absoluta del token criptográfico (`user?.id || data.userId`), impidiendo que un operador atribuya ajustes o compras a terceros. | **Corregido & Testeado** |
| **A01: Broken Access Control / API3** | **Mass Assignment & Falta de DTOs en Usuarios**: Endpoints de creación y actualización de usuarios aceptaban `data: any`, eludiendo el `ValidationPipe` estricto. | CWE-915 | [users.controller.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/users/users.controller.ts), [create-user.dto.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/users/dto/create-user.dto.ts), [update-user.dto.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/users/dto/update-user.dto.ts) | Creación de DTOs tipados con `@IsEmail()`, `@MinLength()`, `@MaxLength()`, `@IsArray()` y validación automática de rechazo de campos no autorizados (`forbidNonWhitelisted: true`). | **Corregido & Testeado** |
| **A07: Identification Failures** | **Políticas de Contraseña Débiles y Riesgo de Bcrypt DoS**: Longitud mínima de 6 caracteres sin longitud máxima permitía contraseñas triviales o payloads masivos para saturar CPU. | CWE-521 / CWE-400 | [login.dto.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/auth/dto/login.dto.ts), [auth.schema.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/packages/shared/src/schemas/auth.schema.ts) | Se aumentó la longitud mínima de nueva contraseña a 8 caracteres y se fijó un límite máximo de 128 caracteres para evitar agotamiento de recursos criptográficos. | **Corregido & Testeado** |
| **A05: Security Misconfiguration** | **Fuga de Información en Manejo de Errores Globales**: `HttpExceptionFilter` devolvía `exception.message` en crudo al cliente para excepciones `Error` no controladas. | CWE-209 | [http-exception.filter.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/common/filters/http-exception.filter.ts) | Redacción de mensajes en entorno de producción (`NODE_ENV === 'production'`) a un mensaje neutro, registrando trazas y excepciones exclusivamente en el logger del servidor. | **Corregido & Testeado** |
| **A05: Security Misconfiguration** | **Manejo Incorrecto de Rechazo CORS**: En Fastify CORS, arrojar `new Error()` en el callback de origen causaba excepciones 500 no capturadas. | CWE-942 | [main.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/main.ts) | Se corrigió el rechazo de orígenes no permitidos a `callback(null, false)`, denegando solicitudes no autorizadas sin provocar errores no controlados. | **Corregido & Testeado** |
| **A06: Vulnerable Components** | **Vulnerabilidad Crítica de Spoofing en proxy-addr**: Paquete `proxy-addr < 2.0.8` vulnerable a suplantación de IP en subredes IPv4-mapped IPv6. | GHSA-jqcg-44mw-7w3h | [pnpm-workspace.yaml](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/pnpm-workspace.yaml) | Se forzó la versión `>=2.0.8` de `proxy-addr` y `>=4.2.3` de `fast-uri` vía `overrides` de pnpm. El escaneo de producción `pnpm audit --prod` ahora reporta **0 vulnerabilidades críticas**. | **Corregido & Testeado** |
| **A10: SSRF** | **Endurecimiento de URLs en Telemetría y Webhooks**: Riesgo de exploración de puertos internos y bypass de IPs decimales/hexadecimales o DNS rebinding. | CWE-918 | [backend-telemetry.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/telemetry/backend-telemetry.service.ts) | Se amplió `isValidSafeUrl()` para bloquear puertos no estándar (restringido a 80 y 443), credenciales incrustadas (`user:pass`), notaciones numéricas/hex e interfaces `.nip.io`/`.sslip.io`. | **Corregido & Testeado** |

---

## 4. Puntos que Requieren Atención en Despliegue Productivo

1. **Variables de Entorno de Producción ([.env](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/.env)):**
   * Antes de exponer el backend en internet, reemplazar `JWT_SECRET` por una clave aleatoria criptográficamente segura (mínimo 256 bits) y configurar los certificados digitales reales de AFIP (`AFIP_ENV=production`, `AFIP_CUIT`, `AFIP_CERT_PATH`, `AFIP_KEY_PATH`).
2. **Base de Datos Relacional (Modo Full-Stack):**
   * En modo local autónomo (*Offline-First*), el frontend ya opera al 100% sin requerir servicios externos. Para operar con persistencia en PostgreSQL 16 y Redis 7, levantar los contenedores con `docker compose up -d` y ejecutar `pnpm db:migrate` y `pnpm db:seed` (que ahora incluye también los tipos de comprobante de Notas de Crédito AFIP `003`, `008` y `013`).
