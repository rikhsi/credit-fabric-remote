import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, DestroyRef,
  EventEmitter,
  Input,
  OnChanges, OnDestroy, OnInit,
  Output,
  SimpleChanges, ViewChild
} from '@angular/core';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { NgClass, NgIf, NgOptimizedImage } from '@angular/common';
import { NgxMaskPipe } from 'ngx-mask';
import { AccountsDto } from '../../../views/main/features/accounts-payments/models/accounts-payments.model';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Pageable } from '../../interfaces/pageable.interface';

@Component({
    selector: 'app-account-select',
    imports: [
        MatFormField,
        MatIcon,
        MatLabel,
        MatOption,
        MatSelect,
        MatSelectTrigger,
        MatSuffix,
        NgOptimizedImage,
        NgxMaskPipe,
        NgClass,
        MatAutocompleteTrigger,
        MatInput,
        ReactiveFormsModule,
        MatError,
        NgIf,
        NgxMatSelectSearchModule
    ],
    templateUrl: './account-select.component.html',
    styles: ``,
    styleUrls: ['./account-select.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountSelectComponent implements OnInit, OnChanges, OnDestroy {
  @Input() touched = false;
  @Input() disabled = false;
  @Input() selectedAccount!: AccountsDto | null;
  @Input() accounts!: AccountsDto[];
  @Input() label = 'Счет';
  @Input() required = false;

  @Input() searching = false;

  @Input() preSelected!: AccountsDto;

  @Input() showTitle = true;
  @Input() showBalance = true;

  @Input() showSearch = false;

  @Input() pageable?: Pageable<AccountsDto>;

  @Output() accountSelected = new EventEmitter();

  @Output() onSearch = new EventEmitter<any>();
  @Output() loadMore = new EventEmitter<any>();

  @ViewChild(MatSelect) matSelect!: MatSelect;

  searchControl = new FormControl('', { nonNullable: true });
  scrollThreshold = 0.95; // When to trigger load more (95% scrolled)
  isLoadingMore = false;

  constructor(
    private destroyRef: DestroyRef,
    private _cdRef: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.watchSearch();
    this.setupScrollListener();
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['preSelected'] && !!changes['preSelected'].currentValue) {
      this.selectedAccount = changes['preSelected'].currentValue;
    }
    if (changes['pageable'] && this.pageable) {
      this.isLoadingMore = false;
    }
    if (changes['accounts'] && this.accounts) {
      this._cdRef.detectChanges();
    }
  }

  ngOnDestroy() {
    const panel = this.matSelect?.panel?.nativeElement;
    if (panel) {
      panel.removeEventListener('scroll', this.handleScroll);
    }
  }

  onSelectOpened(opened: boolean) {
    if (opened) {
      // Small timeout ensures the panel DOM is available
      setTimeout(() => {
        const panel = this.matSelect.panel?.nativeElement;
        if (panel) {
          panel.addEventListener('scroll', this.handleScroll);
        }
      });
    } else {
      // Clean up listener when closed (optional)
      const panel = this.matSelect.panel?.nativeElement;
      if (panel) {
        panel.removeEventListener('scroll', this.handleScroll);
      }
    }
  }

  handleScroll = (event: Event) => {
    const element = event.target as HTMLElement;
    const atBottom = element.scrollTop + element.clientHeight >=
      element.scrollHeight * this.scrollThreshold;

    if (atBottom && !this.isLoadingMore && this.pageable && !this.pageable.last) {
      this.isLoadingMore = true;
      const searchText = this.searchControl.value || '';
      this.loadMore.emit({ search: searchText, page: this.pageable.number + 1 });
    }
  };



  private setupScrollListener() {
    if (this.matSelect && this.matSelect.panel) {
      this.matSelect.panel.nativeElement.addEventListener('scroll', (event: Event) => {
        const element = event.target as HTMLElement;
        const atBottom = element.scrollTop + element.clientHeight >=
          element.scrollHeight * this.scrollThreshold;

        if (atBottom && !this.isLoadingMore && this.pageable && !this.pageable.last) {
          this.isLoadingMore = true;
          const searchText = this.searchControl.value || '';
          this.loadMore.emit({ search: searchText, page: this.pageable.number + 1 });
        }
      });
    }
  }

  watchSearch() {
    this.searchControl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        debounceTime(300),
        distinctUntilChanged()
        )
      .subscribe(searchText => {
        this.onSearch.emit(searchText || '');
      });
  }

  selectSenderAccount(account: AccountsDto) {
    this.searchControl.setValue('', { emitEvent: false });
    this.accountSelected.emit(this.selectedAccount);
  }

  protected readonly Number = Number;
}
