import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslocoDirective, translate } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { finalize, map, of, switchMap, take } from 'rxjs';
import { environment } from 'src/environments/development';
import { OnlineApiService } from '@api/controllers/los/online-api.service';
import { ModalConfirmComponent } from '@shared/components';
import { BounceDirective } from '@shared/directives';
import { ImagePipe } from '@shared/pipes';
import { ConfirmModal } from '@app/typings/modal';
import { LoanRoute, RootRoute } from '@app/constants/route-path';
import { LoanDraftService } from '@core/services/loan-draft.service';
import { SuccessModal } from '@pages/oneid/components/success-modal/success-modal';
import { SuccessModalData } from '@pages/oneid/data/modal';
import { ONE_ID_INSTRUCTION_STEPS } from '@pages/oneid/data/one-id';

@Component({
  selector: 'cf-oneid',
  imports: [TranslocoDirective, NzButtonComponent, NzIconDirective, NzTypographyComponent, BounceDirective, ImagePipe],
  templateUrl: './oneid.html',
  styleUrl: './oneid.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OneId {
  private readonly nzModalService = inject(NzModalService);
  private readonly notification = inject(NzNotificationService);
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

          this.loanDraft.clear();
          this.openSuccessModal(draft.loanAmount);
        },
        error: () => this.openErrorModal(),
      });
  }

  private notifyNotGranted(): void {
    this.notification.error(translate('flow.one_id.consent.not_granted_title'), translate('flow.one_id.consent.not_granted_description'));
  }

  private openSuccessModal(amount: number): void {
    const modalRef = this.nzModalService.create<SuccessModal, SuccessModalData, boolean>({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzFooter: null,
      nzCentered: true,
      nzWidth: 'auto',
      nzData: {
        id: null,
        amount,
      },
      nzContent: SuccessModal,
    });

    modalRef.afterClose.pipe(take(1)).subscribe(() => {
      void this.router.navigate(['/', RootRoute.Applications], { replaceUrl: true });
    });
  }

  private openErrorModal(): void {
    this.nzModalService.create<ModalConfirmComponent, ConfirmModal, boolean>({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: ModalConfirmComponent,
      nzData: {
        icon: 'close',
        title: 'modal.error_application.title',
        description: 'modal.error_application.description',
        submit: {
          title: 'action.close',
          danger: false,
        },
      },
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
    });
  }
}
