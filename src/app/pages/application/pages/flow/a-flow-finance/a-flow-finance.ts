import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { TranslocoDirective } from '@jsverse/transloco';
import { filter } from 'rxjs';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { FinanceForm, FinanceInfo, SuccessModal } from '@pages/application/components';
import { ModalConfirmComponent } from '@shared/components';
import { ConfirmModal } from '@typings';
import { SuccessModalData } from '@pages/application/models';

@Component({
  selector: 'cf-a-flow-finance',
  imports: [NzButtonComponent, FinanceInfo, TranslocoDirective],
  templateUrl: './a-flow-finance.html',
  styleUrl: './a-flow-finance.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AFlowFinance {
  private nzModalService = inject(NzModalService);

  openFinanceForm(): void {
    this.nzModalService.create({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: FinanceForm,
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
    });
  }

  finish(): void {
    this.confirmModal()
      .afterClose.pipe(filter((state) => state))
      .subscribe(() => {
        this.successModal();
      });
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
