import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { BridgeService } from '@core/services/bridge.service';
import { LayoutHeader } from '@layouts/components';
import { LoanLayoutService } from '@layouts/services';

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

  public data = computed(() => this.loanLayoutService.routData());

  ngOnInit(): void {
    this.loanLayoutService.initRouterEvents().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  onClose(): void {
    this.bridgeService.onCloseClick();
  }
}
