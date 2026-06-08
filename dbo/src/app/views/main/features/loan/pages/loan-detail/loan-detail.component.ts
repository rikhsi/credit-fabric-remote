import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EMPTY, switchMap, tap } from 'rxjs';
import { SvgIconComponent } from 'src/app/shared/components/svg-icon/svg-icon.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/core/services/user.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConditionsModalComponent } from '../../components/conditions-modal/conditions-modal.component';
import { LoanLogicService } from '../../services/loan-logic.service';
import { LoanService } from '../../../loans/services/loan.service';
import { Loan } from '../../../loans/models/loan.model';
import { TransactionDetailComponent } from '../../../transaction-detail/transaction-detail.component';
import { PaymentsComponent } from "../../../main/components/payments/payments.component";
import { LoanDetailModalComponent } from '../../components/loan-detail-modal/loan-detail-modal.component';
import { LoanDetailDto } from '../../models/loan.modal';
import { NgIf } from '@angular/common';
import { AccountCardComponent, AccountCardData } from 'src/app/shared/components/account-card/account-card.component';
import { AccountComponent } from "src/app/shared/components/account/account.component";
import { maskAccountNumber } from 'src/app/core/utils/mask.utils';

// ─── Interfaces (move to a dedicated models file later) ────────────────────────

export interface MoneyAmount {
  amount: number;
  scale: number;
  currency: string;
}

export interface LoanGuarantor {
  type: string;
  summ: string;
}

export interface LoanDetail {
  percComiss: string;
  methodCalculation: string;
  nextPaydate: string;
  accMain: string;
  regDate: string;
  crdTypename: string;
  paymentFrequency: string;
  guars: LoanGuarantor[];
  nextPaysum: MoneyAmount;
  conditionOverpay: string;
  percMain: string;
  percFine: string;
  percType: string | null;
  guarantors: any[];
  isNextPaydateExpire:boolean
}


export interface LoanCard {
  crd_number: string;
  crd_curcode: string;
  crd_state: string;
  crd_sum: MoneyAmount;
  crd_rest: string;
  perc_main: string;
  crd_typename: string;
  graph_type: string;
  crd_regdate: string;
  crd_retdate: string;
  crd_object: string;
  guars: LoanGuarantor[];
  overdue_debt: MoneyAmount;
  overdue_perc: MoneyAmount;
  perc_rest: string;
  early_repayment: string;
}

export interface LoanData {
  amount: MoneyAmount;
  totalDebt: MoneyAmount;
  currency: string;
  state: string;
  status: string;
  stateLogo: {
    contentType: string | null;
    path: string;
    name: string;
    ext: string | null;
  };
  detail: LoanDetail;
  card: LoanCard;
  loanId: string;
  pinnedOrder: number | null;
  pinned: boolean;
  percMain?:string
}

export function formatMoney(money: MoneyAmount): string {
  if (!money) return '—';
  const value = money.amount / Math.pow(10, money.scale);
  // Format with spaces as thousand separators (Uzbek locale style)
  const [intPart, decPart] = value.toFixed(money.scale).split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return decPart ? `${formattedInt}.${decPart}` : formattedInt;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-loan-detail',
  imports: [RouterLink, TranslateModule, SvgIconComponent, MatTooltipModule, PaymentsComponent, NgIf, AccountCardComponent, AccountComponent],
  templateUrl: './loan-detail.component.html',
  styles: ``,
  providers: [LoanLogicService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanDetailComponent implements OnInit {
  readonly matDialog = inject(MatDialog);
  readonly route = inject(ActivatedRoute);
  private loanService = inject(LoanService);
  userService = inject(UserService);
  loanLogicService = inject(LoanLogicService);
  private translate = inject(TranslateService);

  id = signal<string | null>(null);

  readonly loanDetails = signal<LoanData | null>(null);
  loanDetail = signal<LoanDetailDto | null>(null)

  readonly totalDebt = computed(() => {
    const d = this.loanDetails();
    return d ? formatMoney(d.totalDebt) : '—';
  });

  readonly totalDebtCurrency = computed(() => this.loanDetails()?.totalDebt?.currency ?? '');

  readonly nextPaysum = computed(() => {
    const d = this.loanDetails();
    return d ? formatMoney(d.detail.nextPaysum) : '—';
  });

  readonly nextPaysumCurrency = computed(() => this.loanDetails()?.detail?.nextPaysum?.currency ?? '');

  readonly nextPaydate = computed(() => this.loanDetails()?.detail?.nextPaydate ?? '—');
  readonly isNextPaydateExpire = computed(() => this.loanDetails()?.detail?.isNextPaydateExpire || null)
  readonly cardNumber = computed(() => {
    const num = this.loanDetails()?.detail.accMain ?? '';
    if (num.length > 8) {
      return `${num.slice(0, 5)} •••• ${num.slice(-3)}`;
    }
    return num;
  });

  readonly depositName = computed(() => this.loanDetails()?.card?.crd_typename ?? '—');

  readonly state = computed(() => this.loanDetails()?.state ?? '');

  readonly isActive = computed(() => this.loanDetails()?.status === 'OPEN');

  readonly currency = computed(() => this.loanDetails()?.currency ?? '');

// loan-detail.component.ts


readonly loanCard = computed<AccountCardData>(() => {
  const d = this.loanDetails();
  console.log('d',d)
  if (!d) {
    return {
      balance: '0',
      decimals: '00',
      currency: 'UZS',
      statusLabel: '',
      statusIcon:'',
      isActive: false,
      accountType: '',
      maskedNumber: '',
      flagSrc: 'assets/flags/radius-20/UZS.png',
    };
  }

  const rawAmount = d.totalDebt.amount / Math.pow(10, d.totalDebt.scale);
  const [intPart, decPart = '00'] = rawAmount.toFixed(d.totalDebt.scale).split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  console.log('bingo', parseFloat(d.detail?.percMain ?? '') || 0)

  return {
    balance: formattedInt,
    decimals: decPart,
    currency: d.totalDebt.currency,
    statusLabel: d.state,
    isActive: d.status === 'OPEN',
    statusIcon:`${d.stateLogo?.path}${d.stateLogo?.name}`,
    accountType: d.card.crd_typename,                      
    maskedNumber: maskAccountNumber(d.detail.accMain),   
    flagSrc: `assets/flags/radius-20/${d.currency}.png`,
    percent: parseFloat(d.detail?.percMain ?? '') || 0,
    onDetails: () => this.openDetail(),
  };
});

  // ─────────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const raw = localStorage.getItem('loanData');
    if (raw) {
      try {
        this.loanDetails.set(JSON.parse(raw) as LoanData);

        console.log('---------------------------',this.loanDetails())
      } catch {
        console.warn('Failed to parse loanData from localStorage');
      }
    }


    this.route.params
      .pipe(
        tap((params) => this.id.set(params['id'])),
        switchMap(() => this.getDetail())
      )
      .subscribe();
  }

  getDetail() {
    if (!this.id()) return EMPTY;
    return this.loanService.getLoanDetail(this.id()!).pipe(
      tap((res: any) => {
        this.loanDetail.set(res);
        console.log('loan details',res)
      })
    );
  }

  createPayment(): void {
    // TODO: implement payment creation
  }

  openConditions(): void {
    const d = this.loanDetails();
    if (!d) return;

 const data = {
    title: this.translate.instant('new_loan.terms'),
    description: [
      { label: this.translate.instant('new_loan.currency'), value: d.currency },
      { label: this.translate.instant('new_loan.annual_interest_rate'), value: d.card.perc_main },
      { label: this.translate.instant('new_loan.calculation_method'), value: d.detail.methodCalculation },
      { label: this.translate.instant('new_loan.graph_type'), value: d.card.graph_type },
      { label: this.translate.instant('new_loan.loan_amount'), value: `${formatMoney(d.amount)} ${d.amount.currency}` },
      { label: this.translate.instant('new_loan.early_repayment'), value: d.card.early_repayment },
      { label: this.translate.instant('new_loan.opening_date'), value: d.card.crd_regdate },
      { label: this.translate.instant('new_loan.closing_date'), value: d.card.crd_retdate },
      { label: this.translate.instant('new_loan.target'), value: d.card.crd_object },
    ],
      tariffs: d.card.guars.map((g) => ({
        title: `${g.summ} сум`,
        subtitle: g.type,
      })),
    };

    this.matDialog.open(ConditionsModalComponent, {
      data,
      width: '550px',
      height: '100%',
      position: { right: '0' },
      panelClass: 'right-side-dialog',
    });
  }

  openDetail() {
    this.matDialog.open(LoanDetailModalComponent, {
      data:this.loanDetail(),
      width: '550px',
      height: '100%',
      position: { right: '0' },
      panelClass: 'right-side-dialog',
    });
  }
}