import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {LoanService} from "../../services/loan.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {LoanHistoryDetail} from "../../models/loan.model";
import {
  CurrencyPipe,
  DatePipe,
  JsonPipe,
  KeyValuePipe,
  NgClass,
  NgForOf,
  NgIf,
  NgOptimizedImage
} from "@angular/common";
import {ContainerNavComponent} from "../../../../../../shared/components/container-nav/container-nav.component";
import {ContainerTitleComponent} from "../../../../../../shared/components/container-title/container-title.component";
import {NgxMaskPipe} from "ngx-mask";
import {MatAccordion, MatExpansionPanel} from "@angular/material/expansion";
import {PaginatorComponent} from "../../../../../../shared/components/paginator/paginator.component";
import { ExcelService } from '../../../../../../core/services/excel.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MatDatepicker,
  MatDatepickerInput, MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput
} from '@angular/material/datepicker';
import { MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { debounceTime, take } from 'rxjs';
import { MatNativeDateModule } from '@angular/material/core';
import { UtilsService } from '../../../../../../core/services/utils.service';
import { Options, TemplateService } from '../../../../../../core/services/template.service';
import { AmountService } from '../../../../../../core/services/amount.service';
import { AccountSelectComponent } from '../../../../../../shared/components/account-select/account-select.component';
import { AccountsDto } from '../../../accounts-payments/models/accounts-payments.model';
import { AccountService } from '../../../../../../core/services/account.service';


interface LoanHistoryItem {
  dtAccName: string;
  dtMfo: string;
  dtAcc: string;
  date: string;
  totalDue: string;
  totalCap: string;
  total: string;
  principal: string;
  interest: string;
  charge: string;
  tax: string;
  totalPmnt: string;
  outstanding: string;
  coAccName: string;
  lnType: number;
  dateExecute: string;
}

@Component({
    selector: 'app-my-loan-history',
    imports: [
        NgForOf,
        JsonPipe,
        CurrencyPipe,
        KeyValuePipe,
        NgOptimizedImage,
        ContainerNavComponent,
        ContainerTitleComponent,
        NgIf,
        NgxMaskPipe,
        MatAccordion,
        MatExpansionPanel,
        PaginatorComponent,
        MatDateRangeInput,
        MatNativeDateModule,
        MatDatepickerModule,
        NgClass,
        FormsModule,
        MatDatepicker,
        MatDatepickerInput,
        MatDatepickerToggle,
        MatFormField,
        MatHint,
        MatInput,
        MatLabel,
        MatSuffix,
        ReactiveFormsModule,
        AccountSelectComponent
    ],
    providers: [DatePipe],
    templateUrl: './my-loan-history.component.html',
    styles: `
    .mat-expansion-panel:not([class*=mat-elevation-z]) {
      box-shadow: none;
    }
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyLoanHistoryComponent implements OnInit {
  loading = false
  title = 'История';
  navs = [
    {
      title: 'Главная',
      link: '/'
    },
    {
      title: 'Мои кредиты',
      link: '/loans/loans-my'
    },
    {
      title: this.title,
      link: '/'
    },
  ];
  pageIndex = 0;
  pageSize = 5;
  totalItems = 0;
  panelState = false;

  accounts!: AccountsDto[];
  preSelected!: AccountsDto;

  dateChips = [
    {
      title: 'Вчера',
      type: 'day',
      value: 1,
      active: true,
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
    {
      title: 'Год',
      type: 'year',
      value: 1,
      active: false,
    },
    {
      title: 'За весь период',
      type: 'all',
      value: 1,
      active: false,
    },
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

  columnTitles = {
    dtAccName: 'Наименование счета',
    dtMfo: 'МФО',
    dtAcc: 'Номер счета',
    date: 'Дата операции',
    totalDue: 'Общее к оплате',
    totalCap: 'Капитал',
    total: 'Общая сумма',
    principal: 'Основной долг',
    interest: 'Проценты',
    isDebit: 'Дебет',
    charge: 'Сборы',
    tax: 'Налог',
    totalPmnt: 'Общая оплата',
    outstanding: 'Неоплаченная сумма',
    coAccName: 'Счет контрагента',
    lnType: 'Тип кредита',
    dateExecute: 'Дата исполнения',
    purpose: 'Назначение',
    transNumber: 'Номер транзакции',
  };

  private _cdr = inject(ChangeDetectorRef)
  private _activatedRoute = inject(ActivatedRoute)
  private _loanService = inject(LoanService)
  public datePipe = inject(DatePipe)
  #destroyRef = inject(DestroyRef)
  histories: LoanHistoryDetail[] | undefined = [];
  groupedHistories: { date: string, history: LoanHistoryDetail[] }[] = [];
  public currency = signal<string>('')
  public loanId = signal<number>(0)
  public attachedAccount = signal<string>('')
  public loan1 = signal<string>('');
  yesterDay = new Date();

  constructor(
    private excelService: ExcelService,
    private utilsService: UtilsService,
    private templateService: TemplateService,
    private amountService: AmountService,
    private accountsService: AccountService,
  ) {
    this.yesterDay.setDate(this.yesterDay.getDate() - 1);
  }

  historyForm = new FormGroup({
    id: new FormControl('', [Validators.required]),
    account: new FormControl('', [Validators.required]),
    transType: new FormControl('DEBIT_CREDIT', [Validators.required]),
    date: new FormGroup({
      dateBegin: new FormControl(this.yesterDay, [Validators.required]),
      dateClose: new FormControl(new Date(), [Validators.required]),
    })
  });

  ngOnInit(): void {
    this._activatedRoute.queryParams.subscribe(params => {
      if (params['id']) {
        this.loanId.set(params['id'])
        this.loan1.set(params['loan1'])
        this.attachedAccount.set(params['attached'])
        this.getLoanHistory()
        this.currency.set(params['curr'])
      }
    });
    this.watchFilter();
  }

  watchFilter() {
    this.historyForm.valueChanges
      .pipe(takeUntilDestroyed(this.#destroyRef), debounceTime(300))
      .subscribe((val) => {
        this.getLoanHistory();
      })
  }

  setAccount(account: AccountsDto) {
    // this.accountNumber = account.altAcctId;
    // this.selectedAccount = account;
    // this.id = `${account.id}`;
    // this.historyForm.patchValue({
    //   id: this.id
    // });
    this.getAccInfo(account.altAcctId);
  }

  getAccInfo(account: string) {
    this.accountsService.getAccountInfo(account)
      .pipe(take(1))
      .subscribe(val => {
        if(val) {
          // this.account = val;
          // this.getBankInfo(val.mfo);
        }
      })
  }

  setDateRange(chip: any) {
    const now = new Date();
    let previousDate: Date | null = new Date(now);
    if (chip.type === 'day') {
      previousDate.setDate(now.getDate() - chip.value);
    } else if (chip.type === 'month') {
      previousDate.setMonth(now.getMonth() - chip.value);
    } else if (chip.type === 'year') {
      previousDate.setFullYear(now.getFullYear() - chip.value);
    } else if (chip.type === 'all') {
      previousDate = new Date(0);
    }
    this.historyForm.patchValue({
      date: {
        dateBegin: previousDate,
        dateClose: now,
      }
    });
  }

  getLoanHistory() {
    this.loading = true;
    const body = this.historyForm.getRawValue();
    this.utilsService.spinnerState$$.next(true);
    this._loanService.getLoanHistoryLink({
      account: this.attachedAccount(),
      pageNumber: 1,
      pageSize: 100,
      dateBegin: body.date.dateBegin?.toLocaleDateString('ru-Ru'),
      dateClose: body.date.dateClose?.toLocaleDateString('ru-Ru'),
      type: 'MAIN',
      loanId: this.loanId()
    })
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: val => {
          if (val){
            this.totalItems = val.totalElements;
            this.pageSize = val.size;
            this.totalItems = val.totalElements
            this.pageIndex = val.number;
            this.histories = val?.content
            this.groupByDate()
            this.loading = false
            this._cdr.detectChanges();
          }
        }
      });
  }

  groupByDate() {
    const grouped = this.histories?.reduce((acc, history) => {
      const date = history.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(history);
      return acc;
    }, {} as Record<string, LoanHistoryDetail[]>);
    if (grouped) {
      this.groupedHistories = Object.keys(grouped).map(date => ({
        date,
        history: grouped[date]
      }));
    }
  }

  exportToExcel() {
    const formatted = this.formatData();

    if(formatted) {
      const translated = this.translateColumns(formatted);

      this.excelService.exportToExcel(translated, 'credit-history');
    }
  }

  async exportStatementToPDF() {
    const formatted = this.formatData();

    const options: Options = {
      templateLang: 'ru',
      templateLogo: undefined,
      templatePath: 'loan-history.mustache',
      templateData: formatted,
      templateName: 'История кредита'
    };
    await this.templateService.showPdfInDialog(options);
  }

  translateColumns(formatted: any) {
    const translated: any[] = formatted.map((el: any) => {
      const obj = {};

      Object.keys(el).forEach((key) => {
        // @ts-ignore
        obj[this.columnTitles[key]] = el[key];
      });

      return obj;
    });

    return translated;
  }

  formatData() {
    return this.histories?.map((el: any) => {
      return {
        dtAccName: el.dtAccName,
        dtMfo: el.dtMfo,
        dtAcc: el.dtAcc,
        date: el.date,
        totalDue: this.amountService.convertToAmount(+el.totalDue),
        totalCap: this.amountService.convertToAmount(+el.totalCap),
        total: this.amountService.convertToAmount(+el.total),
        principal: this.amountService.convertToAmount(+el.principal),
        interest: this.amountService.convertToAmount(+el.interest),
        isDebit: el.isDebit ? 'Да' : 'Нет',
        charge: this.amountService.convertToAmount(+el.charge),
        tax: this.amountService.convertToAmount(+el.tax),
        totalPmnt: this.amountService.convertToAmount(+el.totalPmnt),
        outstanding: this.amountService.convertToAmount(+el.outstanding),
        coAccName: el.coAccName || 'Не указано',
        lnType: el.lnType,
        dateExecute: el.dateExecute,
        purpose: el.purpose,
        transNumber: el.transNumber || 'Не указано',
      };
    });
  }

  toggleChip(chip: any) {
    this.dateChips.forEach((el) => {
      el.active = el.title === chip.title;
    });
    this.setDateRange(chip);
  }
}
