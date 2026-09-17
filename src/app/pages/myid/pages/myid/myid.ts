import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { translate } from '@jsverse/transloco';
import { finalize, take } from 'rxjs';
import { environment } from 'src/environments/development';
import { OnlineApiService } from '@api/controllers/los/online-api.service';
import { ModalConfirmComponent } from '@shared/components';
import { ConfirmModal } from '@app/typings/modal';
import { RootRoute } from '@app/constants/route-path';
import { OneIdConsent } from '@pages/myid/components/one-id-consent/one-id-consent';
import { OneIdInstruction } from '@pages/myid/components/one-id-instruction/one-id-instruction';
import { SuccessModal } from '@pages/myid/components/success-modal/success-modal';
import { SuccessModalData } from '@pages/myid/data/modal';
import { ONE_ID_INSTRUCTION_STEPS } from '@pages/myid/data/one-id';

type OneIdView = 'consent' | 'instruction';

@Component({
  selector: 'cf-myid',
  imports: [OneIdConsent, OneIdInstruction],
  templateUrl: './myid.html',
  styleUrl: './myid.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyId {
  private nzModalService = inject(NzModalService);
  private notification = inject(NzNotificationService);
  private onlineApi = inject(OnlineApiService);
  private router = inject(Router);

  protected readonly view = signal<OneIdView>('consent');
  protected readonly loading = signal(false);
  protected readonly steps = ONE_ID_INSTRUCTION_STEPS;

  openInstruction(): void {
    this.view.set('instruction');
  }

  backToConsent(): void {
    this.view.set('consent');
  }

  goToOneId(): void {
    window.open(environment.oneIdUrl, '_blank');
  }

  grant(): void {
    if (this.loading()) {
      return;
    }

    this.loading.set(true);

    this.onlineApi
      .checkOneId$()
      .pipe(
        finalize(() => this.loading.set(false)),
        take(1),
      )
      .subscribe({
        next: (granted) => {
          if (granted) {
            this.openSuccessModal();
            return;
          }

          this.notifyNotGranted();
        },
        error: () => this.openErrorModal(),
      });
  }

  private notifyNotGranted(): void {
    this.notification.error(translate('flow.one_id.consent.not_granted_title'), translate('flow.one_id.consent.not_granted_description'));
  }

  private openSuccessModal(): void {
    const modalRef = this.nzModalService.create<SuccessModal, SuccessModalData, boolean>({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzFooter: null,
      nzCentered: true,
      nzWidth: 'auto',
      nzData: {
        id: null,
        amount: null,
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
