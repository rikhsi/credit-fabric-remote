import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';
import { PaginatorComponent } from '../../../../../../shared/components/paginator/paginator.component';
import { AccountsPaymentsService } from '../../../accounts-payments/services/accounts-payments.service';
import { AccountsDto } from '../../../accounts-payments/models/accounts-payments.model';
import { AccountComponent } from '../../../../../../shared/components/account/account.component';
import { MatDialog } from '@angular/material/dialog';
import { AccountsModalComponent } from '../../../../../../shared/components/accounts-modal/accounts-modal.component';
import { AccountService } from '../../../../../../core/services/account.service';

@Component({
    selector: 'app-accounts',
    imports: [
        NgOptimizedImage,
        NgClass,
        MatAccordion,
        MatExpansionPanel,
        PaginatorComponent,
        AccountComponent
    ],
    templateUrl: './accounts.component.html',
    styles: ``,
    styleUrls: ['./accounts.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountsComponent implements OnInit{

  accounts: AccountsDto[] = [];

  constructor(
    private accountService: AccountService,
    private matDialog: MatDialog,
    private _cdRef: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.accountService.getAccountList({
      page: 0,
      size: 50,
    }, {
      fromAmount: 1,
      accountsNotIn: ['9'],
    }).subscribe(val => {
      this.accounts = val?.content as AccountsDto[];
      this._cdRef.markForCheck();
    })
  }

  isOpen = false;

  toggleAccountsOpen() {
    this.matDialog.open(AccountsModalComponent, {
      width: '400px',
      height: '100%',
      position: { right: '0' },
      panelClass: 'right-side-dialog',
      data: {
        accounts: this.accounts
      }
    });
    // this.isOpen = !this.isOpen;
  }
}
