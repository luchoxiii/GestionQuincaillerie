import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultSettings();
  }

  async getSettings() {
    const settings = await this.prisma.setting.findMany();
    const result: Record<string, string> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }
    return result;
  }

  async updateSettings(data: Record<string, string>) {
    const defaultGroup = 'general';
    const entries = Object.entries(data || {});
    if (entries.length > 100) {
      throw new Error('Límite de claves excedido en actualización de configuración');
    }

    for (const [key, value] of entries) {
      if (!key || typeof key !== 'string' || key.length > 100 || !/^[a-zA-Z0-9_.-]+$/.test(key)) {
        continue; // Discard invalid or dangerous keys (OWASP A03 / A04)
      }
      const safeValue = String(value || '').slice(0, 10000);
      await this.prisma.setting.upsert({
        where: { key },
        update: { value: safeValue },
        create: {
          key,
          value: safeValue,
          group: defaultGroup,
        },
      });
    }
    return this.getSettings();
  }

  async seedDefaultSettings() {
    const defaultSettings = {
      company_name: "Ferretería El Martillo",
      company_cuit: "30-71234567-8",
      company_tax_condition: "RESPONSABLE_INSCRIPTO",
      company_address: "Av. Libertador 1234",
      company_phone: "011-4567-8900",
      company_email: "contacto@ferreteriaelmartillo.com",
      default_sale_point: "1",
    };
    
    for (const [key, value] of Object.entries(defaultSettings)) {
      const exists = await this.prisma.setting.findUnique({ where: { key } });
      if (!exists) {
        await this.prisma.setting.create({
          data: {
            key,
            value,
            group: 'company',
          }
        });
      }
    }
  }
}
