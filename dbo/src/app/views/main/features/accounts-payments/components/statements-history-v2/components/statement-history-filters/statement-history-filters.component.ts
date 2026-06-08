import {CommonModule} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  output,
  Output,
  SimpleChanges
} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {debounceTime, distinctUntilChanged, Subject, tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {STATUS_OPTIONS} from '../../models/statement-history.model';
import {StatementHistoryLogicService} from '../../statement-history-logic.service';
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {
  DatePickerDefaultComponent
} from "../../../../../../../../shared/components/date-picker-default/date-picker-default.component";
import {
  MatDatepickerActions, MatDatepickerApply, MatDatepickerCancel,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate
} from "@angular/material/datepicker";
import {SvgIconComponent} from "../../../../../../../../shared/components/svg-icon/svg-icon.component";
import {MatInput} from "@angular/material/input";
import {DateAdapter, provideNativeDateAdapter} from "@angular/material/core";
import {CustomDateAdapter} from "../../../../../../../../core/services/custom-date-adapter.service";

@Component({
  selector: 'app-statement-history-filters',
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatChipsModule,
    CommonModule,
    MatMenuModule,
    TranslateModule,
    DatePickerDefaultComponent,
    MatDateRangeInput,
    SvgIconComponent,
    MatDateRangePicker,
    MatDatepickerActions,
    MatInput,
    MatDatepickerCancel,
    MatDatepickerApply,
    MatStartDate,
    MatEndDate,
  ],
  styles: [
    `
      ::ng-deep .mat-calendar-body-selected {
        background-color: #00A38D !important;
      }

    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideNativeDateAdapter(),
    {provide: DateAdapter, useClass: CustomDateAdapter},
  ],
  template: `
    <form [formGroup]="filterForm" class="flex flex-col">
      <div class="flex flex-col gap-y-[15px]">
        <div class="flex gap-3 flex-wrap w-full p-2 items-center text-start">
          <div class="relative w-[300px]">
            <span class="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M14.5 14.75L10.0001 10.25M11.5 6.5C11.5 9.3995 9.1495 11.75 6.25 11.75C3.3505 11.75 1 9.3995 1 6.5C1 3.6005 3.3505 1.25 6.25 1.25C9.1495 1.25 11.5 3.6005 11.5 6.5Z"
                  stroke="#AEAEAE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <input type="text" [placeholder]="'salaryStatements.search' | translate"
                   (input)="this.inputSubject.next($event)" formControlName="searchText"
                   class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-[10px] focus:outline-none  text-sm h-[32px] bg-white"/>
          </div>
          <!-- <div (click)="this.showFilterModal()"
            class="p-2.5 flex items-center rounded-[10px] border-[#EDEDED] border-2 cursor-pointer">
            <img src="assets/new-icons/filter.svg" class="w-[25px] h-[17px]" alt="filter">
          </div> -->
          <div class="border cursor-pointer border-[#EDEDED] rounded-[10px]" #transactionTrigger="matMenuTrigger"
               [ngClass]="{'!border-[#00A38D]': transactionTrigger.menuOpen || this.filterForm.value?.type !== ''}"
               [matMenuTriggerFor]="transactionMenu">
            <div class="flex items-center h-[32px] p-2 gap-3">
              <p>{{ 'accountStatements.statement_type' | translate }}</p>
              <mat-chip (removed)="removeFilter('type')" [removable]="true" *ngIf="this.filterForm.value?.type"
                        class="!bg-[#F4F4F4] !h-[32px] ">
                <div class="flex items-center gap-2">
                  <span class="text-[#191A1D] text-[12px] font-medium">{{ this.filterForm.value?.type?.label }}</span>
                </div>
                <button matChipRemove>
                  <img src="assets/svg/close.svg" alt="close" width="48" height="48">
                </button>
              </mat-chip>
              <img src="assets/new-icons/arrow-down.svg" alt="">
            </div>
            <mat-menu #transactionMenu="matMenu" xPosition="after" class="menu-actions mt-2">
              <div class="flex flex-col items-center gap-1 p-[4px]">
                @for (item of reportChildList; track $index) {
                  <div (click)="setFilter(item, 'type')"
                       class="flex cursor-pointer  hover:bg-[#F7F7F7] rounded-[12px] gap-2 text-start py-[4px] px-[6px]">
                    <span class="w-[350px] text-[14px] text-[#5C5C5C] font-medium">{{ item.label }}</span>
                  </div>
                }
              </div>
            </mat-menu>
          </div>
          <div *ngIf="activeTabs !== 'signature' && activeMainTabs !== 'signature'" #statusTrigger="matMenuTrigger"
               [ngClass]="{'!border-[#00A38D]': statusTrigger.menuOpen || this.filterForm.value?.statuses}"
               class="border cursor-pointer border-[#EDEDED] rounded-[10px]" [matMenuTriggerFor]="statusMenu">
            <div class="flex items-center p-2 gap-3 h-[32px]">
              <p> {{ 'filter.status' | translate }}</p>
              <mat-chip [removable]="true" *ngIf="this.filterForm.value?.statuses" (removed)="removeFilter('statuses')"
                        class="!bg-[#F4F4F4] !h-[32px] ">
                <div class="flex items-center gap-2">
                </div>
                <span
                  class="text-[#191A1D] text-[12px] font-medium">{{ this.filterForm.value?.statuses?.label | translate }}</span>
                <button matChipRemove>
                  <img src="assets/svg/close.svg" alt="close" width="48" height="48">
                </button>
              </mat-chip>
              <img src="assets/new-icons/arrow-down.svg" alt="" height="8" width="12">
            </div>
            <mat-menu #statusMenu="matMenu" xPosition="after" class="menu-actions mt-2">
              <div class="flex flex-col items-center gap-1 p-[4px]">
                <div *ngFor="let status of statuses" (click)="setFilter(status, 'status')"
                     class="flex cursor-pointer text-start items-center hover:bg-[#F7F7F7] rounded-[12px] gap-2 py-[4px] px-[6px]">
                  <!-- <div class=" flex text-start">
                    <img [src]="status.img" alt="">
                  </div> -->
                  <span class="w-[140px] text-[14px] text-[#5C5C5C] font-medium">{{ status.label | translate }}</span>
                </div>
              </div>
            </mat-menu>
          </div>

          @if (isCalendarRange) {
            <app-datepicker-default [mode]="'range'" formControlName="rangeForm" [control]="filterForm.get('rangeForm')"
                                    size="small" placeholder="accountStatements.request_date"></app-datepicker-default>
          } @else {
            <div #periodTrigger="matMenuTrigger"
                 [ngClass]="{'!border-primary-base': periodTrigger.menuOpen || this.filterForm.value?.startDate || this.filterForm.value.endDate}"
                 class="border border-custom-border relative cursor-pointer rounded-[10px] bg-surface-2"
                 [matMenuTriggerFor]="periodMenu">
              <div
                class="flex items-center justify-between pt-[10px] pb-[10px] pr-[10px] pl-[12px] gap-2 min-w-[108px] h-[40px]">
                <p class="text-[14px] font-normal text-custom-primary">{{ 'accountStatements.request_date' | translate }}</p>
                <mat-chip [removable]="true" *ngIf="this.filterForm.value?.startDate && this.filterForm.value.endDate"
                          (removed)="removeFilter('startDate'); removeFilter('endDate')"
                          class="!bg-surface-4 !h-[20px]">
                  <span class="text-custom-primary text-[12px] font-medium">
                    {{ detectPeriodLabel(this.filterForm.value?.startDate, this.filterForm.value.endDate) }}
                  </span>
                  <button matChipRemove>
                    <mat-icon class="text-5xl text-custom-primary">close</mat-icon>
                  </button>
                </mat-chip>
                <div class="w-[20px] h-[20px] items-center flex justify-center">
                  <!-- <img src="./assets/new-icons/calendar.svg" alt=""> -->
                  <app-svg-icon name="hamkor_calendar" [size]="20" classes="text-custom-primary"></app-svg-icon>
                </div>
              </div>

              <mat-date-range-input class="absolute inset-0 w-[100px] opacity-0 pointer-events-none"
                                    [rangePicker]="picker">
                <input matStartDate formControlName="startDate" readonly matInput class="peer"/>
                <input matEndDate formControlName="endDate" readonly matInput class="peer"/>
              </mat-date-range-input>

              <mat-date-range-picker #picker>
                <mat-date-range-picker-actions>
                  <div class="w-full px-2 py-1">
                    <div class="flex w-full gap-3">
                      <button class="h-[32px] bg-surface-2 text-custom-primary rounded-xl w-1/2 text-xs"
                              matDateRangePickerCancel>Отменить
                      </button>
                      <button class="h-[32px] bg-primary-base text-white rounded-xl w-1/2 text-xs"
                              matDateRangePickerApply (click)="onApply()">Применить
                      </button>
                    </div>
                  </div>
                </mat-date-range-picker-actions>
              </mat-date-range-picker>

              <mat-menu #periodMenu="matMenu" xPosition="after" class="menu-actions mt-2">
                <div class="flex flex-col items-center gap-1 p-[4px]">
                  <div (click)="setPeriodToday()"
                       class="flex cursor-pointer text-start items-center hover:bg-surface-2 rounded-[12px] gap-2 py-[4px] px-[6px]">
                    <span
                      class="w-[120px] text-[14px] text-custom-secondary font-medium">{{ 'accounts.today' | translate }}</span>
                    <img src="./assets/new-icons/arrow-right-period.svg" class="opacity-0" alt="">
                  </div>
                  <div (click)="setPeriodYesterday()"
                       class="flex cursor-pointer items-center hover:bg-surface-2 rounded-[12px] gap-2 text-start py-[4px] px-[6px]">
                    <span
                      class="w-[120px] text-[14px] text-custom-secondary font-medium">{{ "chat.yesterday" | translate }}</span>
                    <img src="./assets/new-icons/arrow-right-period.svg" class="opacity-0" alt="">
                  </div>
                  <div (click)="setPeriodWeek()"
                       class="flex cursor-pointer items-center hover:bg-surface-2 rounded-[12px] gap-2 text-start py-[4px] px-[6px]">
                    <span
                      class="w-[120px] text-[14px] text-custom-secondary font-medium">{{ 'accounts.week' | translate }}</span>
                    <img src="./assets/new-icons/arrow-right-period.svg" class="opacity-0" alt="">
                  </div>
                  <div (click)="setPeriodMonth()"
                       class="flex cursor-pointer items-center hover:bg-surface-2 rounded-[12px] gap-2 text-start py-[4px] px-[6px]">
                    <span
                      class="w-[120px] text-[14px] text-custom-secondary font-medium">{{ 'accounts.month' | translate }}</span>
                    <img src="./assets/new-icons/arrow-right-period.svg" class="opacity-0" alt="">
                  </div>
                  <div (click)="picker.open()"
                       class="flex cursor-pointer items-center hover:bg-surface-2 rounded-[12px] gap-2 text-start py-[4px] px-[6px]">
                    <span
                      class="w-[120px] text-[14px] text-custom-secondary font-medium">{{ 'accounts.custom' | translate }}</span>
                    <img src="./assets/new-icons/arrow-right-period.svg" alt="">
                  </div>
                </div>
              </mat-menu>
            </div>
          }
          <!--<div #periodTrigger="matMenuTrigger"
            [ngClass]="{'!border-[#00A38D]': periodTrigger.menuOpen || this.filterForm.value?.startDate || this.filterForm.value.endDate}"
            class="border cursor-pointer border-[#EDEDED] rounded-[10px]" [matMenuTriggerFor]="periodMenu">
            <div class="flex items-center p-2 gap-3 h-[32px]">
              <p>{{'accountStatements.request_date' | translate}}</p>
              <mat-chip [removable]="true" *ngIf="this.filterForm.value?.startDate && this.filterForm.value.endDate"
                (removed)="removeFilter('startDate'); removeFilter('endDate')" class="!bg-[#F4F4F4] !h-[32px] ">
                <div class="flex items-center gap-2">
                </div>
                <span class="text-[#191A1D] text-[12px] font-medium">{{detectPeriodLabel(this.filterForm.value?.startDate,
                  this.filterForm.value.endDate)}}</span>
                <button matChipRemove>
                  <img src="assets/svg/close.svg" alt="close" width="48" height="48">
                </button>
              </mat-chip>
              <img src="assets/new-icons/calendar-icon.svg" alt="">
            </div>
            <mat-menu #periodMenu="matMenu" xPosition="after" class="menu-actions mt-2">
              <div class="flex flex-col items-center gap-1 p-[4px]">
                <div (click)="setPeriodToday()"
                  class="flex cursor-pointer text-start items-center hover:bg-[#F7F7F7] rounded-[12px] gap-2 py-[4px] px-[6px]">
                  <span class="w-[120px] text-[14px] text-[#5C5C5C] font-medium">{{'salaryStatements.today' | translate}}</span>
                  <img src="assets/new-icons/arrow-right-period.svg" class="opacity-0" alt="">
                </div>
                <div (click)="setPeriodYesterday()"
                  class="flex cursor-pointer items-center hover:bg-[#F7F7F7] rounded-[12px] gap-2 text-start py-[4px] px-[6px]">
                  <span class="w-[120px] text-[14px] text-[#5C5C5C] font-medium">{{'salaryStatements.yesterday' | translate}}</span>
                  <img src="assets/new-icons/arrow-right-period.svg" class="opacity-0" alt="">
                </div>
                <div (click)="setPeriodWeek()"
                  class="flex cursor-pointer items-center hover:bg-[#F7F7F7] rounded-[12px] gap-2 text-start py-[4px] px-[6px]">
                  <span class="w-[120px] text-[14px] text-[#5C5C5C] font-medium">{{'salaryStatements.week' | translate}}</span>
                  <img src="assets/new-icons/arrow-right-period.svg" class="opacity-0" alt="">
                </div>
                <div (click)="setPeriodMonth()"
                  class="flex cursor-pointer items-center hover:bg-[#F7F7F7] rounded-[12px] gap-2 text-start py-[4px] px-[6px]">
                  <span class="w-[120px] text-[14px] text-[#5C5C5C] font-medium"> {{'salaryStatements.month' | translate}}</span>
                  <img src="assets/new-icons/arrow-right-period.svg" class="opacity-0" alt="">
                </div>
              </div>
            </mat-menu>
          </div>-->

          <div *ngIf="this.filterForm.value.fromAmount && this.filterForm.value.toAmount"
               class="flex rounded-[10px] items-center p-2 gap-3 h-[40px]  border border-[#00A38D]">
            <p>Сумма {{ 'createPayment.amount' | translate }}</p>
            <mat-chip [removable]="true" (removed)="removeFilter('fromAmount');removeFilter('toAmount')"
                      class="!bg-[#F4F4F4] !h-[32px] ">
              <span class="text-[#191A1D] text-[12px] font-medium">от:
                {{ this.filterForm.value?.fromAmount?.toLocaleString('ru') + ' - ' }}</span>
              <span class="text-[#191A1D] text-[12px] font-medium">до:
                {{ this.filterForm.value?.toAmount?.toLocaleString('ru') }}</span>
              <button matChipRemove>
                <img src="assets/svg/close.svg" alt="close" width="48" height="48">
              </button>
            </mat-chip>
          </div>
          <div *ngIf="hasAnyFilter()" class="flex items-center gap-1 cursor-pointer" (click)="clearAllFilters()">
            <span class="text-[#008C79] font-medium">{{ 'new.reset_all' | translate }}</span>
            <img width="30" height="30" src="assets/svg/close-active.svg" alt="">
          </div>
        </div>

      </div>
    </form>
    <ng-template #triggerTemplate let-selectedValue>
      <div>
        @if (selectedValue) {
          <span>{{ selectedValue }}</span>
        } @else {
          <span>Choose an item...</span>
        }
      </div>
    </ng-template>
    <ng-template #optionTemplate let-option>
      <div>
        <span>{{ option }}</span>
      </div>
    </ng-template>
    <ng-template #header>
      @if (!toggleActive) {
        <div class="mt-3">
          <button type="button" (click)="panelState = !panelState"
                  class="p-2.5 flex items-center rounded-[10px] border-[#EDEDED] border">
            <img src="assets/new-icons/filter.svg" alt="filter">
          </button>
        </div>
      }
    </ng-template>
  `,
})
export class StatementHistoryFiltersComponent implements OnInit, OnChanges {
  @Output() filterChange = new EventEmitter<any>();
  @Output() searched = new EventEmitter();

  @Input() panelState = false;
  @Input() toggleActive = false;
  @Input() isActionStatus = false;
  @Input() activeTabs = ''
  @Input() isCalendarRange = false;
  @Input() activeMainTabs = '';
  @Input() reportChildList: { value: string; label: string; }[] = [];

  inputSubject = new Subject<any>();
  currencies: any[] = [];
  accounts: any[] = [];
  backAction = output<string>()
  payments = [];
  // readonly STATEMENT_ITEMS = [
  //   {value: "REPORT", label: "REPORT"},
  //   {value: "REPORT_INFO", label: "REPORT_INFO"},
  //   {value: "ACCOUNT_ACTIVITY_INFO", label: "Сведения о работе счета"},
  //   {value: "WITH_CORRESPONDENT", label: "С корреспондентом"},
  //   {value: "OPERATING_DAY", label: "Опердень"},
  //   {value: "PERSONAL_ACCOUNT_STATEMENT", label: "Выписка лицевого счета"},
  //   {value: "DOCUMENT_STATEMENT", label: "Выписка по документам"},
  //   {value: "TERMINAL_STATEMENT", label: "Выписка с терминала"},
  //   {value: "CURRENCY_OPERATIONS_STATEMENT", label: "Выписка по валютным операциям"},
  //   {value: "PAYMENT_DOCUMENTS", label: "Платежные документы"},
  //   {value: "ACCOUNT_ACTIVITY_CERTIFICATE", label: "Справка о работе счета"},
  //   {value: "FIVE_DIGIT_ACCOUNT_CERTIFICATE", label: "Справка по 5-значному счету"},
  //   {value: "BANK_STATEMENT_1C", label: "Банковская выписка (для 1С)"},
  //   {value: "BANK_STATEMENT_MT940", label: "Банковская выписка MT940"},
  //   {value: "ACCOUNT_MOVEMENTS", label: "Движение счетов"},
  //   {value: "ACCOUNT_BALANCES", label: "Остатки на счетах"},
  //   {value: "BALANCE_SHEET", label: "Сальдово-оборотная ведомость"},
  //   {value: "CARD_FILE_BALANCES", label: "Остатки счетов Картотеки"},
  //   {value: "OUTGOING_PAYMENT_INVENTORY", label: "Опись исходящих платёжных документов"},
  //   {value: "PAYMENT_ORDER_REGISTRY", label: "Реестр введённых платёжных поручений"},
  //   {value: "MERCHANT_TERMINAL_REGISTRY", label: "Реестр транзакций торговых организаций в разрезе терминалов"},
  //   {value: "CARD_FILE_1", label: "Счета на картотеке 1"},
  //   {value: "CARD_FILE_2", label: "Счета на картотеке 2"},
  //   {value: "CBU_EXCHANGE_RATES", label: "Курсы валют ЦБ РУЗ"},
  // ]

  statuses = STATUS_OPTIONS

  filterForm = this.fb.group({
    startDate: new FormControl<any | null>(null),
    endDate: new FormControl<any | null>(null),
    // dateRange: this.fb.control<{ start: Date | null; end: Date | null } | null>(null),
    type: new FormControl<any>(null),
    docNum: new FormControl<string | null>(null),
    searchText: new FormControl<string>(''),
    senderAccount: new FormControl<any | null>(null),
    receiverAccount: new FormControl<string | null>(null),
    inn: new FormControl<string | null>(null),
    receiverName: new FormControl<string | null>(null),
    fromAmount: new FormControl<number | null>(null),
    toAmount: new FormControl<number | null>(null),
    currency: new FormControl<number | null>(null),
    statuses: new FormControl<any>(null),
    transactionModes: [null],
    transactionStepFilter: new FormControl<string | null>(null),
    rangeForm: [null],
  });

  constructor(
    private fb: FormBuilder,
    private destroyRef: DestroyRef,
    private _cdRef: ChangeDetectorRef,
    // private _matDialog: MatDialog,
    private statementHistoryLogicService: StatementHistoryLogicService,
    private translateService: TranslateService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isActionStatus']) {
      this._cdRef.markForCheck();
    }
    if (changes['activeTabs']) {
      this.clearAllFilters()
    }

    if (changes['activeMainTabs']) {
      this.clearAllFilters()
    }
  }

  ngOnInit() {
    // this.getCurrencies();
    // this.getAccountsV2();
    // this.getAccountsList();
    this.filterChange.emit(this.filterForm.value);
    this.filter();

    this.inputSubject
      .pipe(debounceTime(800), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        this.filterForm.patchValue({
          searchText: val.target.value
        })
        this.search();
      });

    if (this.isCalendarRange) {
      this.handleStartAndEndDate()
    }

    this.filterForm.valueChanges.pipe(
      debounceTime(800),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
      tap((res) => {
        this.statementHistoryLogicService.setFilterForm(res)
      })
    ).subscribe()
  }

  onApply() {
    this.search();
  }

  // private removeRangeFormFromForm(obj: any) {
  //   let copiedFilterFormValue = JSON.parse(JSON.stringify(obj))
  //   if (copiedFilterFormValue.hasOwnProperty('rangeForm')) {
  //     delete copiedFilterFormValue['rangeForm']
  //   }
  //
  //   return copiedFilterFormValue
  // }

  private handleStartAndEndDate() {
    this.filterForm?.get('rangeForm')?.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
      tap((res: any) => {
        this.filterForm.get('startDate')?.setValue(res.start)
        this.filterForm.get('endDate')?.setValue(res.end)
        this.search()
      })
    ).subscribe()
  }

  get transactionModes() {
    return this.filterForm.get('transactionModes');
  }

  search() {
    this.filter();
    this.searched.emit();
  }

  filter() {
    const filterBody: any = this.filterForm.getRawValue();
    // filterBody.fromAmount = filterBody.fromAmount * 100;
    // filterBody.senderAccount = filterBody.senderAccount ? filterBody.senderAccount.account : null;
    // filterBody.toAmount = filterBody.toAmount ? filterBody.toAmount * 100 : null;
    this.filterChange.emit({
      statuses: filterBody.statuses ? [filterBody.statuses] : null,
      transactionModes: filterBody.transactionModes ? [filterBody.transactionModes] : null,
      startDate: filterBody.startDate ? filterBody.startDate : null,
      endDate: filterBody.endDate ? filterBody.endDate : null,
    });
  }

  removeFilter(key: string): void {
    const control = this.filterForm.get(key);
    if (control) {
      const isType = key === 'type';
      const isSearchText = key === 'searchText';
      if (isType || isSearchText) {
        control.reset('')
      } else {
        control.reset(null)
      }
      this.search();
    }
  }

  clearAllFilters(): void {
    Object.keys(this.filterForm.controls).forEach(key => {
      const control = this.filterForm.get(key);
      if (control) {
        const isType = key === 'type';
        const isSearchText = key === 'searchText';
        control.reset(isType ? '' : isSearchText ? '' : null);
      }
    });
    this.search();
  }

  hasAnyFilter(): boolean {
    const value = this.filterForm.value;
    return Object.keys(value).some(key => {
      const val = value[key];

      if (key === 'type' && val === '') {
        return false;
      }
      if (key === 'searchText' && !val) {
        return false;
      }
      // if (key === 'dateRange') {
      //   if (!val || (val && (!val.start || !val.end))) return false;
      // }
      return val !== null && val !== undefined && val !== '';
    });
  }

  setFilter(value: any, type: string) {
    if (type === "account") {
      this.filterForm.patchValue({
        senderAccount: {account: value.altAcctId, nameAcc: value.accountTitle, ...value}
      })
      this.search();
    } else if (type === "type") {
      this.filterForm.patchValue({
        type: value
      })
      this.search();
    } else if (type === "status") {
      this.filterForm.patchValue({
        statuses: value
      })
      this.search();
    } else if (type === "period") {
      this.filterForm.patchValue({
        startDate: value.startDate,
        endDate: value.endDate,
      })
      this.search();
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      // this.openChooseList();
      this.search();
    }
  }

  setPeriodToday() {
    const today = new Date();
    const startDate = new Date(today.setHours(0, 0, 0, 0));
    const endDate = new Date(today.setHours(23, 59, 59, 999));
    return this.setFilter({startDate, endDate}, "period")
  }

  setPeriodYesterday() {
    const now = new Date();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
    const endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);

    return this.setFilter({startDate, endDate}, "period")
  }

  setPeriodWeek() {
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);

    return this.setFilter({startDate, endDate}, "period");
  }

  setPeriodMonth() {
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 29);

    return this.setFilter({startDate, endDate}, "period");
  }

  // setPeriodToday() {
  //   const now = new Date();
  //   const startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
  //   const endDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999));
  //   return this.setFilter({ startDate, endDate }, "period");
  // }
  //
  // setPeriodYesterday() {
  //   const now = new Date();
  //   const startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0));
  //   const endDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999));
  //   return this.setFilter({ startDate, endDate }, "period");
  // }
  //
  // setPeriodWeek() {
  //   const now = new Date();
  //   const startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0));
  //   const endDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999));
  //   return this.setFilter({ startDate, endDate }, "period");
  // }
  //
  // setPeriodMonth() {
  //   const now = new Date();
  //   const startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0));
  //   const endDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999));
  //   return this.setFilter({ startDate, endDate }, "period");
  // }

  detectPeriodLabel(startDate: Date, endDate: Date): string {
    const now = new Date();

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
    const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);

    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
    const weekEnd = todayEnd;

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const format = (d: Date) =>
      d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

    if (startDate.getTime() === todayStart.getTime() && endDate.getTime() === todayEnd.getTime()) {
      return `${this.translateService.instant('story.today')} ${format(startDate)}`;
    }

    if (startDate.getTime() === yesterdayStart.getTime() && endDate.getTime() === yesterdayEnd.getTime()) {
      return `${this.translateService.instant('story.yesterday')} ${format(startDate)}`;
    }

    if (startDate.getTime() === weekStart.getTime() && endDate.getTime() === weekEnd.getTime()) {
      return `${format(weekStart)} – ${format(weekEnd)}`;
    }

    if (startDate.getTime() === monthStart.getTime() && endDate.getTime() === monthEnd.getTime()) {
      return `${format(monthStart)} – ${format(monthEnd)}`;
    }

    return `${format(startDate)} – ${format(endDate)}`;
  }
  // detectPeriodLabel(startDate: Date, endDate: Date): string {
  //
  //   const format = (d: Date) => d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', timeZone: 'UTC' });
  //
  //   const now = new Date();
  //
  //   const todayStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
  //   const todayEnd = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999));
  //
  //   const yesterdayStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0));
  //   const yesterdayEnd = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999));
  //
  //   if (startDate.getTime() >= todayStart.getTime() && startDate.getTime() <= todayEnd.getTime()) {
  //     return `Сегодня ${format(startDate)}`;
  //   }
  //
  //   if (startDate.getTime() >= yesterdayStart.getTime() && startDate.getTime() <= yesterdayEnd.getTime()) {
  //     return `Вчера ${format(startDate)}`;
  //   }
  //
  //   return `${format(startDate)} – ${format(endDate)}`;
  // }
  // showFilterModal() {
  //   const dialog = this._matDialog.open(TableFiltersDialogComponent, {
  //     width: '550px',
  //     height: '100%',
  //     position: { right: '0' },
  //     panelClass: 'right-side-dialog',
  //     disableClose: true,
  //     data: {
  //       account: this.accounts,
  //       setFilter: (value: any) => this.setFilterFromPopUp(value),
  //       filterForm: this.filterForm.value,
  //       activeTabs: this.activeTabs,
  //       activeMainTabs: this.activeMainTabs,
  //     }
  //   });
  //   dialog.componentInstance.onDetail.subscribe(res => {
  //     this.backAction.emit(res)
  //     dialog.close()
  //   })
  // }
  // clearFilter() {
  //   this.filterForm.reset();
  //   this.filterForm.patchValue({
  //     type: '',
  //     searchText: '',
  //   })
  //   this.filterChange.emit(this.filterForm.value);
  // }
  // setType(value: string) {
  //   this.filterForm.patchValue({
  //     type: value,
  //   });
  //   this.filter();
  // }
  // getActiveFilters(): { key: string; value: any }[] {
  //   const filters = this.filterForm.value;
  //   const activeFilters: { key: string; value: any }[] = [];
  //
  //   Object.entries(filters).forEach(([key, value]) => {
  //     if (value !== null && value !== '' && value !== '') {
  //       activeFilters.push({ key, value });
  //     }
  //   });
  //   return activeFilters;
  // }
  // setFilterFromPopUp(filters: any) {
  //   this.filterForm.patchValue(filters)
  //   this.search();
  // }
}
