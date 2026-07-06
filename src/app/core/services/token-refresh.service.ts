import { Injectable } from '@angular/core';
import { catchError, finalize, Observable, of, shareReplay, Subject, Subscription, take, timeout } from 'rxjs';

const TOKEN_REFRESH_TIMEOUT_MS = 30_000;

@Injectable({
  providedIn: 'root',
})
export class TokenRefreshService {
  private readonly refreshCompleted$ = new Subject<boolean>();
  private refreshWaiters$: Observable<boolean> | null = null;
  private waiterConnectSub: Subscription | null = null;
  private refreshFailed = false;

  get isRefreshing(): boolean {
    return this.refreshWaiters$ !== null;
  }

  consumeRefreshFailed(): boolean {
    const failed = this.refreshFailed;
    this.refreshFailed = false;
    return failed;
  }

  waitForRefresh(): Observable<boolean> {
    this.ensureRefreshWaiters();

    return this.refreshWaiters$!;
  }

  startRefresh(): void {
    this.ensureRefreshWaiters();
    this.connectWaiters();
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

  private connectWaiters(): void {
    if (this.waiterConnectSub || !this.refreshWaiters$) {
      return;
    }

    this.waiterConnectSub = this.refreshWaiters$!.subscribe({
      complete: () => {
        this.waiterConnectSub = null;
      },
    });
  }

  private ensureRefreshWaiters(): void {
    if (this.refreshWaiters$) {
      return;
    }

    this.refreshWaiters$ = this.refreshCompleted$.pipe(
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
      shareReplay({ bufferSize: 1, refCount: false }),
      finalize(() => {
        this.refreshWaiters$ = null;
        this.waiterConnectSub?.unsubscribe();
        this.waiterConnectSub = null;
      }),
    );
  }
}
