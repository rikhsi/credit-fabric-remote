import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

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
import { debounceTime } from 'rxjs';
import { MatNativeDateModule } from '@angular/material/core';
import { UtilsService } from '../../../../../../core/services/utils.service';
import {LoanService} from "../../../loans/services/loan.service";
import {LoanHistoryDetail} from "../../../loans/models/loan.model";
import {AccountService} from "../../../../../../core/services/account.service";
import {IStatementsDto} from "../../../accounts-payments/models/statements.interface";


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
        ReactiveFormsModule
    ],
    providers: [DatePipe],
    templateUrl: './my-deposit-history.component.html',
    styles: `
    .mat-expansion-panel:not([class*=mat-elevation-z]) {
      box-shadow: none;
    }
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyDepositHistoryComponent implements OnInit {
  loading = false
  title = 'История операций';
  navs = [
    {
      title: 'Главная',
      link: '/'
    },
    {
      title: 'Мои депозиты',
      link: '/deposits/my-deposits'
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
  private _accountService = inject(AccountService)
  public datePipe = inject(DatePipe)
  #destroyRef = inject(DestroyRef)
  histories: LoanHistoryDetail[] | undefined = [];

  groupedHistories: { date: string, history: LoanHistoryDetail[] }[] = [];
  public currency = signal<string>('')
  public depositId = signal<string>('')
  public attachedAccount = signal<string>('')
  yesterDay = new Date();

  constructor(
    private excelService: ExcelService,
    private utilsService: UtilsService,
  ) {
    this.yesterDay.setDate(this.yesterDay.getDate() - 1);
  }

  historyForm = new FormGroup({
    id: new FormControl(null, [Validators.required]),
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
        this.depositId.set(params['id'])
        this.attachedAccount.set(params['attached'])
        this.getDepositHistory()
        this.currency.set(params['curr'])
      }
    });
    this.watchFilter();
  }

  watchFilter() {
    this.historyForm.valueChanges
      .pipe(takeUntilDestroyed(this.#destroyRef), debounceTime(300))
      .subscribe((val) => {
        this.getDepositHistory();
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

  getDepositHistory() {
    this.loading = true;
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
      account: this.attachedAccount(),
      autoId:true
    } as IStatementsDto;
    this.utilsService.spinnerState$$.next(true);
    this._accountService.getAccountHistory(body)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: val => {
          if (val){
            this.totalItems = val.totalElements;
            this.pageSize = val.size;
            this.totalItems = val.totalElements
            this.pageIndex = val.number;
            this.histories = val.data.content
            this.groupByDate()
            this.loading = false
            this._cdr.detectChanges();
          }
        }
      });
  }
  formatDate(date: Date) {
    return this.datePipe.transform(date, 'dd.MM.yyyy') as string;
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

      this.excelService.exportToExcel(translated, 'deposit-history');
    }
  }

  viewExcel() {
    const formatted = this.formatData();

    if(formatted) {
      const translated = this.translateColumns(formatted);

      this.excelService.exportToExcelInBrowser(translated, 'deposit-history');
    }
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
        totalDue: +el.totalDue / 100,
        totalCap: +el.totalCap / 100,
        total: +el.total / 100,
        principal: +el.principal / 100,
        interest: +el.interest / 100,
        isDebit: el.isDebit ? 'Да' : 'Нет',
        charge: +el.charge / 100,
        tax: +el.tax / 100,
        totalPmnt: +el.totalPmnt / 100,
        outstanding: +el.outstanding / 100,
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
