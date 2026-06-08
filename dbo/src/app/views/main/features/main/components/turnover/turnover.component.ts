import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { AccountsPaymentsService } from '../../../accounts-payments/services/accounts-payments.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgxMaskPipe } from 'ngx-mask';
import {MatRipple} from "@angular/material/core";
import {UiSvgIconComponent} from "../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { AccountService } from '../../../../../../core/services/account.service';
import { AccountsDto } from '../../../accounts-payments/models/accounts-payments.model';
import { AmountService } from '../../../../../../core/services/amount.service';

@Component({
    selector: 'app-turnover',
    imports: [
        NgxMaskPipe,
        MatRipple,
        UiSvgIconComponent,
        MatMenu,
        MatMenuTrigger
    ],
    templateUrl: './turnover.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TurnoverComponent implements OnInit {
  accounts: AccountsDto[] = [];

  constructor(
    private accountsPaymentsService: AccountsPaymentsService,
    private destroyRef: DestroyRef,
    private _cdRef: ChangeDetectorRef,
    private accountService: AccountService,
    public amountService: AmountService,
  ) {
  }

  transaction!: any;

  ngOnInit() {
    this.getDailyTransactions();
    this.getAccounts();
  }

  getDailyTransactions() {
    this.accountsPaymentsService.getDailyTransaction()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
            this.transaction = res;
            this._cdRef.markForCheck();
          }
        }
      });
  }

  getAccounts() {
    this.accountService.getAccountList(
      { page: 0, size: 100 },
      {
        accountPrefixes: ['SETTLEMENT'],
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(!res) return;
          this.accounts = res.content;
          this._cdRef.detectChanges();
        },
        error: (err) => {

        }
      });
  }

  updateTurnoverAccount(acc: AccountsDto) {
    this.accountService.updateAccountDailyTransaction(acc.altAcctId, `${acc.id}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(!res) return;
          this.getDailyTransactions();
        }
      });
  }
}
