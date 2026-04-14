import { HttpParams } from '@angular/common/http';

export function buildHttpParams<T extends object>(filters: T): HttpParams {
  let params = new HttpParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params = params.set(key, String(value));
    }
  });

  return params;
}

export function buildQueryParams<T extends object>(filters: T): Partial<T> {
  const cleaned: Partial<T> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      cleaned[key as keyof T] = value as T[keyof T];
    }
  });

  return cleaned;
}

export function parseQueryParams<T extends Record<string, unknown>>(params: Record<string, unknown>): T {
  const parsed: Record<string, unknown> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (typeof value === 'string') {
      const trimmed = value.trim();

      // number
      if (trimmed !== '' && !isNaN(Number(trimmed))) {
        parsed[key] = Number(trimmed);
        return;
      }

      // boolean
      if (trimmed === 'true') {
        parsed[key] = true;
        return;
      }

      if (trimmed === 'false') {
        parsed[key] = false;
        return;
      }

      parsed[key] = trimmed;
      return;
    }

    // если вдруг не строка — оставляем как есть
    parsed[key] = value;
  });

  return parsed as T;
}
