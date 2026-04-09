import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { LayoutHeader } from '@layouts/components';
import { LoanApplicationLayoutService } from '@layouts/services';

@Component({
  selector: 'cf-loan-application-layout',
  imports: [LayoutHeader, RouterOutlet, NzTagComponent, TranslocoDirective],
  templateUrl: './loan-application-layout.html',
  styleUrl: './loan-application-layout.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LoanApplicationLayoutService],
})
export class LoanApplicationLayout implements OnInit {
  lalService = inject(LoanApplicationLayoutService);
  destroyRef = inject(DestroyRef);

  title = computed(() => this.lalService.title());

  ngOnInit(): void {
    this.lalService.initRouterEvents().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}
