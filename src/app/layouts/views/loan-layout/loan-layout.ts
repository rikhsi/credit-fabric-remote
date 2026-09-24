import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, viewChild } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivationEnd, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { filter, map, of, startWith, switchMap } from 'rxjs';
import { BridgeService } from '@core/services/bridge.service';
import { LayoutHeader } from '@layouts/components';
import { LoanLayoutService } from '@layouts/services';
import { getApplicationIdFromUrl, getRouteParam } from '@layouts/utils';
import { RouteParam } from '@app/constants/route-param';
import { SwipeBackDirective } from '@shared/directives';

function isTranslationKey(title: string): boolean {
  return /^[a-z][\w.]*$/i.test(title);
}

type TitleSpec = { key: string; params: Record<string, string>; raw?: string };

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

  private readonly titleSpec = computed<TitleSpec>(() => {
    const data = this.data();
    const url = this.currentUrl();
    const id =
      getApplicationIdFromUrl(url) ||
      getRouteParam(this.router.routerState.snapshot.root, RouteParam.AppId) ||
      data?.applicationId ||
      '';

    if (id || data?.title === 'application.number') {
      return { key: 'application.number', params: { id } };
    }

    const title = data?.title;

    if (!title) {
      return { key: '', params: {} };
    }

    if (isTranslationKey(title)) {
      return { key: title, params: {} };
    }

    return { key: '', params: {}, raw: title };
  });

  /**
   * `selectTranslate` waits until i18n JSON is loaded — sync `translate()` on hard reload
   * returned the raw key ("application.number") and never refreshed when lang tick stayed the same.
   */
  public readonly pageTitle = toSignal(
    toObservable(this.titleSpec).pipe(
      switchMap((spec) => {
        if (spec.raw) {
          return of(spec.raw);
        }

        if (!spec.key) {
          return of('');
        }

        return this.transloco.selectTranslate<string>(spec.key, spec.params);
      }),
    ),
    { initialValue: '' },
  );

  ngOnInit(): void {
    this.loanLayoutService.initRouterEvents().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();

    // Lazy child activate can finish after the initial NavigationEnd we missed.
    this.router.events
      .pipe(
        filter((event): event is ActivationEnd => event instanceof ActivationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.loanLayoutService.syncFromRouter());
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
