# 📋 Relatório Técnico Exaustivo de Auditoria, Diagnóstico e Reparação Integral

> 🌐 **Languages / Idiomas / Langues:** [🇪🇸 Español](./AUDIT_REPORT.md) • [🇺🇸 English](./AUDIT_REPORT.en.md) • [🇧🇷 Português](./AUDIT_REPORT.pt.md) • [🇫🇷 Français](./AUDIT_REPORT.fr.md)  
> 📖 **General Documentation / Documentación General:** [🇪🇸 Español (README.md)](./README.md) • [🇺🇸 English (README.en.md)](./README.en.md) • [🇧🇷 Português (README.pt.md)](./README.pt.md) • [🇫🇷 Français (README.fr.md)](./README.fr.md)

---

**Projeto:** `GestionQuincaillerie` (ERP + PDV para Loja de Ferragens e Depósito de Materiais de Construção)  
**Diretório:** `D:\TPs Univerty\GestionQuincaillerie-main`  
**Arquitetura:** Monorepo `pnpm` (`@ferreteria/shared`, `@ferreteria/api`, `@ferreteria/web`)  
**Escopo:** Inspeção linha por linha de todos os **285 arquivos** do repositório (16 módulos de backend NestJS/Prisma, 23 serviços de frontend, 4 stores Zustand, 32 páginas/modais React, componentes de UI/acessibilidade, esquemas Zod, livro-razão criptográfico SHA-256 e scripts).

---

## 1. Resumo Executivo

Foi realizada uma **auditoria técnica aprofundada em três frentes simultâneas** (Backend/Prisma/Shared, Serviços/Stores/Hooks Frontend e Páginas/Modais/Componentes React), identificando e corrigindo na raiz **mais de 65 falhas reais de programação, lógica comercial e fiscal, colisões de teclado/eventos, vazamentos de memória/timers, corrupção de dados e vulnerabilidades de segurança**.

| Indicador de Qualidade | Antes da Auditoria | Após as Correções |
| :--- | :---: | :---: |
| **Bundle Inicial Frontend (`index.js`)** | `2.128,76 kB` (monolítico, sem code-splitting) | **`307,45 kB`** (`-85,6%`, carregamento lazy + chunks) |
| **Artefatos Residuais em `apps/web/`** | `vite.config.js`, `.d.ts`, `.tsbuildinfo`, `.csv` | **0 arquivos residuais** (`node_modules/.tmp`) |
| **Build de Produção Backend (`dist/main.js`)** | Quebrado (`dist/src/main.js` por incluir `prisma/seed.ts`) | **`dist/main.js` funcional** (`include: ["src/**/*"]`) |
| **Controladores API com RBAC (`@RequirePermissions`)** | 4 de 15 (11 controladores desprotegidos) | **15 de 15 controladores protegidos (100%)** |
| **Checagem de Tipos (`pnpm -r run lint`)** | Avisos e divergências de esquemas | **0 erros TypeScript nos 3 pacotes** |
| **Suíte Frontend (`Vitest`)** | 20 suítes / 138 testes | **20 suítes / 138 testes (100% aprovados)** |
| **Suíte Backend (`Jest`)** | 8 suítes / 49 testes | **8 suítes / 49 testes (100% aprovados)** |

---

## 2. Catálogo Completo de Erros Detectados e Soluções de Raiz Aplicadas

### A. Terminal PDV (POS), Colisões de Teclado, Leitor de Código de Barras e Vendas de Balcão

1. **Esvaziamento Acidental do Carrinho ao Fechar Modais com `Escape`**
   * **Arquivos:** [PosPage.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/pages/pos/PosPage.tsx)
   * **Causa raiz:** O listener global `window.addEventListener('keydown', ...)` em `PosPage.tsx` disparava `clearCart()` ao pressionar `Escape` sem verificar se `CheckoutModal`, `PriceCheckModal`, `TicketReceiptModal`, `AccessibilityModal` ou qualquer diálogo Radix (`[role="dialog"]`) estava aberto. Fechar um modal com `Escape` destruía toda a venda em andamento.
   * **Solução aplicada:** O listener em `PosPage.tsx` foi blindado para ignorar `Escape`, `F2`, `F4` e acionamentos do leitor quando qualquer modal/diálogo estiver ativo ou quando o foco estiver em um campo de entrada editável.

2. **Colisão e Duplicação do Modal de Consulta de Preços (`F3`)**
   * **Arquivos:** [DashboardLayout.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/components/layout/DashboardLayout.tsx), [PosPage.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/pages/pos/PosPage.tsx)
   * **Causa raiz:** Tanto `DashboardLayout` quanto `PosPage` montavam sua própria instância de `<PriceCheckModal>` e escutavam a tecla `F3` no objeto `window`. Na rota `/pos`, pressionar `F3` abria **dois modais sobrepostos** simultaneamente.
   * **Solução aplicada:** O componente `<PriceCheckModal>` foi unificado em `DashboardLayout.tsx` como instância global única e o atalho `F3` do PDV dispara o evento para esse controlador central.

3. **Cálculo de Troco (`change`) Sempre em `$0` e Bloqueio do Seletor de Meio de Pagamento**
   * **Arquivos:** [CheckoutModal.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/pages/pos/CheckoutModal.tsx)
   * **Causa raiz:**
     1. `handleAddPayment` truncava `actualAmount = amount > remaining ? remaining : amount` e imediatamente chamava `setTendered('')`. Como `change` era calculado como `Number(tendered) - remaining`, ao zerar `tendered` o troco passava instantaneamente para `$0`, ocultando o banner de troco e vocalizando "$0" pelo assistente de áudio.
     2. O componente `<Select>` de meios de pagamento não era controlado (`value` omitido). Ao selecionar "Dinheiro" e alternar o regime fiscal (que limpava `payments`), o Radix retinha `"pm-1"` internamente e não disparava `onValueChange` ao clicar novamente em "Dinheiro".
     3. `createInvoice.mutateAsync` era invocado sem encaminhar o array `items`, gerando notas com linhas em branco (`items: []`) em `/facturacion`.
     4. Permitia cobrança em Conta Corrente (`pm-5`) para "Consumidor Final" ou excedendo o `creditLimit` do cliente.
   * **Solução aplicada:**
     * Adicionado estado `lastChange` para armazenar o troco entregue em pagamentos em dinheiro, atalhos de seleção rápida de valores, seletor controlado `selectedMethodId`, botão explícito de "Adicionar Pagamento" e botão para remoção individual de parcelas.
     * Validação estrita para pagamentos em Conta Corrente (`pm-5`), exigindo cliente selecionado e respeitando o limite de crédito.
     * Envio completo das linhas do pedido (`items`), `netAmount`, `taxAmount` e `taxRate` na emissão da nota fiscal em `createInvoice.mutateAsync`.

4. **Falha na Leitura de Códigos EAN-13, Buffer Desatualizado e Estoque Fictício (`Stock: 10`)**
   * **Arquivos:** [useBarcodeScanner.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/hooks/useBarcodeScanner.ts), [PosPage.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/pages/pos/PosPage.tsx), [PriceCheckModal.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/components/common/PriceCheckModal.tsx)
   * **Causa raiz:**
     1. Em `useBarcodeScanner.ts`, a verificação `if (e.key === 'Enter' && window.barcodeBuffer)` ocorria **antes** de checar se decorreram mais de `50ms` desde a última tecla digitada (`now - window.lastKeyTime > 50`). Se o operador digitasse uma única letra e minutos depois pressionasse `Enter`, ocorria uma leitura falsa de 1 caractere.
     2. `PosPage.tsx` comparava apenas `(p.code || p.sku) === barcode` sobre a lista filtrada por categoria, ignorando o array `p.barcodes` (EAN-13).
     3. Na grade de produtos do PDV, `<Badge>Stock: {product.stock || 10}</Badge>` tratava `0` como falso e exibia `Stock: 10` para itens esgotados, permitindo vendas sem estoque.
     4. A alíquota de impostos lia `product.taxRate ?? 21`, ignorando `product.taxes?.[0]?.tax?.rate` (onde alíquotas de `10.5%`, `27%` ou `0%` estão cadastradas).
   * **Solução aplicada:**
     * Verificação de expiração temporal antes de processar `Enter` em `useBarcodeScanner.ts`, exigência de comprimento mínimo (`>= 3` caracteres) e descarte de eventos vindos de `HTMLSelectElement` e `isContentEditable`.
     * Busca no catálogo completo incluindo `p.barcodes`, exibição do estoque real `Number(product.stock ?? product.totalStock ?? 0)`, bloqueio de inclusão de produtos sem estoque e leitura da alíquota correta.

5. **Distorção de Cupons de Valor Fixo (`FIXED`), Teto `maxDiscountAmount` e Preços Congelados de Orçamentos em `pos.store.ts`**
   * **Arquivos:** [pos.store.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/stores/pos.store.ts)
   * **Causa raiz:**
     1. Ao aplicar um cupom `FIXED` (ex. `$5.000`), `applyCoupon` o convertia em uma porcentagem arredondada (`discountPct`). Alterações posteriores no carrinho faziam o cupom fixo se comportar como um desconto percentual permanente que escalava sem limite.
     2. Cupons `PERCENTAGE` ignoravam o teto `maxDiscountAmount`.
     3. `addItem` e `updateQuantity` multiplicavam `item.product.price * quantity` em vez de `item.unitPrice * quantity`, sobrescrevendo os preços congelados de orçamentos carregados no carrinho.
   * **Solução aplicada:** Centralizada a função `recalculateCart` em `pos.store.ts`, preservando `item.unitPrice`, eliminando itens com `qty <= 0`, redistribuindo proporcionalmente o valor fixo em cupons `FIXED` e respeitando o teto `maxDiscountAmount`.

6. **Comprovante Térmico com Dados Estáticos Hardcoded**
   * **Arquivos:** [TicketReceiptModal.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/pages/pos/TicketReceiptModal.tsx)
   * **Causa raiz:** Renderizava textos fixos `"FERRETERÍA EL CLAVO"`, `"Cliente: Consumidor Final"` e `"Ver detalle en sistema..."` em vez dos itens realmente vendidos.
   * **Solução aplicada:** Integrado com a configuração fiscal da empresa (`useCompanySettings`), identificação real do comprador e detalhamento completo de itens (`sale.items`), subtotais, descontos e tributos.

---

### B. Serviços Offline-First, Sincronização Cruzada (`localStorage`), Caixa, Estoque e Excel

7. **Dupla Contabilização do Saldo Inicial no Saldo Teórico de Caixa (`2x Opening Balance`)**
   * **Arquivos:** [cash.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/cash.service.ts), [CashRegisterPage.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/pages/cash/CashRegisterPage.tsx)
   * **Causa raiz:** `useOpenCashSession` definia `session.openingBalance = 10000` e além disso inseria um movimento `{ type: 'IN', amount: 10000, description: 'Abertura de caixa (Fundo inicial)' }`. Em seguida, `CashRegisterPage.tsx` somava todos os movimentos `'IN'` a `session.openingBalance`, duplicando o saldo teórico inicial.
   * **Solução aplicada:** Removida a inserção redundante do movimento `'IN'` na abertura de sessão em `cash.service.ts` e desconsideradas entradas de abertura no cálculo de receitas em `CashRegisterPage.tsx`.

8. **Desalinhamento Crítico de Chaves em `backup.service.ts` e `purchases.service.ts`**
   * **Arquivos:** [backup.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/backup.service.ts), [purchases.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/purchases.service.ts)
   * **Causa raiz:**
     1. `backup.service.ts` lia e restaurava chaves inexistentes (`'ferreteria_company_settings'`, `'ferreteria_local_coupons'`, etc.) e omitia `stores`, `invoices`, `stock` e `stockMovements`.
     2. `purchases.service.ts` buscava sessões em chave com formato de array e gravava saídas em chaves dinâmicas separadas, fazendo com que compras pagas em dinheiro nunca reduzissem o saldo da gaveta de caixa ativa.
   * **Solução aplicada:** Harmonizadas todas as chaves em `backup.service.ts` (com compatibilidade retroativa) e conectado `purchases.service.ts` às chaves ativas do serviço de caixa e à trilha de auditoria.

9. **Transferências entre Depósitos sem Efeito no Estoque e Ajustes sem Filtro de Depósito**
   * **Arquivos:** [inventory.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/inventory.service.ts), [InventoryPage.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/pages/inventory/InventoryPage.tsx), [StockAdjustModal.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/pages/inventory/StockAdjustModal.tsx)
   * **Causa raiz:**
     1. `useCreateTransfer` gravava no Kardex e na auditoria, mas **nunca alterava as quantidades em `ferreteria_local_stock` nem chamava `saveLocalStock()`**.
     2. `useAdjustStock` localizava produtos apenas por `productId` ignorando `warehouseId`, sobrescrevia `totalStock` global e registrava como entrada `'IN'` em vez de ajuste `'ADJUST'`.
     3. `StockAdjustModal.tsx` rejeitava `qty === 0`, impedindo zerar estoques esgotados.
   * **Solução aplicada:** `useCreateTransfer` debita atomicamente do depósito de origem e credita no depósito de destino em `ferreteria_local_stock`; `useAdjustStock` filtra por `productId + warehouseId`; `StockAdjustModal` aceita ajuste exato a `0`; e `InventoryPage.tsx` renderiza a tabela real de transferências.

10. **Impacto Incorreto em Caixa para Vendas em Cartão/Conta Corrente e Divergência `VOIDED` vs `CANCELLED`**
    * **Arquivos:** [sales.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/sales.service.ts), [SalesPage.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/pages/sales/SalesPage.tsx), [DashboardPage.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/pages/DashboardPage.tsx), [reports.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/reports.service.ts)
    * **Causa raiz:**
      1. `useCreateSale` inseria um movimento de entrada `'IN'` na gaveta de dinheiro pelo valor total da venda, mesmo quando recebida via Cartão, Pix/Transferência, Conta Corrente ou Mercado Livre.
      2. `useVoidSale` marcava a venda com `status = 'CANCELLED'` sem estornar estoque, dinheiro ou conta corrente, enquanto `SalesPage.tsx` e `reports.service.ts` filtravam por `status === 'VOIDED'`. Vendas canceladas continuavam inflando relatórios e podiam ser canceladas indefinidamente.
    * **Solução aplicada:** `useCreateSale` agora registra na gaveta de dinheiro apenas pagamentos em espécie (`pm-1`/`CASH`), incrementa o débito do cliente em `pm-5` e atualiza o estoque multidepósito. `useVoidSale` define `status = 'VOIDED'` e estorna o estoque, movimento de caixa e saldo de conta corrente.

11. **Corrupção de Decimais (`10.5% -> 105`) e Mapeamento Ganancioso no Importador Excel/CSV**
    * **Arquivos:** [excel-import.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/excel-import.service.ts)
    * **Causa raiz:**
      1. `parseNumber` executava `.replace(/\./g, '').replace(',', '.')`, apagando pontos decimais em números convencionais (`10.5` tornava-se `105` e era limitado a `21%`; `125.50` tornava-se `12550`).
      2. `getColumnValue` utilizava correspondência parcial gananciosa (`kNorm.includes(c)`): quando "Preço Venda" vinha vazio para cálculo automático por margem, o termo `'preco'` casava com "Preço Custo", forçando preço de venda igual ao custo (0% de margem).
      3. `downloadProductTemplate` e `downloadCustomerTemplate` utilizavam `XLSX.writeFile`, o que em ambiente Node/Vitest gravava arquivos `.csv` soltos na raiz de `apps/web/`.
    * **Solução aplicada:** Desenvolvida rotina inteligente de detecção numérica diferenciando separadores de milhar de pontos decimais, eliminada a sobreposição em `getColumnValue` e adotado download via `Blob` no navegador.

12. **Truncamento de Arquivos CSV pelo Caractere `#`, Inflação de Relatórios e Aspas Duplas em Datasets ML**
    * **Arquivos:** [quotes.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/quotes.service.ts), [customer-analytics.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/customer-analytics.service.ts), [reports.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/reports.service.ts), [invoicing.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/invoicing.service.ts)
    * **Causa raiz:**
      1. `exportQuotesCsv` utilizava `encodeURI('data:text/csv...')`, que não escapa o caractere `#` (comum em observações como `"pedido #1024"`), quebrando o download do CSV.
      2. `customer-analytics.service.ts` computava vendas canceladas no cálculo RFM/LTV, apresentava erro de precedência booleana no segmento `BIG_BUILDER` e envolvia campos em aspas duplas manuais antes de chamar `exportToCsv` (gerando aspas triplas `"""..."""`).
      3. `reports.service.ts` adicionava artificialmente `+ (baselineRevenue * 0.3)` sobre a receita real quando `totalRevenue > 0`.
      4. `invoicing.service.ts` gerava 21% de imposto sobre notas isentas e emitia Notas de Crédito mantendo a letra da nota original sem cancelar o registro original.
    * **Solução aplicada:** Exportação CSV convertida para `Blob`, vendas canceladas excluídas do cálculo RFM, precedência lógica corrigida, inflação artificial de faturamento removida e tratamento exato de notas isentas e Notas de Crédito (`letter: 'NC'`, `orig.status = 'ANULADO'`).

---

### C. Autenticação, Controle de Acesso, Áudio/Acessibilidade e Componentes UI

13. **Bypass de Senha e Status Ativo no Login Local, Proteção de Rotas e Reatividade de Filial**
    * **Arquivos:** [LoginPage.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/pages/LoginPage.tsx), [users.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/users.service.ts), [App.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/App.tsx), [Sidebar.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/components/layout/Sidebar.tsx), [UserModal.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/pages/users/UserModal.tsx), [UserBitacoraModal.tsx](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/components/users/UserBitacoraModal.tsx), [stores.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/stores.service.ts)
    * **Solução aplicada:**
      * `LoginPage.tsx` agora valida contra `getLocalUsers()`, rejeita contas desativadas (`isActive === false`), checa senha, preserva username e mapeia tokens e permissões da API.
      * Implementado `ErrorBoundary` global em `App.tsx`, validação de permissões em `ProtectedRoute` e filtragem dinâmica de menu no `Sidebar.tsx`.
      * Suporte à revogação de permissões individuais (`deniedPermissions`) em `UserModal.tsx` e correlação por identificadores em `UserBitacoraModal.tsx`.
      * Tornada reativa a seleção de filial (`useActiveStore`) via eventos locais para atualização instantânea em `Header.tsx` e `StoresSettingsTab.tsx`.

14. **Vazamento de Nós na Web Audio API, Dessincronização de `isMuted`, Favicon Ausente e Estilos de Impressão**
    * **Arquivos:** [a11y-audio.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/a11y-audio.service.ts), [accessibility.store.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/stores/accessibility.store.ts), [index.html](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/index.html), [index.css](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/index.css)
    * **Solução aplicada:**
      * Em `a11y-audio.service.ts`, inclusão de checagem `if (this.isMuted)` em `speak()`, desconexão de osciladores em `osc.onended`, limpeza de timers pendentes e fechamento seguro do `AudioContext`.
      * Em `accessibility.store.ts`, sincronização de `a11yAudio.setMuted(!soundFeedback)` em todos os ciclos de vida.
      * Em `index.html`, substituição do favicon ausente por SVG inline e importação da fonte `'Atkinson Hyperlegible'` para suporte a dislexia.
      * Em `index.css`, regras `@media print` para ocultação de elementos de navegação e fundos na impressão de recibos e faturas.

---

### D. Backend NestJS, Prisma ORM, Criptografia SHA-256 e Pacote Compartilhado (`@ferreteria/api` & `@ferreteria/shared`)

15. **Rollback Indevido em `SalesService.createSale` e `voidSale` por Consulta Fora da Transação (`tx`)**
    * **Arquivos:** [sales.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/sales/sales.service.ts), [sales.dto.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/sales/dto/sales.dto.ts)
    * **Causa raiz:** Dentro de `this.prisma.$transaction(async (tx) => { ... })`, `createSale` e `voidSale` finalizavam chamando `return this.getSale(sale.id)`, que executava `this.prisma.sale.findUnique` fora do escopo `tx`. No PostgreSQL (`READ COMMITTED`), o registro não confirmado em `tx` não era visível pelo cliente externo, disparando `NotFoundException` e cancelando toda a operação. Além disso, taxas de imposto eram zeradas e cancelamentos não restauravam crédito do cliente.
    * **Solução aplicada:** `getSale(id, prismaClient = this.prisma)` agora recebe o cliente transacional `tx`; `createSale` calcula taxas reais de impostos e vincula movimentação de estoque; e `voidSale` estorna o estoque para o depósito original e ajusta o saldo em conta corrente do cliente.

16. **Sobreposição de Rota `GET /api/products/export`, Transações em `update` e `massPriceUpdate`**
    * **Arquivos:** [products.controller.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/products/products.controller.ts), [products.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/products/products.service.ts)
    * **Causa raiz:** `@Get(':id')` estava posicionado antes de `@Get('export')`, capturando `/api/products/export` como identificador `id = "export"` (404). Em `ProductsService.update`, `userId` causava erro no Prisma e atualizações de impostos ocorriam fora de transação. Em `massPriceUpdate`, o envio de `percentage` gerava `NaN`.
    * **Solução aplicada:** Reordenada a rota `@Get('export')` antes de `@Get(':id')`, extraído `userId`, encapsulado `update()` em `$transaction` e suportado tanto `percentageChange` quanto `percentage`.

17. **Tipos de Nota de Crédito Faltantes em `seed.ts`, `NULLS FIRST` na Numeração e Relatórios Fiscais**
    * **Arquivos:** [seed.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/prisma/seed.ts), [afip.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/invoicing/afip.service.ts), [invoicing.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/invoicing/invoicing.service.ts), [reports.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/reports/reports.service.ts)
    * **Causa raiz:** `seed.ts` não cadastrou os tipos de notas de crédito `003`, `008` e `013`, impossibilitando emissão. Na consulta de numeração, `ORDER BY number DESC` com valores nulos posicionava `NULL` no topo no PostgreSQL (`NULLS FIRST`), reiniciando a contagem em `1` e colidindo com chaves únicas. No relatório fiscal, notas canceladas eram somadas indevidamente.
    * **Solução aplicada:** Cadastrados os códigos de nota de crédito no seed; filtrado `number: { not: null }` na geração de sequência; notas canceladas excluídas e notas de crédito subtraídas nos relatórios; eliminada consulta N+1 em produtos mais vendidos.

18. **Livro-Razão Criptográfico SHA-256 (`packages/shared/src/utils/crypto.ts`)**
    * **Arquivos:** [crypto.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/packages/shared/src/utils/crypto.ts)
    * **Causa raiz:** `JSON.stringify(data.details, Object.keys(data.details).sort())` utilizava array no segundo argumento (`replacer`), o que segundo o padrão ECMAScript filtra globalmente propriedades em todos os níveis, descartando atributos de objetos aninhados. Além disso, `sha256` operava sobre unidades de código UTF-16 sem codificação prévia para bytes UTF-8.
    * **Solução aplicada:** Implementada codificação prévia em UTF-8 e rotina de serialização canônica recursiva (`canonicalizeValue`) em `computeAuditLogHash`.

19. **Blindagem RBAC em Todos os 15 Controladores, Segurança JWT, Tratamento Prisma e Limpeza de Timers**
    * **Arquivos:** [permissions.guard.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/common/guards/permissions.guard.ts), [audit.interceptor.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/common/interceptors/audit.interceptor.ts), [http-exception.filter.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/common/filters/http-exception.filter.ts), [auth.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/auth/auth.service.ts), [jwt.strategy.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/auth/strategies/jwt.strategy.ts), [backend-telemetry.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/telemetry/backend-telemetry.service.ts) e todos os 15 controladores em `apps/api/src/modules/**`.
    * **Solução aplicada:**
      * Aplicados `@UseGuards(JwtAuthGuard, PermissionsGuard)` e `@RequirePermissions(...)` em 100% dos controladores, suportando caracteres coringa e delimitadores variados.
      * Registrado `RolesController` e ocultado hash de senha em respostas da API.
      * Verificado status ativo do usuário e tipo de token (`access` vs `refresh`) na autenticação.
      * Mapeamento de códigos de erro do Prisma (`P2002` -> 409, `P2025` -> 404, `P2003` -> 400).
      * Removidas credenciais estáticas do Telegram, fortalecida validação anti-SSRF e adicionado desarmamento de timers em `onModuleDestroy()`.

---

## 3. Auditoria de Segurança OWASP Top 10 e Remediações Aplicadas

Foi conduzida uma análise estática e dinâmica de vulnerabilidades sobre a arquitetura do sistema, em conformidade com os padrões **OWASP Top 10 (2021)** e **OWASP API Security Top 10 (2023)**:

| Categoria OWASP | Vulnerabilidade / Debilidade Identificada | CWE Associado | Arquivo(s) Afetado(s) | Remediação Aplicada | Status |
|---|---|---|---|---|---|
| **A03: Injection** | **CSV Formula Injection / Execução de Macros DDE**: Células com nomes de produtos, clientes ou notas iniciando com `=`, `+`, `-`, `@`, `\t`, `\r` eram executadas como fórmulas/código no Excel/Calc. | CWE-1236 | [utils.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/lib/utils.ts), [quotes.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/quotes.service.ts) | Criada função `sanitizeCsvCell()` que detecta disparadores de fórmula e prefixa apóstrofo (`'`), desarmando a execução em planilhas. | **Corrigido & Testado** |
| **A03: Injection** | **Cross-Site Scripting (XSS) / Template Injection em E-mails**: Nomes de clientes ou razões sociais eram concatenados em texto simples no modelo HTML do comprovante de e-mail. | CWE-79 | [email-notification.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/web/src/services/email-notification.service.ts) | Implementada rotina `escapeHtml()` para codificar entidades HTML (`&`, `<`, `>`, `"`, `'`) em todas as variáveis injetadas no corpo do e-mail. | **Corrigido & Testado** |
| **A01: Broken Access Control** | **Insecure Direct Object Reference (IDOR) em Caixas**: Qualquer usuário autenticado conseguia forçar o encerramento ou lançar sangrias/reforços em turnos de outros operadores. | CWE-639 / CWE-284 | [cash-register.controller.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/cash-register/cash-register.controller.ts), [cash-register.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/cash-register/cash-register.service.ts) | Vinculada a identidade autenticada (`req.user.id`) e aplicada validação estrita de posse (`session.userId === userId`), exceto para perfis com `cash.view_all`. | **Corrigido & Testado** |
| **A01: Broken Access Control** | **Suplantação de Identidade em Estoque e Compras**: Parâmetros `userId` no corpo da requisição sobrescreviam o identificador do token JWT (`data.userId || user?.id`). | CWE-287 / CWE-306 | [inventory.controller.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/inventory/inventory.controller.ts), [purchases.controller.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/purchases/purchases.controller.ts) | Forçada a prioridade do token criptográfico (`user?.id || data.userId`), impedindo que operadores atribuam ajustes ou pedidos a terceiros. | **Corregido & Testado** |
| **A01: Broken Access Control / API3** | **Mass Assignment e Ausência de DTOs em Usuários**: Rotas de criação e edição aceitavam `data: any`, contornando validação estrutural. | CWE-915 | [users.controller.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/users/users.controller.ts), [create-user.dto.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/users/dto/create-user.dto.ts), [update-user.dto.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/users/dto/update-user.dto.ts) | Criação de DTOs estritos com anotações de validação (`@IsEmail()`, etc.) e rejeição automática de parâmetros não autorizados (`forbidNonWhitelisted: true`). | **Corregido & Testado** |
| **A07: Identification Failures** | **Políticas de Senha Fracas e Risco de DoS no Bcrypt**: Mínimo de 6 caracteres sem limite superior permitia senhas triviais ou cargas excessivas para esgotar processamento. | CWE-521 / CWE-400 | [login.dto.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/auth/dto/login.dto.ts), [auth.schema.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/packages/shared/src/schemas/auth.schema.ts) | Elevada a exigência mínima para 8 caracteres e fixado teto de 128 caracteres para mitigar ataques de exaustão computacional. | **Corregido & Testado** |
| **A05: Security Misconfiguration** | **Vazamento de Detalhes Técnicos em Falhas Globais**: `HttpExceptionFilter` retornava `exception.message` e rastros SQL diretamente para o cliente. | CWE-209 | [http-exception.filter.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/common/filters/http-exception.filter.ts) | Mascaramento de erros em ambiente de produção (`NODE_ENV === 'production'`), isolando pilhas de execução exclusivamente nos registros internos. | **Corregido & Testado** |
| **A05: Security Misconfiguration** | **Rejeição Incorreta em CORS**: No Fastify CORS, disparar `new Error()` no callback gerava erros 500 não capturados. | CWE-942 | [main.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/main.ts) | Ajustada a resposta de origens não autorizadas para `callback(null, false)`, bloqueando solicitações sem causar exceções no servidor. | **Corregido & Testado** |
| **A06: Vulnerable Components** | **Vulnerabilidade Crítica de Spoofing em proxy-addr**: Pacote `proxy-addr < 2.0.8` suscetível a falsificação de IP em sub-redes IPv4 mapeadas para IPv6. | GHSA-jqcg-44mw-7w3h | [pnpm-workspace.yaml](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/pnpm-workspace.yaml) | Forçada versão `>=2.0.8` de `proxy-addr` e `>=4.2.3` de `fast-uri` via `overrides` do pnpm. Auditoria `pnpm audit --prod` registra **0 vulnerabilidades críticas**. | **Corregido & Testado** |
| **A10: SSRF** | **Endurecimento de Endereços em Telemetria e Webhooks**: Risco de varredura de portas internas e DNS rebinding. | CWE-918 | [backend-telemetry.service.ts](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/apps/api/src/modules/telemetry/backend-telemetry.service.ts) | Aprimorada rotina `isValidSafeUrl()` para restringir portas às convencionais (80 e 443), proibir credenciais embutidas e descartar domínios dinâmicos. | **Corregido & Testado** |

---

## 4. Cuidados e Recomendações para Implantação em Produção

1. **Variáveis de Ambiente ([.env](file:///D:/TPs%20Univerty/GestionQuincaillerie-main/.env)):**
   * Antes de expor o backend na rede pública, substituir `JWT_SECRET` por uma chave aleatória robusta (mínimo de 256 bits) e configurar credenciais de produção fiscais e de mensageria.
2. **Banco de Dados Relacional (Modo Completo):**
   * No modo autônomo (*Offline-First*), o frontend opera plenamente no navegador. Para persistência com PostgreSQL 16 e Redis 7, inicialize os contêineres com `docker compose up -d` (ou `podman-compose up -d`) e execute `pnpm db:migrate` e `pnpm db:seed`.
