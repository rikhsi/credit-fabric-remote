import {
  ChangeDetectionStrategy,
  Component, DestroyRef,
  EventEmitter,
  inject,
  Input,
  Output,
  output, signal
} from '@angular/core';
import {NgClass, NgIf} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {TransactionDetailComponent} from '../../../transaction-detail/transaction-detail.component';
import {getStatusApplication} from '../../../../../../core/utils/mixin.utils';
import {MatMenu, MatMenuTrigger} from "@angular/material/menu";
import {TransactionService} from "../../../../../../core/services/transaction.service";
import {Router} from "@angular/router";
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {SvgIconComponent} from 'src/app/shared/components/svg-icon/svg-icon.component';
import {MatSnackBar} from "@angular/material/snack-bar";
import {UtilsService} from "../../../../../../core/services/utils.service";
import {PaymentService} from "../../../../../../core/services/payment.service";
import {TransactionContent} from "../../../accounts-payments/models/accounts-payments.model";
import {KartotekaModalComponent} from "../../../add-payment/modals/kartoteka-modal/kartoteka-modal.component";
import {ToastrService} from "ngx-toastr";
import {PreparePaymentUzsTransactionResponse} from "../../../../../../entities/transaction/transaction.model";
import {HistorySignModalComponent} from "../../../../../../shared/components/history-sign-modal/history-sign-modal";
import {ICONS_TYPE} from "../../../../../../shared/types";
import {DeleteModalComponent} from "../../../../../../shared/components/delete-modal/delete-modal.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {
  ConfirmSignModalComponent
} from "../../../../../../shared/components/confirm-sign-modal/confirm-sign-modal.component";

@Component({
  selector: 'app-payment',
  imports: [
    NgClass,
    NgIf,
    MatMenu,
    MatMenuTrigger,
    TranslateModule,
    SvgIconComponent
  ],
  templateUrl: './payment.component.html',
  styles: ``,
  styleUrls: ['./payment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentComponent {
  @Input() transaction!: any;
  @Input() onClickShowDetail = false;
  @Input() hideStatus = false;
  @Input() setSelected = false;
  @Input() selected = false;

  private snackBar = inject(MatSnackBar);

  @Output() selectionChange = new EventEmitter<{ id: string, amount: number, checked: boolean }>();

  private readonly transactionService = inject(TransactionService)
  backAction = output<string>()

  constructor(
    private _matDialog: MatDialog,
    private router: Router,
    private translateService: TranslateService,
    private utilsService: UtilsService,
    private toastrService: ToastrService,
    private destroyRef: DestroyRef,
  ) {
  }

  toggleCheckbox(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectionChange.emit({
      id: this.transaction.id,
      amount: this.transaction.isDebit
        ? this.transaction.senderAmount.amount
        : this.transaction.receiverAmount.amount,
      checked
    });
  }

  showAcceptSignDialog(action: any) {
    if (this.transaction.status === 'AUTO_PAY') {
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
  onSubAction(transaction: PreparePaymentUzsTransactionResponse) {
    const dialog = this._matDialog.open(HistorySignModalComponent, {
      data: {
        action: {
          externalId: transaction.id,
          action: 'SIGN_AND_SEND',
          type: transaction.transactionMode,
          successMessage: 'Успешно!'
        },
        transactionId: transaction.id,
        transaction: transaction
      }
    });
    dialog.componentInstance.onDetail.subscribe((res) => {
      if (res === 'sign') {
        this.backAction.emit('sign')
      }
      dialog.close();
    });
  }


  transactionName(transaction) {
    // transaction.sender.name : transaction.recipient.name
    if (transaction.transactionMode === 'TO_PHYSICAL_CARD' && !transaction.isDebit) {
      return transaction.sender.name
    } else if (transaction.transactionMode === 'TO_PHYSICAL_CARD' && transaction.isDebit) {
      return transaction.additionalInfo.pan
    } else if (transaction.transactionMode === 'TRANSACTION' && !transaction.isDebit) {
      return transaction.sender.name
    } else if (transaction.transactionMode === 'TRANSACTION' && transaction.isDebit) {
      return transaction.recipient.name
    } else if (transaction.transactionMode === 'CORP_CARD_TOP_UP' && !transaction.isDebit) {
      return transaction.sender.name
    } else if (transaction.transactionMode === 'CORP_CARD_TOP_UP' && transaction.isDebit) {
      return transaction.recipient.name
    } else if (transaction.transactionMode === 'BUDGET' && !transaction.isDebit) {
      return transaction.sender.name
    } else if (transaction.transactionMode === 'BUDGET' && transaction.isDebit) {
      return transaction.recipient.name
    } else if (transaction.transactionMode === 'CORP_CARD_TOP_UP_CHILD' && transaction.isDebit) {
      return transaction.recipient.name
    } else if (transaction.transactionMode === 'CORP_CARD_TOP_UP_CHILD' && !transaction.isDebit) {
      return transaction.sender.name
    } else if (transaction.transactionMode === 'CORP_CARD_TOP_UP_TRANSIT' && transaction.isDebit) {
      return transaction.recipient.name
    } else if (transaction.transactionMode === 'CORP_CARD_TOP_UP_TRANSIT' && !transaction.isDebit) {
      return transaction.sender.name
    } else if (transaction.transactionMode === 'SALARY') {
      return transaction.additionalInfo.contractNumber
    } else if (transaction.transactionMode === 'SALARY_TRANSIT ') {
      return transaction.additionalInfo.contractNumber
    } else if (transaction.transactionMode === 'MUNIS') {
      return transaction.recipient.name
    } else {
      return transaction.sender.name
    }
  }
  protected downloadExcel() {
    this.utilsService.spinnerState$$.next(true);
    this.transactionService.getExcelForTransaction(this.transaction.id).subscribe(response => {
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
        console.error('Excel файл не найден!');
      }
    })
  }
  protected share() {
          const amount  = this.transaction.isDebit ? this.integerPart(this.transaction.senderAmount.amount) + '.' + this.decimalPart(this.transaction.senderAmount.amount)
          : this.integerPart(this.transaction.receiverAmount.amount) + '.' + this.decimalPart(this.transaction.receiverAmount.amount)

          const textToShare = `
          'Номер и дата документа': ${'№' + this.transaction.docNum + ',' + this.formatDate(this.transaction.lastStatusTime)}
          ${this.translateService.instant('createPayment.amount')}: ${amount}
          ${this.translateService.instant('accounts.organization_name')}: ${this.transaction?.sender?.name ?? '-'}
          ${this.translateService.instant('salaryStatements.settlement_account_in_sums')}: ${this.transaction?.sender.account ?? '-'}
          ${this.translateService.instant('createPayment.organization_name')}: ${this.transaction?.recipient.name ?? '-'}
          ${this.translateService.instant('myAccounts.recipient_account')}: ${this.transaction?.recipient.account ?? '-'}
          ${this.translateService.instant('myAccounts.inn')}: ${this.transaction?.recipient.tax ?? '-'}
          ${this.translateService.instant('myAccounts.bank_mfo')}: ${this.transaction?.recipient.codeFilial ?? '-'}
          ${this.translateService.instant('myAccounts.payment_purpose_code')}: ${this.transaction?.purpose.code ?? '-'}
          ${this.translateService.instant('myAccounts.payment_purpose')}: ${this.transaction?.description ?? '-'}
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

  transactionLogo(transaction) {
    if (transaction.transactionMode === 'TO_PHYSICAL_CARD' && transaction.isDebit) {
      return transaction.recipient.icon?.path + transaction.recipient.icon?.name
    } else if (transaction.transactionMode === 'TO_PHYSICAL_CARD' && !transaction.isDebit) {
      return transaction.sender.icon?.path + transaction.sender.icon?.name
    } else if (transaction.transactionMode === 'TRANSACTION' && transaction.isDebit) {
      return transaction.recipient.icon?.path + transaction.recipient.icon?.name
    } else if (transaction.transactionMode === 'TRANSACTION' && !transaction.isDebit) {
      return transaction.sender.icon?.path + transaction.sender.icon?.name
    } else if (transaction.transactionMode === 'CORP_CARD_TOP_UP' && transaction.isDebit) {
      return transaction.recipient.icon?.path + transaction.recipient.icon?.name
    } else if (transaction.transactionMode === 'BUDGET' && transaction.isDebit) {
      return transaction.recipient.icon?.path + transaction.recipient.icon?.name
    } else if (transaction.transactionMode === 'SALARY' || transaction.transactionMode === 'SALARY_TRANSIT' || transaction.transactionMode === 'MUNIS') {
      return transaction.recipient.icon?.path + transaction.recipient.icon?.name
    } else {
      return transaction.recipient.icon?.path + transaction.recipient.icon?.name
    }
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

  getTimeFromISO(dateString: string): string {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
  }

  showDetails(transaction) {
    if(transaction.transactionMode == 'FILE_TRANSACTION_PARENT') {
       this.router.navigate(
        ['/payment/mass-payments/created-payments', transaction.massFileId],
        {
          queryParams: {
            transactionGroupUuid: transaction.id,
            type: 'all'
          }
        }
      );
    }else {
      if (this.onClickShowDetail && !this.setSelected) {
        const dialog = this._matDialog.open(TransactionDetailComponent, {
          width: '475px',
          height: '100%',
          position: {right: '0'},
          panelClass: 'right-side-dialog',
          data: this.transaction,
        });
        dialog.componentInstance.onDetail.subscribe(res => {
          this.backAction.emit(res)
          dialog.close();
        });
        dialog.afterClosed().subscribe(() => {
          this.backAction.emit('close')
        })
      }
    }
  }

navigateCreatePayment(event:Event,transaction: any) {
  event.stopPropagation()
  this.router.navigate(
    ['/payment/mass-payments/created-payments', transaction.massFileId],
    {
      queryParams: {
        transactionGroupUuid: transaction.id,
        type: 'all'
      }
    }
  );
}
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

  filteredMenu() {
   return  this.transaction.webListButtons.filter(item => item.carousel !== 'SIGNING')
  }

  navigateLoan(transaction, mode: 'edit' | 'reverse') {
    this.router.navigate([`/loan/pay-off-the-loan/${transaction.id}`], {
      queryParams: {
        mode,
        returnUrl:transaction.returnUrl
      }
    });
  }

  buttonActions(action: string, data: any) {
    let isLoan:boolean = data.transactionMode == "LOAN_PAYMENT";
    switch (action) {
      case 'REPEAT':
        if (isLoan) this.navigateLoan(data, 'reverse');
        else this.repeatFuncNew(data);
        break;

      case 'DELETE':
        this.deleteTransaction(data);
        break;

      case 'REPEAT_PAYMENT':
        this.redirectToReversePayment(data);
        break;

      // case 'autopay':
      //   this.saveTemplate(data?.id);
      //   break;
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
                this.backAction.emit('sign');
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

  printPdf(id: string) {
    this.transactionService.generatePDF(id).subscribe(transaction => {
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
        console.error("PDF fayl topilmadi!");
      }
    });
  }

  redirectToReversePayment(transaction) {
    if (transaction.transactionMode === "TRANSACTION") {
      localStorage.setItem('transaction', JSON.stringify(transaction));
      this.router.navigate(['/payment/transfer-to-account'], {
        queryParams: {
          transactionId: transaction.id,
          type: "reverse"
        }
      });
    }
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
  }

  // formatDate(dateString: string): string {
  //   const date = new Date(dateString);
  //   return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long' }).format(date);
  // }
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
      return `${parseInt(day, 10)} ${monthName} ${year}, ${dayNameShort},  ${hour}:${minute}`;
    }
  }

  protected readonly Math = Math;
  protected readonly getStatusApplication = getStatusApplication;
}
