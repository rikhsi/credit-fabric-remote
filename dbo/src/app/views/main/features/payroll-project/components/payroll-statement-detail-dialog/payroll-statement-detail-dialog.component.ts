import {ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IconComponent } from '../../../../../../shared/ui/icon/icon.component';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { DatePipe, NgForOf } from '@angular/common';
import { MinorToMajorPipe } from '../../../../../../shared/lib/minor-to-major.pipe';
import { TransactionService } from '../../../../../../core/services/transaction.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActionsHistoryDTO } from '../../../../../../core/models/transaction.models';
import { PreparePaymentUzsTransactionResponse } from '../../../../../../entities/transaction/transaction.model';
import { PAYMENT_STATUS_META } from '../../../../../../shared/models/payment-status.model';
import { MONTH_NAMES } from '../../../../../../features/payroll/statement-form/statement-form.model';

@Component({
  selector: 'app-payroll-statement-detail-dialog',
  imports: [
    TranslateModule,
    IconComponent,
    MatDialogClose,
    MinorToMajorPipe,
    NgForOf
  ],
  providers: [DatePipe],
  templateUrl: './payroll-statement-detail-dialog.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayrollStatementDetailDialogComponent implements OnInit  {

  actionData = signal<ActionsHistoryDTO[]>([])

  public readonly data = inject<
    { transaction: PreparePaymentUzsTransactionResponse, childLength: number }
  >(MAT_DIALOG_DATA);
  private readonly translate = inject(TranslateService);
  private transactionService = inject(TransactionService);
  private readonly destroy = inject(DestroyRef)

  ngOnInit() {
    this.getActionsHistory();
  }

  getActionsHistory() {
    this.transactionService.getTransactionsActionHistory(this.data.transaction.id).pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (data) => {
          this.actionData.set(data.actions)
        }
      })
  }

  translateStatus(status: string): string {
    const map: Record<string, string> = {
      CREATE: 'Создан',
      DELETE: 'Удален',
      UPDATE: 'Обновлен',
      SIGN: 'Подписан',
      SIGN_REVERT: 'На доработку',
      CANCEL: 'Отменен',
    };

    return map[status] || 'Неизвестный статус';
  }

  info = [
    {
      title: this.translate.instant('myAccounts.sender'),
      fields: [
        { label: 'Номер ведомости', value: this.data.transaction.docNum },
        { label: this.translate.instant('salaryStatements.payment_type'), value: this.data.transaction.purpose.name },
        {
          label: this.translate.instant('salaryStatements.month'),
          value: this.getMonthLabel(this.data.transaction.additionalInfo?.months)
        },
        { label: 'Год', value: this.data.transaction.additionalInfo?.year },
        {
          label: this.translate.instant('templates.creation_date'),
          value: this.data.transaction.audit.createdAt.split(' ')[0]
        },
        {
          label: 'Дата отправки',
          value: this.data.transaction.audit.updatedAt ? this.data.transaction.audit.updatedAt.split(' ')[0] : undefined,
        },
        {
          label: this.translate.instant('salaryStatements.organization_name'),
          value: this.data.transaction.sender.name
        },
        { label: 'Счет', value: this.data.transaction.sender.account },
        { label: 'МФО банка', value: this.data.transaction.sender.codeFilial },
      ],
    },
    {
      title: this.translate.instant('salaryStatements.recipient'),
      fields: [
        { label: 'Сотрудников', value: this.data.childLength },
        { label: 'МФО банка', value: this.data.transaction.recipient.codeFilial },
        {
          label: this.translate.instant('salaryStatements.organization_name'),
          value: this.data.transaction.recipient.name
        },
        { label: 'Счёт ведомости', value: this.data.transaction.recipient.account },
      ],
    },
    {
      title: 'Данные о платеже',
      fields: [
        { label: this.translate.instant('salaryStatements.payment_purpose'), value: this.data.transaction.description },
      ]
    }
  ];

  getMonthLabel(months: string | string[] | undefined): string {
    if (!months) return '';
    const arr = Array.isArray(months) ? months : months.split(',');
    return arr.map(m => MONTH_NAMES[Number(m.trim()) - 1]).join(', ');
  }

  protected readonly PAYMENT_STATUS_META = PAYMENT_STATUS_META;
}
