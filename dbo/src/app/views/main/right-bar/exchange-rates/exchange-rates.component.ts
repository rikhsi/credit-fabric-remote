import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxMaskPipe } from 'ngx-mask';
import { Subject, takeUntil } from 'rxjs';

import { CalculatorModalComponent } from '../../../../core/components/calculator-modal/calculator-modal.component';
import { UiSvgIconComponent } from '../../../../core/components/ui-svg-icon/ui-svg-icon.components';
import { RightBarService } from '../services/right-bar.service';

@Component({
    selector: 'app-exchange-rates',
    imports: [
        MatFormFieldModule,
        MatDatepickerModule,
        MatInputModule,
        MatNativeDateModule,
        UiSvgIconComponent,
        MatIconModule,
        MatSelectModule,
        MatRippleModule,
        CurrencyPipe
    ],
    templateUrl: './exchange-rates.component.html',
    styles: [
        `
      .branch-selection {
        & .mdc-text-field--filled:not(.mdc-text-field--disabled)
        .mdc-line-ripple::before {
          display: none !important;
        }

        & .mat-select-arrow {
          border: none !important;
        }

        &.mat-form-field-appearance-fill
        .mdc-text-field--no-label
        .mat-mdc-select-arrow-wrapper {
          display: none;
        }

        & .mat-mdc-select-placeholder,
        & .mat-mdc-select-value-text {
          color: #007AFF;
          font-weight: 600
        }

        & .mat-mdc-select-value {
          text-align: end !important
        }

        & .mat-mdc-form-field-icon-suffix, .mat-mdc-form-field-icon-prefix {
          padding: 0
        }
      }

      .mat-mdc-form-field-has-icon-suffix .mat-mdc-text-field-wrapper {
        padding: 0
      }
    `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ExchangeRatesComponent implements OnInit {
  constructor(
    private matDialog: MatDialog,
    private _cf: ChangeDetectorRef,
    private rightBarService: RightBarService
  ) {
  }
  private unsub$ = new Subject<void>();
  info:Array<{
    buyingRate:number
    currencyCode:string
    sellingRate:number
    sbCourse:number
  }> = []
  isFetching: boolean = false

  onOpenCalculator() {
    this.matDialog.open(CalculatorModalComponent, {
      disableClose: true,
      data: 'Hello World'
    })
  }


  ngOnInit() {
    this.getCourse()
  }


  getCourse() {
    this.isFetching = true
    this.rightBarService.getCurrencyRate().pipe(takeUntil(this.unsub$)).subscribe({
      next: (res: any) => {
        if (res) {
         this.info = res.result.data
        }
      },
      complete: () => {
        this._cf.markForCheck()
        this.isFetching = false
      }
    });
  }


  getCurrencyName(code:string):string{
    switch (code) {
      case '840':
        return 'USD'
      case '392':
        return 'JPY'
      case '398':
        return 'KZT'
      case '826':
        return 'GBP'
      case '978':
        return 'EUR'
      case '756':
        return 'CHF'
      case '643':
        return 'RUB'
      case '784':
        return 'AED'
      case '156':
        return 'CNY'
    }
    return code
  }

}
