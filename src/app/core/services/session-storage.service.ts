import { Injectable } from '@angular/core';
import { SessionStorageItem } from '@app/constants/session-storage';

@Injectable({
  providedIn: 'root',
})
export class SessionStorageService {
  public setItem<T>(key: SessionStorageItem, value: T): void {
    try {
      const jsonValue = JSON.stringify(value);
      sessionStorage.setItem(key, jsonValue);
    } catch (error: unknown) {}
  }

  public getItem<T>(key: SessionStorageItem): T | null {
    try {
      const item = sessionStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch (error: unknown) {
      return null;
    }
  }

  public removeItem(key: SessionStorageItem): void {
    sessionStorage.removeItem(key);
  }

  public hasKey(key: SessionStorageItem): boolean {
    return sessionStorage.getItem(key) !== null;
  }

  public clear(): void {
    sessionStorage.clear();
  }
}
