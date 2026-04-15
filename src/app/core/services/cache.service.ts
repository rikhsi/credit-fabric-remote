import { Injectable } from '@angular/core';
import { Observable, finalize, of, shareReplay, tap } from 'rxjs';
import { HttpEvent, HttpHeaders, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class CacheService {
  private responseCache = new Map<string, HttpResponse<unknown>>();
  private inFlightCache = new Map<string, Observable<HttpEvent<unknown>>>();

  buildKey(req: HttpRequest<unknown>): string {
    const params = this.serializeParams(req.params);
    const headers = this.serializeHeaders(req.headers);
    const query = params ? `?${params}` : '';
    const headerBlock = headers ? `::${headers}` : '';

    return `${req.method}:${req.url}${query}${headerBlock}`;
  }

  get(key: string, factory: () => Observable<HttpEvent<unknown>>) {
    const cached = this.responseCache.get(key);
    if (cached) {
      return of(cached.clone());
    }

    const inFlight = this.inFlightCache.get(key);
    if (inFlight) {
      return inFlight;
    }

    const request$ = factory().pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          this.responseCache.set(key, event);
        }
      }),
      finalize(() => {
        this.inFlightCache.delete(key);
      }),
      shareReplay(1),
    );

    this.inFlightCache.set(key, request$);

    return request$;
  }

  invalidate(key: string) {
    this.responseCache.delete(key);
    this.inFlightCache.delete(key);
  }

  invalidateByPrefix(prefix: string) {
    for (const key of this.responseCache.keys()) {
      if (key.startsWith(prefix)) {
        this.responseCache.delete(key);
      }
    }
  }

  clearAll() {
    this.responseCache.clear();
    this.inFlightCache.clear();
  }

  private serializeParams(params: HttpParams): string {
    const keys = params.keys().sort();
    const normalized: string[] = [];

    for (const key of keys) {
      const values = (params.getAll(key) ?? []).map((value) => value ?? '').sort();

      for (const value of values) {
        normalized.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }

    return normalized.join('&');
  }

  private serializeHeaders(headers: HttpHeaders): string {
    const dynamicHeaders = ['accept-language'];
    const normalized: string[] = [];

    for (const header of dynamicHeaders) {
      const values = headers.getAll(header);

      if (!values?.length) {
        continue;
      }

      for (const value of [...values].sort()) {
        normalized.push(`${header}=${value}`);
      }
    }

    return normalized.join('&');
  }
}
