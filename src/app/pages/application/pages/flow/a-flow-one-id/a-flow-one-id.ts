import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { translate } from '@jsverse/transloco';
import { finalize, take } from 'rxjs';
import { environment } from 'src/environments/development';
import { OnlineApiService } from '@api/controllers/los/online-api.service';
import { ModalConfirmComponent } from '@shared/components';
import { FlowService } from '@pages/application/services';
import { ConfirmModal } from '@app/typings/modal';
import { RouteParam } from '@app/constants/route-param';
import { RootRoute } from '@app/constants/route-path';
import { OneIdConsent } from '@pages/application/components/one-id-consent/one-id-consent';
import { OneIdInstruction } from '@pages/application/components/one-id-instruction/one-id-instruction';
import { SuccessModal } from '@pages/application/components/success-modal/success-modal';
import { SuccessModalData } from '@pages/application/data/modal';
import { ONE_ID_INSTRUCTION_STEPS } from '@pages/application/data/one-id';
import { buildCreateApplicationPayload } from '@pages/application/utils/finance-months';

type OneIdView = 'consent' | 'instruction';

@Component({
  selector: 'cf-a-flow-one-id',
  imports: [OneIdConsent, OneIdInstruction],
  templateUrl: './a-flow-one-id.html',
  styleUrl: './a-flow-one-id.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AFlowOneId {
  private nzModalService = inject(NzModalService);
  private notification = inject(NzNotificationService);
  private flowService = inject(FlowService);
  private onlineApi = inject(OnlineApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected readonly view = signal<OneIdView>('consent');
  protected readonly loading = signal(false);
  protected readonly steps = ONE_ID_INSTRUCTION_STEPS;

  get applicationId(): number {
    return Number(this.route.snapshot.params[RouteParam.AppId]);
  }

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
      .checkOneId$(this.applicationId)
      .pipe(take(1))
      .subscribe({
        next: (granted) => {
          if (granted) {
            this.submit();
            return;
          }

          this.loading.set(false);
          this.notifyNotGranted();
        },
        error: () => {
          this.loading.set(false);
          this.openErrorModal();
        },
      });
  }

  private submit(): void {
    const payload = buildCreateApplicationPayload(this.flowService.flowForm().value());

    this.onlineApi
      .createApplication$(payload)
      .pipe(
        finalize(() => this.loading.set(false)),
        take(1),
      )
      .subscribe({
        next: () => this.openSuccessModal(),
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
        id: this.applicationId,
        amount: null,
      },
      nzContent: SuccessModal,
    });

    modalRef.afterClose.pipe(take(1)).subscribe(() => {
      void this.router.navigate(['/', RootRoute.Applications, this.applicationId], { replaceUrl: true });
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
