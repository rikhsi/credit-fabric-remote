import {NgClass, NgForOf} from "@angular/common";
import {Component, EventEmitter, Input, Output, computed, signal, input} from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import {MatMenu, MatMenuTrigger} from "@angular/material/menu";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'new-app-pagination',
  standalone: true,
  templateUrl: './new-pagination.component.html',
  imports: [NgFor, NgIf, NgClass, MatMenu,MatMenuTrigger, TranslateModule],

})
export class NewPaginationComponent {
  pageSizeOptions = input<number[]>([5, 10, 20, 50])

  @Input({ required: true }) totalItems = 0;
  @Input({ required: true }) pageSize = 10;
  @Input({ required: true }) pageIndex = 0;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  private refresh = signal(0);
  totalPages = computed(() => {
    this.refresh();
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  });
  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSizeChange.emit(size);
    this.refresh.update(v => v + 1);
  }

  getPages(): Array<number | '...'> {
    const total = this.totalPages();
    const current = this.pageIndex;
    const delta = 2;

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i);
    }

    const range = new Set<number>();
    range.add(0);
    range.add(total - 1);

    for (let i = current - delta; i <= current + delta; i++) {
      if (i > 0 && i < total - 1) range.add(i);
    }

    const pages = Array.from(range).sort((a, b) => a - b);
    const final: Array<number | '...'> = [];

    for (let i = 0; i < pages.length; i++) {
      final.push(pages[i]);
      if (pages[i + 1] - pages[i] > 1) {
        final.push('...');
      }
    }

    return final;
  }
}
