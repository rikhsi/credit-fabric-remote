import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxMaskDirective } from 'ngx-mask';
import { Subject, takeUntil } from 'rxjs';
import { UiSvgIconComponent } from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';

import {
  DepositWithdrawFrequencyEnum,
  RateModifierByConditionEnum,
  RateModifierEnum,
} from '../../../models/deposit-calculator.model';
import { DepositService } from '../../../services/deposit.service';

@Component({
    selector: 'app-deposit-calculator',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiSvgIconComponent,
        MatFormFieldModule,
        MatSelectModule,
        FormsModule,
        NgxMaskDirective,
        MatIcon,
        MatTabsModule,
        MatCheckboxModule,
        MatRadioGroup,
        MatRadioButton,
    ],
    templateUrl: './deposit-calculator.component.html',
    styles: `
      .select {
        .mdc-notched-outline__leading,
        .mdc-notched-outline__notch,
        .mdc-notched-outline__trailing {
          border-color: #dbdbdb !important;
        }

        .mdc-text-field--outlined {
          --mdc-outlined-text-field-container-shape: 10px !important;
        }

        .mat-mdc-select-arrow {
          display: none;
        }

        .mat-mdc-form-field-flex {
          height: 44px;
          padding: 8px;
        }

        .mat-mdc-form-field-infix {
          padding-top: 16px;
          top: -15px;
        }

        .mat-mdc-select-placeholder,
        .mat-mdc-form-field-input-control,
        .mat-mdc-select-value-text {
          color: #000;
        }

        .mat-mdc-form-field-icon-suffix {
          width: 40px;
        }

        .mat-mdc-text-field-wrapper {
          padding: 0;
        }
        .mat-mdc-select-arrow-wrapper {
          display: none;
        }
        padding-left: 25px;
        font-size: 14px;
      }

      .mat-mdc-tab.mdc-tab {
        height: 35px !important;
        margin-bottom: 16px;
      }

        .range-slider {
          position: relative;
        }

        .custom-range {
          /* Add your custom styles for the range input */
          width: 100%;
          height: 6px;
          background-color: #e0e0e0;
          border: none;
          border-radius: 5px;
          outline: none;
          -webkit-appearance: none;
        }

        .custom-range::-webkit-slider-thumb {
          /* Add your custom styles for the slider thumb */
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background-color: #7c8897;
          border-radius: 50%;
          cursor: pointer;
        }

        .indicator {
          position: absolute;
          bottom: 20px;
          transform: translateX(-50%);
          background-color: #7c8897;
          color: white;
          padding: 6px 10px;
          border-radius: 5px;
        }
        select {
          -webkit-appearance: none;
          appearance: none;
        }
        .mat-mdc-tab-header {
          width: 300px;
          color: #007AFF;
          font-weight: 500
        }
        .rate-select {
          padding-left: 0;
          margin: 0 4px;
          font-size: 13px !important;
          margin-bottom: 4px
        }
        ::ng-deep .mat-checkbox .mat-checkbox-frame {
          border-color: violet;
        }
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DepositCalculatorComponent implements OnInit, OnDestroy {
  private unsub$ = new Subject<void>();
  
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DepositCalculatorComponent>,
    private depositService: DepositService,
    private cf: ChangeDetectorRef
  ) {}

  sliderDepositAmountValue: string = '100000';
  sliderDayValue: string = '1';
  selectedCurrencyVal = 'uzb';
  dayFrom = 0;
  dayEnd = 0;
  percentageRate = 0;
  calculatedAmount = 0;

  form = this.fb.nonNullable.group({
    rateModifier: false,
    rateModifierByCondition: false,
    depositWithdrawFrequency: DepositWithdrawFrequencyEnum.AT_THE_END_OF_TERM,
  });

  ngOnInit(): void {
    this.getAvailableDepositDays();
  }
  
  ngOnDestroy(): void {
      this.unsub$.next();
      this.unsub$.complete();
  }
  
  getAvailableDepositDays() {
    this.depositService.getCalculatorDays().pipe(takeUntil(this.unsub$)).subscribe(res => {
      if(!res) return;
      this.dayFrom = res.dayFrom || 0;
      this.dayEnd = res.dayEnd || 100;
      this.sliderDayValue = `${res.dayFrom || '0'}`;
      this.cf.markForCheck();
    })
  }
  
  onSelectedCurrencyVal(val: any) {
    this.selectedCurrencyVal = val;
  }
  
  formatNumberWithSpaces() {
    return `${this.sliderDepositAmountValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} UZS`;
  }

  formatMonth() {
    return `${this.sliderDayValue} день`;
  }

  onCalculateDeposit() {
    if (this.form.invalid) return;
    
    const { rateModifier, rateModifierByCondition, depositWithdrawFrequency } = this.form.value;
    const payload = {
      depositAmount: this.sliderDepositAmountValue + '00',
      day: this.sliderDayValue,
      depositWithdrawFrequency,
      rateModifier: rateModifier
        ? RateModifierEnum.WITH_CAPITALIZATION
        : RateModifierEnum.WITHOUT_CAPITALIZATION,
      rateModifierByCondition: rateModifierByCondition
        ? RateModifierByConditionEnum.WITH_PARTIAL_WITHDRAWAL
        : RateModifierByConditionEnum.WITHOUT_PARTIAL_WITHDRAWAL,
    };
    
    this.depositService.calculateDeposit(payload).pipe(takeUntil(this.unsub$)).subscribe(res => {
      if (!res) return;
      this.percentageRate = res?.percentage;
      this.calculatedAmount = res?.amount;
      this.cf.markForCheck()
    });
  }
}
