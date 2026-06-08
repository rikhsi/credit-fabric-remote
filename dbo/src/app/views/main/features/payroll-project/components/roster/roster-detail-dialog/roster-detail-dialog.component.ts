import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Output,
  signal
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef} from "@angular/material/dialog";
import {TransactionContent} from "../../../../accounts-payments/models/accounts-payments.model";
import {MatIcon} from "@angular/material/icon";
import {MatRipple} from "@angular/material/core";
import {NgClass, NgForOf, NgOptimizedImage} from "@angular/common";
import {PaymentShortComponent} from "../../../../../../../shared/components/payment-short/payment-short.component";
import {SelectActionComponent} from "../../../../../../../shared/components/select-action/select-action.component";
import {getStatusApplication} from "../../../../../../../core/utils/mixin.utils";
import {AmountService} from "../../../../../../../core/services/amount.service";
import {Router} from "@angular/router";
import {ISelectAction} from "../../../../../../../shared/interfaces/select-actions.interface";
import {
  EspSignConfirmComponent
} from "../../../../../../../core/components/esp-sign-confirm/esp-sign-confirm.component";
import {UtilsService} from "../../../../../../../core/services/utils.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {EspSignConfirmService} from "../../../../../../../core/services/esp-confirm.service";
import {ToastrService} from "ngx-toastr";
import {AccountsPaymentsService} from "../../../../accounts-payments/services/accounts-payments.service";
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-roster-detail-dialog',
    imports: [
        MatDialogClose,
        MatIcon,
        MatRipple,
        NgForOf,
        NgOptimizedImage,
        PaymentShortComponent,
        SelectActionComponent,
        NgClass,
        TranslateModule
    ],
    templateUrl: './roster-detail-dialog.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RosterDetailDialogComponent {
  private _dialogRef = inject(MatDialogRef<RosterDetailDialogComponent>)
  @Output() onRosterDetail = new EventEmitter<void>()
  public data = signal<TransactionContent>(inject(MAT_DIALOG_DATA))
  public amountService = inject(AmountService)
  private _router = inject(Router)
  private _utilsService = inject(UtilsService)
  private _matDialog = inject(MatDialog)
  #destroy = inject(DestroyRef)
  private _espConfirmService = inject(EspSignConfirmService)
  private _toastrService = inject(ToastrService)
  private _accountsPaymentsService = inject(AccountsPaymentsService)
  prepareActions: ISelectAction[] = [
    {
      title: 'Отправить на подпись',
      id: 'sign'
    },
  ]

  actions: ISelectAction[] = [
    {
      title: 'Подписать и отправить',
      id: 'send',
      disabled: !this.data()?.canUserSign,
    }
  ];

  getTimeFromISO(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ru-Ru');
  }

  getActions() {
    if (['NEW', 'PREPARE'].includes(this.data().status)) {
      return this.prepareActions;
    } else if (this.data().status === 'SIGN') {
      return this.actions;
    } else {
      return [];
    }
  }


  onAction(action: ISelectAction) {
    switch (action.id) {
      case 'send':
        this.confirm(this.data());
        break;
      case 'sign':
        this.sign(this.data());
        break;
      default:
        console.log(action);
    }
  }

  protected readonly getStatusApplication = getStatusApplication;

  navigateToEdit(res: TransactionContent) {
    if (res) {
      this._dialogRef.close()
      this._router.navigate(['payroll-project/employees/roaster/edit', res.recipient.account, res.additionalInfo?.contractNumber, res.sender.account, res.additionalInfo?.parentId, res.additionalInfo?.year, res.additionalInfo?.month, res.id, res.type ?? '', res.description, res.transactionMode, res.docNum])
    }
  }

  deleteTransaction(data: TransactionContent) {
    const status = this.data().status;
    if (!['NEW', 'PREPARE'].includes(status)) {
      this._toastrService.error('Вы можете удалить только созданную транзакцию!');
      return;
    }
    this._accountsPaymentsService.deletePreparedTransaction(data.id)
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe({
        next: (res) => {
          if (res?.msg) {
            this._toastrService.success('Транзакция успешно удалена!');
            this._dialogRef.close('update')
          }
        }
      })
  }


  navigateToInside(parentId: string | undefined, docNum: string, transactionMode: string) {
    if (parentId) {
      this._dialogRef.close()
      if (transactionMode === 'SALARY') this._router.navigate(['/payroll-project/roster/cards', docNum, parentId])
      if (transactionMode === 'CORP_CARD_TOP_UP') this._router.navigate(['/corp-card-project/roster/cards', docNum, parentId])

    }
  }

  confirm(transaction: TransactionContent) {
    if (!transaction.id) {
      return;
    }
    this._utilsService.spinnerState$$.next(true);
    this._matDialog.open(EspSignConfirmComponent, {
      width: '744px',
      data: {action: {externalId: transaction.id, type: transaction.transactionMode, successMessage: 'Отправлен в Банк!'}, transaction: {}},
    }).afterClosed()
      .subscribe({
        next: res => {
          if (res === 'update') {
            this._dialogRef.close('update');
          }
        }
      });
  }

  sign(transaction: TransactionContent) {
    this._utilsService.spinnerState$$.next(true);
    this._espConfirmService.paymentSign({
      type: transaction.transactionMode,
      id: transaction.id,
      hash: ''
    }).pipe(takeUntilDestroyed(this.#destroy)).subscribe({
      next: (res) => {
        if (res) {

          this._toastrService.success('Успешно!');
          this._dialogRef.close('update');
        }
      },
      error: (err: any) => {
        const message = err.message || err || 'Неизвестная ошибка!';
        this._toastrService.error(message);
        this._dialogRef.close();
      }
    })
  }
}
