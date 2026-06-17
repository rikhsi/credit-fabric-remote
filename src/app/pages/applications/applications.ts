import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { Router } from '@angular/router';
import { CardApplication } from './components';
import { ApplicationsService } from './services';
import { EmptyListPipe } from '@shared/pipes';
import { Empty } from '@shared/components';
import { ApplicationRoute, RootRoute } from '@app/constants/route-path';

@Component({
  selector: 'cf-applications',
  imports: [CardApplication, NzSkeletonModule, EmptyListPipe, Empty, TranslocoDirective],
  templateUrl: './applications.html',
  styleUrl: './applications.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ApplicationsService],
})
export class Applications implements OnInit {
  private applicationService = inject(ApplicationsService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  readonly isLoading = computed(() => this.applicationService.isLoading());
  readonly items = computed(() => this.applicationService.applicationsList());

  ngOnInit(): void {
    this.applicationService.getApplications$().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  goToApplication(id: number): void {
    void this.router.navigate([`/${RootRoute.Application}/${ApplicationRoute.Flow}/${id}`]);
  }
}
