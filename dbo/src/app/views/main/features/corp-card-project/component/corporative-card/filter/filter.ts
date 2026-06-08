// Angular core
import { NgClass, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, inject, input, Input, OnInit,
  output, Output, signal
} from '@angular/core';

// Helper functions
import { debounceTime, distinctUntilChanged } from "rxjs";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

// UI helpers
import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import { MatChip, MatChipRemove } from '@angular/material/chips';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';

//Services
import { CustomDateAdapter } from 'src/app/core/services/custom-date-adapter.service';

// Utils
import { clearAllFormFilters, getSelectedItem, hasAnyFormFilter, removeFormFilter } from 'src/app/core/utils/form-filter.util';

import { CardType, FilterKeys, Status } from "./model"
import {currencies , bankCards, statusList } from "../../../constants/corp-card-constants"
import { TranslateModule } from '@ngx-translate/core';
import { CorpCardService } from '../../../services/corp-card.service';


@Component({
  selector: 'Filters',
  imports: [
    NgIf,
    NgForOf,
    NgClass,
    NgOptimizedImage,
    MatChip,
    MatMenu,
    MatChipRemove,
    MatMenuTrigger,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: DateAdapter, useClass: CustomDateAdapter },
  ],
  templateUrl: './filter.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class FilterComponent implements OnInit {
  @Output() filterChange = new EventEmitter<any>();
  hasFilter = output<boolean>()
  @Input() isHidden!: boolean;
  @Input() isSearchVisivle!: boolean;


  private fb = inject(FormBuilder)
  private destroyRef = inject(DestroyRef)
  private corpCardService = inject(CorpCardService);

  cardCurrencies = signal<any>([])
  cardStatuses = signal<any>([])
  cardTypes = signal<any>(['ALL'])


  filterForm = this.fb.group({
    searchText: new FormControl<string  | null>(null),
    type: new FormControl<CardType | null>(null),
    currency: new FormControl<any | null>(null),
    status: new FormControl<Status | null>(null)
  });


  ngOnInit() {
    this.getAllCardSelectOptions()
    this.filterForm.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.filterChange.emit(this.filterForm.value));
  }

  private getAllCardSelectOptions() {
    this.corpCardService.getAllCardSelectOptions('CORPORATE').subscribe((res:any) => {
      console.log('res',res)
      res = res.result;
      if(res.data) {
         this.cardCurrencies.set(res.data.cardCurrencies)
        this.cardStatuses.set(res.data.cardStatuses)
        this.cardTypes.set([
        'ALL',
        ...res.data.cardTypes.filter((type: string) => type !== 'ALL')
      ]);
      } else {
        this.cardCurrencies.set([])
        this.cardStatuses.set([])
        this.cardTypes.set(['ALL'])
      }
      console.log('cardCurrencies',this.cardCurrencies())
      console.log('cardStatuses',this.cardStatuses())
      console.log('cardTypes',this.cardTypes())
    })
  }

  setFilter(value: any, field: FilterKeys) {
     this.filterForm.patchValue({ [field]: value });
  }

  removeFilter(key: FilterKeys): void {
    removeFormFilter(this.filterForm, key);
  }

  hasAnyFilter(): boolean {
    let result =  hasAnyFormFilter(this.filterForm);
    this.hasFilter.emit(result)
    return result;
  }

  clearAllFilters(): void {
    clearAllFormFilters(this.filterForm);
  }

  getSelectedBankCard() {
    return getSelectedItem(this.filterForm.value, 'type', this.bankCards, 'type');
  }

getSelectedCurrency() {
  const selected = this.filterForm.value.currency;
  return this.cardCurrencies().find((c: any) => c.name === selected) ?? null;
}

  getSelectedStatus() {
    return getSelectedItem(this.filterForm.value, 'status', statusList, 'type');
  }

  protected readonly bankCards = bankCards
  protected readonly statusList = statusList
  protected readonly currencies =  currencies
}
