import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { FinanceForm, FinanceInfo, SuccessModal } from '@pages/application/components';
import { ModalConfirmComponent } from '@shared/components';
import { ConfirmModal } from '@typings';
import { SuccessModalData } from '@pages/application/models';

@Component({
  selector: 'cf-a-finance',
  imports: [NzButtonComponent, FinanceInfo],
  templateUrl: './a-finance.html',
  styleUrl: './a-finance.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AFinance {
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
    this.successModal();
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
        title: 'Не удалось создать заявку',
        description: 'Попробуйте позже. Сервер временно недоступен.',
        submit: {
          title: 'Вернуться на Главную',
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
        title: 'У вас уже есть одобренная заявка',
        description: 'У вас есть одобренная заявка. Примите по ней решение',
        submit: {
          title: 'Перейти в Мои заявки',
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
        title: 'Нужно посетить филиал банка',
        description: 'Для вашей компании требуется индивидуальное оформление. Пожалуйста, обратитесь в филиал банка.',
        submit: {
          title: 'Найти филиал',
          danger: false,
        },
        cancel: {
          title: 'Вернуться на Главную',
          danger: false,
        },
      },
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
    });
  }
}
