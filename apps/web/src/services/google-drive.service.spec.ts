import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  getGoogleDriveConfig,
  saveGoogleDriveConfig,
  getSavedGoogleToken,
  saveGoogleToken,
  clearGoogleToken,
  getOrCreateBackupFolder,
  uploadBackupToGoogleDrive,
  listGoogleDriveBackups,
  downloadBackupFromGoogleDrive,
  GoogleDriveConfig,
} from './google-drive.service';
import { ErpBackupSnapshot, createBackupSnapshot } from './backup.service';

describe('Google Drive Service — Pruebas Unitarias ☁️', () => {
  const mockAccessToken = 'ya29.a0AfH6SM...test-token';

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Gestión de Configuración y Tokens', () => {
    it('debería retornar configuración por defecto si no hay nada en localStorage', () => {
      const config = getGoogleDriveConfig();
      expect(config.clientId).toBeDefined();
      expect(config.autoBackupEnabled).toBe(false);
      expect(config.autoBackupIntervalHours).toBe(24);
    });

    it('debería guardar y recuperar la configuración de Google Drive', () => {
      const customConfig: GoogleDriveConfig = {
        clientId: 'custom-client-id-1234.apps.googleusercontent.com',
        apiKey: 'AIzaSy...custom-api-key',
        autoBackupEnabled: true,
        autoBackupIntervalHours: 12,
        connectedAccountEmail: 'admin@ferreteria.com',
      };

      saveGoogleDriveConfig(customConfig);
      const retrieved = getGoogleDriveConfig();

      expect(retrieved.clientId).toBe(customConfig.clientId);
      expect(retrieved.autoBackupEnabled).toBe(true);
      expect(retrieved.autoBackupIntervalHours).toBe(12);
      expect(retrieved.connectedAccountEmail).toBe('admin@ferreteria.com');
    });

    it('debería gestionar almacenamiento y eliminación del token en session y localStorage', () => {
      expect(getSavedGoogleToken()).toBeNull();

      // Guardado temporal en sessionStorage
      saveGoogleToken('token-temp-abc', false);
      expect(getSavedGoogleToken()).toBe('token-temp-abc');

      // Guardado persistente en localStorage
      saveGoogleToken('token-persist-xyz', true);
      expect(getSavedGoogleToken()).toBe('token-temp-abc'); // sessionStorage toma precedencia

      // Limpieza total
      clearGoogleToken();
      expect(getSavedGoogleToken()).toBeNull();
    });
  });

  describe('Operaciones de Carpetas en Google Drive', () => {
    it('debería retornar el ID de la carpeta si ya existe en Drive', async () => {
      const fakeFolderId = 'folder-id-existing-999';
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          files: [{ id: fakeFolderId, name: 'Ferreteria_ERP_Backups' }],
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const folderId = await getOrCreateBackupFolder(mockAccessToken);

      expect(folderId).toBe(fakeFolderId);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch.mock.calls[0][0]).toContain('Ferreteria_ERP_Backups');
    });

    it('debería crear una nueva carpeta si no existe previamente', async () => {
      const newFolderId = 'folder-newly-created-777';
      const mockFetch = vi
        .fn()
        // 1ra llamada: búsqueda devuelve vacío
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ files: [] }),
        })
        // 2da llamada: creación de la carpeta
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: newFolderId, name: 'Ferreteria_ERP_Backups' }),
        });
      vi.stubGlobal('fetch', mockFetch);

      const folderId = await getOrCreateBackupFolder(mockAccessToken);

      expect(folderId).toBe(newFolderId);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch.mock.calls[1][1].method).toBe('POST');
      const body = JSON.parse(mockFetch.mock.calls[1][1].body);
      expect(body.name).toBe('Ferreteria_ERP_Backups');
      expect(body.mimeType).toBe('application/vnd.google-apps.folder');
    });

    it('debería lanzar un error si la API de Google Drive devuelve un fallo HTTP', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Unauthorized (Token Expirado)',
      });
      vi.stubGlobal('fetch', mockFetch);

      await expect(getOrCreateBackupFolder(mockAccessToken)).rejects.toThrow(
        'Error al consultar Google Drive: Unauthorized (Token Expirado)'
      );
    });
  });

  describe('Subida Multipart y Listado de Backups', () => {
    it('debería subir un archivo de backup con formato multipart y registrar la fecha', async () => {
      const mockSnapshot: ErpBackupSnapshot = createBackupSnapshot('Test Export');

      const mockFetch = vi
        .fn()
        // Búsqueda de carpeta
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ files: [{ id: 'fld-123' }] }),
        })
        // Subida multipart POST
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: 'gdrive-file-id-555',
            name: 'backup_ferreteria_2026.json',
            size: 4096,
            createdTime: '2026-09-10T15:00:00Z',
            webViewLink: 'https://drive.google.com/file/d/555',
          }),
        });
      vi.stubGlobal('fetch', mockFetch);

      const result = await uploadBackupToGoogleDrive(mockAccessToken, mockSnapshot);

      expect(result.id).toBe('gdrive-file-id-555');
      expect(result.size).toBe(4096);
      expect(result.webViewLink).toBe('https://drive.google.com/file/d/555');

      // Verificar que actualizó lastBackupDate en configuración
      const cfg = getGoogleDriveConfig();
      expect(cfg.lastBackupDate).toBeDefined();

      // Verificar cabeceras de la subida multipart
      const uploadCall = mockFetch.mock.calls[1];
      expect(uploadCall[1].method).toBe('POST');
      expect(uploadCall[1].headers['Content-Type']).toContain('multipart/related');
      expect(uploadCall[1].body).toContain('Ferretería ERP');
    });

    it('debería listar los archivos existentes en la carpeta de respaldos', async () => {
      const mockFetch = vi
        .fn()
        // Búsqueda de carpeta
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ files: [{ id: 'fld-123' }] }),
        })
        // Listado de archivos
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            files: [
              {
                id: 'file-1',
                name: 'backup_2026-09-01.json',
                size: '2048',
                createdTime: '2026-09-01T12:00:00Z',
                modifiedTime: '2026-09-01T12:00:00Z',
              },
              {
                id: 'file-2',
                name: 'backup_2026-09-08.json',
                size: '4096',
                createdTime: '2026-09-08T12:00:00Z',
                modifiedTime: '2026-09-08T12:00:00Z',
              },
            ],
          }),
        });
      vi.stubGlobal('fetch', mockFetch);

      const backups = await listGoogleDriveBackups(mockAccessToken);

      expect(backups).toHaveLength(2);
      expect(backups[0].id).toBe('file-1');
      expect(backups[0].size).toBe(2048);
      expect(backups[1].id).toBe('file-2');
    });

    it('debería descargar y deserializar el snapshot de un backup desde Google Drive', async () => {
      const mockSnapshotData: ErpBackupSnapshot = {
        metadata: {
          version: '1.0.0',
          appName: 'Ferreteria_ERP',
          createdAt: new Date().toISOString(),
          totals: { products: 1, customers: 0, sales: 0, quotes: 0, purchases: 0, suppliers: 0, categories: 0, coupons: 0 },
        },
        data: {
          products: [{ id: 'p1', name: 'Martillo Galponero' }],
          customers: [],
          sales: [],
          quotes: [],
          cashSession: null,
          cashMovements: [],
          categories: [],
          purchases: [],
          suppliers: [],
          settings: null,
          coupons: [],
          auditLogs: [],
          users: [],
          roles: [],
          ecommerceOrders: [],
        },
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockSnapshotData,
      });
      vi.stubGlobal('fetch', mockFetch);

      const downloaded = await downloadBackupFromGoogleDrive('file-123', mockAccessToken);

      expect(downloaded.metadata.appName).toBe('Ferreteria_ERP');
      expect(downloaded.data.products[0].name).toBe('Martillo Galponero');
      expect(mockFetch.mock.calls[0][0]).toContain('file-123?alt=media');
    });
  });
});
