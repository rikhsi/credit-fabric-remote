import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { BridgeService } from '@core/services/bridge.service';
import { LayoutHeader } from '@layouts/components';
import { LoanLayoutService } from '@layouts/services';
import { getRouteParam } from '@layouts/utils';
import { RouteParam } from '@app/constants/route-param';

function isTranslationKey(title: string): boolean {
  return /^[a-z][\w.]*$/i.test(title);
}

@Component({
  selector: 'cf-loan-layout',
  imports: [LayoutHeader, RouterOutlet],
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

  public data = computed(() => this.loanLayoutService.routData());
  public pageTitle = computed(() => {
    const title = this.data()?.title;

    if (!title) {
      return '';
    }

    if (title === 'application.number') {
      const id = this.data()?.applicationId ?? getRouteParam(this.router.routerState.snapshot.root, RouteParam.AppId) ?? '';

      return this.transloco.translate('application.number', { id });
    }

    return isTranslationKey(title) ? this.transloco.translate(title) : title;
  });

  ngOnInit(): void {
    this.loanLayoutService.initRouterEvents().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  onClose(): void {
    this.bridgeService.onCloseClick();
  }
}
