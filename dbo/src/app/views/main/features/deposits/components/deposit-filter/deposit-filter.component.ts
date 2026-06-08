import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, DestroyRef,
  EventEmitter,
  OnInit, Output,
} from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { DepositService } from '../../services/deposit.service';

@Component({
  selector: 'app-deposit-filter',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    NgForOf,
    NgIf,
    MatMenu,
    MatMenuTrigger,
    TranslateModule,
  ],
  templateUrl: './deposit-filter.component.html',
  styleUrl: './deposit-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepositFilterComponent implements OnInit {
  @Output() filterChange = new EventEmitter<any>();
  @Output() searched = new EventEmitter();

  inputSubject = new Subject<any>();

  depositTypes: { code: string; title: string; logoUrl: string }[] = [];
  currencies: { code: string; logoUrl: string }[] = [];

  filterForm = this.fb.group({
    searchText: new FormControl<string>(''),
    depositType: new FormControl<string | null>(null),
    currency: new FormControl<string | null>(null),
  });

  constructor(
    private fb: FormBuilder,
    private destroyRef: DestroyRef,
    private cdRef: ChangeDetectorRef,
    private depositService: DepositService,
  ) {}

  ngOnInit(): void {
    this.inputSubject
      .pipe(debounceTime(2000), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((event: any) => {
        this.filterForm.patchValue({ searchText: event.target.value });
        this.emitFilter();
      });

    this.depositService.getDepositSelectList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (!res) return;
        this.depositTypes = res.depositTypes.map(t => ({
          code: t.code,
          title: t.title,
          logoUrl: t.logo ? `${t.logo.path}${t.logo.name}` : '',
        }));
        this.currencies = res.currencyListObj.map(c => ({
          code: c.currency,
          logoUrl: c.logo ? `${c.logo.path}${c.logo.name}` : '',
        }));
        this.cdRef.markForCheck();
      });
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  getDepositTypeTitle(code: string): string {
    return this.depositTypes.find(t => t.code === code)?.title ?? code;
  }

  getCurrencyLogoUrl(code: string): string {
    return this.currencies.find(c => c.code === code)?.logoUrl ?? '';
  }

  // ─── Filter actions ──────────────────────────────────────────────────────────

  setFilter(value: any, type: 'depositType' | 'currency'): void {
    this.filterForm.patchValue({ [type]: value });
    this.emitFilter();
  }

  removeFilter(key: 'depositType' | 'currency' | 'searchText'): void {
    const defaultValue = key === 'searchText' ? '' : null;
    this.filterForm.get(key)?.reset(defaultValue);
    this.emitFilter();
  }

  clearAllFilters(): void {
    this.filterForm.reset({ searchText: '', depositType: null, currency: null });
    this.emitFilter();
  }

  hasAnyFilter(): boolean {
    const { searchText, depositType, currency } = this.filterForm.value;
    return !!(searchText || depositType || currency);
  }

  private emitFilter(): void {
    this.filterChange.emit(this.filterForm.getRawValue());
    this.searched.emit();
  }
}
