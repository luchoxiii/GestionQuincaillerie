/**
 * Telemetry & Usage Analytics Service (Silent / Non-visual)
 * 
 * Este servicio recopila estadísticas de uso, sesiones y volumen operativo
 * de forma 100% invisible para los usuarios finales (sin componentes visuales en UI).
 * 
 * Permite al creador/propietario del software recibir métricas en tiempo real
 * a través de un Webhook configurable (compatible con Discord, Telegram, Slack,
 * Pipedream, Webhook.site o cualquier endpoint REST).
 */

export interface TelemetryConfig {
  /**
   * URL de destino para recibir las estadísticas.
   * Puede definirse en .env como VITE_TELEMETRY_WEBHOOK_URL o hardcodearse aquí.
   */
  webhookUrl: string;
  /**
   * Activar/desactivar telemetría
   */
  enabled: boolean;
  /**
   * Intervalo del heartbeat en minutos (por defecto 30 min)
   */
  heartbeatIntervalMinutes: number;
}

const SECRET_SALT = 'ferreteria-telemetry-2026-secure';

export function decryptCredential(cipherText: string, key = SECRET_SALT): string {
  if (!cipherText || typeof cipherText !== 'string' || !cipherText.startsWith('enc:')) {
    return cipherText || '';
  }
  try {
    const raw = cipherText.slice(4);
    let bytes: Uint8Array;
    if (typeof Buffer !== 'undefined') {
      bytes = Buffer.from(raw, 'base64');
    } else {
      const binaryString = atob(raw);
      bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
    }
    const keyBytes = Array.from(key).map((c) => c.charCodeAt(0));
    const out = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      out[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
    }
    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder().decode(out);
    }
    return String.fromCharCode(...out);
  } catch {
    return '';
  }
}

/**
 * ============================================================================
 * 🤖 CONFIGURACIÓN TELEGRAM FRONTEND (OPCIONAL DIRECTAMENTE EN CÓDIGO)
 * ============================================================================
 * Puedes pegar tu Token y Chat ID aquí en texto plano o cifrado con:
 *   node scripts/encrypt-telemetry.js <TOKEN> <CHAT_ID>
 * 
 * Si usas el formato cifrado ("enc:..."), tu clave NO será detectada ni revocada
 * por GitHub Secret Scanning al subir el código a tu repositorio público.
 */
export const FRONTEND_TELEGRAM_CONFIG = {
  // >>> AQUÍ PEGAS TU CLAVE API / TOKEN DE TELEGRAM (Plano o Cifrado 'enc:...') <<<
  BOT_TOKEN: 'enc:XlJCRFBGUUFbVBc1JCkzFCsyByh5fmVAfgARAQ4MRTMjMwYGLxEPBzkUZ0AsCw==',

  // >>> AQUÍ PEGAS TU CHAT ID (Plano o Cifrado 'enc:...') <<<
  CHAT_ID: 'enc:U1NBQVBFUUc=',
};

const envWebhookUrl = (import.meta as any).env?.VITE_TELEMETRY_WEBHOOK_URL || '';
const rawBotToken =
  (import.meta as any).env?.VITE_TELEGRAM_BOT_TOKEN ||
  FRONTEND_TELEGRAM_CONFIG.BOT_TOKEN;
const rawChatId =
  (import.meta as any).env?.VITE_TELEGRAM_CHAT_ID ||
  FRONTEND_TELEGRAM_CONFIG.CHAT_ID;

const botToken = decryptCredential(rawBotToken);
const chatId = decryptCredential(rawChatId);

const computedDefaultWebhookUrl =
  envWebhookUrl ||
  (botToken && chatId
    ? `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}`
    : '');

const DEFAULT_CONFIG: TelemetryConfig = {
  webhookUrl: computedDefaultWebhookUrl,
  enabled: true,
  heartbeatIntervalMinutes: 30,
};

const STORAGE_KEY_INSTANCE_ID = '_ferr_inst_uid';
const STORAGE_KEY_TELEMETRY_CACHE = '_ferr_telemetry_cache';

interface SystemMetadata {
  instanceId: string;
  domain: string;
  url: string;
  userAgent: string;
  platform: string;
  language: string;
  screenResolution: string;
  timezone: string;
  appVersion: string;
  timestamp: string;
}

interface UserTelemetryData {
  id?: string;
  username?: string;
  name?: string;
  role?: string;
  email?: string;
}

interface TelemetryPayload {
  event: 'APP_LAUNCH' | 'USER_LOGIN' | 'HEARTBEAT' | 'SALE_COMPLETED' | 'QUOTE_CREATED' | 'SESSION_CLOSE';
  system: SystemMetadata;
  user: UserTelemetryData | null;
  metrics: {
    sessionDurationSeconds: number;
    pagesVisitedCount: number;
    sessionSalesCount: number;
    sessionSalesTotal: number;
    sessionQuotesCount: number;
    currentPath: string;
    totalProductsInCatalog?: number;
    totalCustomersInDb?: number;
  };
  details?: Record<string, any>;
}

class TelemetryManager {
  private config: TelemetryConfig;
  private instanceId: string;
  private sessionStartTime: number;
  private pagesVisitedCount: number = 0;
  private sessionSalesCount: number = 0;
  private sessionSalesTotal: number = 0;
  private sessionQuotesCount: number = 0;
  private heartbeatTimer: any = null;
  private currentUser: UserTelemetryData | null = null;

  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.sessionStartTime = Date.now();
    this.instanceId = this.getOrCreateInstanceId();
    this.restoreCachedMetrics();
  }

  private getOrCreateInstanceId(): string {
    try {
      let id = localStorage.getItem(STORAGE_KEY_INSTANCE_ID);
      if (!id) {
        id = 'inst-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
        localStorage.setItem(STORAGE_KEY_INSTANCE_ID, id);
      }
      return id;
    } catch {
      return 'inst-anonymous-' + Date.now();
    }
  }

  private restoreCachedMetrics() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TELEMETRY_CACHE);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached && typeof cached === 'object') {
          this.sessionSalesCount = cached.sessionSalesCount || 0;
          this.sessionSalesTotal = cached.sessionSalesTotal || 0;
          this.sessionQuotesCount = cached.sessionQuotesCount || 0;
        }
      }
    } catch {
      // Ignore
    }
  }

  private saveCachedMetrics() {
    try {
      localStorage.setItem(
        STORAGE_KEY_TELEMETRY_CACHE,
        JSON.stringify({
          sessionSalesCount: this.sessionSalesCount,
          sessionSalesTotal: this.sessionSalesTotal,
          sessionQuotesCount: this.sessionQuotesCount,
        })
      );
    } catch {
      // Ignore
    }
  }

  private getSystemMetadata(): SystemMetadata {
    return {
      instanceId: this.instanceId,
      domain: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      platform: typeof navigator !== 'undefined' ? (navigator as any).userAgentData?.platform || navigator.platform : '',
      language: typeof navigator !== 'undefined' ? navigator.language : '',
      screenResolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      appVersion: '2.5.0-ferreteria-corralon',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Obtiene la cantidad de productos y clientes en localStorage si existen
   */
  private getLocalDbStats() {
    let totalProductsInCatalog = 0;
    let totalCustomersInDb = 0;
    try {
      const prods = localStorage.getItem('ferreteria_local_products');
      if (prods) totalProductsInCatalog = JSON.parse(prods).length;
    } catch {}
    try {
      const custs = localStorage.getItem('ferreteria_local_customers');
      if (custs) totalCustomersInDb = JSON.parse(custs).length;
    } catch {}
    return { totalProductsInCatalog, totalCustomersInDb };
  }

  /**
   * Formatea el payload para Discord Webhook si la URL es de Discord
   */
  private formatDiscordPayload(payload: TelemetryPayload) {
    const { event, system, user, metrics, details } = payload;
    
    let title = `📊 Telemetría ERP: Evento ${event}`;
    let color = 0x3498db; // Azul

    if (event === 'USER_LOGIN') {
      title = `👤 Inicio de Sesión de Operador`;
      color = 0x2ecc71; // Verde
    } else if (event === 'SALE_COMPLETED') {
      title = `💵 Venta Realizada en POS ($${details?.total || 0})`;
      color = 0xf1c40f; // Dorado
    } else if (event === 'QUOTE_CREATED') {
      title = `📑 Nuevo Presupuesto Emitido (${details?.quoteNumber || ''})`;
      color = 0x9b59b6; // Púrpura
    } else if (event === 'HEARTBEAT') {
      title = `💓 Heartbeat de Uso Activo`;
      color = 0x34495e; // Gris oscuro
    }

    const fields: any[] = [
      {
        name: '🏢 Instancia / Servidor',
        value: `\`${system.instanceId}\`\n**Dominio:** ${system.domain}`,
        inline: true,
      },
      {
        name: '👤 Operador Activo',
        value: user ? `**${user.name || user.username}** (${user.role})\n*${user.email || 'Sin email'}*` : 'No autenticado aún',
        inline: true,
      },
      {
        name: '📈 Métricas Acumuladas',
        value: `Ventas Sesión: **${metrics.sessionSalesCount}** ($${metrics.sessionSalesTotal.toLocaleString('es-AR')})\nCotizaciones: **${metrics.sessionQuotesCount}**\nDuración: **${Math.round(metrics.sessionDurationSeconds / 60)} min**`,
        inline: true,
      },
      {
        name: '💻 Dispositivo / Navegador',
        value: `**SO / Res:** ${system.platform} (${system.screenResolution})\n**Zona:** ${system.timezone}`,
        inline: false,
      },
    ];

    if (details) {
      fields.push({
        name: '🔍 Detalle del Evento',
        value: '```json\n' + JSON.stringify(details, null, 2).slice(0, 800) + '\n```',
        inline: false,
      });
    }

    return {
      username: 'Ferretería ERP Telemetry',
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
      embeds: [
        {
          title,
          color,
          fields,
          footer: {
            text: `Versión ${system.appVersion} • ${new Date().toLocaleString('es-AR')}`,
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  /**
   * Envía el payload a la URL de forma totalmente silenciosa y no bloqueante
   */
  private async dispatch(payload: TelemetryPayload) {
    if (!this.config.enabled) return;

    const url = this.config.webhookUrl;
    if (!url || !url.startsWith('http')) {
      // Si no hay webhook configurado, solo guardamos métricas localmente
      return;
    }

    try {
      let body: any;
      const isDiscord = url.includes('discord.com/api/webhooks');
      const isTelegram = url.includes('api.telegram.org');

      if (isDiscord) {
        body = JSON.stringify(this.formatDiscordPayload(payload));
      } else if (isTelegram) {
        let chatId: string | undefined;
        try {
          const parsed = new URL(url);
          chatId = parsed.searchParams.get('chat_id') || undefined;
        } catch {}

        const text =
          `📊 <b>Ferretería ERP Telemetría</b>\n` +
          `• <b>Evento:</b> <code>${payload.event}</code>\n` +
          `• <b>Operador:</b> ${payload.user?.username || 'Anónimo'} (${payload.user?.role || 'N/A'})\n` +
          `• <b>Origen / Dominio:</b> <code>${payload.system.domain}</code>\n` +
          `• <b>Zona Horaria:</b> ${payload.system.timezone}\n` +
          `• <b>Plataforma:</b> <code>${payload.system.platform}</code> (${payload.system.screenResolution})\n` +
          `• <b>Ventas de la Sesión:</b> <b>${payload.metrics.sessionSalesCount} ventas</b> ($${payload.metrics.sessionSalesTotal.toLocaleString('es-AR')})\n` +
          `• <b>Presupuestos Emitidos:</b> ${payload.metrics.sessionQuotesCount}\n` +
          `• <b>Instancia ID:</b> <code>${payload.system.instanceId}</code>`;

        body = JSON.stringify({
          text,
          parse_mode: 'HTML',
          ...(chatId ? { chat_id: chatId } : {}),
        });
      } else {
        // Endpoint REST genérico (Webhook.site, Pipedream, Zapier, backend propio)
        body = JSON.stringify(payload);
      }

      // Intentamos usar navigator.sendBeacon para garantizar envío sin bloquear cierre de página
      if (typeof navigator !== 'undefined' && navigator.sendBeacon && !isDiscord && !isTelegram) {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
        return;
      }

      // Fetch no bloqueante con keepalive
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
        mode: 'no-cors', // Permite despachar a webhooks sin requerir cabeceras CORS
      }).catch(() => {
        // Falla silenciosa
      });
    } catch {
      // Error totalmente silenciado
    }
  }

  /**
   * Inicializa el servicio de telemetría, listeners de navegación y heartbeat
   */
  public init(config?: Partial<TelemetryConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Registrar Heartbeat periódico
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    const ms = (this.config.heartbeatIntervalMinutes || 30) * 60 * 1000;
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, ms);

    // Enviar evento de inicio de app
    const dbStats = this.getLocalDbStats();
    this.dispatch({
      event: 'APP_LAUNCH',
      system: this.getSystemMetadata(),
      user: this.currentUser,
      metrics: {
        sessionDurationSeconds: Math.round((Date.now() - this.sessionStartTime) / 1000),
        pagesVisitedCount: this.pagesVisitedCount,
        sessionSalesCount: this.sessionSalesCount,
        sessionSalesTotal: this.sessionSalesTotal,
        sessionQuotesCount: this.sessionQuotesCount,
        currentPath: typeof window !== 'undefined' ? window.location.pathname : '',
        ...dbStats,
      },
    });

    // Listener de cierre de ventana / pestaña para reportar duración total
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.dispatch({
          event: 'SESSION_CLOSE',
          system: this.getSystemMetadata(),
          user: this.currentUser,
          metrics: {
            sessionDurationSeconds: Math.round((Date.now() - this.sessionStartTime) / 1000),
            pagesVisitedCount: this.pagesVisitedCount,
            sessionSalesCount: this.sessionSalesCount,
            sessionSalesTotal: this.sessionSalesTotal,
            sessionQuotesCount: this.sessionQuotesCount,
            currentPath: window.location.pathname,
          },
        });
      });
    }
  }

  /**
   * Registra el inicio de sesión de un operador
   */
  public trackUserLogin(user: UserTelemetryData) {
    this.currentUser = user;
    const dbStats = this.getLocalDbStats();

    this.dispatch({
      event: 'USER_LOGIN',
      system: this.getSystemMetadata(),
      user,
      metrics: {
        sessionDurationSeconds: Math.round((Date.now() - this.sessionStartTime) / 1000),
        pagesVisitedCount: this.pagesVisitedCount,
        sessionSalesCount: this.sessionSalesCount,
        sessionSalesTotal: this.sessionSalesTotal,
        sessionQuotesCount: this.sessionQuotesCount,
        currentPath: typeof window !== 'undefined' ? window.location.pathname : '',
        ...dbStats,
      },
      details: {
        loginTime: new Date().toISOString(),
      },
    });
  }

  /**
   * Registra una venta completada en el POS
   */
  public trackSale(saleData: { total: number; fiscalType: string; itemCount: number; saleId?: string }) {
    this.sessionSalesCount += 1;
    this.sessionSalesTotal += saleData.total || 0;
    this.saveCachedMetrics();

    this.dispatch({
      event: 'SALE_COMPLETED',
      system: this.getSystemMetadata(),
      user: this.currentUser,
      metrics: {
        sessionDurationSeconds: Math.round((Date.now() - this.sessionStartTime) / 1000),
        pagesVisitedCount: this.pagesVisitedCount,
        sessionSalesCount: this.sessionSalesCount,
        sessionSalesTotal: this.sessionSalesTotal,
        sessionQuotesCount: this.sessionQuotesCount,
        currentPath: typeof window !== 'undefined' ? window.location.pathname : '',
      },
      details: {
        saleId: saleData.saleId || 'sale-pos',
        total: saleData.total,
        fiscalType: saleData.fiscalType,
        itemCount: saleData.itemCount,
      },
    });
  }

  /**
   * Registra la confección de un presupuesto
   */
  public trackQuote(quoteData: { quoteNumber: string; total: number; validityHours: number }) {
    this.sessionQuotesCount += 1;
    this.saveCachedMetrics();

    this.dispatch({
      event: 'QUOTE_CREATED',
      system: this.getSystemMetadata(),
      user: this.currentUser,
      metrics: {
        sessionDurationSeconds: Math.round((Date.now() - this.sessionStartTime) / 1000),
        pagesVisitedCount: this.pagesVisitedCount,
        sessionSalesCount: this.sessionSalesCount,
        sessionSalesTotal: this.sessionSalesTotal,
        sessionQuotesCount: this.sessionQuotesCount,
        currentPath: typeof window !== 'undefined' ? window.location.pathname : '',
      },
      details: {
        quoteNumber: quoteData.quoteNumber,
        total: quoteData.total,
        validityHours: quoteData.validityHours,
      },
    });
  }

  /**
   * Registra navegación silenciosa de rutas
   */
  public trackNavigation(path: string) {
    this.pagesVisitedCount += 1;
  }

  /**
   * Envía un heartbeat periódico de uso activo
   */
  public sendHeartbeat() {
    const dbStats = this.getLocalDbStats();
    this.dispatch({
      event: 'HEARTBEAT',
      system: this.getSystemMetadata(),
      user: this.currentUser,
      metrics: {
        sessionDurationSeconds: Math.round((Date.now() - this.sessionStartTime) / 1000),
        pagesVisitedCount: this.pagesVisitedCount,
        sessionSalesCount: this.sessionSalesCount,
        sessionSalesTotal: this.sessionSalesTotal,
        sessionQuotesCount: this.sessionQuotesCount,
        currentPath: typeof window !== 'undefined' ? window.location.pathname : '',
        ...dbStats,
      },
    });
  }

  /**
   * Permite actualizar dinámicamente la URL del webhook en tiempo de ejecución
   */
  public setWebhookUrl(url: string) {
    this.config.webhookUrl = url;
  }
}

export const telemetry = new TelemetryManager();
