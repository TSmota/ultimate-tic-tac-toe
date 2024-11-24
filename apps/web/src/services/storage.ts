'use client';

class StorageService {
  setItem<T = unknown>(key: string, value: T): void {
    const serializedValue = JSON.stringify(value);
    sessionStorage.setItem(key, serializedValue);
  }

  getItem<T>(key: string): T | undefined {
    const serializedValue = sessionStorage.getItem(key);

    if (serializedValue === null) {
      return undefined;
    }

    return JSON.parse(serializedValue) as T;
  }

  removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }
}

const storageService = new StorageService();

export { storageService };
