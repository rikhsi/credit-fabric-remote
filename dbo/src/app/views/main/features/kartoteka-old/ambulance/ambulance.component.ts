import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import {
  ContainerTableComponent
} from '../../../../../shared/components/common/container-table/container-table.component';
import { FilterButtonComponent } from '../../../../../shared/components/common/filter-button/filter-button.component';
import { FilterKartoteka2Component } from '../components/filter-kartoteka-2/filter-kartoteka-2.component';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { NgOptimizedImage } from '@angular/common';
import { TableActionsComponent } from '../../../../../shared/components/table-actions/table-actions.component';
import { ContainerNavComponent } from '../../../../../shared/components/container-nav/container-nav.component';
import { ContainerTitleComponent } from '../../../../../shared/components/container-title/container-title.component';
import { AmbulanceTableActionsBtns, Kartoteka2TableActionBtns } from '../constants/table-btn';
import { PaginatorComponent } from '../../../../../shared/components/paginator/paginator.component';
import { ToastrService } from 'ngx-toastr';
import { KartotekaService } from '../services/kartoteka.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AmbulanceTableColumns } from '../constants/table-columns';
import { Ambulance } from '../models/ambulance.interface';
import { AmbulanceModalComponent } from '../components/ambulance-modal/ambulance-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-ambulance',
    imports: [
        ContainerTableComponent,
        FilterButtonComponent,
        FilterKartoteka2Component,
        MatMenu,
        NgOptimizedImage,
        TableActionsComponent,
        ContainerNavComponent,
        ContainerTitleComponent,
        PaginatorComponent,
        MatMenuTrigger
    ],
    templateUrl: './ambulance.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AmbulanceComponent implements OnInit {
  title = 'Неотложные нужды';

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

  data: Ambulance[] = [];
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
    this.getAmbulance();
  }

  getAmbulance() {
    this.loading = true;
    this.kartotekaService.getAmbulance({ page: this.page, size: this.pageSize })
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
    this.matDialog.open(AmbulanceModalComponent, {
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
    this.getAmbulance();
  }

  protected readonly AmbulanceTableActionsBtns = AmbulanceTableActionsBtns;
  protected readonly tableColumns = AmbulanceTableColumns;
}
