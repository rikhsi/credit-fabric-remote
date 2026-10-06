import { Injectable } from '@angular/core';
import { catchError, finalize, Observable, of, shareReplay, Subject, take, timeout } from 'rxjs';

const TOKEN_REFRESH_TIMEOUT_MS = 30_000;

@Injectable({
  providedIn: 'root',
})
export class TokenRefreshService {
  private readonly refreshCompleted$ = new Subject<boolean>();
  private refreshWaiters$: Observable<boolean> | null = null;
  private refreshFailed = false;

  get isRefreshing(): boolean {
    return this.refreshWaiters$ !== null;
  }

  consumeRefreshFailed(): boolean {
    const failed = this.refreshFailed;
    this.refreshFailed = false;
    return failed;
  }

  /**
   * Starts (or joins) a single host token refresh.
   * Subscribes to the completion signal before invoking `trigger`, so a sync
   * `onTokenRefresh` callback from the host is not missed.
   */
  ensureRefresh(trigger: () => void): Observable<boolean> {
    if (!this.refreshWaiters$) {
      this.refreshWaiters$ = new Observable<boolean>((subscriber) => {
        const inner = this.refreshCompleted$
          .pipe(
            take(1),
            timeout({
              first: TOKEN_REFRESH_TIMEOUT_MS,
              with: () => {
                this.markRefreshFailed();
                return of(false);
              },
            }),
            catchError(() => {
              this.markRefreshFailed();
              return of(false);
            }),
          )
          .subscribe(subscriber);

        trigger();

        return () => inner.unsubscribe();
      }).pipe(
        shareReplay({ bufferSize: 1, refCount: false }),
        finalize(() => {
          this.refreshWaiters$ = null;
        }),
      );
    }

    return this.refreshWaiters$;
  }

  completeRefresh(success: boolean): void {
    if (!success) {
      this.markRefreshFailed();
    }

    this.refreshCompleted$.next(success);
  }

  private markRefreshFailed(): void {
    this.refreshFailed = true;
  }
}
