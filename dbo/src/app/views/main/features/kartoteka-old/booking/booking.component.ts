import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { ContainerNavComponent } from '../../../../../shared/components/container-nav/container-nav.component';
import { ContainerTitleComponent } from '../../../../../shared/components/container-title/container-title.component';
import { TableActionsComponent } from '../../../../../shared/components/table-actions/table-actions.component';
import { AmbulanceTableActionsBtns } from '../constants/table-btn';
import { BookingTableColumns } from '../constants/table-columns';
import {
  ContainerTableComponent
} from '../../../../../shared/components/common/container-table/container-table.component';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { NgOptimizedImage } from '@angular/common';
import { Booking } from '../models/booking.interface';
import { ToastrService } from 'ngx-toastr';
import { KartotekaService } from '../services/kartoteka.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaginatorComponent } from '../../../../../shared/components/paginator/paginator.component';
import { MatDialog } from '@angular/material/dialog';
import { BookingModalComponent } from '../components/booking-modal/booking-modal.component';

@Component({
    selector: 'app-booking',
    imports: [
        ContainerNavComponent,
        ContainerTitleComponent,
        TableActionsComponent,
        ContainerTableComponent,
        MatMenu,
        NgOptimizedImage,
        MatMenuTrigger,
        PaginatorComponent
    ],
    templateUrl: './booking.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingComponent implements OnInit {
  title = 'Бронь';
  navs = [
    {
      title: 'Главная',
      link: '/'
    },
    {
      title: 'Картотека',
      link: '/kartoteka/kartoteka-2'
    },
    {
      title: this.title,
      link: '/'
    },
  ];

  data: Booking[] = [];
  pageSize = 20;
  page = 1;
  totalItems = 0;
  errorMessage = '';
  loading = false;

  constructor(
    private destroyRef: DestroyRef,
    private toastrService: ToastrService,
    private kartotekaService: KartotekaService,
    private _cdRef: ChangeDetectorRef,
    private matDialog: MatDialog,
  ) {
  }

  ngOnInit() {
    this.getBooking();
  }

  getBooking() {
    this.loading = true;
    this.kartotekaService.getBooking({ page: this.page, size: this.pageSize })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.data = res.data || [];
          this.pageSize = +res.pageSize;
          this.page = +res.pageNum;
          this.totalItems = +res.count;
          this.errorMessage = '';
        },
        error: (err: any) => {
          this.errorMessage = err.message || err || 'Что-то пошло не так...';
        },
        complete: () => {
          this.loading = false;
          this._cdRef.markForCheck();
        }
      });
  }

  onActionClick(event: any) {

  }

  openDetails(event: any) {
    this.matDialog.open(BookingModalComponent, {
      width: '550px',
      height: '100%',
      position: {right: '0'},
      panelClass: 'right-side-dialog',
      data: event,
    }).afterClosed()
      .subscribe((res) => {
        if(res === 'update') {
        }
      });
  }

  onSelectedRows(rows: any) {}


  pageChanged(event: any) {
    this.page = event.page;
    this.pageSize = event.size;
    this.getBooking();
  }

  protected readonly AmbulanceTableActionsBtns = AmbulanceTableActionsBtns;
  protected readonly tableColumns = BookingTableColumns;
}
