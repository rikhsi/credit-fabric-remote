import { inject, Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Observable, tap } from 'rxjs';
import { SplashService } from '@core/services';

@Injectable()
export class LoanApplicationLayoutService {
  private router = inject(Router);
  private splashService = inject(SplashService);

  public initRouterEvents(): Observable<NavigationEnd> {
    queueMicrotask(() => {
      this.router.navigate([], { onSameUrlNavigation: 'reload', queryParamsHandling: 'preserve' });
    });

    return this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      tap(() => {
        this.splashService.hide = true;
      }),
    );
  }
}
