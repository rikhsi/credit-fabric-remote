import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { LocationBackDirective } from '../../../../../../shared/directives/location-back.directive';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/autocomplete';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { NgClass, NgIf, NgOptimizedImage } from '@angular/common';
import { NgxMaskPipe } from 'ngx-mask';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountsDto } from '../../../accounts-payments/models/accounts-payments.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService } from '../../../../../../core/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionModes } from '../../../../../auth/constants/transaction-list.const';
import { PaymentService } from '../../../../../../core/services/payment.service';
import { TransactionFormComponent } from '../transaction-form/transaction-form.component';
import { debounceTime, take } from 'rxjs';
import { AccountService } from '../../../../../../core/services/account.service';
import { BudgetFormComponent } from '../budget-form/budget-form.component';
import { BudgetIncomeFormComponent } from '../budget-income-form/budget-income-form.component';
import { MunisFormComponent } from '../munis-form/munis-form.component';
import { BetweenAccountsFormComponent } from '../between-accounts-form/between-accounts-form.component';
import { AccountsPaymentsService } from '../../../accounts-payments/services/accounts-payments.service';
import { OperDayComponent } from '../oper-day/oper-day.component';
import { WidgetsComponent } from '../../../../../../shared/components/widgets/widgets.component';
import { TransactionOneDetailDto } from '../../../../../../core/models/transaction.models';
import { UtilsService } from '../../../../../../core/services/utils.service';
import { CreateAccountComponent } from '../../../accounts-payments/components/create-account/create-account.component';
import { CreateAutopayComponent } from '../../../create-autopay/create-autopay.component';
import { AutoPayForm } from '../../../create-autopay/interfaces/auto-pay.interface';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-pay',
  imports: [
    LocationBackDirective,
    MatAccordion,
    MatExpansionPanel,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    MatSelectTrigger,
    MatSuffix,
    NgOptimizedImage,
    NgxMaskPipe,
    ReactiveFormsModule,
    NgClass,
    TransactionFormComponent,
    BudgetFormComponent,
    BudgetIncomeFormComponent,
    MunisFormComponent,
    BetweenAccountsFormComponent,
    FormsModule,
    OperDayComponent,
    WidgetsComponent,
    MatError,
    NgIf,
    CreateAccountComponent,
    CreateAutopayComponent,
    NgxMatSelectSearchModule
  ],
  templateUrl: './pay.component.html',
  styles: ``,
  styleUrls: ['./pay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayComponent implements OnInit {
  docNum = '';
  isEditing = false;
  changedDocNum = '';
  docDate = '';
  fromQuery = '';
  toQuery = '';
  autoPay = false;
  autoPayForm!: AutoPayForm;

  templateModes = ['TRANSACTION', 'BUDGET'];

  searchAccountControl = new FormControl('');
  searchingAccount = false;

  touched = false;

  businessUser!: any;
  selectedAccount!: AccountsDto | null | undefined;
  templateTransaction!: TransactionOneDetailDto;

  accounts!: AccountsDto[];
  isOpenRequisites = false;

  type = '';
  editPayment!: TransactionOneDetailDto;
  templatePayment!: TransactionOneDetailDto;

  constructor(
    private userService: UserService,
    private destroyRef: DestroyRef,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private accountService: AccountService,
    private _cdRef: ChangeDetectorRef,
    private accountsPaymentService: AccountsPaymentsService,
    private utilsService: UtilsService,
  ) {
  }

  ngOnInit() {
    this.watchRoute();
    this.getBusinessUserInfo();
    this.getDocNum();
    this.watchAccountSearch();
  }

  watchAccountSearch() {
    this.searchAccountControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(600))
      .subscribe(searchText => {
        this.getAccounts(searchText || '');
      });
  }

  watchRoute() {
    this.activatedRoute.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const t = params.get('type');
        this.type = t ? t : '';
        this.getAccounts();
      });

    this.activatedRoute.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((queries) => {
        const from = queries.get('from');
        const to = queries.get('to');
        const type = queries.get('type');
        if (type === 'auto-pay') {
          this.autoPay = true;
        }
        this.toQuery = to || '';
        this.fromQuery = from || '';
        if (this.fromQuery == 'edit-payment') {
          this.getEditPayment();
        }
        if (this.fromQuery == 'repeat-payment') {
          this.getRepeatPayment();
        }
        if (this.fromQuery == 'template-payment') {
          this.getTemplatePayment();
        }
      })
  }

  removeFromEditPaymentQuery() {
    const queryParams = { ...this.activatedRoute.snapshot.queryParams };
    delete queryParams['from'];

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  getEditPayment() {
    const template = sessionStorage.getItem('edit-payment') as any;
    this.editPayment = template ? JSON.parse(template) : null;
    this.docNum = `${this.editPayment.docNum}`;
  }

  getRepeatPayment() {
    const template = sessionStorage.getItem('repeat-payment') as any;
    this.templatePayment = template ? JSON.parse(template) : null;
    this.docNum = `${this.templatePayment.docNum}`;
  }

  getTemplatePayment() {
    const template = sessionStorage.getItem('template-payment') as any;
    this.templatePayment = template ? JSON.parse(template) : null;

    if (this.templatePayment.status === 'AUTO_PAY') {
      this.autoPay = true;
    }

    const account = this.templatePayment.sender.account
    if (account) {
      this.selectAccountFromTemplate(account);
    }
    // this.docNum = `${this.templatePayment.docNum}`;
    this._cdRef.detectChanges();
  }

  getAccount(account: string) {
    this.accountService.getAccountInfo(account)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res:any) => {
          if (res) {
            this.selectedAccount = {
              ...res,
              altAcctId: res?.accountNumberCard
            };
            this._cdRef.markForCheck();
          }
        }
      })
  }

  selectAccountFromEdit(account: string) {
    const acc = this.accounts
      ?.find(acc => acc.altAcctId == account);

    if (acc) {
      this.selectSenderAccount(acc);
    } else if (this.fromQuery === 'edit-payment') {
      this.getAccount(account);
    }
  }

  selectAccountFromTemplate(account: string) {
    const acc = this.accounts
      ?.find(acc => acc.altAcctId == account);

    if (acc) {
      this.selectSenderAccount(acc);
    } else if (this.fromQuery === 'template-payment') {
      this.getAccount(account);
    }
  }

  getAccounts(search = '') {
    let type = this.type;
    if (this.type === 'BUDGET_INCOME') {
      type = 'BUDGET';
    } else if (this.type === 'BETWEEN_ACCOUNTS') {
      type = 'TRANSACTION';
    }
    const data: any = {
      senderAccount: null,
      transactionMode: type,
      search
    }
    if (this.type === 'BETWEEN_ACCOUNTS') {
      data.accountType = 'TERM_DEPOSIT';
      this.utilsService.spinnerState$$.next(true);
    }
    this.searchingAccount = true;
    this.accountService.getPaymentAllowed({
      page: 0,
      size: 10
    }, data).pipe(take(1))
      .subscribe((val) => {
        if (val) {
          if (val && Array.isArray(val.content)) {
            this.accounts = val.content;
            this.selectedAccount = undefined;
            this.touched = false;
            if (this.fromQuery === 'template-payment') {
              const account = this.templatePayment.sender.account
              if (account) {
                this.selectAccountFromTemplate(account);
              }
            }
            if (this.fromQuery === 'edit-payment') {
              const account = this.editPayment.sender.account;
              if (account) {
                this.selectAccountFromEdit(account)
                // this.getAccount(account);
              }
            }
            if (this.fromQuery === 'repeat-payment') {
              const account = this.templatePayment.sender.account;
              if (account) {
                this.selectAccountFromEdit(account)
                // this.getAccount(account);
              }
            }

          }
        }
        this.searchingAccount = false;
        this._cdRef.detectChanges();
      })
  }

  updateAutoPayForm(event: AutoPayForm) {
    this.autoPayForm = event;
  }

  toggleEditMode() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.changedDocNum = this.docNum;
    } else {
      this.changedDocNum = '';
    }
  }

  setDocNum(event: Event) {
    this.changedDocNum = (event.target as HTMLInputElement).value;
  }

  getDocDate() {
    let date: Date = new Date();
    if (this.docDate) {
      date = new Date(this.docDate);
    }
    this._cdRef.markForCheck();
    return date?.toLocaleDateString('ru-Ru')
  }

  setDocDate(date: any) {
    this.docDate = date;
    this._cdRef.markForCheck();
  }

  saveDocNum() {
    this.docNum = this.changedDocNum;
    this.toggleEditMode();
    this._cdRef.markForCheck();
  }

  selectSenderAccount(account: any | null) {
    if (account) {
      this.selectedAccount = account;
    }
    this._cdRef.detectChanges();
  }

  toggleRequisites() {
    this.isOpenRequisites = !this.isOpenRequisites;
  }

  selectType(type: string) {
    this.selectSenderAccount(null);

    const fromQuery = this.activatedRoute.snapshot.queryParamMap.get('from');
    if (fromQuery === 'edit-payment') {
      this.removeFromEditPaymentQuery();
    }

    const queryParams = this.autoPay ? {
      type: 'auto-pay'
    } : {}

    this.router.navigate(['/pay', type], {
      queryParams,
    });
  }


  getBusinessUserInfo() {
    this.userService.userInfo$$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.businessUser = res?.business;
      });
  }


  getDocNum() {
    if (!this.editPayment) {
      this.paymentService.getPaymentDocNum()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(val => {
          if (val) {
            this.docNum = val.msg;
          }
        });
    }
  }

  protected readonly Number = Number;
  protected readonly transactionModes = TransactionModes;
}
