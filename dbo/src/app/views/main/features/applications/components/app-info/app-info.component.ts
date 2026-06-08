import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { TemplateService } from '../../../../../../core/services/template.service';
import { ISelectAction } from '../../../../../../shared/interfaces/select-actions.interface';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EspSignConfirmService } from '../../../../../../core/services/esp-confirm.service';
import { UtilsService } from '../../../../../../core/services/utils.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  EspSignApplicationComponent
} from '../../../../../../core/components/esp-sign-application/esp-sign-application.component';
import { getStatusApp } from '../../../../../../core/utils/mixin.utils';
import { getTransactionTypeTranslation } from '../../../../../../core/models/transaction.models';
import { MatIcon } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';
import { SelectActionComponent } from '../../../../../../shared/components/select-action/select-action.component';
import { NgClass } from '@angular/common';
import { CreateAccountDetailComponent } from '../crete-account-detail/create-account-detail.component';
import { CloseAccountDetailComponent } from '../close-account-detail/close-account-detail.component';
import { ConversionBuyDetailComponent } from '../conversion-buy-detail/conversion-buy-detail.component';
import { ConversionSellDetailComponent } from '../conversion-sell-detail/conversion-sell-detail.component';
import { ConversionCrossDetailComponent } from '../conversion-cross-detail/conversion-cross-detail.component';
import { SwiftShortDetailComponent } from '../swift-short-detail/swift-short-detail.component';
import { OpenDepositDetailComponent } from '../open-deposit-detail/open-deposit-detail.component';
import { CloseDepositDetailComponent } from '../close-deposit-detail/close-deposit-detail.component';
import { EspSignConfirmComponent } from '../../../../../../core/components/esp-sign-confirm/esp-sign-confirm.component';
import { AppAccreditDetailComponent } from '../app-accredit-detail/app-accredit-detail.component';

@Component({
    selector: 'app-app-info',
    imports: [
        MatDialogClose,
        MatIcon,
        MatRipple,
        SelectActionComponent,
        NgClass,
        CreateAccountDetailComponent,
        CloseAccountDetailComponent,
        ConversionBuyDetailComponent,
        ConversionSellDetailComponent,
        ConversionCrossDetailComponent,
        SwiftShortDetailComponent,
        OpenDepositDetailComponent,
        CloseDepositDetailComponent,
        AppAccreditDetailComponent
    ],
    templateUrl: './app-info.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppInfoComponent implements OnInit {
  public data: any = inject(MAT_DIALOG_DATA)
  private _templateService = inject(TemplateService);

  loading = false;


  actions: ISelectAction[] = [
    {
      title: 'Подписать и отправить',
      id: 'send',
      disabled: !this.data?.canUserSign,
    }
  ];

  prepareActions: ISelectAction[] = [
    {
      title: 'Отправить на подпись',
      id: 'sign'
    },
  ]
  getActions() {
    if(this.data.buttons.length > 0) {
      return this.data.buttons.map(action => ({
        id: action.actionType,
        title: action.name,
      }));
    }
    return [];

    // if(this.data.applicationStatus === 'NEW') {
    //   return this.prepareActions;
    // } else if(this.data.applicationStatus === 'SIGN') {
    //   return this.actions;
    // } else {
    //   return [];
    // }
  }

  constructor(
    private _matDialog: MatDialog,
    private _matDialogRef: MatDialogRef<AppInfoComponent>,
    private destroyRef: DestroyRef,
    private router: Router,
    private toastrService: ToastrService,
    private _cdRef: ChangeDetectorRef,
    private espConfirmService: EspSignConfirmService,
    private utilsService: UtilsService,
  ) {
  }


  ngOnInit() {
    this.watchApplicationEsp();
  }

  watchApplicationEsp() {
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
  onAction(action: ISelectAction) {
    this.handleAction(action.id);
  }

  getTimeFromISO(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ru-Ru');
  }

  handleAction(action: any) {
    if(!this.data.applicationId) {
      return;
    }
    this.utilsService.spinnerState$$.next(true);

    let transactionId: any = this.data.conversionApplicationDto?.transactionId ||
      this.data.depositOpenApplicationRes?.transactionId ||
      null;

    this._matDialog.open(EspSignConfirmComponent, {
      width: '744px',
      data: {
        action: {
          isApplication: true,
          transactionId,
          applicationId: this.data.applicationId,
          externalId: this.data.applicationId,
          action: action.id,
          type: this.data.transactionMode,
          successMessage: 'Успешно!',
        },
        transaction: {}
      },
    }).afterClosed()
      .subscribe({
        next: res => {
          if(res === 'update') {
            this.utilsService.updateTransactions.next('update-applications');
            this._matDialogRef.close('update');
            this._cdRef.detectChanges();
          }
        }
      });
  }

  confirm(transaction: any) {
    if(!transaction.applicationId) {
      return;
    }

    let transactionId: any = transaction.conversionApplicationDto?.transactionId ||
      transaction.depositOpenApplicationRes?.transactionId ||
      null;

    this._matDialog.open(EspSignApplicationComponent, {
      width: '744px',
      data: {
        applicationId: transaction.applicationId,
        transactionId,
        updateMessage: 'update',
      },
    }).afterClosed()
      .subscribe(res => {
        if(res === 'update') {
          this.utilsService.updateTransactions.next('update-applications');
          this.toastrService.success('Отправлен в Банк!');
          this._cdRef.detectChanges();
          this._matDialogRef.close('update');
        }
      });
  }

  sign(transaction: any) {
    this.utilsService.spinnerState$$.next(true);

    let transactionId: any = transaction.conversionApplicationDto?.transactionId ||
      transaction.depositOpenApplicationRes?.transactionId ||
      null;

    this.espConfirmService.signApplication({
      transactionId,
      applicationId: transaction.applicationId,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        if(res) {
          this.utilsService.spinnerState$$.next(false);
          this.toastrService.success('Отправлен на подпись!');
          this._matDialogRef.close('update');
          this._cdRef.detectChanges();
        }
      },
      error: (err) => {
        this.utilsService.spinnerState$$.next(false);
        this.toastrService.error(err?.message || err);
        this._cdRef.detectChanges();
      }
    })
  }

  getDate(isoString: string) {
    return new Date(isoString).toLocaleDateString('ru-Ru');
  }

  convertAmount(amount: number) {
    const integerPart = this.separateNumberByThree(Math.floor(amount / 100));
    const fractionalPart = `${amount % 100}`?.padStart(2, '0');
    return `${integerPart},${fractionalPart}`;
  }

  separateNumberByThree(value: string | number): string {
    const strValue = value.toString();

    return strValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  protected readonly getTransactionTypeTranslation = getTransactionTypeTranslation;
  protected readonly Math = Math;
  protected readonly getStatusApplication = getStatusApp;
}
