import { inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router, UrlTree } from '@angular/router';
import { filter, Observable, Subject, tap } from 'rxjs';
import { getApplicationIdFromUrl, getCurrentRouteData, getRootSnapshot, getRouteParam } from '@layouts/utils';
import { LoanLayoutData } from '@layouts/models';
import { SplashService } from '@core/services/splash.service';
import { RouteParam } from '@app/constants/route-param';

@Injectable()
export class LoanLayoutService {
  private router = inject(Router);
  private splashService = inject(SplashService);

  readonly routData = signal<LoanLayoutData>(null);

  private readonly backClickSubject = new Subject<void>();
  readonly backClick$ = this.backClickSubject.asObservable();

  private backHandled = false;

  public initRouterEvents(): Observable<NavigationEnd> {
    // Initial NavigationEnd can fire before LoanLayout subscribes (hard reload).
    queueMicrotask(() => {
      this.syncFromRouter();
      this.splashService.hide = true;
    });

    return this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      tap(() => {
        this.syncFromRouter();
        this.splashService.hide = true;
      }),
    );
  }

  /** Re-read route tree (safe to call after ActivationEnd / hard reload). */
  syncFromRouter(): void {
    this.updateActions();
  }

  /** Header / swipe-back entry point. Page can claim the click via `handleBackClick()`. */
  emitBackClick(): void {
    this.backHandled = false;
    this.backClickSubject.next();

    if (!this.backHandled) {
      this.navigateByBackConfig();
    }
  }

  handleBackClick(): void {
    this.backHandled = true;
  }

  navigateByBackConfig(): void {
    const link = this.routData()?.backConfig?.link;

    if (!link) {
      return;
    }

    if (link instanceof UrlTree) {
      void this.router.navigateByUrl(link);
      return;
    }

    if (Array.isArray(link)) {
      void this.router.navigate(link);
      return;
    }

    void this.router.navigateByUrl(link);
  }

  private updateActions(): void {
    const snapshot = getRootSnapshot(this.router);
    const currentSnapshot = getCurrentRouteData<LoanLayoutData>(snapshot);
    const applicationId =
      getApplicationIdFromUrl(this.router.url) ||
      getRouteParam(snapshot, RouteParam.AppId) ||
      currentSnapshot?.applicationId ||
      (typeof window !== 'undefined' ? getApplicationIdFromUrl(window.location.pathname) : null) ||
      undefined;

    this.routData.set({
      ...currentSnapshot,
      ...(applicationId ? { applicationId: String(applicationId) } : {}),
    });
  }
}
