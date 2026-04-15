import { Injectable } from '@angular/core';
import { Observable, of, shareReplay } from 'rxjs';
import { HttpEvent } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class CacheService {
  private responseCache = new Map<string, HttpEvent<unknown>>();
  private inFlightCache = new Map<string, Observable<HttpEvent<unknown>>>();

  get(key: string, factory: () => Observable<HttpEvent<unknown>>) {
    // 1. cache hit
    const cached = this.responseCache.get(key);
    if (cached) {
      return of(cached);
    }

    // 2. in-flight dedupe (🔥 VERY IMPORTANT)
    const inFlight = this.inFlightCache.get(key);
    if (inFlight) {
      return inFlight;
    }

    // 3. create request
    const request$ = factory().pipe(shareReplay(1));

    this.inFlightCache.set(key, request$);

    request$.subscribe({
      next: (res) => {
        this.responseCache.set(key, res);
      },
      complete: () => {
        this.inFlightCache.delete(key);
      },
      error: () => {
        this.inFlightCache.delete(key);
      },
    });

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
}
