import { ChangeDetectionStrategy, Component, inject, linkedSignal, ViewContainerRef } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { TranslocoDirective } from '@jsverse/transloco';
import { filter, switchMap, take } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { OnlineApiService } from '@api/controllers/los/online-api.service';
import { ModalConfirmComponent } from '@shared/components';
import { flowFinanceFormModel } from '@pages/application/data/form';
import { FlowService } from '@pages/application/services';
import { ConfirmModal } from '@app/typings/modal';
import { RouteParam } from '@app/constants/route-param';
import { FinanceForm } from '@pages/application/components/finance-form/finance-form';
import { FinanceInfo } from '@pages/application/components/finance-info/finance-info';
import { SuccessModal } from '@pages/application/components/success-modal/success-modal';
import { FlowFinanceForm } from '@pages/application/models/form';
import { SuccessModalData } from '@pages/application/models/modal';
import { isFinanceStepValid } from '@pages/application/utils/flow-step.validation';

@Component({
  selector: 'cf-a-flow-finance',
  imports: [NzButtonComponent, FinanceInfo, TranslocoDirective],
  templateUrl: './a-flow-finance.html',
  styleUrl: './a-flow-finance.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AFlowFinance {
  private nzModalService = inject(NzModalService);
  private flowService = inject(FlowService);
  private onlineApi = inject(OnlineApiService);
  private route = inject(ActivatedRoute);
  private vcr = inject(ViewContainerRef);

  public readonly flowForm = linkedSignal(() => this.flowService.flowForm);

  get applicationId(): number {
    return Number(this.route.snapshot.params[RouteParam.AppId]);
  }

  openFinanceForm(editIndex?: number): void {
    const items = this.flowService.flowForm().value().financeInformations;
    const nzData = editIndex !== undefined ? items[editIndex] : flowFinanceFormModel;

    const modalRef = this.nzModalService.create<FinanceForm, FlowFinanceForm, FlowFinanceForm>({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: FinanceForm,
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
      nzViewContainerRef: this.vcr,
      nzData,
    });

    modalRef.afterClose.pipe(filter(Boolean), take(1)).subscribe((value) => {
      this.flowService.flowForm().value.update((cur) => {
        const financeInformations =
          editIndex !== undefined
            ? cur.financeInformations.map((item, index) => (index === editIndex ? value : item))
            : [...cur.financeInformations, value];

        return {
          ...cur,
          financeInformations,
        };
      });
    });
  }

  finish(): void {
    if (!isFinanceStepValid(this.flowService.flowForm().value())) {
      this.flowForm().financeInformations().markAsDirty();
      this.scrollToInvalidElement();
      return;
    }

    this.confirmModal()
      .afterClose.pipe(
        filter((state) => state),
        switchMap(() => this.onlineApi.createApplication$(this.flowService.buildStartProcessingPayload(this.applicationId))),
        take(1),
      )
      .subscribe({
        next: () => this.successModal(),
        error: () => this.errorModal(),
      });
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

  private successModal(): NzModalRef {
    return this.nzModalService.create<SuccessModal, SuccessModalData, boolean>({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzFooter: null,
      nzCentered: true,
      nzWidth: 'auto',
      nzData: {
        id: 23,
        amount: 50000000,
      },
      nzContent: SuccessModal,
    });
  }

  private errorModal(): NzModalRef {
    return this.nzModalService.create<ModalConfirmComponent, ConfirmModal, boolean>({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: ModalConfirmComponent,
      nzData: {
        icon: 'close',
        title: 'modal.error_application.title',
        description: 'modal.error_application.description',
        submit: {
          title: 'action.back_home',
          danger: false,
        },
      },
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
    });
  }

  private hasApplicationModal(): NzModalRef {
    return this.nzModalService.create<ModalConfirmComponent, ConfirmModal, boolean>({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: ModalConfirmComponent,
      nzData: {
        icon: 'close',
        title: 'modal.error_exist_application.title',
        description: 'modal.error_exist_application.description',
        submit: {
          title: 'action.go_my_applications',
          danger: false,
        },
      },
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
    });
  }

  private goToBankModal(): NzModalRef {
    return this.nzModalService.create<ModalConfirmComponent, ConfirmModal, boolean>({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: ModalConfirmComponent,
      nzData: {
        icon: 'close',
        title: 'modal.error_bank_office_application.title',
        description: 'modal.error_bank_office_application.description',
        submit: {
          title: 'action.find_place',
          danger: false,
        },
        cancel: {
          title: 'action.back_home',
          danger: false,
        },
      },
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
    });
  }
}
