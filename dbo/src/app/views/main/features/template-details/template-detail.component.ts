import { Component, DestroyRef, inject, OnInit, output, signal } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { NgForOf, NgIf} from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  TransactionOneDetailDto,
} from '../../../../core/models/transaction.models';
import { TemplateService } from "../../../../core/services/template.service";
import { getStatusApplication } from '../../../../core/utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UtilsService } from '../../../../core/services/utils.service';
import { UserService } from '../../../../core/services/user.service';
import { AccountService } from "../../../../core/services/account.service";
import { AccountInfoDto } from "../accounts-payments/models/accounts-payments.model";
import { TransactionService } from "../../../../core/services/transaction.service";
import { SvgIconComponent } from 'src/app/shared/components/svg-icon/svg-icon.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ICONS_TYPE } from 'src/app/shared/types';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-template-detail',
  templateUrl: './template-detail.component.html',
  imports: [
    MatDivider,
    SvgIconComponent,
    NgIf,
    TranslateModule,
    NgForOf,
    MatIconModule
  ],
  styles: `
    .label {
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
    }
    .value {
      font-size: 16px;
      font-weight: 400;
      line-height: 24px;
    }
  `
})
export class TemplateDetailModalComponent implements OnInit {
  public readonly onDetail = output<string>()
  private readonly transactionService = inject(TransactionService)
  public data: TransactionOneDetailDto = inject(MAT_DIALOG_DATA)
  private readonly snackBar = inject(MatSnackBar)
  private destroy = inject(DestroyRef)


  public readonly account = signal<AccountInfoDto | null>(null)
  public readonly auditInfo = signal<any>(null)
  protected readonly Number = Number;
  loading = false;
  public actionButtons = signal<{ title: string; icon: ICONS_TYPE; action: string, titleTranslateKey: string }[]>([
    { action: 'sign', icon: 'hamkor_subscribe_pen', title: 'Подписать', titleTranslateKey: 'createPayment.sign' },
    { action: 'reverse', icon: 'hamkor_reverse_right', title: 'Повторить', titleTranslateKey: 'accountStatements.retry' },
    { action: 'edit', icon: 'hamkor_edit', title: 'Редактировать', titleTranslateKey: 'createPayment.edit' },
    { action: 'delete', icon: 'hamkor_delete', title: 'Удалить', titleTranslateKey: 'createPayment.delete' },
  ]);


  user!: any;
  director!: any;
  headOfFinance!: any;

  userInfo = signal<any>(null);

  constructor(
    protected _matDialogRef: MatDialogRef<TemplateDetailModalComponent>,
    private destroyRef: DestroyRef,
    private utilsService: UtilsService,
    private userService: UserService,
    private translateService: TranslateService
  ) { }


  ngOnInit() {
    const userInfo = localStorage.getItem("businessInfo");
    if (userInfo) {
      this.userInfo.set(JSON.parse(userInfo));
    }
    this.watchTransactionEsp();
    this.getUserInfo();
    this.getActionsHistory()
  }

  closeDialog() {
    this.onDetail.emit('close');
  }


  getActionsHistory() {
    this.transactionService.getTransactionsActionHistory(this.data.id).pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (data) => {
          this.auditInfo.set(data.actions)
        }
      })
  }

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

  copy(data: any) {
    this.navigator.clipboard.writeText(data)
    this.snackBar.open(`${this.translateService.instant('new.copied')}! ✅`, this.translateService.instant('new.close_1'), { duration: 3000 })
  }


  copyRequisites() {
    const textToCopy = `
${this.translateService.instant('accounts.organization_name')}: ${this.data.isDebit ? this.data.recipient.name :
        this.data.sender.name}
${this.translateService.instant('myAccounts.recipient_account')}: ${this.data.isDebit ? this.data.recipient.account :
        this.data.sender.account}
${this.translateService.instant('myAccounts.inn')}: ${this.data.isDebit ? this.data.recipient.tax :
        this.data.sender.tax}
${this.translateService.instant('myAccounts.bank_mfo')}: ${this.data.isDebit ? this.data.recipient.codeFilial :
        this.data.sender.codeFilial}
  `;

    navigator.clipboard.writeText(textToCopy).then(() => {
      this.snackBar.open(`${this.translateService.instant('new.details_copied')} ✅`, this.translateService.instant('new.close_1'), { duration: 3000 });
    });
  }

  //"january": "января",
      // "february": "февраля",
      // "martha": "марта",
      // "april": "апреля",
      // "may": "мая",
      // "june": "июня,",
      // "july": "июля",
      // "august": "августа",
      // "september": "сентября",
      // "october": "октября",
      // "november": "ноября",
      // "december": "декабря",

  formatDate(createdAt: string): string {
    const [datePart, timePart] = createdAt.split(" ");
    const [day, month, year] = datePart.split(".");
    const [hour, minute] = timePart.split(":");
    const translateMonths = [
        'new.january',
        'new.february',
        'new.march',
        'new.april',
        'new.may',
        'new.june',
        'new.july',
        'new.august',
        'new.september',
        'new.october',
        'new.november',
        'new.december'
      ];

  const monthKey = translateMonths[parseInt(month, 10) - 1];
  const monthName = this.translateService.instant(monthKey);

  return `${parseInt(day, 10)} ${monthName} ${year}, ${hour}:${minute}`;
  }

  formatDocDate(createdAt: string): string {
    const [datePart, timePart] = createdAt.split(" ");
    const [day, month, year] = datePart.split(".");
    const [hour, minute] = timePart?.split(":");

     const translateMonths = [
        'new.january',
        'new.february',
        'new.march',
        'new.april',
        'new.may',
        'new.june',
        'new.july',
        'new.august',
        'new.september',
        'new.october',
        'new.november',
        'new.december'
      ];

    const monthKey = translateMonths[parseInt(month, 10) - 1];
    const monthName = this.translateService.instant(monthKey);

    return `${parseInt(day, 10)} ${monthName} ${year}, ${hour}:${minute}`;
  }

  watchTransactionEsp() {
    this.utilsService.updateTransactions
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          if (res === 'update') {
            this._matDialogRef.close('update');
          }
        }
      })
  }

  getUserInfo() {
    this.userService.director$$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(director => {
        if (director) {
          this.director = director;
        }
      });

    this.userService.headOfFinance$$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(headOfFinance => {
        if (headOfFinance) {
          this.headOfFinance = headOfFinance;
        }
      });
  }


  getTimeFromISO(dateString: string): string {
    const date = new Date(dateString);

    const intl = new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'short',
    }).format(date);

    return `${intl}`;
  }

  protected readonly getStatusApplication = getStatusApplication;
  protected readonly Math = Math;
  protected readonly navigator = navigator;
}
