'use client';

class StorageService {
  setItem<T = unknown>(key: string, value: T): void {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  }

  getItem<T>(key: string): T | undefined {
    const serializedValue = localStorage.getItem(key);

    if (serializedValue === null) {
      return undefined;
    }

    return JSON.parse(serializedValue) as T;
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}

const storageService = new StorageService();

export { storageService };
