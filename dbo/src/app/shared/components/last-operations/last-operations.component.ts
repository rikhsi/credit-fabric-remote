import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { NgxMaskPipe } from 'ngx-mask';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AccountsPaymentsService
} from '../../../views/main/features/accounts-payments/services/accounts-payments.service';
import { Router } from '@angular/router';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-last-operations',
    imports: [
        NgOptimizedImage,
        NgxMaskPipe,
        MatMenu,
        MatMenuTrigger,
        MatIcon
    ],
    templateUrl: './last-operations.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LastOperationsComponent implements OnInit {
  patterns: any[] = [];
  hide = false;

  constructor(
    private accountsPaymentsService: AccountsPaymentsService,
    private destroyRef: DestroyRef,
    private _cdRef: ChangeDetectorRef,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.getPayments();
    this.getHide();
  }

  saveHide() {
    sessionStorage.setItem('hide-last-operations', JSON.stringify(this.hide));
  }

  getHide() {
    let hide = sessionStorage.getItem('hide-last-operations');
    if(hide) {
      this.hide = JSON.parse(hide);
    }
  }

  formatDate(dateString: string) {
    const date = new Date(dateString).toLocaleDateString('ru-Ru', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return date;
  }

  getPayments(paging = {page: 0, size: 10}) {
    this.accountsPaymentsService.getTransactionList(
      paging,
      {
        startDate: null,
        endDate: null,
        transactionModes: ['LOAN_REPAYMENT', 'LOAN_PRETERM', 'LOAN_CLOSE'],
        statuses: null,
      }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (!res) return
        this.patterns = res.content;
        this._cdRef.markForCheck();
      })
  }

  hidePatterns() {
    setTimeout(() => {
      this.hide = !this.hide;
      this.saveHide();
      this._cdRef.markForCheck();
    }, 200);
  }
}
