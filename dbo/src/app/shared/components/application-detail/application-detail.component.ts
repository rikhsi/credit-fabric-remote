import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';
import { NgClass, NgForOf, NgOptimizedImage } from '@angular/common';
import { PaymentShortComponent } from '../payment-short/payment-short.component';
import { SelectActionComponent } from '../select-action/select-action.component';
import { ISelectAction } from '../../interfaces/select-actions.interface';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EspSignConfirmService } from '../../../core/services/esp-confirm.service';
import { UtilsService } from '../../../core/services/utils.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTooltip } from '@angular/material/tooltip';
import {
  EspSignApplicationComponent
} from '../../../core/components/esp-sign-application/esp-sign-application.component';
import { getStatusApp } from '../../../core/utils/mixin.utils';
import { EspSignConfirmComponent } from '../../../core/components/esp-sign-confirm/esp-sign-confirm.component';
import { UserService } from '../../../core/services/user.service';

@Component({
    selector: 'app-application-detail',
    imports: [
        MatDialogClose,
        MatIcon,
        MatRipple,
        NgForOf,
        NgOptimizedImage,
        PaymentShortComponent,
        SelectActionComponent,
        NgClass,
        MatTooltip
    ],
    templateUrl: './application-detail.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationDetailComponent implements OnInit {
  public data: any = inject(MAT_DIALOG_DATA)

  loading = false;
  user!: any;

  getActions() {
    if(this.data.buttons.length > 0) {
      return this.data.buttons.map(action => ({
        id: action.actionType,
        title: action.name,
      }));
    }
    return [];
  }

  constructor(
    private _matDialog: MatDialog,
    private _matDialogRef: MatDialogRef<ApplicationDetailComponent>,
    private destroyRef: DestroyRef,
    private router: Router,
    private toastrService: ToastrService,
    private _cdRef: ChangeDetectorRef,
    private espConfirmService: EspSignConfirmService,
    private utilsService: UtilsService,
    private userService: UserService,
  ) {
  }

  ngOnInit() {
    this.watchApplicationEsp();
    this.getUser();
  }

  getUser() {
    this.userService.userInfo$$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => {
        this.user = user;
        console.log(user);
      })
  }

  watchApplicationEsp() {
    this.utilsService.updateTransactions
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          if(res === 'update-currency-buy') {
            this._matDialogRef.close();
          }
        }
      })
  }

  onAction(action: ISelectAction) {
    this.handleAction(action.id);
    // switch (action.id) {
    //   case 'send':
    //     this.confirm(this.data);
    //     break;
    //   case 'sign':
    //     this.sign(this.data);
    //     break;
    //   default:
    //     console.log(action);
    // }
  }

  getTimeFromISO(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ru-Ru');
  }

  handleAction(action: any) {
    if(!this.data.applicationId) {
      return;
    }

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
          action: action,
          type: this.data.transactionMode,
          successMessage: 'Успешно!',
        },
        transaction: {},
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
    this.utilsService.spinnerState$$.next(true);

    let transactionId: any = transaction.conversionApplicationDto?.transactionId ||
      transaction.depositOpenApplicationRes?.transactionId ||
      null;

    this._matDialog.open(EspSignApplicationComponent, {
      width: '744px',
      data: {
        applicationId: transaction.applicationId,
        transactionId,
        updateMessage: 'update-currency-buy',
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

  protected readonly Math = Math;
  protected readonly getStatusApplication = getStatusApp;
}
