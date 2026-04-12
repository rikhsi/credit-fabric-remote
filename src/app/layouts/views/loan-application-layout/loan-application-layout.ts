import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { LayoutHeader } from '@layouts/components';
import { LoanApplicationLayoutService } from '@layouts/services';

@Component({
  selector: 'cf-loan-application-layout',
  imports: [LayoutHeader, RouterOutlet, TranslocoDirective],
  templateUrl: './loan-application-layout.html',
  styleUrl: './loan-application-layout.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LoanApplicationLayoutService],
})
export class LoanApplicationLayout implements OnInit {
  private loanLayoutService = inject(LoanApplicationLayoutService);
  private destroyRef = inject(DestroyRef);

  public data = computed(() => this.loanLayoutService.routData());

  ngOnInit(): void {
    this.loanLayoutService.initRouterEvents().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}
