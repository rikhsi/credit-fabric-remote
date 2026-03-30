import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
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
  private router = inject(Router);
  private loanLayoutService = inject(LoanLayoutService);
  private destroyRef = inject(DestroyRef);

  public title = computed(() => this.loanLayoutService.title());

  ngOnInit(): void {
    this.loanLayoutService.initRouterEvents().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();

    this.router.navigate([], { onSameUrlNavigation: 'reload', queryParamsHandling: 'preserve' });
  }
}
