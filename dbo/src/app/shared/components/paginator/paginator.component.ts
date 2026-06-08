import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { SelectComponent } from '../select/select.component';
import { MatFormField, MatOption, MatSelect, MatSelectModule, MatSuffix } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';

@Component({
    selector: 'app-paginator',
    imports: [
        NgForOf,
        NgIf,
        NgOptimizedImage,
        SelectComponent,
        MatSelectModule,
        MatFormField,
        MatIcon,
        MatInput,
    ],
    templateUrl: './paginator.component.html',
    styles: ``,
    styleUrls: ['./paginator.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginatorComponent implements OnInit, OnChanges {
  @Input() totalItems: number = 0;
  @Input() pageSizes = [10, 20, 30, 50, 100];
  @Input() itemsPerPage: number = this.pageSizes[0];
  @Input() currentPage: number = 1;

  selectedPageSize = this.itemsPerPage;

  @Output() pageChange = new EventEmitter<{
    page: number;
    size: number;
  }>();

  totalPages: number = 0
  pageNumbers: number[] = [];


  constructor(
    private _cdRef: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.updatePagination();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['itemsPerPage'] && changes['itemsPerPage'].currentValue !== undefined) {
      const pageSize = changes['itemsPerPage'].currentValue;
      if(pageSize < 10) {
        this.itemsPerPage = 10;
      }
      this.selectedPageSize = pageSize < 10 ? 10 : pageSize;
    }

    this.updatePagination();
  }

  updatePagination() {
    this.calculateTotalPages();
    this.generatePageNumbers();
  }

  perPage(perPage: number) {
    this.selectedPageSize = perPage;
    this.itemsPerPage = perPage;
    this.updatePagination();

    this.pageChange.emit({
      page: 0,
      size: this.itemsPerPage,
    });

    this._cdRef.markForCheck();
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage) || 0;
  }

  // generatePageNumbers() {
  //   const visiblePages = 5; // Adjust the number of visible create-payment as needed
  //   const startPage = Math.max(1, this.currentPage - Math.floor(visiblePages / 2));
  //   const endPage = Math.min(this.totalPages, startPage + visiblePages
  //     - 1);
  //
  //   this.pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  //   this._cdRef.markForCheck();
  // }
  //
  // goToPage(pageChange: any) {
  //   const page = typeof pageChange === 'number' ? pageChange : +pageChange.target.value;
  //   if (page >= 1 && page <= this.totalPages) {
  //     this.currentPage = page;
  //     this.pageChange.emit({
  //       page: this.currentPage - 1,
  //       size: this.itemsPerPage,
  //     });
  //     this.generatePageNumbers();
  //   }
  // }

  generatePageNumbers() {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2; // сколько страниц показывать вокруг текущей
    const range: (number | string)[] = [];

    if (total <= 7) {
      // если страниц мало — показываем все
      for (let i = 1; i <= total; i++) {
        range.push(i);
      }
    } else {
      range.push(1);

      if (current - delta > 2) {
        range.push('...');
      }

      const start = Math.max(2, current - delta);
      const end = Math.min(total - 1, current + delta);

      for (let i = start; i <= end; i++) {
        range.push(i);
      }

      if (current + delta < total - 1) {
        range.push('...');
      }

      range.push(total);
    }

    this.pageNumbers = range as number[];
    this._cdRef.markForCheck();
  }

  enforceRange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (Number(input.value) < 1) {
      input.value = '1';
    } else if (Number(input.value) > this.totalPages) {
      input.value = this.totalPages.toString();
    }
  }

}
