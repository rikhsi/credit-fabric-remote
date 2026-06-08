import {ChangeDetectorRef, Component, DestroyRef, inject, OnInit, output, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDivider} from '@angular/material/divider';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {
  getTransactionTypeTranslation,
  TransactionOneDetailDto,
  TransactionTypes
} from '../../../../core/models/transaction.models';
import {Options, TemplateService} from "../../../../core/services/template.service";
import {getStatusApplication} from '../../../../core/utils';
import {AmountService} from '../../../../core/services/amount.service';
import {AccountsPaymentsService} from '../accounts-payments/services/accounts-payments.service';
import {SaveTransactionComponent} from '../accounts-payments/components/save-transaction/save-transaction.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ToastrService} from 'ngx-toastr';
import {EspSignConfirmService} from '../../../../core/services/esp-confirm.service';
import {EspSignConfirmComponent} from '../../../../core/components/esp-sign-confirm/esp-sign-confirm.component';
import {UtilsService} from '../../../../core/services/utils.service';
import {UserService} from '../../../../core/services/user.service';
import {historyActions} from './constants/action-btn';
import {AccountService} from "../../../../core/services/account.service";
import {AccountInfoDto} from "../accounts-payments/models/accounts-payments.model";
import {MatMenu, MatMenuTrigger} from "@angular/material/menu";
import {TransactionService} from "../../../../core/services/transaction.service";
import {SvgIconComponent} from 'src/app/shared/components/svg-icon/svg-icon.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ICONS_TYPE} from 'src/app/shared/types';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {HistorySignModalComponent} from "../../../../shared/components/history-sign-modal/history-sign-modal";
import {DeleteModalComponent} from 'src/app/shared/components/delete-modal/delete-modal.component';
import {MatIconModule} from '@angular/material/icon';
import {KartotekaModalComponent} from "../add-payment/modals/kartoteka-modal/kartoteka-modal.component";
import {SaveMyOfficeComponent} from "../accounts-payments/components/save-myoffice/save-myoffice.component";
import {ConfirmSignModalComponent} from "../../../../shared/components/confirm-sign-modal/confirm-sign-modal.component";

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.component.html',
  imports: [
    MatMenu,
    MatDivider,
    SvgIconComponent,
    NgIf,
    TranslateModule,
    NgForOf,
    NgClass,
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
export class TransactionDetailComponent implements OnInit {
  public readonly onDetail = output<string>()
  private readonly accountService = inject(AccountService)
  private readonly transactionService = inject(TransactionService)
  public data: TransactionOneDetailDto = inject(MAT_DIALOG_DATA)
  private _templateService = inject(TemplateService);
  private readonly snackBar = inject(MatSnackBar)
  private destroy = inject(DestroyRef)


  public readonly account = signal<AccountInfoDto | null>(null)
  public readonly auditInfo = signal<any>(null)
  protected readonly Number = Number;
  loading = false;
  public actionButtons = signal<{ title: string; icon: ICONS_TYPE; action: string, titleTranslateKey: string }[]>([
    { action: 'SIGNING', icon: 'hamkor_subscribe_pen', title: 'Подписать', titleTranslateKey: 'createPayment.sign' },
    { action: 'REPEAT', icon: 'hamkor_reverse_right', title: 'Повторить', titleTranslateKey: 'accountStatements.retry' },
    { action: 'REPEAT_PAYMENT', icon: 'hamkor_reverse_right', title: 'Повторить', titleTranslateKey: 'accountStatements.retry' },
    { action: 'EDIT', icon: 'hamkor_edit', title: 'Редактировать', titleTranslateKey: 'createPayment.edit' },
    { action: 'CREATE_TEMPLATE', icon: 'hamkor_template', title: 'Редактировать', titleTranslateKey: 'createPayment.edit' },
    { action: 'MY_OFFICE', icon: 'hamkor_template', title: 'Редактировать', titleTranslateKey: 'createPayment.edit' },
    { action: 'DELETE', icon: 'hamkor_delete', title: 'Удалить', titleTranslateKey: 'createPayment.delete' },
  ]);

  findIconByEnum(carousel: string) {
    return this.actionButtons().find(item => item.action === carousel)
  }

  findCarousel(carousel: string) {
    return this.data.webButtons.some(item => item.carousel === carousel)
  }

  user!: any;
  director!: any;
  headOfFinance!: any;

  userInfo = signal<any>(null)

  constructor(
    private amountService: AmountService,
    private accountsPaymentsService: AccountsPaymentsService,
    private _matDialog: MatDialog,
    protected _matDialogRef: MatDialogRef<TransactionDetailComponent>,
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
    const userInfo = localStorage.getItem("businessInfo");
    if (userInfo) {
      this.userInfo.set(JSON.parse(userInfo));
    }
    this.watchTransactionEsp();
    this.getUserInfo();
    this.getAccount();
    this.getActionsHistory()
  }

  filtered() {
    return this.data.webButtons.filter(item => item.carousel !== 'SEND' && item.carousel !== 'DOWNLOAD' && item.carousel  !== 'PRINTER')
  }

  getActionsHistory() {
    this.transactionService.getTransactionsActionHistory(this.data.id).pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (data) => {
          if(data) {
            this.auditInfo.set(data.actions)
          }
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

  redirectToReversePayment(transaction) {
    if (transaction.transactionMode === "TRANSACTION") {
      localStorage.setItem('transaction', JSON.stringify(transaction));
      this.router.navigate(['/payment/transfer-to-account'], { queryParams: { transactionId: transaction.id, type: "reverse",returnUrl:transaction.returnUrl} });
    }
    this.closeDialog();
  }

  copy(data: any) {
    this.navigator.clipboard.writeText(data)
    this.snackBar.open(`${this.translateService.instant('new.copied')}! ✅`, this.translateService.instant('new.close_1'), { duration: 3000 })
  }

  setStatusImage(status: string): string {
    if (status === 'SUCCESS') {
      return './assets/new-icons/done-status.svg';
    } else if (status === 'COMPLETED') {
      return './assets/new-icons/done-status.svg';
    } else if (status === 'PREPARE') {
      return './assets/new-icons/prepare-status.svg';
    } else if (status === 'AUTO_PAY') {
      return './assets/new-icons/planned-status.svg';
    } else if (status === 'REVERTED') {
      return './assets/new-icons/revision-status.svg';
    } else if (status === 'ERROR') {
      return './assets/new-icons/error-status.svg';
    } else {
      return './assets/new-icons/default-status.svg';
    }
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

  getAccount() {
    this.accountService.getAccountInfo(this.data.isDebit ? this.data.sender.account : this.data.recipient.account)
      .pipe()
      .subscribe(res => {
        if (!res) return
        this.account.set(res)
      })
  }

  buttonActions(action: string, data: any) {
    let isLoan:boolean = this.data.transactionMode == "LOAN_PAYMENT";
   switch (action) {
    case 'REPEAT':
      if (isLoan) this.navigateLoan(data, 'reverse');
      else this.repeatFuncNew(data);
      break;

    case 'EDIT':
      if (isLoan) this.navigateLoan(data, 'edit');
      else this.eidtFuncNew(data);
      break;

    case 'DELETE':
      this.deleteTransaction(data);
      break;

    case 'CREATE_TEMPLATE':
      this.saveTemplate(data?.id);
      break;

    case 'MY_OFFICE':
      this.saveMyOffice(data?.id);
      break;

    case 'REPEAT_PAYMENT':
      this.redirectToReversePayment(data);
      break;

    // case 'autopay':
    //   this.saveTemplate(data?.id);
    //   break;
    }
  }

  navigateLoan(transaction, mode: 'edit' | 'reverse') {
    this.router.navigate([`/loan/pay-off-the-loan/${transaction.id}`], {
      queryParams: {
        mode,
        returnUrl:transaction.returnUrl
      }
    });
  this._matDialogRef.close();
  }


  openKartotekaModal(data: any) {
    this._matDialog.open(KartotekaModalComponent, {
      data: data,
      width: "467px",
      minHeight: "620px"
    });
  }

  repeatFuncNew(transaction: any) {
    this.utilsService.spinnerState$$.next(true);
    this.transactionService.checkKartoteka(transaction.transactionMode).subscribe((res: any) => {
        this.utilsService.spinnerState$$.next(false);
        if (res) {

        if (!res.hasKartoteka2) {
          this.repeatPayment(transaction, false);
          return;
        }

        const hasNeotlojka = res.data.some((item: any) => item.amountType === 'NEOTLOJKA');
        const hasBron      = res.data.some((item: any) => item.amountType === 'BRON');
        const isEmpty      = res.data.length === 0;
        const isMunis      = transaction.transactionMode === 'MUNIS';

        if (isEmpty || (hasBron && isMunis)) {
          this.openKartotekaModal(res.kartoteka2Details);
        } else if (hasNeotlojka || (hasBron && !isMunis)) {
          this.repeatPayment(transaction, true);
        }
      } else {
        this.toastrService.error();
      }

    });
  }

  repeatPayment(transaction: any, isKartoteka = false) {
    const kartotekaParam = isKartoteka ? { isKartoteka: 'kartoteka' } : {};
    const { transactionMode, additionalInfo, id, transactionUuid, returnUrl } = transaction;

    const ROUTES: Partial<Record<string, () => void>> = {
      TRANSACTION: () => this.router.navigate(['/payment/transfer-to-account'], {
        queryParams: { transactionId: returnUrl ? transactionUuid : id, type: 'repeat', returnUrl, ...kartotekaParam }
      }),

      BUDGET: () => {
        const isBudgetIncome = additionalInfo?.windowType === 'BUDGET_INCOME';
        const path = isBudgetIncome ? '/payment/transfer-to-treasure' : '/payment/transfer-to-budget';
        this.router.navigate([path], { queryParams: { transactionId: id, type: 'repeat', ...kartotekaParam } });
      },

      TO_PHYSICAL_CARD: () => this.router.navigate(['/payment/transfer-to-card'], {
        queryParams: { transactionId: id, type: 'repeat', ...kartotekaParam }
      }),

      SALARY: () => this.router.navigate([`/payroll-project/statements/${id}/repeat`], { queryParams: {...kartotekaParam} }),

      CORP_CARD_TOP_UP: () => this.router.navigate(['/payment/transfer-to-corporate-card'], {
        queryParams: { transactionId: id, type: 'repeat', ...kartotekaParam }
      }),

      MUNIS: () => this.router.navigate(['payment/transfer-to-munis/create-transaction'], {
        queryParams: { transactionId: id, type: 'repeat', ...kartotekaParam }
      }),

      CREATE_EPT: () => this.router.navigate(['/EPT/payment'], {
        queryParams: { transactionId: returnUrl ? transactionUuid : id, type: 'repeat', returnUrl, ...kartotekaParam }
      }),
    };

    ROUTES[transactionMode]?.();
    this.closeDialog();
  }

  eidtFuncNew(transaction: any) {
    this.utilsService.spinnerState$$.next(true);
    this.transactionService.checkKartoteka(transaction.transactionMode).subscribe((res: any) => {
      this.utilsService.spinnerState$$.next(false);
      if (res) {

        if (!res.hasKartoteka2) {
          this.editPayment(transaction, false);
          return;
        }

        const hasNeotlojka = res.data.some((item: any) => item.amountType === 'NEOTLOJKA');
        const hasBron      = res.data.some((item: any) => item.amountType === 'BRON');
        const isEmpty      = res.data.length === 0;
        const isMunis      = transaction.transactionMode === 'MUNIS';

        if (isEmpty || (hasBron && isMunis)) {
          this.openKartotekaModal(res.kartoteka2Details);
        } else if (hasNeotlojka || (hasBron && !isMunis)) {
          this.editPayment(transaction, true);
        }
      } else {
        this.toastrService.error();
      }

    });
  }

  formatDate(createdAt: string): string {
    const [datePart, timePart] = createdAt.split(" ");
    const [year, month, day] = datePart.split("-");
    const [hour, minute] = timePart.split(":");

    const translateMonths = [
      'new.january', 'new.february', 'new.march', 'new.april',
      'new.may', 'new.june', 'new.july', 'new.august',
      'new.september', 'new.october', 'new.november', 'new.december'
    ];

    const translateDaysFull = [
      'new.sunday', 'new.monday', 'new.tuesday', 'new.wednesday',
      'new.thursday', 'new.friday', 'new.saturday'
    ];

    const translateDaysShort = [
      'new.sun', 'new.mon', 'new.tue', 'new.wed',
      'new.thu', 'new.fri', 'new.sat'
    ];

    const date = new Date(parseInt(year), parseInt(month, 10) - 1, parseInt(day, 10));
    const currentYear = new Date().getFullYear();
    const isCurrentYear = parseInt(year, 10) === currentYear;

    const monthName = this.translateService.instant(translateMonths[parseInt(month, 10) - 1]);
    const dayOfWeek = date.getDay();

    if (isCurrentYear) {
      const dayName = this.translateService.instant(translateDaysFull[dayOfWeek]);
      return `${parseInt(day, 10)} ${monthName}, ${dayName}, ${hour}:${minute}`;
    } else {
      const dayNameShort = this.translateService.instant(translateDaysShort[dayOfWeek]);
      return `${parseInt(day, 10)} ${monthName} ${year}, ${dayNameShort}, ${hour}:${minute}`;
    }
  }

  editPayment(transaction, isKartoteka: boolean) {
    if (transaction.transactionMode === "TRANSACTION") {
      this.router.navigate(['/payment/transfer-to-account'], {
        queryParams: {
          transactionId: transaction.id,
          mode: this.data.isPreErrorStatusTransactionInMassivePayment ? 'mass' :"transaction",
          returnUrl:transaction.returnUrl,
          isKartoteka: isKartoteka ? 'kartoteka' : undefined,
        },
      });
    }
    else if (transaction.transactionMode === "CREATE_EPT") {
      this.router.navigate(['/EPT/payment'], {
        queryParams: {
          transactionId: transaction.id,
          mode: "transaction",
          returnUrl:transaction.returnUrl,
          isKartoteka: isKartoteka ? 'kartoteka' : undefined,
        },
      });
    }
    else if (transaction.transactionMode === "BUDGET" && transaction.additionalInfo.windowType !== 'BUDGET_INCOME') {
      this.router.navigate(['/payment/transfer-to-budget'], {
        queryParams: {
          transactionId: transaction.id,
          mode: "transaction",
          isKartoteka: isKartoteka ? 'kartoteka' : undefined,
        }
      });
    } else if (transaction.transactionMode === "BUDGET" && transaction.additionalInfo.windowType === 'BUDGET_INCOME') {
      this.router.navigate(['/payment/transfer-to-treasure'], {
        queryParams: {
          transactionId: transaction.id,
          mode: "transaction",
          isKartoteka: isKartoteka ? 'kartoteka' : undefined,
        }
      });
    } else if (transaction.transactionMode === "TO_PHYSICAL_CARD") {
      this.router.navigate(['/payment/transfer-to-card'], {
        queryParams: {
          transactionId: transaction.id,
          mode: "transaction",
          isKartoteka: isKartoteka ? 'kartoteka' : undefined,
        }
      });
    } else if (transaction.transactionMode === "SALARY") {
      this.router.navigate([`/payroll-project/statements/${transaction.id}/edit`], { queryParams: { isKartoteka: isKartoteka ? 'kartoteka' : undefined} });
    } else if (transaction.transactionMode === "CORP_CARD_TOP_UP") {
      this.router.navigate(['/payment/transfer-to-corporate-card'], {
        queryParams: {
          transactionId: transaction.id,
          mode: "transaction",
          isKartoteka: isKartoteka ? 'kartoteka' : undefined,
        }
      });
    } else if (transaction.transactionMode === "MUNIS") {
      this.router.navigate(['payment/transfer-to-munis/create-transaction'], {
        queryParams: {
          transactionId: transaction?.id,
          type: 'edit',
          isKartoteka: isKartoteka ? 'kartoteka' : undefined,
        }
      })
    }
    this.closeDialog();
  }

  protected downloadExcel() {
    this.utilsService.spinnerState$$.next(true);
    this.transactionService.getExcelForTransaction(this.data.id).subscribe(response => {
      this.utilsService.spinnerState$$.next(false);
      if (response?.file) {
        const byteCharacters = atob(response.file);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);

        const blob = new Blob([byteArray], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'report.xlsx';
        a.click();

        window.URL.revokeObjectURL(url);
      } else {
        this.utilsService.spinnerState$$.next(false);
        this.toastrService.error('Excel файл не найден!');
      }
    })
  }

  printPdf() {
    this.transactionService.generatePDF(this.data?.id).subscribe( {
      next: (transaction) => {
        if (transaction?.file) {
          const byteCharacters = atob(transaction.file);
          const byteNumbers = new Array(byteCharacters.length);

          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }

          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], {type: 'application/pdf'});

          const url = URL.createObjectURL(blob);
          const printWindow = window.open(url);

          if (printWindow) {
            printWindow.onload = () => {
              printWindow.focus();
              printWindow.print();
            };
          }
        } else {
          this.toastrService.error('"PDF файл не найден!"')
        }
      },
      error: error => {
        console.error(error, "PDF fayl topilmadi!");
      }
    });
  }

  protected share() {
    const amount  = this.data.isDebit ? this.integerPart(this.data.senderAmount.amount) + '.' + this.decimalPart(this.data.senderAmount.amount)
      : this.integerPart(this.data.receiverAmount.amount) + '.' + this.decimalPart(this.data.receiverAmount.amount)

    const textToShare = `
          'Номер и дата документа': ${'№' + this.data.docNum + ',' + this.formatDate(this.data.lastStatusTime)}
          ${this.translateService.instant('createPayment.amount')}: ${amount}
          ${this.translateService.instant('accounts.organization_name')}: ${this.data?.sender?.name ?? '-'}
          ${this.translateService.instant('salaryStatements.settlement_account_in_sums')}: ${this.data?.sender.account ?? '-'}
          ${this.translateService.instant('createPayment.organization_name')}: ${this.data?.recipient.name ?? '-'}
          ${this.translateService.instant('myAccounts.recipient_account')}: ${this.data?.recipient.account ?? '-'}
          ${this.translateService.instant('myAccounts.inn')}: ${this.data?.recipient.tax ?? '-'}
          ${this.translateService.instant('myAccounts.bank_mfo')}: ${this.data?.recipient.codeFilial ?? '-'}
          ${this.translateService.instant('myAccounts.payment_purpose_code')}: ${this.data?.purpose.code ?? '-'}
          ${this.translateService.instant('myAccounts.payment_purpose')}: ${this.data?.description ?? '-'}
          `.trim();


    if (navigator.share) {
      navigator.share({
        title: '',
        text: textToShare
      }).then(() => {
        this.snackBar.open('Поделились ✅', 'Закрыть', {duration: 2000});
      }).catch((err) => {
        console.error('Share error:', err);
        this.snackBar.open('Не удалось поделиться', 'Закрыть', {duration: 3000});
      });
    } else {
      navigator.clipboard.writeText(textToShare).then(() => {
        this.snackBar.open('Web Share не поддерживается — данные скопированы ✅', 'Закрыть', {duration: 3000});
      }).catch(() => {
        this.snackBar.open('Web Share не поддерживается и копирование не удалось', 'Закрыть', {duration: 3000});
      });
    }
  }



  deleteTransaction(data: any) {
    const transactionId = data.returnUrl && data.status !== 'PRE_ERROR' ? data.transactionUuid : data.id
    this._matDialog.open(DeleteModalComponent, {
          data: {
            title: this.translateService.instant('custom.delete_payment_confirm'),
            agree: this.translateService.instant('story.delete'),
            cancel: this.translateService.instant('story.cancel'),
          }
        }).afterClosed()
          .subscribe({
            next: (res: any) => {
              if(res === 'agree') {
                this.transactionService[data.status === 'PRE_ERROR' ? "deletePreErrorTransaction" : "deleteTransaction"](transactionId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                  next: (res) => {
                    this.toastrService.success(res.msg);
                    this.closeDialog();
                    this.onDetail.emit('sign');
                  },
                  error: (err) => {
                    const message = err.message || err || this.translateService.instant('acc.unknown_error');
                    this.toastrService.error(message)
                  }
                })
              }
            }
          })


  }

  saveTemplate(id: string) {
    if (id) {
      let dialog = this._matDialog.open(SaveTransactionComponent, {
        disableClose: true,
        data: id
      })
      dialog.componentInstance.save
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          dialog.close()
        })
    }
  }
  saveMyOffice(id: string) {
    if (id) {
      let dialog = this._matDialog.open(SaveMyOfficeComponent, {
        disableClose: true,
        maxHeight: "600px",
        maxWidth: "600px",
        data: id
      })
      dialog.componentInstance.save
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          dialog.close()
        })
    }
  }

  handleAction(action: any) {
    this._matDialog.open(EspSignConfirmComponent, {
      width: '744px',
      data: { externalId: this.data.id, action: action.id, type: this.data.transactionMode, successMessage: 'Успешно!' },
    }).afterClosed()
      .subscribe({
        next: res => {
          if (res === 'update') {
            this.onDetail.emit('sign')
          }
        }
      });
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

  formatDocDate(createdAt: string): string {
    const [datePart, timePart] = createdAt.split(" ");
    const [day, month, year] = datePart.split(".");
    const [hour, minute] = timePart.split(":");

    const translateMonths = [
      'new.january', 'new.february', 'new.march', 'new.april',
      'new.may', 'new.june', 'new.july', 'new.august',
      'new.september', 'new.october', 'new.november', 'new.december'
    ];

    const translateDaysFull = [
      'new.sunday', 'new.monday', 'new.tuesday', 'new.wednesday',
      'new.thursday', 'new.friday', 'new.saturday'
    ];

    const translateDaysShort = [
      'new.sun', 'new.mon', 'new.tue', 'new.wed',
      'new.thu', 'new.fri', 'new.sat'
    ];

    const date = new Date(parseInt(year), parseInt(month, 10) - 1, parseInt(day, 10));
    const currentYear = new Date().getFullYear();
    const isCurrentYear = parseInt(year, 10) === currentYear;

    const monthName = this.translateService.instant(translateMonths[parseInt(month, 10) - 1]);
    const dayOfWeek = date.getDay();

    if (isCurrentYear) {
      const dayName = this.translateService.instant(translateDaysFull[dayOfWeek]);
      return `${parseInt(day, 10)} ${monthName}, ${dayName}, ${hour}:${minute}`;
    } else {
      const dayNameShort = this.translateService.instant(translateDaysShort[dayOfWeek]);
      return `${parseInt(day, 10)} ${monthName} ${year}, ${dayNameShort}, ${hour}:${minute}`;
    }
  }

  getActions() {
    const actions = this.data.buttons.length > 0
      ? this.data.buttons.map(action => ({
        id: action.actionType,
        title: action.name,
      }))
      : [];
    return actions;
  }

  // action
  //   :
  //   "SIGN_AND_SEND"
  // excludeTransactions
  //   :
  //   []
  // fileTransactionId
  //   :
  //   "972920fd-7601-495c-97fc-2e1c16e3fe67"
  // includeTransactions
  //   :
  //   [{…}]


  showAcceptSignDialog(action: any) {
    console.log(this.data, "data")
    if (this.data.status === 'AUTO_PAY') {
      this._matDialog.open(ConfirmSignModalComponent, {
      }).afterClosed().subscribe((res) => {
        if (res === 'agree') {
          this.onSubAction(action);
        }
      })
    } else {
      this.onSubAction(action);
    }
  }

  onSubAction(action: { id: string; title: string }) {
    const dialog = this._matDialog.open(HistorySignModalComponent, {
      data: this.data.returnUrl ?  {
        action: {
          isMassivePayment:true,
          massivePaymentData: {
            action: 'SIGN_AND_SEND',
            excludeTransactions: [],
            fileTransactionId: this.route.snapshot.queryParamMap.get('transactionGroupUuid'),
            includeTransactions: [
              {
                id: this.data.transactionUUID,
                mode: "TRANSACTION"
              }
            ]
          },
          type: 'TRANSACTION',
          successMessage: this.translateService.instant('acc.sent_to_the_bank')
        },
        transactionId: 'mass',
        selectedAmount: this.data?.senderAmount.amount / 100,
        // transactionId: this.data.id,
        // transaction: this.data
      } : {
        action:
          { externalId: this.data.id, action: action.id, type: this.data.transactionMode, successMessage: 'Успешно!' },
        transactionId: this.data.transactionUUID ? this.data.transactionUUID : this.data.id,
        transaction: this.data
      }
    });
    dialog.componentInstance.onDetail.subscribe(res => {
      this.onDetail.emit(res);
      dialog.close();
    });
  }

  onAction(action: string) {
    if (action !== 'sign') {
    }
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



  // repeatPayment() {
  //   sessionStorage.setItem('repeat-payment', JSON.stringify(this.data));
  //   this._matDialogRef.close();
  //   if (this.data.transactionMode === 'DEPOSIT_WITHDRAW') {
  //     this.router.navigate(['/deposits/my-deposits/withdraw']);
  //   } else {
  //     this.router.navigate(['/pay'], {
  //       queryParams: {
  //         from: 'repeat-payment'
  //       }
  //     });
  //   }
  // }

  // editPayment() {
  //   sessionStorage.setItem('edit-payment', JSON.stringify(this.data));
  //   let windowType = this.data.additionalInfo?.windowType;
  //   this.editCredit();
  //   if (windowType === 'MUNIS') return;
  //   if (windowType) {
  //     windowType = windowType === 'MUNIS' ? 'P2SERVICE' : windowType;
  //     this._matDialogRef.close();
  //     this.router.navigate(['/pay', windowType], {
  //       queryParams: {
  //         from: 'edit-payment'
  //       }
  //     });
  //   }
  // }

  editCredit() {
    if (this.data.transactionMode === 'LOAN_REPAYMENT' && this.data.additionalInfo?.loanId) {
      this.router.navigate(
        ['/loan/pay-off-the-loan/', this.data.additionalInfo.loanId],
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

    const options: Options = {
      templateLang: 'ru',
      templateLogo: undefined,
      templatePath: '/transaction-details.mustache',
      templateData: {
        ...this.data,
        amount: this.amountService.convertToAmount(this.data.senderAmount.amount || this.data.receiverAmount.amount),
        amountInWords: this.amountService.numberToWordsRU((this.data.senderAmount.amount || this.data.receiverAmount.amount) / 100),
        transfered: formatted,
        signs: !this.data.isDebit ? [] : [{
          director: this.director,
          headOfFinance: this.headOfFinance,
        }],
        dateExec: formatted,
      },
      templateName: 'transaction-details'
    };
    await this._templateService.showPdfInDialog(options, 'landscape');
  }

  getTimeFromISO(dateString: string): string {
    const date = new Date(dateString);

    const intl = new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'short',
    }).format(date);

    return `${intl}`;
  }

  confirm(transaction: TransactionOneDetailDto) {
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

  sign(transaction: TransactionOneDetailDto) {
    this.utilsService.spinnerState$$.next(true);
    this.espConfirmService.paymentSign({
      type: transaction.transactionMode,
      id: transaction.id,
      hash: ''
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        if (res) {
          this._cdRef.detectChanges();
          this.toastrService.success(this.translateService.instant('settings.success'));
          this._matDialogRef.close('update');
        }
      },
      error: (err: any) => {
        this._cdRef.detectChanges();
        const message = err.message || err || this.translateService.instant('acc.unknown_error');
        this.toastrService.error(message);
        this._matDialogRef.close();
      }
    })
  }

  getTransactionType() {
    const type = (this.data.additionalInfo?.windowType || this.data.transactionMode) as TransactionTypes;
    let res = this.getTransactionTypeTranslation(type);
    if (res === 'Транзакция') {
      res = 'Платёжное поручение';
    }
    return res;
  }

  getHistory() {
    return this.data.signedList.filter(el => el.isFinished).sort((a, b) => a.signOrderNumber - b.signOrderNumber);
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


  protected readonly getTransactionTypeTranslation = getTransactionTypeTranslation;
  protected readonly getStatusApplication = getStatusApplication;
  protected readonly historyActions = historyActions;
  protected readonly Math = Math;
  protected readonly navigator = navigator;
}
