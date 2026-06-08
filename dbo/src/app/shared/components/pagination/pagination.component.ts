import { Component, computed, input, output } from '@angular/core';
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
  imports: [
    NgClass,
    NgForOf,
    NgIf,
    MatMenuTrigger,
    MatMenu,
    TranslateModule
  ]
})
export class PaginationComponent {
  pageIndex = input<number>(0);
  pageSize = input<number>(10);
  totalItems = input<number>(0);
  pageSizeOptions = input<number[]>([5, 10, 20, 50]);
  maxVisiblePages = input<number>(5);

  pageChange = output<number>();
  pageSizeChange = output<number>();

  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));


  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.pageIndex();
    const maxVisible = this.maxVisiblePages();

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i);
    }

    const pages: number[] = [];
    const halfVisible = Math.floor(maxVisible / 2);

    pages.push(0);

    let start: number;
    let end: number;

    if (current <= halfVisible) {
      start = 1;
      end = maxVisible - 2;
    } else if (current >= total - halfVisible - 1) {
      start = total - maxVisible + 2;
      end = total - 1;
    } else {
      start = current - halfVisible + 1;
      end = current + halfVisible - 1;
    }

    if (start > 1) {
      pages.push(-1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < total - 2) {
      pages.push(-1);
    }

    if (total > 1 && pages[pages.length - 1] !== total - 1) {
      pages.push(total - 1);
    }

    return pages;
  });

  onPageChange(page: number) {
    if (page >= 0 && page < this.totalPages()) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(size: number) {
    this.pageSizeChange.emit(size);
  }
}