import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { ApplicationsDetailService } from '../../services';
import {
  ViewApproved,
  ViewDecline,
  ViewDeclineClient,
  ViewError,
  ViewInProgress,
  ViewIssued,
  ViewOnDesign,
  ViewSigned,
} from './components';
import { Refresher, RefresherEvent } from '@shared/components';
import { ApplicationStatus } from '@api/models/los/application';
import { RootRoute } from '@app/constants/route-path';
import { RouteParam } from '@app/constants/route-param';

@Component({
  selector: 'cf-applications-detail',
  imports: [
    NzSkeletonModule,
    NzSpinComponent,
    ViewInProgress,
    ViewDecline,
    ViewError,
    ViewOnDesign,
    ViewApproved,
    ViewSigned,
    ViewIssued,
    ViewDeclineClient,
    Refresher,
  ],
  templateUrl: './applications-detail.html',
  styleUrl: './applications-detail.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ApplicationsDetailService],
})
export class ApplicationsDetail implements OnInit {
  private readonly applicationsDetailService = inject(ApplicationsDetailService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = computed(() => this.applicationsDetailService.isLoading());
  readonly isRefreshing = computed(() => this.applicationsDetailService.isRefreshing());
  readonly application = computed(() => this.applicationsDetailService.application());
  readonly status = ApplicationStatus;

  get applicationId(): number {
    return Number(this.route.snapshot.params[RouteParam.AppId]);
  }

  onRefresh(event: RefresherEvent): void {
    this.applicationsDetailService
      .reload$(this.applicationId)
      .pipe(
        finalize(() => event.complete()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.applicationsDetailService
      .getApplication$(this.applicationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => {
          void this.router.navigate(['/', RootRoute.Applications]);
        },
      });
  }
}
