import { ErpBackupSnapshot, createBackupSnapshot } from './backup.service';

export interface GoogleDriveConfig {
  clientId: string;
  apiKey?: string;
  autoBackupEnabled: boolean;
  autoBackupIntervalHours: number;
  lastBackupDate?: string;
  connectedAccountEmail?: string;
}

export interface GoogleDriveBackupFile {
  id: string;
  name: string;
  size: number;
  createdTime: string;
  modifiedTime: string;
  webViewLink?: string;
}

const STORAGE_KEY_GDRIVE_CONFIG = '_ferr_gdrive_config';
const STORAGE_KEY_GDRIVE_TOKEN = '_ferr_gdrive_token';
const FOLDER_NAME = 'Ferreteria_ERP_Backups';

export function getGoogleDriveConfig(): GoogleDriveConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GDRIVE_CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return {
    clientId: (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '',
    apiKey: (import.meta as any).env?.VITE_GOOGLE_API_KEY || '',
    autoBackupEnabled: false,
    autoBackupIntervalHours: 24,
  };
}

export function saveGoogleDriveConfig(config: GoogleDriveConfig) {
  localStorage.setItem(STORAGE_KEY_GDRIVE_CONFIG, JSON.stringify(config));
}

export function getSavedGoogleToken(): string | null {
  return sessionStorage.getItem(STORAGE_KEY_GDRIVE_TOKEN) || localStorage.getItem(STORAGE_KEY_GDRIVE_TOKEN);
}

export function saveGoogleToken(token: string, persist = false) {
  if (persist) {
    localStorage.setItem(STORAGE_KEY_GDRIVE_TOKEN, token);
  } else {
    sessionStorage.setItem(STORAGE_KEY_GDRIVE_TOKEN, token);
  }
}

export function clearGoogleToken() {
  sessionStorage.removeItem(STORAGE_KEY_GDRIVE_TOKEN);
  localStorage.removeItem(STORAGE_KEY_GDRIVE_TOKEN);
}

/**
 * Busca o crea la carpeta 'Ferreteria_ERP_Backups' en Google Drive
 */
export async function getOrCreateBackupFolder(accessToken: string): Promise<string> {
  // 1. Buscar si ya existe
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`;
  const res = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Error al consultar Google Drive: ${res.statusText}`);
  }

  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  // 2. Si no existe, crear la carpeta
  const createUrl = 'https://www.googleapis.com/drive/v3/files';
  const createRes = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Copias de Seguridad automáticas del sistema Ferretería ERP',
    }),
  });

  if (!createRes.ok) {
    throw new Error(`Error al crear carpeta en Google Drive: ${createRes.statusText}`);
  }

  const newFolder = await createRes.json();
  return newFolder.id;
}

/**
 * Sube un archivo de backup JSON a Google Drive
 */
export async function uploadBackupToGoogleDrive(
  accessToken: string,
  snapshot?: ErpBackupSnapshot
): Promise<GoogleDriveBackupFile> {
  const backup = snapshot || createBackupSnapshot('Google Drive Cloud Backup');
  const folderId = await getOrCreateBackupFolder(accessToken);

  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
  const fileName = `backup_ferreteria_${dateStr}.json`;
  const fileContent = JSON.stringify(backup, null, 2);

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType: 'application/json',
    description: `Copia de seguridad Ferretería ERP (${backup.metadata.totals.products} productos, ${backup.metadata.totals.customers} clientes, ${backup.metadata.totals.sales} ventas)`,
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,createdTime,modifiedTime,webViewLink';
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al subir archivo a Google Drive (${res.status}): ${errorText}`);
  }

  const uploadedFile = await res.json();

  // Actualizar configuración con fecha de último backup
  const cfg = getGoogleDriveConfig();
  cfg.lastBackupDate = new Date().toISOString();
  saveGoogleDriveConfig(cfg);

  return {
    id: uploadedFile.id,
    name: uploadedFile.name,
    size: Number(uploadedFile.size || fileContent.length),
    createdTime: uploadedFile.createdTime || new Date().toISOString(),
    modifiedTime: uploadedFile.modifiedTime || new Date().toISOString(),
    webViewLink: uploadedFile.webViewLink,
  };
}

/**
 * Obtiene la lista de backups almacenados en la carpeta de Google Drive
 */
export async function listGoogleDriveBackups(accessToken: string): Promise<GoogleDriveBackupFile[]> {
  const folderId = await getOrCreateBackupFolder(accessToken);
  const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false&fields=files(id,name,size,createdTime,modifiedTime,webViewLink)&orderBy=createdTime desc`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Error al listar archivos de Google Drive: ${res.statusText}`);
  }

  const data = await res.json();
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    size: Number(f.size || 0),
    createdTime: f.createdTime,
    modifiedTime: f.modifiedTime,
    webViewLink: f.webViewLink,
  }));
}

/**
 * Descarga el contenido JSON de un backup alojado en Google Drive
 */
export async function downloadBackupFromGoogleDrive(
  fileId: string,
  accessToken: string
): Promise<ErpBackupSnapshot> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Error al descargar archivo desde Google Drive: ${res.statusText}`);
  }

  const content = await res.json();
  return content as ErpBackupSnapshot;
}
