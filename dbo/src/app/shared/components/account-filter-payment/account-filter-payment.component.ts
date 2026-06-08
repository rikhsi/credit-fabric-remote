import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, DestroyRef,
  EventEmitter, HostListener, input, Input,
  OnChanges,
  OnDestroy,
  OnInit, output,
  Output, signal, SimpleChanges
} from '@angular/core';
import { NgClass, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatChip, MatChipRemove } from '@angular/material/chips';
import { AccountService } from '../../../core/services/account.service';
import { CustomDateAdapter } from '../../../core/services/custom-date-adapter.service';
import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import { debounceTime, distinctUntilChanged, Subject } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { TranslateModule } from '@ngx-translate/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-account-filter-payment',
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
    MatIconModule
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: DateAdapter, useClass: CustomDateAdapter },
  ],
  templateUrl: './account-filter-payment.component.html',
  styles: ``,
  styleUrls: ['./account-filter-payment.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountFilterPaymentComponent implements OnInit, OnChanges, OnDestroy {
  @Output() filterChange = new EventEmitter<any>();
  @Output() searched = new EventEmitter();

  @Input() panelState = false;
  @Input() toggleActive = false;
  @Input() isActionStatus = false;
  @Input() currencyType = ''
    hasAnyFilterInForm = output<boolean>()
  currencyList = input<{ code: string; flag: string }[]>();


  inputSubject = new Subject<any>();
  corpAccount = signal<any>(null)
  currencies: any[] = [];
  accounts: any[] = [];
  backAction = output<string>()
  payments = [];

  statusList = [
    { name: "Активен", value: true, img: "./assets/new-icons/done-status.svg", translateKey: 'myAccounts.active' },
    { name: "Заблокирован", value: false, img: "./assets/new-icons/blocked-icon.svg", translateKey: 'myAccounts.blocked' },
  ]
  typeAccountList = signal<{ key: string, value: string }[]>([])

  filterForm = this.fb.group({
    searchText: new FormControl<string>(''),
    isActive: new FormControl<boolean | null>(null),
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
    private _matDialog: MatDialog,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isActionStatus']) {
      this._cdRef.markForCheck();
    }
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

    this.getAllResponseType()

    this.filterForm.valueChanges.pipe(
    takeUntilDestroyed(this.destroyRef)
  ).subscribe(() => {
    this.hasAnyFilterInForm.emit(this.computeHasAnyFilter());
  });

  this.hasAnyFilterInForm.emit(this.computeHasAnyFilter());


  }

  ngOnDestroy(): void {
    this.filterForm.reset()
    this.search()
  }
  private getAllResponseType() {
    this.accountService.getAllResponseType().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.typeAccountList.set(res || []);
    }
    );
  }

  search() {
    this.filter();
    this.searched.emit();
      this.hasAnyFilterInForm.emit(this.computeHasAnyFilter()); 
  }

  filter() {
    const filterBody: any = this.filterForm.getRawValue();
    filterBody.statuses = filterBody.statuses ? [filterBody.statuses] : null;
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
    console.log(this.filterForm.value, "ff")
  }
  clearAllFilters(): void {
    Object.keys(this.filterForm.controls).forEach(key => {
      const control = this.filterForm.get(key);
      if (control) {
        const isType = key === 'type';
        const isSearchText = key === 'searchText';
        control.reset(isType ? 'ANY' : isSearchText ? '' : null);
      }
    });

    this.search();
  }

  hasAnyFilter(): boolean {
   return this.computeHasAnyFilter()
  }

  private computeHasAnyFilter(): boolean {
  const value = this.filterForm.value;
  return Object.keys(value).some(key => {
    const val = value[key];
    if (key === 'type' && val === 'ANY') return false;
    if (key === 'searchText' && !val) return false;
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
        statuses: value
      })
      this.search();
    } else if (type === "currencyEnum") {
      const currentValues = this.filterForm.value.currencyEnum || [];
      const index = currentValues.indexOf(value);

      let newValues: string[];
      if (index > -1) {
        newValues = currentValues.filter(v => v !== value);
      } else {

        newValues = [...currentValues, value];
      }

      this.filterForm.patchValue({
        currencyEnum: newValues.length > 0 ? newValues : null
      })
      this.search();
    } else if (type === "accountPrefixes") {
      this.filterForm.patchValue({
        accountPrefixes: [value]
      })
      this.filterForm.patchValue({
        accountPrefixesLabel: this.typeAccountList().find(item => item.key === value)?.value || null
      })
      this.search();
    } else if (type === "isActive") {
      this.filterForm.patchValue({
        isActive: value
      })
      this.search();
    }
  }
  isCurrencySelected(currency: string): boolean {
    const selected = this.filterForm.value.currencyEnum || [];
    return selected.includes(currency);
  }

  get statusLabel(): string {
    const status = this.filterForm.value?.statuses;
    if (!status) return ''
    switch (status) {
      case "ACTIVE":
        return 'Активен';

      case "BLOCKED":
        return 'Заблокирован';

      default:
        return '';
    }
  }
  get accountPrefixesLabel(): string {
    const accountPrefixes = this.filterForm.value?.accountPrefixes?.[0] ?? '';
    if (!accountPrefixes) return ''
    switch (accountPrefixes) {
      case "TRANSIT":
        return 'Транзитный счет';

      case "SETTLEMENT":
        return 'Расчетный счет';

      default:
        return '';
    }
  }
  protected readonly console = console;
}
