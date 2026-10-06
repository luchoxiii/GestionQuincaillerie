import { describe, it, expect, beforeEach } from 'vitest';
import {
  formatCurrency,
  getActiveCurrencyConfig,
  setCachedCurrencyConfig,
  cn,
} from './utils';

describe('Utils & Multi-Currency Engine 🪙', () => {
  beforeEach(() => {
    localStorage.clear();
    setCachedCurrencyConfig(null);
  });

  describe('formatCurrency con Moneda Predeterminada (ARS)', () => {
    it('debería formatear correctamente valores numéricos en Pesos Argentinos ($)', () => {
      const result = formatCurrency(1250.5);
      expect(result).toContain('1.250,50');
      expect(result).toMatch(/(\$|ARS)/);
    });

    it('debería manejar valores 0, negativos y strings numéricas', () => {
      expect(formatCurrency(0)).toContain('0,00');
      expect(formatCurrency('4500.75')).toContain('4.500,75');
      const negativeResult = formatCurrency(-500);
      expect(negativeResult).toContain('500,00');
      expect(negativeResult).toContain('-');
      expect(formatCurrency(null)).toContain('0,00');
      expect(formatCurrency(undefined)).toContain('0,00');
    });
  });

  describe('formatCurrency con Monedas Internacionales Configuradas', () => {
    it('debería formatear en Dólares Estadounidenses (USD - US$)', () => {
      const result = formatCurrency(1250.5, {
        code: 'USD',
        symbol: 'US$',
        locale: 'en-US',
        decimals: 2,
      });
      expect(result).toContain('1,250.50');
      expect(result).toMatch(/(\$|US\$|USD)/);
    });

    it('debería formatear en Euros (EUR - €)', () => {
      const result = formatCurrency(1250.5, {
        code: 'EUR',
        symbol: '€',
        locale: 'es-ES',
        decimals: 2,
      });
      expect(result).toMatch(/1[.]?250,50/);
      expect(result).toContain('€');
    });

    it('debería formatear en Pesos Chilenos (CLP) sin decimales', () => {
      const result = formatCurrency(1250.5, {
        code: 'CLP',
        symbol: '$',
        locale: 'es-CL',
        decimals: 0,
      });
      expect(result).not.toContain(',50');
      expect(result).toMatch(/(1\.251|1\.250|1251|1250)/);
    });

    it('debería formatear en Real Brasileño (BRL - R$)', () => {
      const result = formatCurrency(1250.5, {
        code: 'BRL',
        symbol: 'R$',
        locale: 'pt-BR',
        decimals: 2,
      });
      expect(result).toContain('1.250,50');
      expect(result).toContain('R$');
    });

    it('debería soportar monedas personalizadas con fallback seguro', () => {
      const result = formatCurrency(5000, {
        code: 'CUSTOM_COIN',
        symbol: '💎',
        locale: 'es-AR',
        decimals: 2,
      });
      expect(result).toContain('💎');
      expect(result).toContain('5.000,00');
    });
  });

  describe('Sincronización de Moneda en localStorage', () => {
    it('debería leer la moneda configurada en localStorage automáticamente', () => {
      localStorage.setItem(
        'ferreteria_local_settings',
        JSON.stringify({
          businessName: 'Ferretería Global',
          currencyCode: 'USD',
          currencySymbol: 'US$',
          currencyLocale: 'en-US',
          currencyDecimals: 2,
        })
      );
      setCachedCurrencyConfig(null);

      const config = getActiveCurrencyConfig();
      expect(config.code).toBe('USD');
      expect(config.symbol).toBe('US$');
      expect(config.locale).toBe('en-US');

      const formatted = formatCurrency(100);
      expect(formatted).toContain('100.00');
    });
  });

  describe('Función cn (ClassNames Merge)', () => {
    it('debería combinar clases CSS condicionales y resolver conflictos Tailwind', () => {
      const result = cn('bg-red-500', false && 'hidden', 'text-white', 'bg-blue-500');
      expect(result).toContain('bg-blue-500');
      expect(result).not.toContain('bg-red-500');
      expect(result).toContain('text-white');
    });
  });
});
