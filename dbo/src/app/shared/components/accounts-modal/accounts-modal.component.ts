import { ChangeDetectionStrategy, Component, DestroyRef, Inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NgOptimizedImage } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AccountsDto } from '../../../views/main/features/accounts-payments/models/accounts-payments.model';
import { NgxMaskPipe } from 'ngx-mask';
import { ScrollableDirective } from '../../../core/utils/scrollable.directive';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { takeUntil } from 'rxjs';
import {
  AccountsPaymentsDetailsComponent
} from '../../../views/main/features/accounts-payments/components/accounts-payments-details/accounts-payments-details.component';
import {
  AccountsPaymentsService
} from '../../../views/main/features/accounts-payments/services/accounts-payments.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AccountService } from '../../../core/services/account.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-accounts-modal',
    imports: [
        MatIcon,
        NgOptimizedImage,
        MatTooltip,
        NgxMaskPipe,
        ScrollableDirective,
        MatMenu,
        MatMenuTrigger
    ],
    templateUrl: './accounts-modal.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountsModalComponent {
  currencyNamesInRussian: {[key: string]: string} = {
    UZS: 'сумах',
    USD: 'долларах',
    RUB: 'рублях',
    EUR: 'евро',
    KZT: 'тенге',
    GBP: 'фунтах',
    AED: 'дирхамах',
    JPY: 'йенах',
    CHF: 'франках'
  };

  constructor(
    private clipboard: Clipboard,
    private toastrService: ToastrService,
    private dialogRef: MatDialogRef<AccountsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { accounts: AccountsDto[] },
    private accountService: AccountService,
    private destroyRef: DestroyRef,
    private matDialog: MatDialog,
    private router: Router,
  ) {
  }

  copyAcc(acc: string) {
    const res = this.clipboard.copy(acc);

    if(res) {
      this.toastrService.success('Скопировано!');
    }
  }

  divideAccount(account: string) {
    const first = account.slice(0, 5);
    const second = account.slice(5, 8);
    const third = account.slice(8, 9);
    const middle = account.slice(9, -3);
    const last = account.slice(-3);
    return `${first} ${second} ${third} ${middle} ${last}`;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  openHistory(account: any) {
    this.router.navigate(['account-history', account.id], {
      queryParams: {
        accountNumber: account.altAcctId,
      }
    });
    this.dialogRef.close();
  }

  getInfo(accountNumber: string) {
    this.accountService.getAccountInfo(accountNumber)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
      if (!res) return
      this.matDialog.open(AccountsPaymentsDetailsComponent, {
        data: {
          ...res,
          altAcctId: accountNumber,
        },
        width: '400px',
        height: '100%',
        position: { right: '0' },
        panelClass: 'right-side-dialog',
      }).afterClosed()
        .subscribe((res) => {
        })
    })
  }

  protected readonly Math = Math;
}
