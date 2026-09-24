import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivationEnd, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { filter, map, merge, startWith } from 'rxjs';
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

  /**
   * Recompute titles after i18n JSON loads — sync `translate()` returns the key
   * until `translationLoadSuccess`, which previously stuck the header on "application.number".
   */
  private readonly i18nTick = toSignal(
    merge(
      this.transloco.langChanges$,
      this.transloco.events$.pipe(
        filter((event) => event.type === 'translationLoadSuccess' || event.type === 'langChanged'),
        map(() => this.transloco.getActiveLang()),
      ),
    ).pipe(startWith(this.transloco.getActiveLang())),
    { initialValue: this.transloco.getActiveLang() },
  );

  public pageTitle = computed(() => {
    this.i18nTick();

    const data = this.data();
    const url = this.currentUrl();
    // URL first — on hard reload child route data/params often lag behind the address bar.
    const id =
      getApplicationIdFromUrl(url) ||
      getRouteParam(this.router.routerState.snapshot.root, RouteParam.AppId) ||
      data?.applicationId ||
      '';

    if (id || data?.title === 'application.number') {
      return this.transloco.translate('application.number', { id });
    }

    const title = data?.title;

    if (!title) {
      return '';
    }

    return isTranslationKey(title) ? this.transloco.translate(title) : title;
  });

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
