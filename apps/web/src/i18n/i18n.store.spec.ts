import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useI18nStore } from './i18n.store';
import { LANGUAGE_STORAGE_KEY } from '@ferreteria/shared';

describe('i18n Store (useI18nStore)', () => {
  beforeEach(() => {
    localStorage.clear();
    useI18nStore.getState().setLanguage('es');
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('debería inicializar con el idioma predeterminado en español (es)', () => {
    const { language, t } = useI18nStore.getState();
    expect(language).toBe('es');
    expect(t('nav.pos')).toBe('Punto de Venta');
    expect(t('common.cancel')).toBe('Cancelar');
    expect(t('header.priceCheck')).toBe('Consultar Precio');
  });

  it('debería cambiar el idioma a inglés (en) y traducir cadenas correctamente', () => {
    const { setLanguage } = useI18nStore.getState();
    setLanguage('en');

    const state = useI18nStore.getState();
    expect(state.language).toBe('en');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    expect(document.documentElement.lang).toBe('en');

    expect(state.t('nav.pos')).toBe('Point of Sale');
    expect(state.t('nav.inventory')).toBe('Inventory');
    expect(state.t('common.save')).toBe('Save');
    expect(state.t('common.delete')).toBe('Delete');
    expect(state.t('header.accessibility')).toBe('Accessibility');
    expect(state.t('pos.emptyCart')).toBe('Cart is empty');
    expect(state.t('checkoutModal.confirmSale')).toBe('Confirm Sale & Charge');
  });

  it('debería cambiar el idioma a portugués (pt) y traducir cadenas correctamente', () => {
    const { setLanguage } = useI18nStore.getState();
    setLanguage('pt');

    const state = useI18nStore.getState();
    expect(state.language).toBe('pt');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('pt');
    expect(document.documentElement.lang).toBe('pt');

    expect(state.t('nav.pos')).toBe('Frente de Caixa (PDV)');
    expect(state.t('nav.inventory')).toBe('Estoque');
    expect(state.t('common.save')).toBe('Salvar');
    expect(state.t('common.delete')).toBe('Excluir');
    expect(state.t('header.accessibility')).toBe('Acessibilidade');
    expect(state.t('pos.emptyCart')).toBe('O carrinho está vazio');
    expect(state.t('checkoutModal.confirmSale')).toBe('Confirmar Venda e Receber');
  });

  it('debería cambiar el idioma a francés (fr) y traducir cadenas correctamente', () => {
    const { setLanguage } = useI18nStore.getState();
    setLanguage('fr');

    const state = useI18nStore.getState();
    expect(state.language).toBe('fr');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('fr');
    expect(document.documentElement.lang).toBe('fr');

    expect(state.t('nav.pos')).toBe('Point de Vente (Caisse)');
    expect(state.t('nav.inventory')).toBe('Gestion des Stocks');
    expect(state.t('common.save')).toBe('Enregistrer');
    expect(state.t('common.delete')).toBe('Supprimer');
    expect(state.t('header.accessibility')).toBe('Accessibilité');
    expect(state.t('pos.emptyCart')).toBe('Le panier est vide');
    expect(state.t('checkoutModal.confirmSale')).toBe('Confirmer la Vente et Clôturer');
  });

  it('debería interpolar variables correctamente con {param}', () => {
    const { setLanguage, t } = useI18nStore.getState();
    setLanguage('es');

    const announcementEs = t('voice.productAnnouncement', {
      name: 'Taladro Percutor',
      price: '$45.000',
      stock: 8,
    });
    expect(announcementEs).toBe('Taladro Percutor. Precio: $45.000. Stock disponible: 8 unidades.');

    setLanguage('en');
    const stateEn = useI18nStore.getState();
    const announcementEn = stateEn.t('voice.productAnnouncement', {
      name: 'Hammer Drill',
      price: '$45.00',
      stock: 8,
    });
    expect(announcementEn).toBe('Hammer Drill. Price: $45.00. In stock: 8 units.');
  });

  it('debería realizar fallback al español si una clave no existe en el idioma destino', () => {
    const { setLanguage, t } = useI18nStore.getState();
    setLanguage('fr');

    // Clave válida en el sistema
    expect(t('nav.dashboard')).toBe('Tableau de Bord');

    // Clave inexistente en cualquier idioma debe retornar la clave original
    expect(t('inexistente.subclave' as any)).toBe('inexistente.subclave');
  });

  it('debería despachar el evento language-changed al alternar idioma', () => {
    const eventSpy = vi.fn();
    window.addEventListener('language-changed', eventSpy);

    const { setLanguage } = useI18nStore.getState();
    setLanguage('pt');

    expect(eventSpy).toHaveBeenCalledTimes(1);
    window.removeEventListener('language-changed', eventSpy);
  });
});
