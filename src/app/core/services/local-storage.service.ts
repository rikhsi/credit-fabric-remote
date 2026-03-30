import { Injectable } from '@angular/core';
import { LocalStorageItem } from '@constants';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  public setItem<T>(key: LocalStorageItem, value: T): void {
    try {
      const jsonValue = JSON.stringify(value);
      localStorage.setItem(key, jsonValue);
    } catch (error: unknown) {}
  }

  public getItem<T>(key: LocalStorageItem): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch (error: unknown) {
      return null;
    }
  }

  public removeItem(key: LocalStorageItem): void {
    localStorage.removeItem(key);
  }

  public hasKey(key: LocalStorageItem): boolean {
    return localStorage.getItem(key) !== null;
  }

  public clear(): void {
    localStorage.clear();
  }
}
