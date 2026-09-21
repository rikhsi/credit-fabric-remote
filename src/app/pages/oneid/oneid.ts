import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslocoDirective, translate } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { finalize, map, of, switchMap, take } from 'rxjs';
import { environment } from 'src/environments/development';
import { OnlineApiService } from '@api/controllers/los/online-api.service';
import { BounceDirective } from '@shared/directives';
import { ImagePipe } from '@shared/pipes';
import { LoanRoute, RootRoute } from '@app/constants/route-path';
import { LoanDraftService } from '@core/services/loan-draft.service';
import { ToastService } from '@core/services/toast.service';
import { showApplicationErrorToast, showApplicationSuccessToast } from '@pages/loan/utils/application-toast';
import { ONE_ID_INSTRUCTION_STEPS } from '@pages/oneid/data/one-id';

@Component({
  selector: 'cf-oneid',
  imports: [TranslocoDirective, NzButtonComponent, NzIconDirective, NzTypographyComponent, BounceDirective, ImagePipe],
  templateUrl: './oneid.html',
  styleUrl: './oneid.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OneId {
  private readonly toast = inject(ToastService);
  private readonly onlineApi = inject(OnlineApiService);
  private readonly loanDraft = inject(LoanDraftService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly steps = ONE_ID_INSTRUCTION_STEPS;

  goToOneId(): void {
    window.open(environment.oneIdUrl, '_blank');
  }

  checkPermission(): void {
    if (this.loading()) {
      return;
    }

    const draft = this.loanDraft.read();

    if (!draft) {
      void this.router.navigate(['/', RootRoute.Loan, LoanRoute.List]);
      return;
    }

    this.loading.set(true);

    this.onlineApi
      .checkOneId$()
      .pipe(
        switchMap((granted) => (granted ? this.onlineApi.startProcessing$(draft).pipe(map(() => true)) : of(false))),
        finalize(() => this.loading.set(false)),
        take(1),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (submitted) => {
          if (!submitted) {
            this.notifyNotGranted();
            return;
          }

          this.finishWithSuccess();
        },
        error: (error) => this.finishWithError(error),
      });
  }

  private notifyNotGranted(): void {
    this.toast.error(translate('flow.one_id.consent.not_granted_title'), translate('flow.one_id.consent.not_granted_description'));
  }

  private finishWithSuccess(): void {
    this.loanDraft.clear();
    showApplicationSuccessToast(this.toast);
    void this.router.navigate(['/', RootRoute.Applications], { replaceUrl: true });
  }

  private finishWithError(error?: unknown): void {
    this.loanDraft.clear();
    showApplicationErrorToast(this.toast, error);
    void this.router.navigate(['/', RootRoute.Applications], { replaceUrl: true });
  }
}
