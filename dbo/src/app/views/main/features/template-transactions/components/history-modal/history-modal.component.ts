import {ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ToastrService} from 'ngx-toastr';
import {AccountService} from "../../../../../../core/services/account.service";
import {TemplateService} from "../../../../../../core/services/template.service";
import {AccountInfoDto} from "../../../accounts-payments/models/accounts-payments.model";
import {TransactionDetailComponent} from "../../../transaction-detail/transaction-detail.component";
import {PAYMENT_ACTIONS } from '../../../add-payment/utils/payment.utils';
import { NgForOf, NgIf} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-transaction-history',
  templateUrl: './history-modal.component.html',
  imports: [
    NgIf,
    NgForOf,
    TranslateModule,
  ]
})
export class HistoryModalComponent implements OnInit {
  private readonly accountService = inject(AccountService)
  public data: any = inject(MAT_DIALOG_DATA)
  private _templateService = inject(TemplateService);
  public readonly account = signal<AccountInfoDto | null>(null)
  public actionButtons = signal<{ title: string, icon: string, action: string }[]>([
    {
      action: 'sign',
      icon: './assets/new-icons/sign-02.svg',
      title: 'Подписать'
    },
    {
      action: 'autopay',
      icon: './assets/new-icons/calendar-check-02.svg',
      title: 'Запланировать'
    },
    {
      action: 'reverse',
      icon: './assets/new-icons/reverse-right.svg',
      title: 'Повторить'
    },
    {
      action: 'edit',
      icon: './assets/new-icons/edit.svg',
      title: 'Редактировать'
    },
    {
      action: 'delete',
      icon: './assets/new-icons/trash.svg',
      title: 'Удалить'
    },


  ])
  user!: any;
  director!: any;
  headOfFinance!: any;

  historyOpened = true;

  ngOnInit() {
  }

  loading = false;

  statusActions(status: string) {
    if (status === 'CREATE') {
      return 'new.created'
    } else if (status === 'UPDATE') {
      return 'Обновлен'
    } else if (status === 'DELETE') {
      return 'Удален'
    } else if (status === 'SIGN') {
      return 'new.signed'
    } else if (status === 'SIGN_REVERT') {
      return 'Отказан'
    } else if (status === 'CANCEL') {
      return 'new.canceled'
    } else {
      return ''
    }
  }


  formatDate(createdAt: string): string {
    const [datePart, timePart] = createdAt.split(" ");
    const [day, month, year] = datePart.split(".");
    const [hour, minute] = timePart.split(":");

    const months = [
      "января", "февраля", "марта", "апреля", "мая", "июня",
      "июля", "августа", "сентября", "октября", "ноября", "декабря"
    ];

    const monthName = months[parseInt(month, 10) - 1];

    return `${parseInt(day, 10)} ${monthName} ${year}, ${hour}:${minute}`;
  }

  getActions() {
    if (this.data.buttons.length > 0) {
      return this.data.buttons.map(action => ({
        id: action.actionType,
        title: action.name,
      }));
    }
    return [];
  }

  constructor(
    private _matDialog: MatDialog,
    protected _matDialogRef: MatDialogRef<TransactionDetailComponent>,
    private destroyRef: DestroyRef,
    protected router: Router,
    private toastrService: ToastrService,
    private _cdRef: ChangeDetectorRef,
  ) {
  }

  close() {
    this._matDialogRef.close();
  }

  editPayment() {
    sessionStorage.setItem('edit-payment', JSON.stringify(this.data));
    let windowType = this.data.additionalInfo?.windowType;
    this.editCredit();
    if (windowType === 'MUNIS') return;
    if (windowType) {
      windowType = windowType === 'MUNIS' ? 'P2SERVICE' : windowType;
      this._matDialogRef.close();
      this.router.navigate(['/pay', windowType], {
        queryParams: {
          from: 'edit-payment'
        }
      });
    }
  }

  editCredit() {
    if (this.data.transactionMode === 'LOAN_REPAYMENT' && this.data.additionalInfo?.loanId) {
      this.router.navigate(
        ['/loan/pay-off-the-loan', this.data.additionalInfo.loanId],
        {
          queryParams: {
            edit: 'true'
          }
        }
      );
      this._matDialogRef.close();
    }
  }

  async printTransactionDetailsPdf() {
    const lastSignDate = this.data.signedList[this.data.signedList.length - 1].signDate;
    let date = new Date(this.data.docDate);

    if (lastSignDate !== 'null') {
      date = new Date(`${this.data.signedList[this.data.signedList.length - 1].signDate}`);
    }

    const formatted = `${date.toLocaleDateString('ru-RU')} ${date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }

  getTimeFromISO(dateString: string): string {
    const date = new Date(dateString);

    const intl = new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'short',
    }).format(date);

    return `${intl}`;
  }

  getHistory() {
    return this.data.signedList.filter(el => el.isFinished).sort((a, b) => a.signOrderNumber - b.signOrderNumber);
  }

  protected readonly Math = Math;
  protected readonly PAYMENT_ACTIONS = PAYMENT_ACTIONS;
}
