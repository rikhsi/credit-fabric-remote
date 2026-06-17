import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { Router } from '@angular/router';
import { CardApplication } from '../../components';
import { ApplicationsService } from '../../services';
import { EmptyListPipe } from '@shared/pipes';
import { Empty } from '@shared/components';
import { ApplicationRoute, RootRoute } from '@app/constants/route-path';
import { ApplicationStatus } from '@api/models/los/application';
import { OnlineGetInfoResult } from '@api/models/los/online';

@Component({
  selector: 'cf-applications-list',
  imports: [CardApplication, NzSkeletonModule, EmptyListPipe, Empty, TranslocoDirective],
  templateUrl: './applications-list.html',
  styleUrl: './applications-list.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ApplicationsService],
})
export class ApplicationsList implements OnInit {
  private applicationService = inject(ApplicationsService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  readonly isLoading = computed(() => this.applicationService.isLoading());
  readonly items = computed(() => this.applicationService.applicationsList());

  ngOnInit(): void {
    this.applicationService.getApplications$().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  goToApplication(item: OnlineGetInfoResult): void {
    if (item.sysStatusId === ApplicationStatus.OnFormFill) {
      void this.router.navigate(['/', RootRoute.Application, ApplicationRoute.Flow, item.id]);
      return;
    }

    void this.router.navigate(['/', RootRoute.Applications, item.id]);
  }
}
