import {
  AfterContentChecked, AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, DestroyRef, EventEmitter, Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { AccountsPaymentsService } from '../../services/accounts-payments.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UtilsService } from '../../../../../../core/services/utils.service';
import { InOutPaneAnimations } from '../../../../animations/in-out-pane.animations';
import { ActivatedRoute, Params, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IStatementsDto } from '../../models/statements.interface';
import { debounceTime, take } from 'rxjs';
import {
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate
} from '@angular/material/datepicker';
import { MatError, MatFormField, MatFormFieldModule, MatLabel, MatSuffix } from '@angular/material/form-field';
import { DateAdapter, MatNativeDateModule, MatRipple } from '@angular/material/core';
import { UiSvgIconComponent } from '../../../../../../core/components/ui-svg-icon/ui-svg-icon.components';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import {
  getRussianFormattedDate,
  getStatusApplication,
  getStepsApplication
} from '../../../../../../core/utils/mixin.utils';
import { DatePipe, NgClass, NgIf, NgOptimizedImage } from '@angular/common';
import { NgxMaskPipe } from 'ngx-mask';
import { Options, TemplateService } from '../../../../../../core/services/template.service';
import { TransactionService } from '../../../../../../core/services/transaction.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AccountInfoDto, AccountsDto } from '../../models/accounts-payments.model';
import { AccountService } from '../../../../../../core/services/account.service';
import { LocationBackDirective } from '../../../../../../shared/directives/location-back.directive';
import { MatInput } from '@angular/material/input';
import { ContainerNavComponent } from '../../../../../../shared/components/container-nav/container-nav.component';
import { ContainerTitleComponent } from '../../../../../../shared/components/container-title/container-title.component';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { PaginatorComponent } from '../../../../../../shared/components/paginator/paginator.component';
import {
  HistoryTransactionsComponent
} from '../../../../../../shared/components/history-transactions/history-transactions.component';
import { AmountService } from '../../../../../../core/services/amount.service';
import { AccountSelectComponent } from '../../../../../../shared/components/account-select/account-select.component';
import { LoanTypes } from '../../../loans/models/loan.model';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { CustomDateAdapter } from '../../../../../../core/services/custom-date-adapter.service';
import { ReportsComponent } from '../../../../../../shared/components/reports/reports.component';
import { ToastrService } from 'ngx-toastr';
import { ApplicationsService } from '../../../applications/services/applications.service';
import { UserService } from '../../../../../../core/services/user.service';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

export interface AccStatement {
  date: string;
  dtMfo: string;
  numberTrans: string;
  purpose: string;
  dtAcc: string;
  ctAccName: string;
  ctAcc: string;
  debit: {
    amount: number;
    scale: number;
    currency: string;
  };
  credit: {
    amount: number;
    scale: number;
    currency: string;
  };
  type: number;
  ctMfo: string;
}


@Component({
    selector: 'app-statments-history',
    templateUrl: './statements-history.component.html',
    styleUrls: ['./statements-history.component.scss'],
    imports: [
        MatPaginator,
        MatDateRangeInput,
        MatNativeDateModule,
        MatDatepickerModule,
        MatError,
        MatFormField,
        MatLabel,
        MatSuffix,
        ReactiveFormsModule,
        MatRipple,
        UiSvgIconComponent,
        MatIcon,
        MatIconButton,
        MatTooltip,
        NgIf,
        NgxMaskPipe,
        DatePipe,
        LocationBackDirective,
        MatInput,
        MatFormFieldModule,
        ContainerNavComponent,
        ContainerTitleComponent,
        NgClass,
        MatRadioGroup,
        MatRadioButton,
        PaginatorComponent,
        NgOptimizedImage,
        HistoryTransactionsComponent,
        AccountSelectComponent,
        RouterLinkActive,
        RouterLink,
        MatProgressSpinner,
        ReportsComponent,
        MatMenu,
        MatMenuItem,
        MatMenuTrigger,
    ],
    animations: [
        InOutPaneAnimations,
    ],
    providers: [
        DatePipe,
        { provide: DateAdapter, useClass: CustomDateAdapter },
    ]
})
export class StatementsHistoryComponent implements OnInit, AfterContentInit {
  title = 'История'
  id = '';
  historyType = 'account';
  loanId = '';

  pageSize = 100;
  pageIndex = 0;
  totalItems = 0;

  selectedTab = '';
  tabs = [
    {
      title: 'Выписки',
      value: 'history',
    },
    {
      title: 'Справка о работе счета',
      value: 'statements',
    }
  ];

  navs = [
    {
      title: 'Главная',
      link: '/'
    },
    {
      title: 'Счета и платежи',
      link: '/accounts-and-payments'
    },
    {
      title: this.title,
      link: '/'
    },
  ];
  dateChips = [
    {
      title: 'Вчера',
      type: 'day',
      value: 1,
      active: true,
      count: 1,
    },
    {
      title: 'Сегодня',
      type: 'day',
      value: 0,
      active: false,
    },
    {
      title: 'Текущая неделя',
      type: 'day',
      value: 7,
      active: false,
    },
    {
      title: 'Текущий месяц',
      type: 'month',
      value: 1,
      active: false,
    },
    // {
    //   title: 'Год',
    //   type: 'year',
    //   value: 1,
    //   active: false,
    // },
    // {
    //   title: 'За весь период',
    //   type: 'all',
    //   value: 1,
    //   active: false,
    // },
  ];
  types = [
    {
      title: 'Все',
      value: 'DEBIT_CREDIT',
    },
    {
      title: 'Только входящие',
      value: 'DEBIT',
    },
    {
      title: 'Только исходящие',
      value: 'CREDIT',
    },
  ]
  transactions: any[] = [];
  loading = false;
  startDate!: Date | null;
  preSelected!: AccountsDto;
  bankInfo!: any;
  historyForm = new FormGroup({
    id: new FormControl('', [Validators.required]),
    account: new FormControl('', [Validators.required]),
    transType: new FormControl('DEBIT_CREDIT', [Validators.required]),
    date: new FormGroup({
      dateBegin: new FormControl(new Date(), [Validators.required]),
      dateClose: new FormControl(new Date(), [Validators.required]),
    })
  });
  user!: any;

  accountTouched = false;

  loadingReports = false;
  reloadReports = new EventEmitter();

  toggleChip(chip: any) {
    this.dateChips.forEach((el) => {
      el.active = el.title === chip.title;
    });
    this.setDateRange(chip);
  }

  reload() {
    this.reloadReports.emit();
  }

  watchFilter() {
    this.historyForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(300))
      .subscribe((val) => {
        this.getAccountHistory();
      })
  }

  watchRoute() {
    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (params) => {
          this.getAccountNumber(params);
          this.getTab(params);
          this.handleHistoryType(params);
          this.getAccountHistory();
        }
      });
  }

  handleHistoryType(params: Params) {
    const type = params['type'];
    const loanId = params['loanId'];
    if(type) {
      this.historyType = type;
    }
    if(loanId) {
      this.loanId = loanId;
    }
    if(this.historyType === 'loan') {
      this.getAccountsList();
    } else {
      this.getAccounts();
    }
  }

  getAccountsList() {
    this.accountsPaymentService.getLoanAccountsAllowed(this.loanId, LoanTypes.HISTORY)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: any) => {
      if (!res) return;
      this.accounts = res as AccountsDto[];
      this.preSelect();
    });
  }

  getAccountNumber(params: Params) {
    this.id = params['id'];
    this.accountNumber = params['accountNumber'];
    if(this.id && this.accountNumber) {
      this.getAccInfo();
      this.getAccountHistory();
      this.historyForm.patchValue({
        id: this.id
      });
    }
  }

  getTab(params: Params) {
    this.selectedTab = params['tab'];

    if(this.selectedAccount) {
      this.accountNumber = this.selectedAccount.altAcctId;
      this.preSelected = this.selectedAccount;
    }

    if(!this.selectedTab) {
      let queryParams = {
        tab: this.tabs[0].value
      };

      if(params['accountNumber']) {
        queryParams['accountNumber'] = params['accountNumber'];
      }

      this.router.navigate(['/charts'], {
        queryParams: queryParams
      });
      return;
    }

    this._cdRef.markForCheck();
  }

  setDateRange(chip: any) {
    const now = new Date();
    let previousDate: Date | null = new Date(now);
    if(chip.type === 'day') {
      previousDate.setDate(now.getDate() - chip.value);
      if(chip?.count === 1) {
        now.setDate(previousDate.getDate());
      }
    } else if(chip.type === 'month') {
      previousDate.setMonth(now.getMonth() - chip.value);
    } else if(chip.type === 'year') {
      previousDate.setFullYear(now.getFullYear() - chip.value);
    } else if(chip.type === 'all') {
      previousDate = this.getOpenDate(this.selectedAccount.openDate);
    }
    this.historyForm.patchValue({
      date: {
        dateBegin: previousDate,
        dateClose: now,
      }
    });
  }

  getOpenDate(dateString: string): Date {
    if (!dateString) {
      const date = new Date(0);
      date.setFullYear(2010);
      return date;
    }

    const format1Regex = /^\d{2}-[A-Z]{3}-\d{2}$/;
    const format2Regex = /^\d{2}\.\d{2}\.\d{4}$/;

    if (format1Regex.test(dateString)) {
      const [day, month, year] = dateString.split("-");
      const monthMap: { [key: string]: number } = {
        JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
        JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11
      };

      const monthNumber = monthMap[month.toUpperCase()];
      const fullYear = 2000 + parseInt(year, 10);

      return new Date(fullYear, monthNumber, +day);
    } else if (format2Regex.test(dateString)) {
      const [day, month, year] = dateString.split(".");
      return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    } else {
      throw new Error("Invalid date format");
    }
  }


  accountNumber = '';
  selectedAccount!: AccountsDto;
  accounts!: AccountsDto[];
  account!: AccountInfoDto;
  accountSearching = false;

  constructor(
    private accountsService: AccountService,
    private _utilsService: UtilsService,
    private activatedRoute: ActivatedRoute,
    private _cdRef: ChangeDetectorRef,
    private datePipe: DatePipe,
    private templateService: TemplateService,
    private transactionService: TransactionService,
    private destroyRef: DestroyRef,
    public amountService: AmountService,
    private router: Router,
    private accountsPaymentService: AccountsPaymentsService,
    private toastrService: ToastrService,
    private applicationService: ApplicationsService,
    private userService: UserService,
    ) {
  }

  ngOnInit() {
    this.getUserInfo();
    this.watchRoute();
    this.toggleChip(this.dateChips[0]);
  }

  getAccounts(searchText = '') {
    this.accountSearching = true;
    this.accountsService.getAccountList({page: 0, size: 100}, { searchText })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
            this.accounts = res.content;
            this.accountSearching = false;
            this.preSelect();
            this._cdRef.markForCheck();
          }
        },
        error: (err) => {
          this.accountSearching = false;
        }
      });
  }

  getUserInfo() {
    this.userService.userInfo$$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => {
        this.user = user;
    });
  }

  preSelect() {
    const account = this.accounts?.find((el) => {
      if(this.accountNumber && el.altAcctId === this.accountNumber) {
        return true;
      }
      return false;
    });
    if(account) {
      this.selectedAccount = account;
      this.preSelected = account;
    }
  }

  setAccount(account: AccountsDto) {
    this.accountNumber = account.altAcctId;
    this.selectedAccount = account;
    if(account.id) {
      this.id = `${account.id}`;
      this.historyForm.patchValue({
        id: this.id
      });
    }
    this.accountTouched = false;
    this.getAccInfo();
    this.getAccountHistory();
  }

  excel(isPdf = false) {
    const reportType = this.selectedTab === 'history' ? 'REPORT' : 'REPORT_INFO';
    this.getHistoryExcel(reportType, isPdf);
  }

  downloadExcel(file: string) {
    const a = window.document.createElement('a');
    a.href = file;
    a.download = 'download-excel';
    a.click();
    a.remove();
  }

  ngAfterContentInit() {
    this.watchFilter();
  }

  getAccInfo() {
    this.accountsService.getAccountInfo(this.accountNumber)
      .pipe(take(1))
      .subscribe(val => {
        if(val) {
          this.account = val;
          this.getBankInfo(val.mfo);
        }
      })
  }

  getAccountHistory() {
    return;
  }

  getHistoryExcel(reportType: string, isPdf = false) {
    this.historyForm.markAllAsTouched();
    if(this.historyForm.get('id')?.invalid) {
      this.accountTouched = true;
      this.toastrService.error('Заполните все поля!');
      return;
    }

    this._cdRef.detectChanges();
    const body = {
      ...this.historyForm.getRawValue(),
      paging: {
        page: this.pageIndex,
        size: this.pageSize,
      },
      date: {
        dateBegin: this.formatDate(new Date(`${this.historyForm.value.date?.dateBegin}`)),
        dateClose: this.formatDate(new Date(`${this.historyForm.value.date?.dateClose}`)),
      },
      account: this.accountNumber,
      reportType,
      isPdf
    } as IStatementsDto;

    this.toastrService.info("Ваш запрос обрабатывается.\n" +
      "Вы получите уведомление, когда он будет готов!");

    this.accountsService.getAccountHistoryExcel(body)
      .pipe(take(1))
      .subscribe({
        next: val => {
          this.applicationService.$applicationState.next('1');
          if (val?.downloadUrl) {
            this.downloadExcel(val.downloadUrl);
          }
        },
        error: (err) => {
        },
        complete: () => {
        }
      });
  }

  getBankInfo(bankMfo: string) {
    if (bankMfo) {
      this.accountsPaymentService.getBankInfo(bankMfo)
        .pipe(
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(val => {
          if (val) {
            this.bankInfo = val;
          }
        })
    }
  }

  formatDate(date: Date) {
    return this.datePipe.transform(date, 'dd.MM.yyyy') as string;
  }

  protected readonly getStatusApplication = getStatusApplication;
  protected readonly getRussianFormattedDate = getRussianFormattedDate;
  protected readonly getStepsApplication = getStepsApplication;
  protected readonly Math = Math;
  protected readonly Number = Number;
}
