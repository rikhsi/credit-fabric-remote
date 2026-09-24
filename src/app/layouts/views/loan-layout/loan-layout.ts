import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { filter, map, startWith } from 'rxjs';
import { BridgeService } from '@core/services/bridge.service';
import { LayoutHeader } from '@layouts/components';
import { LoanLayoutService } from '@layouts/services';
import { getApplicationIdFromUrl, getRouteParam } from '@layouts/utils';
import { RouteParam } from '@app/constants/route-param';
import { SwipeBackDirective } from '@shared/directives';

function isTranslationKey(title: string): boolean {
  return /^[a-z][\w.]*$/i.test(title);
}

@Component({
  selector: 'cf-loan-layout',
  imports: [LayoutHeader, RouterOutlet, SwipeBackDirective],
  templateUrl: './loan-layout.html',
  styleUrl: './loan-layout.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LoanLayoutService],
})
export class LoanLayout implements OnInit {
  private loanLayoutService = inject(LoanLayoutService);
  private destroyRef = inject(DestroyRef);
  private bridgeService = inject(BridgeService);
  private transloco = inject(TranslocoService);
  private router = inject(Router);

  private readonly header = viewChild.required(LayoutHeader);

  public data = computed(() => this.loanLayoutService.routData());
  public readonly canSwipeBack = computed(() => Boolean(this.data()?.backConfig?.link));

  /** Keep title in sync on hard reload when route snapshot lags behind the URL. */
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  public pageTitle = computed(() => {
    const title = this.data()?.title;
    const url = this.currentUrl();
    const idFromUrl = getApplicationIdFromUrl(url);
    const id =
      getRouteParam(this.router.routerState.snapshot.root, RouteParam.AppId) ||
      this.data()?.applicationId ||
      idFromUrl ||
      '';

    // Hard reload can briefly expose only parent route data; URL still has the id.
    if (title === 'application.number' || idFromUrl) {
      return this.transloco.translate('application.number', { id });
    }

    if (!title) {
      return '';
    }

    return isTranslationKey(title) ? this.transloco.translate(title) : title;
  });

  ngOnInit(): void {
    this.loanLayoutService.initRouterEvents().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  onClose(): void {
    this.bridgeService.onCloseClick();
  }

  onSwipeBack(): void {
    if (!this.canSwipeBack()) {
      return;
    }

    this.header().goBack();
  }
}
