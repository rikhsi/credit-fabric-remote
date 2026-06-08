import { LoanLogicService } from './../../services/loan-logic.service';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, signal, computed } from '@angular/core';
import { Location } from '@angular/common';
import { CommonModule, DecimalPipe } from '@angular/common';
import { SvgIconComponent } from "src/app/shared/components/svg-icon/svg-icon.component";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoanService } from '../../../loans/services/loan.service';
import { PaymentScheduleResDto } from './payment-schedule.model';
import { PaymentService } from 'src/app/core/services/payment.service';
import { OneLoanResDto } from '../../models/loan.modal';

@Component({
  selector: 'app-payment-schedule',
  imports: [CommonModule, DecimalPipe, SvgIconComponent, TranslateModule, RouterLink],
  templateUrl: './payment-schedule.component.html',
  styles: ``,
  providers:[
    LoanLogicService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentScheduleComponent implements OnInit {
  constructor(
    private location: Location,
    private _activatedRoute: ActivatedRoute,
    private destroyRef: DestroyRef,
    private _loanService: LoanService,
    public loanLogicService:LoanLogicService,
      private translate: TranslateService,
  ) {}

  isLoading = signal(false);
  errorMessage = signal('');
  scheduleData = signal<PaymentScheduleResDto | null>(null);
  id = signal<any>(null);
  oneLoanData = signal<OneLoanResDto | null>(null)
  totals = computed(() => {
    const data = this.scheduleData();
    if (!data) return null;
    return {
      totalDept: this.formatAmount(data.totals.totalDept.amount, data.totals.totalDept.scale),
      totalPercent: this.formatAmount(data.totals.totalPercent.amount, data.totals.totalPercent.scale),
      totalAll: this.formatAmount(data.totals.totalAll.amount, data.totals.totalAll.scale),
      currency: data.currency.currency
    };
  });

  ngOnInit(): void {
    this._activatedRoute.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: params => {
          const id = params.get('id') as string;
          this.getDepositCreditGraphic(id);
          this.id.set(id)
          this.getOneLoan(id)
        }
      });
  }

  private getOneLoan(id:string) {
    this._loanService.getOneLoan(id).subscribe(res => {
      console.log('res',res)
      this.oneLoanData.set(res)
    })
  }


  formatAmount(amount: number, scale: number): { integer: string; decimal: string; full: string } {
    const divisor = Math.pow(10, scale);
    const value = amount / divisor;
    const [intPart, decPart = ''] = value.toFixed(scale).split('.');

    const formattedInteger = Number(intPart).toLocaleString('ru-RU');
    const formattedDecimal = decPart.padEnd(scale, '0');

    return {
      integer: formattedInteger,
      decimal: formattedDecimal,
      full: `${formattedInteger}.${formattedDecimal}`
    };
  }

  getDepositCreditGraphic(id: string) {
    this.isLoading.set(true);
    this._loanService.depositCreditGraphic(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: val => {
          this.scheduleData.set(val?.items ? val : null);
          console.log('val',val)
          this.isLoading.set(false);
        },
        error: (err: any) => {
           this.errorMessage.set(err?.message || this.translate.instant('new_loan.something_went_wrong'));
          this.isLoading.set(false);
        }
      });
  }

  goBack(): void {
    this.location.back();
  }

  getStatus(repaymentDate: string, paidAmount: number): 'paid' | 'current' | 'upcoming' {
    const today = new Date();
    const payDate = new Date(repaymentDate);
    if (paidAmount > 0 && payDate < today) return 'paid';
    if (payDate.toDateString() === today.toDateString()) return 'current';
    return 'upcoming';
  }

  getStatusClass(repaymentDate: string, paidAmount: number): Record<string, boolean> {
    const status = this.getStatus(repaymentDate, paidAmount);
    return {
      'bg-green-500': status === 'paid',
      'bg-amber-400': status === 'current',
      'bg-gray-300': status === 'upcoming'
    };
  }

  getStatusLabel(repaymentDate: string, paidAmount: number): string {
    const status = this.getStatus(repaymentDate, paidAmount);
    const labels: Record<string, string> = {
      paid: this.translate.instant('new_loan.paid'),
      current:  this.translate.instant('new_loan.current'),
      upcoming: this.translate.instant('new_loan.upcoming')
    };
    return labels[status];
  }

}