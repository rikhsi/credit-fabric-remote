import { inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Observable, tap } from 'rxjs';
import { SplashService } from '@core/services';
import { getCurrentRouteData, getRootSnapshot } from '@layouts/utils';

@Injectable()
export class LoanApplicationLayoutService {
  private router = inject(Router);
  private splashService = inject(SplashService);

  readonly title = signal<string>(null);

  public initRouterEvents(): Observable<NavigationEnd> {
    queueMicrotask(() => {
      this.router.navigate([], { onSameUrlNavigation: 'reload', queryParamsHandling: 'preserve' });
    });

    return this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      tap(() => {
        this.updateActions();
        this.splashService.hide = true;
      }),
    );
  }

  private updateActions(): void {
    const snapshot = getRootSnapshot(this.router);
    const currentSnapshot = getCurrentRouteData(snapshot);

    this.title.set((currentSnapshot['title'] as string) ?? null);
  }
}
