import { inject, input, OnChanges, OnInit, output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SvgIconComponent } from 'src/app/shared/components/svg-icon/svg-icon.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { GetPaymentImportFileDataRes, GetPaymentImportFileDataResContent } from 'src/app/views/main/features/mass-payments/models/mass-payments.model';
import { HighlightDirective } from 'src/app/shared/directives/high-light.directive';
import { Router, RouterLink } from '@angular/router';
import {ConversionKey, CreatedPaymentsKey} from 'src/app/views/main/features/new-main/constants/new-main.const';
import { TransactionDetailComponent } from 'src/app/views/main/features/transaction-detail/transaction-detail.component';
import { MatDialog } from '@angular/material/dialog';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { finalize } from 'rxjs';
import {MassPaymentsService} from "../../../../mass-payments/services/mass-payments.service";
import {UtilsService} from "../../../../../../../core/services/utils.service";



@Component({
  selector: 'app-conversion-list-item',
  imports: [
    CommonModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    SvgIconComponent,
    MatTooltipModule,
    HighlightDirective,
  ],
  templateUrl: './conversion-list.component.html',
  styleUrl:'./conversion-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone:true
})
export class ConversionListComponent implements OnInit , OnChanges {
  private router = inject(Router)
  @Input() transaction!: GetPaymentImportFileDataResContent | any;
  @Input() setSelected = false;
  @Input() selected = false;
  @Input() onClickShowDetail = true;
  searchText = input.required<string>()
  tabType = input.required<ConversionKey>()
  @Output() sign = new EventEmitter<void>();
  @Output() repeat = new EventEmitter<void>();
  @Output() share = new EventEmitter<void>();
  @Output() print = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<{ id: string, amount: number, checked: boolean }>();
  _matDialog = inject(MatDialog)
  backAction = output<string>()
  transactionService = inject(TransactionService)
  translateService = inject(TranslateService)
  snackBar = inject(MatSnackBar)
  private massPaymentsService = inject(MassPaymentsService)
  private utilsService = inject(UtilsService)
  SVG_URL = environment.SVG_URL

  ngOnChanges(changes: SimpleChanges): void {

  }

  ngOnInit(): void {

  }

  showDetails(event: Event): void {
    event.stopPropagation();

    if (!this.onClickShowDetail || this.setSelected) {
      return;
    }

    this.utilsService.spinnerState$$.next(true);

    this.massPaymentsService
      .getFileTransactionDetail(this.transaction.id)
      .pipe(
        finalize(() => this.utilsService.spinnerState$$.next(false))
      )
      .subscribe({
        next: (res) => {
          if (!res) return;

          this.openTransactionDetail(
            {
              ...res,
              transactionUUID: this.transaction.transactionId
            },
            true
          );
        },
        error: () => {
          console.error('Error while loading transaction detail');
        }
      });
  }


  private openTransactionDetail(transaction,isPreErrorStatusTransactionInMassivePayment:boolean) {
    const dialog = this._matDialog.open(TransactionDetailComponent, {
      width: '475px',
      height: '100%',
      position: {right: '0'},
      panelClass: 'right-side-dialog',
      data: {
        ...transaction,
        returnUrl: this.router.url,
        isPreErrorStatusTransactionInMassivePayment,
      },
    });
    dialog.componentInstance.onDetail.subscribe(res => {
      this.backAction.emit(res)
      console.log(res, "emit")
      dialog.close();
    });
    dialog.afterClosed().subscribe(() => {
      this.backAction.emit('close')
    })
  }




  decimalPart(balance): string {
    const amount = (balance ?? 0) / 100;
    const [, dec] = amount.toFixed(2).split('.');
    return dec;
  }



  formatAmount(amount: number): string {
    return amount.toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  getStatusIcon(): string {
    const icons = {
      pending: 'schedule',
      signed: 'check_circle',
      completed: 'check_circle'
    };
    return icons[this.transaction.status] || 'help';
  }


  integerPart(balance): string {
    const amount = (balance ?? 0) / 100;
    const [int] = amount.toFixed(2).split('.');
    return Number(int).toLocaleString().replace(/,/g, ' ');
  }


  handleTransactionEdit(event:Event,transaction: GetPaymentImportFileDataResContent): void {
    event.stopPropagation()
    const returnUrl = this.router.url;

    this.router.navigate(
      ['/payment/transfer-to-account'],
      {
        queryParams: {
          transactionId: this.handleTransactionId(transaction),
          mode: this.handleTransactionMode(transaction),
          returnUrl
        }
      }
    );
  }

  private handleTransactionMode(transaction) {
    if(this.tabType() == 'all' || this.tabType() == 'errors') {
      if(transaction.status.code == 'PRE_ERROR' && transaction.transactionId == null) {
        return 'mass'
      }
    }
    return 'transaction'
  }

  private handleTransactionId(transaction) {
    return transaction.transactionId ? transaction.transactionId : transaction.id
  }

  toggleCheckbox(event: Event) {
    event.stopPropagation()
    const checked = (event.target as HTMLInputElement).checked;
    this.selectionChange.emit({
      id: this.transaction.transactionId,
      amount:  this.transaction.senderAmount.amount,
      checked
    });

    console.log('transaction',this.transaction)
  }



  // #region PAYMENT
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
    }
  }

  transactionName(transaction) {
    // transaction.sender.name : transaction.recipient.name
    if (transaction.transactionMode === 'TO_PHYSICAL_CARD' && !transaction.isDebit) {
      return transaction.sender.name
    } else if (transaction.transactionMode === 'TO_PHYSICAL_CARD' && transaction.isDebit) {
      return transaction.additionalInfo.pan
    }
    // !!todo o'zgaryapti sababi recipient.name null kevoti
    else if (transaction.transactionMode === 'TRANSACTION' && !transaction.isDebit) {
      return transaction.sender.name
    } else if (transaction.transactionMode === 'TRANSACTION' && transaction.isDebit) {
      return transaction.sender.name
    }

    else if (transaction.transactionMode === 'CORP_CARD_TOP_UP' && !transaction.isDebit) {
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
    }
  }

  repeatPayment(event:Event,transaction) {
    event.stopPropagation()
    this.router.navigate(['/payment/transfer-to-account'], {
      queryParams: {
        transactionId: transaction.transactionId,
        type: "repeat"
      }
    });
  }


  formatDate(createdAt: string): string {
    const [datePart, timePart] = createdAt.split(" ");
    const [day, month, year] = datePart.split("-");
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

    return `${year} ${monthName} ${parseInt(day, 10)}, ${hour}:${minute}`;
  }

  onShare (event:Event) {
    event.stopPropagation()
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


  redirectToReversePayment(event:Event,transaction) {
    event.stopPropagation()
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

  protected downloadExcel() {
    this.utilsService.spinnerState$$.next(true);
    this.transactionService.getExcelForTransaction(this.transaction.transactionId).subscribe(response => {
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


  printPdf(event:Event,id: string) {
    event.stopPropagation()
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

  // #endregion PAYMENT


}
