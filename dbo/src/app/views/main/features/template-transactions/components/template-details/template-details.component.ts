import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { TransactionOneDetailDto, TransactionTypes, getTransactionTypeTranslation } from '../../../../../../core/models/transaction.models';
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { Options, TemplateService } from '../../../../../../core/services/template.service';
import { ISelectAction } from '../../../../../../shared/interfaces/select-actions.interface';
import { AmountService } from '../../../../../../core/services/amount.service';
import { AccountsPaymentsService } from '../../../accounts-payments/services/accounts-payments.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EspSignConfirmService } from '../../../../../../core/services/esp-confirm.service';
import { UtilsService } from '../../../../../../core/services/utils.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EspSignConfirmComponent } from '../../../../../../core/components/esp-sign-confirm/esp-sign-confirm.component';
import { getStatusApplication } from 'src/app/core/utils/mixin.utils';
import { MatIcon } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';
import { NgClass, NgForOf } from '@angular/common';
import { PaymentShortComponent } from '../../../../../../shared/components/payment-short/payment-short.component';
// import { MatTooltip } from '@angular/material/tooltip';
import { OperationsService } from '../../../operations/services/operations.service';
import { AutopayService } from '../../../../../../core/services/autopay.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-template-details',
  imports: [
    NgForOf,
    MatIcon,
    // NgOptimizedImage,
    // MatTooltip,
    PaymentShortComponent,
    NgClass,
    MatDialogClose,
    MatRipple,
    // JsonPipe,
    TranslateModule
  ],
    templateUrl: './template-details.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateDetailsComponent implements OnInit {
  public data: any = inject(MAT_DIALOG_DATA);
  public transaction: TransactionOneDetailDto = this.data.transaction;
  public autoPay = this.data.autoPay;
  private _templateService = inject(TemplateService);

  currencyTransactionModes = ['SWIFT', 'CONVERSION_BUY', 'CONVERSION_SELL', 'CONVERSION_CROSS']

  ngOnInit() {
    this.watchTransactionEsp();
    console.log(this.data, "Data")

  }

  loading = false;

  actions: ISelectAction[] = [
    {
      title: 'Подписать и отправить',
      id: 'send',
      disabled: !this.transaction?.canUserSign,
    }
  ];

  constructor(
    private amountService: AmountService,
    private accountsPaymentsService: AccountsPaymentsService,
    private _matDialog: MatDialog,
    private _matDialogRef: MatDialogRef<TemplateDetailsComponent>,
    private destroyRef: DestroyRef,
    private router: Router,
    private toastrService: ToastrService,
    private _cdRef: ChangeDetectorRef,
    private espConfirmService: EspSignConfirmService,
    private utilsService: UtilsService,
    private operationService: OperationsService,
    private autoPayService: AutopayService,
  ) {
  }

  watchTransactionEsp() {
    this.utilsService.updateTransactions
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          if(res === 'update') {
            this._matDialogRef.close('update');
          }
        }
      })
  }

  copyPattern(pattern: any) {
    if(this.currencyTransactionModes.includes(pattern.transactionMode)) {
      pattern.timeout = 2000;
      this.operationService.conversionTemplate.next(pattern);
      if(pattern.transactionMode === 'SWIFT') {
        this.router.navigate(['create-swift'], {
          queryParams: { from: 'swift-template' }
        });
      } else if (this.transaction.transactionMode === 'CONVERSION_BUY') {
        this.router.navigate(['create-currency-buy'], {
          queryParams: { from: 'buy-template' }
        });
      } else if (this.transaction.transactionMode === 'CONVERSION_SELL') {
        this.router.navigate(['create-currency-sell'],  {
          queryParams: { from: 'sell-template' }
        });
      }
      this._matDialogRef.close();
    } else {
      sessionStorage.setItem('template-payment', JSON.stringify(pattern));
      let windowType = pattern.additionalInfo?.windowType;
      if(windowType === 'MUNIS') return;
      if(windowType) {
        windowType = windowType === 'MUNIS' ? 'P2SERVICE' : windowType;
        this.router.navigate(['/pay', windowType], {
          queryParams: {
            from: 'template-payment',
            transactionId: pattern.id
          }
        });
        this._matDialogRef.close();
      }
    }
  }

  editPayment() {
    if(this.currencyTransactionModes.includes(this.transaction.transactionMode)) {
      sessionStorage.setItem('template-currency', JSON.stringify(this.transaction));
      this.operationService.conversionTemplate.next(
        {
          ...this.transaction,
          timeout: 2000
        }
      );
      if(this.transaction.transactionMode === 'SWIFT') {
        this.router.navigate(['create-swift'],{
          queryParams: {
            from: 'edit-template',
          }
        });
      } else if (this.transaction.transactionMode === 'CONVERSION_BUY') {
        this.router.navigate(['create-currency-buy'], {
          queryParams: {
            from: 'edit-template',
          }
        });
      } else if (this.transaction.transactionMode === 'CONVERSION_SELL') {
        this.router.navigate(['create-currency-sell'],{
          queryParams: {
            from: 'edit-template',
          }
        });
      }
      this._matDialogRef.close();
    } else {
      sessionStorage.setItem('template-payment', JSON.stringify(this.transaction));
      if (this.autoPay) {
        sessionStorage.setItem('auto-payment', JSON.stringify(this.autoPay));
      }
      let windowType = this.transaction.additionalInfo?.windowType;
      if(windowType === 'MUNIS') return;
      if(windowType) {
        windowType = windowType === 'MUNIS' ? 'P2SERVICE' : windowType;
        this._matDialogRef.close();
        this.router.navigate(['/pay', windowType], {
          queryParams: {
            from: 'template-payment',
            to: 'edit-template',
          }
        });
      }
    }
  }

  async printTransactionDetailsPdf() {
    const options: Options = {
      templateLang: 'ru',
      templateLogo: undefined,
      templatePath: '/transaction-details.mustache',
      templateData: {
        ...this.transaction,
        amount: this.amountService.convertToAmount(this.transaction.senderAmount.amount),
        amountInWords: this.amountService.numberToWordsRU(this.transaction.senderAmount.amount / 100),
        transfered: this.getTimeFromISO(this.transaction.docDate),
      },
      templateName: 'transaction-details'
    };
    await this._templateService.showPdfInDialog(options);
  }

  getTimeFromISO(dateString: string): string {
    const date = new Date(dateString);

    const intl = new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'short',
    }).format(date);

    return `${intl}`;
  }

  confirm(transaction: TransactionOneDetailDto) {
    if(!transaction.id) {
      return;
    }
    this.utilsService.spinnerState$$.next(true);
    this._matDialog.open(EspSignConfirmComponent, {
      width: '744px',
      data: {action: {externalId: transaction.id, type: transaction.transactionMode, successMessage: 'Отправлен в Банк!'}, transaction: {}},
    }).afterClosed()
      .subscribe({
        next: res => {
          if(res === 'update') {
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
        if(res) {
          this._cdRef.detectChanges();
          this.toastrService.success('Успешно!');
          this._matDialogRef.close('update');
        }
      },
      error: (err: any) => {
        this._cdRef.detectChanges();
        const message = err.message || err || 'Неизвестная ошибка!';
        this.toastrService.error(message);
        this._matDialogRef.close();
      }
    })
  }

  deleteAutoPay() {
    this.autoPayService.deleteAutoPay(this.autoPay.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
            this._matDialogRef.close('update');
            this._cdRef.markForCheck();
          }
        },
        error: (err: any) => {
          this.toastrService.error(err.message || err || 'Неизвестная ошибка');
        }
      });
  }

  getTransactionType() {
    const type = (this.transaction.additionalInfo?.windowType || this.transaction.transactionMode) as TransactionTypes;
    let res = this.getTransactionTypeTranslation(type);
    if(res === 'Транзакция') {
      res = 'Платёжное поручение';
    }
    return res;
  }

  protected readonly getTransactionTypeTranslation = getTransactionTypeTranslation;
  protected readonly getStatusApplication = getStatusApplication;
}
