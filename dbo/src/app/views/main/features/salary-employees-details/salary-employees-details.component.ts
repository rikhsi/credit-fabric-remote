import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit, output, signal } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { MatDivider } from '@angular/material/divider';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  TransactionOneDetailDto,
} from '../../../../core/models/transaction.models';
import { getStatusApplication } from '../../../../core/utils';
import { AmountService } from '../../../../core/services/amount.service';
import { AccountsPaymentsService } from '../accounts-payments/services/accounts-payments.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { EspSignConfirmService } from '../../../../core/services/esp-confirm.service';
import { EspSignConfirmComponent } from '../../../../core/components/esp-sign-confirm/esp-sign-confirm.component';
import { UtilsService } from '../../../../core/services/utils.service';
import { UserService } from '../../../../core/services/user.service';
import { AccountService } from "../../../../core/services/account.service";
import { AccountInfoDto } from "../accounts-payments/models/accounts-payments.model";
import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import { TransactionService } from "../../../../core/services/transaction.service";
import { SvgIconComponent } from 'src/app/shared/components/svg-icon/svg-icon.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ICONS_TYPE } from 'src/app/shared/types';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import {MatTooltip} from "@angular/material/tooltip";
import {SalaryCardRes} from "../../../../entities/salary/salary.model";
import {ConfirmDialogComponent} from "../../../../shared/ui/confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './salary-employees-details.component.html',
  imports: [
    MatMenu,
    MatMenuTrigger,
    MatDivider,
    SvgIconComponent,
    NgIf,
    TranslateModule,
    NgForOf,
    NgClass,
    MatIconModule,
    MatTooltip
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
export class SalaryEmployeesDetailsComponent implements OnInit {
  public readonly onDetail = output<string>()
  private readonly accountService = inject(AccountService)
  private readonly transactionService = inject(TransactionService)
  public data: SalaryCardRes = inject(MAT_DIALOG_DATA)
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

  historyOpened = true;
  userInfo = signal<any>(null)

  constructor(
    private amountService: AmountService,
    private accountsPaymentsService: AccountsPaymentsService,
    private _matDialog: MatDialog,
    protected _matDialogRef: MatDialogRef<SalaryEmployeesDetailsComponent>,
    private destroyRef: DestroyRef,
    private router: Router,
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    private _cdRef: ChangeDetectorRef,
    private espConfirmService: EspSignConfirmService,
    private utilsService: UtilsService,
    private userService: UserService,
    private translateService: TranslateService
  ) { }


  ngOnInit() {
    this.getActionsHistory()
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

  cancelTransactions(employeeId: string | undefined) {
    this._matDialog.open(ConfirmDialogComponent, {
      data: {
        icon: 'alertTriangle',
        title: 'Вы уверены, что хотите удалить сотрудника?',
        description: 'После удаления сотрудника восстановить её будет невозможно',
      },
      width: '480px',
    }).afterClosed().subscribe((res) => {
      if (res === 'confirm') {
        // this.utilService.spinnerState$$.next(true);

        // this.transactionApi.deleteTransactions([transactionId]).subscribe(res => {
        //   this.analyticsService.logFirebaseCustomEvent('delete_transfer_success', {transfer_id: transactionId});
        //
        //   this.router.navigate(['payroll-project', 'statements']);
        //   this.utilService.spinnerState$$.next(false);
        // })
      }
    });
  }

  getActionsHistory() {
    this.transactionService.getTransactionsActionHistory(this.data.uuid).pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (data) => {
          if(data) {
            this.auditInfo.set(data.actions)
            console.log('bingo',this.auditInfo())
          }
        }
      })
  }

  copy(data: any) {
    this.navigator.clipboard.writeText(data)
    this.snackBar.open(`${this.translateService.instant('new.copied')}! ✅`, this.translateService.instant('new.close_1'), { duration: 3000 })
  }

  closeDialog() {
    this.onDetail.emit('close');
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

  getTimeFromISO(dateString: string): string {
    const date = new Date(dateString);

    const intl = new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'short',
    }).format(date);

    return `${intl}`;
  }

  confirm(transaction: TransactionOneDetailDto) {
    console.log("ceek")
    if (!transaction.id) {
      return;
    }
    this._matDialog.open(EspSignConfirmComponent, {
      width: '744px',
      data: { action: {
          externalId: transaction.id,
          type: transaction.transactionMode,
          successMessage: this.translateService.instant('acc.sent_to_the_bank')
        }
      },
    }).afterClosed()
      .subscribe({
        next: res => {
          if (res === 'update') {
            this._matDialogRef.close('update');
          }
        }
      });
  }

  integerPart(balance): string {
    const amount = (balance ?? 0) / 100;
    const [int] = amount.toFixed(2).split('.');
    return Number(int).toLocaleString().replace(/,/g, ' ');
  }

  decimalPart(balance): string {
    const amount = (balance ?? 0) / 100;
    const [, dec] = amount.toFixed(2).split('.');
    return dec;
  }


  protected readonly getStatusApplication = getStatusApplication;
  protected readonly Math = Math;
  protected readonly navigator = navigator;
}
