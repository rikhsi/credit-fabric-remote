import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { ApplicationsDetailService } from '../../services';
import {
  ViewApproved,
  ViewDecline,
  ViewDeclineClient,
  ViewError,
  ViewInProgress,
  ViewIssued,
  ViewOnDecision,
  ViewOnDesign,
  ViewSigned,
} from './components';
import { ApplicationStatus } from '@api/models/los/application';
import { RootRoute } from '@app/constants/route-path';
import { RouteParam } from '@app/constants/route-param';

@Component({
  selector: 'cf-applications-detail',
  imports: [
    NzSkeletonModule,
    ViewInProgress,
    ViewDecline,
    ViewError,
    ViewOnDesign,
    ViewOnDecision,
    ViewApproved,
    ViewSigned,
    ViewIssued,
    ViewDeclineClient,
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
  readonly application = computed(() => this.applicationsDetailService.application());
  readonly accounts = computed(() => this.applicationsDetailService.accounts());
  readonly status = ApplicationStatus;

  get applicationId(): number {
    return Number(this.route.snapshot.params[RouteParam.AppId]);
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
