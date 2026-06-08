import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, Input, OnInit } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { NgxMaskPipe } from 'ngx-mask';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AccountsPaymentsService
} from '../../../views/main/features/accounts-payments/services/accounts-payments.service';
import { Router } from '@angular/router';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { OperationsService } from '../../../views/main/features/operations/services/operations.service';
import { AmountService } from '../../../core/services/amount.service';

@Component({
    selector: 'app-templates',
    imports: [
        NgOptimizedImage,
        NgxMaskPipe,
        MatMenu,
        MatMenuTrigger
    ],
    templateUrl: './templates.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplatesComponent implements OnInit {
  patterns: any[] = [];
  @Input() modes: string[] = [];
  hide = false;

  currencyTransactionModes = ['SWIFT', 'CONVERSION_BUY', 'CONVERSION_SELL', 'CONVERSION_CROSS']

  constructor(
    private accountsPaymentService: AccountsPaymentsService,
    private destroyRef: DestroyRef,
    private _cdRef: ChangeDetectorRef,
    private router: Router,
    private operationService: OperationsService,
    public amountService: AmountService,
  ) {
  }

  ngOnInit() {
    this.getPatterns();
    this.getHide();
  }

  saveHide() {
    sessionStorage.setItem('hide-patterns', JSON.stringify(this.hide));
  }

  getHide() {
    let hide = sessionStorage.getItem('hide-patterns');
    if(hide) {
      this.hide = JSON.parse(hide);
    }
  }

  convertAmount(amount: number) {
    return this.amountService.convertToAmount(amount);
  }

  hidePatterns() {
    setTimeout(() => {
      this.hide = !this.hide;
      this.saveHide();
      this._cdRef.markForCheck();
    }, 200);
  }

  getPatterns(paging = {page: 0, size: 10}) {
    const transactionModes = this.modes?.length > 0 ? this.modes : null;
    this.accountsPaymentService.getTransactionList(paging,
      {
        startDate: null,
        endDate: null,
        transactionModes,
        statuses: ['SAVED'],
      }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (!res) return
        this.patterns = res.content;
        this._cdRef.markForCheck();
      })
  }

  copyPattern(pattern: any) {

    if(this.currencyTransactionModes.includes(pattern.transactionMode)) {
      this.operationService.conversionTemplate.next(pattern);
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
      }
    }

  }

  protected readonly Math = Math;
}
