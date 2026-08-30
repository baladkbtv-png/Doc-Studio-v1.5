import { StudioFile, Template } from './types';

const DB_NAME = 'DocumentStudioDB_v1_5';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject('SSR environment');
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('files')) {
        const fileStore = db.createObjectStore('files', { keyPath: 'id' });
        fileStore.createIndex('type', 'type', { unique: false });
        fileStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
      if (!db.objectStoreNames.contains('templates')) {
        db.createObjectStore('templates', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllFiles(): Promise<StudioFile[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readonly');
      const store = tx.objectStore('files');
      const request = store.getAll();
      request.onsuccess = () => {
        const files = (request.result || []) as StudioFile[];
        files.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(files);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

export async function getFileById(id: string): Promise<StudioFile | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readonly');
      const store = tx.objectStore('files');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

export async function saveFile(file: StudioFile): Promise<StudioFile> {
  file.updatedAt = Date.now();
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      const request = store.put(file);
      request.onsuccess = () => resolve(file);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return file;
  }
}

export async function deleteFile(id: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return false;
  }
}

export async function duplicateFile(file: StudioFile): Promise<StudioFile> {
  const dup: StudioFile = {
    ...file,
    id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: `${file.name} (Copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await saveFile(dup);
  return dup;
}

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const request = store.get(key);
      request.onsuccess = () => {
        if (request.result && request.result.value !== undefined) {
          resolve(request.result.value as T);
        } else {
          const localVal = localStorage.getItem(`docstudio_${key}`);
          if (localVal) {
            try { resolve(JSON.parse(localVal)); return; } catch {}
          }
          resolve(defaultValue);
        }
      };
      request.onerror = () => resolve(defaultValue);
    });
  } catch {
    const localVal = localStorage.getItem(`docstudio_${key}`);
    if (localVal) {
      try { return JSON.parse(localVal); } catch {}
    }
    return defaultValue;
  }
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`docstudio_${key}`, JSON.stringify(value));
    const db = await openDB();
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    store.put({ key, value });
  } catch {}
}

export async function getCustomTemplates(): Promise<Template[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('templates', 'readonly');
      const store = tx.objectStore('templates');
      const request = store.getAll();
      request.onsuccess = () => resolve((request.result || []) as Template[]);
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function saveCustomTemplate(template: Template): Promise<Template> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('templates', 'readwrite');
      const store = tx.objectStore('templates');
      const request = store.put(template);
      request.onsuccess = () => resolve(template);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return template;
  }
}

export async function deleteCustomTemplate(id: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('templates', 'readwrite');
      const store = tx.objectStore('templates');
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}
