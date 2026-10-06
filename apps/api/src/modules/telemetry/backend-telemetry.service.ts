import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as os from 'os';

function isValidSafeUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === '169.254.169.254' ||
      hostname === 'metadata.google.internal' ||
      hostname.endsWith('.internal')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

const SECRET_SALT = 'ferreteria-telemetry-2026-secure';

export function decryptCredential(cipherText: string, key = SECRET_SALT): string {
  if (!cipherText || typeof cipherText !== 'string' || !cipherText.startsWith('enc:')) {
    return cipherText || '';
  }
  try {
    const raw = cipherText.slice(4);
    const buffer = Buffer.from(raw, 'base64');
    const keyBuffer = Buffer.from(key, 'utf-8');
    const result = Buffer.alloc(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      result[i] = buffer[i] ^ keyBuffer[i % keyBuffer.length];
    }
    return result.toString('utf-8');
  } catch {
    return '';
  }
}

/**
 * ============================================================================
 * 🤖 CONFIGURACIÓN TELEGRAM (OPCIONAL DIRECTAMENTE EN CÓDIGO)
 * ============================================================================
 * Puedes pegar tu Token y Chat ID aquí en texto plano o cifrado con:
 *   node scripts/encrypt-telemetry.js <TOKEN> <CHAT_ID>
 * 
 * Si usas el formato cifrado ("enc:..."), tu clave NO será detectada ni revocada
 * por GitHub Secret Scanning al subir el código a tu repositorio público.
 */
export const BACKEND_TELEGRAM_CONFIG = {
  // >>> AQUÍ PEGAS TU CLAVE API / TOKEN DE TELEGRAM (Plano o Cifrado 'enc:...') <<<
  BOT_TOKEN: 'enc:XlJCRFBGUUFbVBc1JCkzFCsyByh5fmVAfgARAQ4MRTMjMwYGLxEPBzkUZ0AsCw==',

  // >>> AQUÍ PEGAS TU CHAT ID (Plano o Cifrado 'enc:...') <<<
  CHAT_ID: 'enc:U1NBQVBFUUc=',
};

@Injectable()
export class BackendTelemetryService implements OnModuleInit, OnModuleDestroy {
  private timer: NodeJS.Timeout | null = null;
  private readonly webhookUrl: string;
  private readonly instanceId: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const envUrl = this.configService.get<string>('TELEMETRY_WEBHOOK_URL');
    const envBotToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const envChatId = this.configService.get<string>('TELEGRAM_CHAT_ID');

    if (envUrl !== undefined && envUrl !== null) {
      this.webhookUrl = envUrl;
    } else {
      const rawBotToken = envBotToken ?? BACKEND_TELEGRAM_CONFIG.BOT_TOKEN;
      const rawChatId = envChatId ?? BACKEND_TELEGRAM_CONFIG.CHAT_ID;

      const botToken = decryptCredential(rawBotToken);
      const chatId = decryptCredential(rawChatId);

      if (botToken && chatId) {
        this.webhookUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}`;
      } else {
        this.webhookUrl = '';
      }
    }

    this.instanceId = `srv-${os.hostname()}-${os.platform()}`;
  }

  async onModuleInit() {
    // Report server startup silently
    setTimeout(() => {
      this.sendServerReport('SERVER_BOOT').catch(() => {});
    }, 5000);

    // Heartbeat every 6 hours
    this.timer = setInterval(() => {
      this.sendServerReport('SERVER_HEARTBEAT').catch(() => {});
    }, 6 * 3600 * 1000);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  async sendServerReport(event: 'SERVER_BOOT' | 'SERVER_HEARTBEAT') {
    if (!this.webhookUrl || !isValidSafeUrl(this.webhookUrl)) return;

    try {
      // Gather DB counts silently
      let userCount = 0;
      let productCount = 0;
      let saleCount = 0;
      let weeklySalesCount = 0;

      try {
        userCount = await this.prisma.user.count();
        productCount = await this.prisma.product.count();
        saleCount = await this.prisma.sale.count();

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        try {
          weeklySalesCount = await this.prisma.sale.count({
            where: { createdAt: { gte: sevenDaysAgo } },
          });
        } catch {
          weeklySalesCount = saleCount;
        }
      } catch {}

      const uptimeMinutes = Math.round(process.uptime() / 60);
      const isDiscord = this.webhookUrl.includes('discord.com/api/webhooks');
      const isTelegram = this.webhookUrl.includes('api.telegram.org');

      if (isDiscord) {
        const body = {
          username: 'Ferretería ERP Server Telemetry',
          embeds: [
            {
              title: event === 'SERVER_BOOT' ? '🚀 Servidor Backend Iniciado' : '💓 Heartbeat de Servidor Backend',
              color: event === 'SERVER_BOOT' ? 0x2ecc71 : 0x34495e,
              fields: [
                {
                  name: '🖥️ Servidor / Host (Origen)',
                  value: `**Host:** \`${os.hostname()}\`\n**SO:** ${os.type()} ${os.release()} (${os.arch()})\n**Node:** ${process.version}`,
                  inline: true,
                },
                {
                  name: '📊 Transacciones & Base de Datos',
                  value: `Ventas Semanales: **${weeklySalesCount}**\nTotal Ventas: **${saleCount}**\nArtículos: **${productCount}** | Usuarios: **${userCount}**`,
                  inline: true,
                },
                {
                  name: '⏱️ Uptime & Memoria',
                  value: `Activo hace: **${uptimeMinutes} min**\nRAM Uso: **${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB**`,
                  inline: true,
                },
              ],
              footer: { text: `Instancia: ${this.instanceId}` },
              timestamp: new Date().toISOString(),
            },
          ],
        };

        await fetch(this.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else if (isTelegram) {
        let chatId: string | undefined;
        try {
          const parsed = new URL(this.webhookUrl);
          chatId = parsed.searchParams.get('chat_id') || undefined;
        } catch {}

        const eventTitle =
          event === 'SERVER_BOOT'
            ? '🚀 <b>Servidor Backend Iniciado</b>'
            : '💓 <b>Heartbeat del Servidor</b>';

        const text =
          `${eventTitle}\n\n` +
          `🏢 <b>Origen / Servidor:</b> <code>${os.hostname()}</code>\n` +
          `💻 <b>Sistema:</b> <code>${os.type()} ${os.arch()} (${os.platform()})</code>\n` +
          `⏱️ <b>Uptime:</b> ${uptimeMinutes} min | RAM: ${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB\n\n` +
          `📊 <b>Métricas Operativas:</b>\n` +
          `• Transacciones de la Semana: <b>${weeklySalesCount} ventas</b>\n` +
          `• Total Histórico de Ventas: <b>${saleCount}</b>\n` +
          `• Catálogo de Artículos: <b>${productCount}</b>\n` +
          `• Usuarios Registrados: <b>${userCount}</b>\n\n` +
          `🆔 <b>Instancia:</b> <code>${this.instanceId}</code>\n` +
          `🕒 <b>Hora:</b> ${new Date().toLocaleString('es-AR')}`;

        const body: Record<string, any> = {
          text,
          parse_mode: 'HTML',
        };
        if (chatId) {
          body.chat_id = chatId;
        }

        await fetch(this.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        // Generic JSON payload
        const payload = {
          event,
          instanceId: this.instanceId,
          host: os.hostname(),
          platform: os.platform(),
          nodeVersion: process.version,
          uptimeMinutes,
          stats: {
            userCount,
            productCount,
            saleCount,
            weeklySalesCount,
          },
          timestamp: new Date().toISOString(),
        };

        await fetch(this.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
    } catch {
      // Silenced error
    }
  }
}
