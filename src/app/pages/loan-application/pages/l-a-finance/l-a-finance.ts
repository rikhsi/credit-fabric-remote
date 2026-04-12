import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FinanceForm, FinanceInfo } from '@pages/loan-application/components';
import { ModalConfirmComponent } from '@shared/components';
import { ConfirmModal } from '@typings';

@Component({
  selector: 'cf-l-a-finance',
  imports: [NzButtonComponent, FinanceInfo],
  templateUrl: './l-a-finance.html',
  styleUrl: './l-a-finance.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LAFinance {
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
    this.nzModalService.create<ModalConfirmComponent, ConfirmModal, boolean>({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: ModalConfirmComponent,
      nzData: {
        title: 'Вы уверены завершить?',
        description: 'Откройте Styx client и вставьте флешку с ключом в компьютер и нажмите “Подключить”.',
        cancel: {
          title: 'Нет',
          danger: false,
        },
        submit: {
          title: 'Да',
          danger: false,
        },
      },
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
    });
  }
}
