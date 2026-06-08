import { AsyncPipe, NgClass, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, EventEmitter, HostListener, input, Input, OnInit, output, Output, signal, SimpleChanges } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChip, MatChipRemove } from '@angular/material/chips';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, Subject, tap } from 'rxjs';
import { AccountService } from 'src/app/core/services/account.service';
import { CustomDateAdapter } from 'src/app/core/services/custom-date-adapter.service';
import { SvgIconComponent } from 'src/app/shared/components/svg-icon/svg-icon.component';
import { CdkTableModule } from "@angular/cdk/table";
import { LoanService } from '../../../loans/services/loan.service';

@Component({
  selector: 'app-loan-filter',
  imports: [
    FormsModule,
    MatChip,
    MatChipRemove,
    NgOptimizedImage,
    ReactiveFormsModule,
    NgClass,
    MatMenu,
    MatMenuTrigger,
    NgForOf,
    NgIf,
    TranslateModule,
    SvgIconComponent,
    MatIconModule,
    CdkTableModule,
    AsyncPipe
],
  providers: [
    provideNativeDateAdapter(),
    { provide: DateAdapter, useClass: CustomDateAdapter },
  ],
  templateUrl: './loan-filter.component.html',
  styleUrl: './loan-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanFilterComponent {
 @Output() filterChange = new EventEmitter<any>();
  @Output() searched = new EventEmitter();
  @Input() hasStatus = true
  @Input() panelState = false;
  @Input() toggleActive = false;
  @Input() isActionStatus = false;
  @Input() currencyType = ''
  currencyList = input<{ code: string; flag: string }[]>();


  inputSubject = new Subject<any>();
  corpAccount = signal<any>(null)
  currencies: any[] = [];
  accounts: any[] = [];
  backAction = output<string>()
  payments = [];

  statusList = [
    { name: "Активный", value: 'OPEN', img: "./assets/new-icons/status-done.svg", translateKey: 'loans.active' },
    { name: "Просроченный", value: 'CLOSE', img: "./assets/new-icons/error-service.svg", translateKey: 'loans.overdue' },
  ]

  filterForm = this.fb.group({
    searchText: new FormControl<string>(''),
    isActive: new FormControl<boolean | null>(null),
    status:new FormControl<'OPEN' | 'CLOSE' | null>(null),
    senderAccount: new FormControl<any | null>(null),
    receiverAccount: new FormControl<string | null>(null),
    fromAmount: new FormControl<number | null>(null),
    toAmount: new FormControl<number | null>(null),
    currencyEnum: new FormControl<string[] | null>(null),
    statuses: [null],
    transactionStepFilter: new FormControl<string | null>(null),
    accountPrefixes: new FormControl<string[] | null>(null),
    accountPrefixesLabel: new FormControl<string | null>(null),
  });

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private destroyRef: DestroyRef,
    private _cdRef: ChangeDetectorRef,
    private translate: TranslateService,
    private _matDialog: MatDialog,
    public loanService:LoanService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isActionStatus']) {
      this._cdRef.markForCheck();
    }
    // if(changes['hasStatus']) {
    //   if(this.filterForm.value && changes['hasStatus'].currentValue == false) {
    //     this.filterForm.get('status')?.setValue('CLOSE')
    //   }
    // }
  }

  ngOnInit() {
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

  }

  ngOnDestroy(): void {
    this.filterForm.reset()
    this.search()
  }


  search() {
    this.filter();
    this.searched.emit();
  }

  filter() {
    const filterBody: any = this.filterForm.getRawValue();
    filterBody.statuses = filterBody.statuses ? [filterBody.statuses] : null;
    filterBody.status = filterBody.status ? [filterBody.status] : null;

    filterBody.fromAmount = filterBody.fromAmount * 100;
    filterBody.senderAccount = filterBody.senderAccount ? filterBody.senderAccount.account : null;
    filterBody.toAmount = filterBody.toAmount ? filterBody.toAmount * 100 : null;
    this.filterChange.emit(filterBody);
  }

  removeFilter(key: string): void {
    const control = this.filterForm.get(key);
    if (control) {
      const isType = key === 'type';
      const isSearchText = key === 'searchText';
      control.reset(isType ? 'ANY' : isSearchText ? '' : null);
      this.search();
    }
  }

  clearAllFilters(): void {
    Object.keys(this.filterForm.controls).forEach(key => {
      const control = this.filterForm.get(key);
      if (control) {
        const isType = key === 'type';
        const isSearchText = key === 'searchText';
        control.reset(isType ? 'ANY' : isSearchText ? '' : null);
      }

      // if(this.hasStatus == false) {
      //   this.filterForm.get('status')?.setValue('CLOSE')
      // }
    });

    this.search();
  }

  hasAnyFilter(): boolean {
    const value = this.filterForm.value;
    return Object.keys(value).some(key => {
      const val = value[key];
      if (key === 'type' && val === 'ANY') {
        return false;
      }
      if (key === 'searchText' && !val) {
        return false;
      }
      if(key == 'status' && !val) {
        return false;
      }
      return val !== null && val !== undefined && val !== '';
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      // this.openChooseList();
      this.search();
    }
  }
  setFilter(value: any, type: string) {
    if (type === "account") {
      this.filterForm.patchValue({
        senderAccount: { account: value.altAcctId, nameAcc: value.accountTitle, ...value }
      })
      this.search();
    } else if (type === "status") {
      this.filterForm.patchValue({
        status: value
      })
      this.search();
    } else if (type === "currencyEnum") {
      // const currentValues = this.filterForm.value.currencyEnum || [];
      // const index = currentValues.indexOf(value);

      // let newValues: string[];
      // if (index > -1) {
      //   newValues = currentValues.filter(v => v !== value);
      // } else {

      //   newValues = [...currentValues, value];
      // }

      this.filterForm.patchValue({
        currencyEnum: [value]
      })
      this.search();
    } else if (type === "accountPrefixes") {
      this.filterForm.patchValue({
        accountPrefixes: [value]
      })
      this.search();
    } 
  }
  isCurrencySelected(currency: string): boolean {
    const selected = this.filterForm.value.currencyEnum || [];
    return selected.includes(currency);
  }

get statusLabel(): string {
  const status = this.filterForm.value?.status;
  if (!status) return '';
  switch (status) {
    case "OPEN": return 'loans.active';   
    case "CLOSE": return 'loans.overdue';
    default: return '';
  }
}

removeCurrency(currency: string): void {
  this.filterForm.patchValue({
    currencyEnum:[]
  });
  this.search();
}

  get accountPrefixesLabel(): string {
    const accountPrefixes = this.filterForm.value?.accountPrefixes?.[0] ?? '';
    if (!accountPrefixes) return ''
    switch (accountPrefixes) {
        case 'TRANSIT':
          return this.translate.instant('new_loan.transit_account');
        case 'SETTLEMENT':
          return this.translate.instant('new_loan.current_account');
        default:
          return '';
      }
  }
  protected readonly console = console;
}
