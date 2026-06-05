import { ChangeDetectionStrategy, Component, inject, linkedSignal, signal } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { TranslocoDirective } from '@jsverse/transloco';
import { filter, finalize, switchMap, take, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { OnlineApiService } from '@api/controllers/los/online-api.service';
import { ModalConfirmComponent, Card, Steps } from '@shared/components';
import { FlowService } from '@pages/application/services';
import { ConfirmModal } from '@app/typings/modal';
import { RouteParam } from '@app/constants/route-param';
import { RootRoute } from '@app/constants/route-path';
import { FinanceForm } from '@pages/application/components/finance-form/finance-form';
import { SuccessModal } from '@pages/application/components/success-modal/success-modal';
import { SuccessModalData } from '@pages/application/data/modal';
import { isFinanceStepValid } from '@pages/application/utils/flow-step.validation';
import { buildCreateApplicationPayload } from '@pages/application/utils/finance-months';

@Component({
  selector: 'cf-a-flow-finance',
  imports: [NzButtonComponent, FinanceForm, Card, Steps, TranslocoDirective],
  templateUrl: './a-flow-finance.html',
  styleUrl: './a-flow-finance.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AFlowFinance {
  private nzModalService = inject(NzModalService);
  private flowService = inject(FlowService);
  private onlineApi = inject(OnlineApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public readonly flowForm = linkedSignal(() => this.flowService.flowForm);
  public readonly submitting = signal(false);

  get applicationId(): number {
    return Number(this.route.snapshot.params[RouteParam.AppId]);
  }

  finish(): void {
    if (this.submitting()) {
      return;
    }

    if (!isFinanceStepValid(this.flowService.flowForm)) {
      this.markFinanceFormDirty();
      this.scrollToInvalidElement();
      return;
    }

    this.confirmModal()
      .afterClose.pipe(
        filter((state) => state),
        tap(() => this.submitting.set(true)),
        switchMap(() => {
          const payload = buildCreateApplicationPayload(this.flowService.flowForm().value());

          return this.onlineApi.createApplication$(payload);
        }),
        finalize(() => this.submitting.set(false)),
        take(1),
      )
      .subscribe({
        next: () => this.openSuccessModal(),
        error: () => this.openErrorModal(),
      });
  }

  private markFinanceFormDirty(): void {
    const { finData } = this.flowForm();

    finData.dirCompanyActivityId().markAsDirty();
    finData.activityTerm().markAsDirty();
    finData.month1Revenue().markAsDirty();
    finData.month1Income().markAsDirty();
    finData.month2Revenue().markAsDirty();
    finData.month2Income().markAsDirty();
    finData.month3Revenue().markAsDirty();
    finData.month3Income().markAsDirty();
  }

  private scrollToInvalidElement(): void {
    setTimeout(() => {
      const el = document.querySelector('.ant-form-item-explain-error');

      if (el) {
        (el as HTMLElement).scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 50);
  }

  private confirmModal(): NzModalRef {
    return this.nzModalService.create<ModalConfirmComponent, ConfirmModal, boolean>({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: ModalConfirmComponent,
      nzData: {
        icon: 'check',
        title: 'modal.application_confirm.title',
        submit: {
          title: 'action.confirm',
          danger: false,
        },
        cancel: {
          title: 'action.cancel',
          danger: false,
        },
      },
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
    });
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
